# Cadê Bolsa? — Guia de deploy (GitHub + servidor próprio + cadebolsa.com.br)

Este guia assume:
- Você tem (ou vai contratar) um **VPS/servidor Linux** (Ubuntu 22.04 ou 24.04), de
  qualquer provedor (Hetzner, DigitalOcean, Contabo, AWS Lightsail, etc.).
- Você já **registrou o domínio** `cadebolsa.com.br` em algum registrador
  (registro.br, por exemplo).
- Você vai usar o **GitHub** para versionar o código e trazê-lo para o servidor.

Tempo estimado: 45–90 minutos na primeira vez.

---

## Parte 1 — Subir o código para o GitHub

1. Crie uma conta no GitHub (se ainda não tiver): https://github.com
2. Crie um repositório novo, **privado** (o código não tem segredos, mas o
   `.env` com sua chave da API nunca deve ir para lá — o `.gitignore` já
   protege isso).
3. No seu computador, dentro da pasta do projeto (`cadebolsa/`):

   ```bash
   git init
   git add .
   git commit -m "Primeira versão do Cadê Bolsa?"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/cadebolsa.git
   git push -u origin main
   ```

   > Confirme que o arquivo `.env` (se você já tiver criado um localmente) **não**
   > aparece no `git status` antes de dar commit. Se aparecer, o `.gitignore`
   > não está funcionando — revise antes de continuar.

---

## Parte 2 — Preparar o servidor

Acesse seu servidor via SSH:

```bash
ssh root@SEU_IP_DO_SERVIDOR
```

### 2.1 Atualizar o sistema e instalar dependências

```bash
apt update && apt upgrade -y
apt install -y python3 python3-venv python3-pip git nginx certbot python3-certbot-nginx ufw
```

### 2.2 Criar um usuário dedicado (boa prática de segurança)

```bash
adduser --system --group --home /var/www/cadebolsa cadebolsa
mkdir -p /var/log/cadebolsa
chown cadebolsa:cadebolsa /var/log/cadebolsa
```

### 2.3 Configurar o firewall básico

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Parte 3 — Trazer o código para o servidor

```bash
cd /var/www
git clone https://github.com/SEU_USUARIO/cadebolsa.git
chown -R cadebolsa:cadebolsa /var/www/cadebolsa
cd cadebolsa
```

### 3.1 Criar o ambiente virtual e instalar dependências

```bash
sudo -u cadebolsa python3 -m venv venv
sudo -u cadebolsa venv/bin/pip install --upgrade pip
sudo -u cadebolsa venv/bin/pip install -r requirements.txt
```

### 3.2 Configurar a chave da API

```bash
cp .env.example .env
nano .env   # cole sua ANTHROPIC_API_KEY real aqui
chown cadebolsa:cadebolsa .env
chmod 600 .env
```

### 3.3 Rodar o coletor pela primeira vez (gera os dados que o site vai exibir)

```bash
sudo -u cadebolsa -H bash -c 'set -a; source /var/www/cadebolsa/.env; set +a; /var/www/cadebolsa/venv/bin/python /var/www/cadebolsa/agente_bolsas.py --max-queries 10'
```

Isso vai criar `data/oportunidades.json`. Confira se o arquivo foi gerado:

```bash
cat /var/www/cadebolsa/data/oportunidades.json | head -30
```

---

## Parte 4 — Subir a aplicação com Gunicorn (systemd)

1. Copie o arquivo de serviço para o systemd:

   ```bash
   cp /var/www/cadebolsa/deploy/cadebolsa.service /etc/systemd/system/cadebolsa.service
   ```

2. Ative e inicie o serviço:

   ```bash
   systemctl daemon-reload
   systemctl enable cadebolsa
   systemctl start cadebolsa
   systemctl status cadebolsa
   ```

   Se aparecer `active (running)` em verde, deu certo. Se der erro, veja os
   logs com:

   ```bash
   journalctl -u cadebolsa -n 50 --no-pager
   ```

3. Teste localmente no próprio servidor:

   ```bash
   curl http://127.0.0.1:8000
   ```

   Deve retornar o HTML da página.

---

## Parte 5 — Configurar o Nginx como proxy reverso

1. Copie a configuração:

   ```bash
   cp /var/www/cadebolsa/deploy/nginx_cadebolsa.conf /etc/nginx/sites-available/cadebolsa
   ln -s /etc/nginx/sites-available/cadebolsa /etc/nginx/sites-enabled/
   nginx -t   # testa se a configuração está correta
   systemctl reload nginx
   ```

