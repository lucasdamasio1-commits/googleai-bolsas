import os
from datetime import datetime
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

def scrape_fapesp(page):
    """Módulo de recolha para oportunidades da FAPESP."""
    print("A iniciar recolha na FAPESP...")
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
                # O campo "id" não é enviado, pois o Supabase irá criá-lo automaticamente (int8)
                "instituicao": "FAPESP",
                "titulo": titulo,
                "area": "Multidisciplinar", # Pode ser extraído dinamicamente
                "modalidade": "Pesquisa",
                "prazo": prazo,
                "link": f"https://fapesp.br{link}" if link.startswith("/") else link,
                "status": "Ativa"
            })
    except Exception as e:
        print(f"Erro ao extrair FAPESP: {e}")
    
    return bolsas

def scrape_daad(page):
    """Módulo de recolha para bolsas do DAAD."""
    print("A iniciar recolha no DAAD...")
    bolsas = []
    # Implementar lógica de navegação e extração específica do DAAD aqui
    # ...
    return bolsas

def scrape_euraxess(page):
    """Módulo de recolha para oportunidades no EURAXESS."""
    print("A iniciar recolha no EURAXESS...")
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

    print("A iniciar ligação ao Supabase...")
    
    # Obtém as credenciais guardadas de forma segura no GitHub Secrets
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Erro crítico: As credenciais do Supabase (SUPABASE_URL e SUPABASE_KEY) não foram encontradas.")
        return

    try:
        # Inicia a ligação à base de dados
        supabase: Client = create_client(url, key)

        # Limpa a tabela antiga para evitar duplicados ou manter editais expirados da semana passada
        # O filtro .neq("id", "0") é um método para atingir e apagar todas as linhas existentes
        print("A limpar registos antigos da tabela...")
        supabase.table("bolsas").delete().neq("id", "0").execute() 

        # Insere as novas bolsas recolhidas na nuvem
        if todas_bolsas:
            print(f"A inserir {len(todas_bolsas)} bolsas no Supabase...")
            supabase.table("bolsas").insert(todas_bolsas).execute()
            print("Sucesso! A base de dados do Cadê Bolsa foi atualizada com as oportunidades mais recentes.")
        else:
            print("Aviso: Nenhuma bolsa foi encontrada nesta varredura.")

    except Exception as e:
        print(f"Erro na operação com o Supabase: {e}")

if __name__ == "__main__":
    main()
