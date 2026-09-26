import json
import os
from datetime import datetime
from playwright.sync_api import sync_playwright

def scrape_fapesp(page):
    """Módulo de coleta para oportunidades da FAPESP."""
    print("A iniciar coleta na FAPESP...")
    bolsas = []
    try:
        # Exemplo de navegação. Os seletores exatos dependem da estrutura atual do site.
        page.goto("https://fapesp.br/oportunidades", timeout=60000)
        page.wait_for_selector(".oportunidade-item", timeout=10000)
        
        elementos = page.locator(".oportunidade-item").all()
        for el in elementos:
            titulo = el.locator(".titulo").inner_text()
            link = el.locator("a").get_attribute("href")
            prazo = el.locator(".prazo").inner_text()
            
            bolsas.append({
                "id": f"fapesp-{len(bolsas)}",
                "instituicao": "FAPESP",
                "titulo": titulo,
                "area": "Multidisciplinar", # Pode ser extraído dinamicamente
                "modalidade": "Pesquisa",
                "prazo": prazo,
                "link": f"https://fapesp.br{link}" if link.startswith("/") else link,
                "status": "Ativa"
            })
    except Exception as e:
        print(f"Erro ao raspar FAPESP: {e}")
    
    return bolsas

def scrape_daad(page):
    """Módulo de coleta para bolsas do DAAD."""
    print("A iniciar coleta no DAAD...")
    bolsas = []
    # Implementar lógica de navegação e extração específica do DAAD aqui
    # ...
    return bolsas

def scrape_euraxess(page):
    """Módulo de coleta para oportunidades no EURAXESS."""
    print("A iniciar coleta no EURAXESS...")
    bolsas = []
    # Implementar lógica de navegação e extração específica do EURAXESS aqui
    # ...
    return bolsas

def main():
    todas_bolsas = []
    
    # Inicia o Playwright em modo headless (essencial para rodar no GitHub Actions)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Executa os scrapers de cada portal
        todas_bolsas.extend(scrape_fapesp(page))
        todas_bolsas.extend(scrape_daad(page))
        todas_bolsas.extend(scrape_euraxess(page))

        browser.close()

    # Adiciona metadados de atualização
    banco_de_dados = {
        "ultima_atualizacao": datetime.now().isoformat(),
        "total_bolsas": len(todas_bolsas),
        "bolsas": todas_bolsas
    }

    # Garante que o diretório 'public' do React existe
    os.makedirs("public", exist_ok=True)
    caminho_arquivo = "public/scholarshipsDatabase.json"

    # Salva os dados processados no ficheiro JSON estático
    with open(caminho_arquivo, "w", encoding="utf-8") as f:
        json.dump(banco_de_dados, f, ensure_ascii=False, indent=4)
    
    print(f"Sucesso! {len(todas_bolsas)} bolsas foram extraídas e salvas em {caminho_arquivo}.")

if __name__ == "__main__":
    main()
