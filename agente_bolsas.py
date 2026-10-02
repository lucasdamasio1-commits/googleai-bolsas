#!/usr/bin/env python3
"""
Agente de busca de oportunidades de financiamento acadêmico
=============================================================

Busca bolsas de IC, mestrado, doutorado, pós-doc e editais de projetos de
pesquisa/extensão no Brasil, Europa, EUA e resto do mundo, priorizando as
áreas de Administração, Marketing e Comunicação.

Este script é o "coletor": ele roda periodicamente (via cron/systemd timer)
e escreve o resultado em data/oportunidades.json, que é o arquivo lido pelo
site (app.py) para exibir as oportunidades. Também guarda uma cópia
histórica com timestamp em data/historico/.

DIFERENCIAL ANTI-ALUCINAÇÃO: o modelo só pode reportar um link que tenha
vindo de uma busca real (web_search), nunca um link "lembrado". Além disso,
oportunidades com prazo de inscrição já vencido são removidas antes de
salvar o arquivo que o site exibe.

REQUISITOS
----------
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY="sua_chave_aqui"

USO
---
    python agente_bolsas.py
    python agente_bolsas.py --regioes brasil europa --niveis mestrado doutorado
    python agente_bolsas.py --max-queries 15
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, date
from urllib.parse import urlparse

try:
    import anthropic
except ImportError:
    sys.exit("ERRO: biblioteca 'anthropic' não instalada.\nRode: pip install -r requirements.txt")

MODEL = "claude-sonnet-4-6"

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
ARQUIVO_ATUAL = os.path.join(DATA_DIR, "oportunidades.json")
DIR_HISTORICO = os.path.join(DATA_DIR, "historico")

# ---------------------------------------------------------------------------
# CONFIGURAÇÃO: regiões, níveis, áreas e domínios de confiança
# ---------------------------------------------------------------------------

REGIOES = {
    "brasil": {
        "descricao": "Brasil",
        "dominios_oficiais": [
            "gov.br/capes", "cnpq.br", "fapesp.br", "faperj.br", "fapemig.br",
            "fapergs.rs.gov.br", "fapesb.ba.gov.br", "finep.gov.br",
            "gov.br/mec", "in.gov.br",
        ],
    },
    "europa": {
        "descricao": "Europa (UE, Reino Unido, Suíça, países nórdicos, etc.)",
        "dominios_oficiais": [
            "ec.europa.eu", "erasmusplus.org.uk", "marie-sklodowska-curie-actions.ec.europa.eu",
            "daad.de", "daad.org.br", "ukri.org", "wellcome.org",
            "eacea.ec.europa.eu", "cost.eu", "euraxess.ec.europa.eu",
            "scholarship-positions.com", "findaphd.com", "findamasters.com",
        ],
    },
    "eua": {
        "descricao": "Estados Unidos",
        "dominios_oficiais": [
            "nsf.gov", "grants.gov", "fulbright.org", "iie.org",
            "aacsb.edu", "aom.org", "aejmc.org", "icahdq.org",
        ],
    },
    "mundo": {
        "descricao": "Resto do mundo / organismos internacionais",
        "dominios_oficiais": [
            "scholarship-positions.com", "opportunitydesk.org", "phdportal.com",
            "mastersportal.com", "unesco.org", "worldbank.org", "idrc-crdi.ca",
        ],
    },
}

NIVEIS = [
    "iniciação científica",
    "mestrado",
    "doutorado",
    "pós-doutorado",
    "projetos de pesquisa e extensão",
]

AREAS_PRIORITARIAS = ["administração", "marketing", "comunicação", "gestão", "negócios"]
AREAS_EN = ["business administration", "management", "marketing", "communication studies"]

PADROES_LINK_GENERICO = [
    r"^https?://(www\.)?[^/]+/?$",
    r"/(home|index|busca|search|noticias)/?$",
    r"\?s=",
]


def eh_link_generico(url: str) -> bool:
    for padrao in PADROES_LINK_GENERICO:
        if re.search(padrao, url, flags=re.IGNORECASE):
            return True
    caminho = urlparse(url).path
    if len(caminho.strip("/")) < 8:
        return True
    return False


def prazo_expirado(item: dict) -> bool:
    """Retorna True apenas se houver uma data ISO válida E ela já tiver passado.
    Itens com prazo não identificado NÃO são considerados expirados (ficam
    marcados como 'a confirmar' no site, mas continuam visíveis)."""
    prazo_iso = (item.get("prazo_iso") or "").strip()
    if not prazo_iso:
        return False
    try:
        data_limite = datetime.strptime(prazo_iso, "%Y-%m-%d").date()
        return data_limite < date.today()
    except ValueError:
        return False  # formato inválido -> não derruba o item, só não confiamos na data


SYSTEM_PROMPT = """\
Você é um agente especializado em localizar oportunidades REAIS e ATUALMENTE \
ABERTAS de financiamento acadêmico (bolsas de iniciação científica, mestrado, \
doutorado, pós-doutorado e editais de projetos de pesquisa/extensão).