---

## Parte 6 — Apontar o domínio para o servidor (DNS)

No painel do seu registrador (registro.br ou onde o domínio foi registrado),
crie os seguintes registros DNS:

| Tipo | Nome | Valor                  |
|------|------|-------------------------|
| A    | @    | `SEU_IP_DO_SERVIDOR`    |
| A    | www  | `SEU_IP_DO_SERVIDOR`    |

A propagação pode levar de alguns minutos a algumas horas. Você pode
verificar com:

```bash
dig cadebolsa.com.br +short
```

Quando o comando retornar o IP do seu servidor, o DNS já propagou.

---

## Parte 7 — Ativar HTTPS (SSL grátis com Let's Encrypt)

Só faça esta etapa **depois** que o DNS já estiver propagado (passo anterior),
senão o certbot não consegue validar o domínio.

```bash
certbot --nginx -d cadebolsa.com.br -d www.cadebolsa.com.br
```

Siga as instruções na tela (informe um e-mail para avisos de renovação). O
certbot já configura a renovação automática — não precisa fazer nada depois.

Teste acessando **https://cadebolsa.com.br** no navegador. O site deve
carregar com o cadeado de segurança.

---

## Parte 8 — Agendar a atualização automática das oportunidades

Isso faz o coletor rodar sozinho todo dia (por padrão, configurado para
06:00 — ajuste em `cadebolsa-scraper.timer` se quiser outro horário).

```bash
cp /var/www/cadebolsa/deploy/cadebolsa-scraper.service /etc/systemd/system/
cp /var/www/cadebolsa/deploy/cadebolsa-scraper.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now cadebolsa-scraper.timer
systemctl list-timers | grep cadebolsa
```

Para rodar manualmente a qualquer momento (sem esperar o horário agendado):

```bash
systemctl start cadebolsa-scraper.service
journalctl -u cadebolsa-scraper.service -n 50 --no-pager
```

> O site (`app.py`) lê o arquivo `data/oportunidades.json` a cada requisição,
> então assim que o coletor terminar de rodar, o site já reflete os dados
> novos automaticamente — não é preciso reiniciar nada.

---

## Parte 9 — Como atualizar o código no futuro

Sempre que você (ou eu) alterarmos o código localmente:

```bash
# no seu computador
git add .
git commit -m "descrição da mudança"
git push
```

```bash
# no servidor
cd /var/www/cadebolsa
sudo -u cadebolsa git pull
sudo -u cadebolsa venv/bin/pip install -r requirements.txt   # só se mudou dependências
systemctl restart cadebolsa
```

Dica: se quiser automatizar esse "pull + restart" para não precisar entrar no
servidor toda vez, um próximo passo natural é configurar um **GitHub Actions**
que faz deploy via SSH automaticamente a cada push — posso te ajudar a montar
isso quando fizer sentido.

---

## Checklist final

- [ ] Repositório no GitHub com o código (sem `.env`)
- [ ] Servidor com Python, Nginx, Certbot instalados
- [ ] `.env` criado no servidor com a chave real
- [ ] `agente_bolsas.py` rodado manualmente pelo menos uma vez (arquivo `data/oportunidades.json` existe)
- [ ] Serviço `cadebolsa.service` ativo (`systemctl status cadebolsa`)
- [ ] Nginx configurado e testado (`nginx -t`)
- [ ] DNS do domínio apontando para o IP do servidor
- [ ] Certificado HTTPS emitido (`certbot --nginx`)
- [ ] Timer `cadebolsa-scraper.timer` ativo para atualizações diárias
- [ ] Site acessível em https://cadebolsa.com.br

---

## Solução de problemas comuns

- **"502 Bad Gateway" no navegador**: o Gunicorn não está rodando. Rode
  `systemctl status cadebolsa` e veja os logs em `/var/log/cadebolsa/error.log`.
- **Site mostra "Nenhuma oportunidade encontrada"**: o coletor ainda não
  gerou dados, ou todas as oportunidades encontradas já expiraram. Rode o
  coletor manualmente (Parte 8) e confira `data/oportunidades.json`.
- **Certbot falha ao emitir certificado**: geralmente é porque o DNS ainda
  não propagou, ou a porta 80 não está liberada no firewall (`ufw status`).
- **`ModuleNotFoundError` ao rodar**: confirme que está usando o Python do
  ambiente virtual (`venv/bin/python`), não o Python do sistema.
