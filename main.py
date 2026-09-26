iimport os
from datetime import datetime
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

def scrape_fapesp(page):
    """Módulo de recolha para oportunidades da FAPESP."""
    print("A iniciar recolha na FAPESP...")
    bolsas = []
    try:
        page.goto("https://fapesp.br/oportunidades", timeout=60000)
        # Aguarda que o conteúdo básico da página carregue de forma resiliente
        page.wait_for_load_state("domcontentloaded", timeout=15000)
        
        # Analisa os links presentes na página para extrair chamadas e editais
        elementos = page.locator("a").all()
        for el in elementos:
            try:
                titulo = el.inner_text().strip()
                link = el.get_attribute("href")
                
                if titulo and link and len(titulo) > 20:
                    # Filtra links relevantes com base em palavras-chave institucionais
                    if any(termo in link.lower() or termo in titulo.lower() for termo in ['oportunidade', 'bolsa', 'chamada', 'edital', 'fomento']):
                        link_completo = f"https://fapesp.br{link}" if link.startswith("/") else link
                        
                        # Evita duplicados na lista
                        if not any(b['link'] == link_completo for b in bolsas):
                            bolsas.append({
                                "instituicao": "FAPESP",
                                "titulo": titulo,
                                "area": "Pesquisa & Fomento",
                                "modalidade": "Pesquisa",
                                "prazo": "Consulte o portal oficial",
                                "link": link_completo,
                                "status": "Ativa"
                            })
            except Exception:
                continue
                
        print(f"FAPESP: {len(bolsas)} oportunidades detetadas.")
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

        # Limpa a tabela antiga para evitar duplicados ou manter editais expirados
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