REGRAS INVIOLÁVEIS:
1. Você SÓ pode reportar uma oportunidade se tiver feito uma busca na web e \
recebido de volta uma URL real através da ferramenta de busca. NUNCA cite uma \
URL de memória. Se não há URL vinda da ferramenta de busca, NÃO inclua o item.
2. O link deve ser o mais específico possível (PDF do edital, página da \
chamada, notícia sobre essa oportunidade específica). NUNCA a home de uma \
instituição.
3. Se o resultado for apenas a página inicial de um portal, um menu, ou uma \
listagem genérica, DESCARTE.
4. Para o prazo, retorne dois campos: "prazo" (texto legível, ex: "31 de \
março de 2027") e "prazo_iso" (formato YYYY-MM-DD). Se não conseguir \
confirmar a data exata, retorne "prazo": "não identificado" e "prazo_iso": null. \
NUNCA invente uma data.
5. Priorize fortemente Administração, Marketing, Comunicação, Gestão e \
Negócios, mas pode incluir oportunidades multidisciplinares relevantes.
6. Responda ESTRITAMENTE em formato JSON (nada de texto antes/depois), lista \
de objetos com os campos: titulo, instituicao, pais, nivel, area, prazo, \
prazo_iso, valor_bolsa, link, resumo, data_verificacao.
   Se nada de específico e verificável foi encontrado, retorne [].
"""


def montar_queries(regioes, niveis, max_queries=None):
    queries = []
    hoje = datetime.now().year
    for regiao_key in regioes:
        regiao = REGIOES[regiao_key]
        termos_area = AREAS_EN if regiao_key in ("eua", "europa", "mundo") else AREAS_PRIORITARIAS
        for nivel in niveis:
            for area in termos_area[:3]:
                queries.append(
                    f'{nivel} {area} edital OR "call for applications" {hoje}/{hoje+1} '
                    f'{regiao["descricao"]}'
                )
            dominios_str = " OR ".join(f"site:{d}" for d in regiao["dominios_oficiais"][:4])
            queries.append(f'{nivel} {" ".join(termos_area[:2])} ({dominios_str})')
    if max_queries:
        queries = queries[:max_queries]
    return queries


def buscar_oportunidades(client, query, tentativas=2):
    for tentativa in range(tentativas):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=2000,
                system=SYSTEM_PROMPT,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
                messages=[{"role": "user", "content": f"Busque: {query}"}],
            )
            texto = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
            match = re.search(r"\[.*\]", texto, flags=re.DOTALL)
            if not match:
                return []
            dados = json.loads(match.group(0))
            return dados if isinstance(dados, list) else []
        except json.JSONDecodeError:
            return []
        except Exception as e:
            if tentativa == tentativas - 1:
                print(f"  [aviso] falha na query '{query[:60]}...': {e}", file=sys.stderr)
                return []
            time.sleep(3)
    return []


def filtrar_deduplicar_e_remover_expirados(itens):
    vistos = set()
    validos = []
    for item in itens:
        link = (item.get("link") or "").strip()
        if not link or not link.startswith("http") or eh_link_generico(link):
            continue
        if prazo_expirado(item):
            continue
        chave = link.rstrip("/")
        if chave in vistos:
            continue
        vistos.add(chave)
        validos.append(item)
    # ordena por prazo (quem não tem data conhecida vai para o final)
    validos.sort(key=lambda x: x.get("prazo_iso") or "9999-99-99")
    return validos


def main():
    parser = argparse.ArgumentParser(description="Coletor de bolsas/editais acadêmicos")
    parser.add_argument("--regioes", nargs="+", default=list(REGIOES.keys()), choices=list(REGIOES.keys()))
    parser.add_argument("--niveis", nargs="+", default=NIVEIS)
    parser.add_argument("--max-queries", type=int, default=None)
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("ERRO: defina a variável de ambiente ANTHROPIC_API_KEY antes de rodar.")

    client = anthropic.Anthropic(api_key=api_key)
    queries = montar_queries(args.regioes, args.niveis, args.max_queries)
    print(f"Executando {len(queries)} buscas...")

    todos_itens = []
    for i, q in enumerate(queries, 1):
        print(f"[{i}/{len(queries)}] {q[:90]}")
        resultado = buscar_oportunidades(client, q)
        print(f"    -> {len(resultado)} oportunidade(s) bruta(s)")
        todos_itens.extend(resultado)
        time.sleep(1)

    itens_finais = filtrar_deduplicar_e_remover_expirados(todos_itens)
    print(f"Total final (sem expirados/duplicados/genéricos): {len(itens_finais)}")

    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(DIR_HISTORICO, exist_ok=True)

    saida = {
        "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        "total": len(itens_finais),
        "oportunidades": itens_finais,
    }

    # arquivo "atual", que o site lê
    with open(ARQUIVO_ATUAL, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=2)

    # cópia histórica com timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    with open(os.path.join(DIR_HISTORICO, f"oportunidades_{timestamp}.json"), "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=2)

    print(f"Arquivo do site atualizado: {ARQUIVO_ATUAL}")


if __name__ == "__main__":
    main()
