#!/usr/bin/env python3
"""
Cadê Bolsa? — site que exibe as oportunidades coletadas por agente_bolsas.py

Lê data/oportunidades.json (gerado pelo coletor) e renderiza os cards.
Filtra por nível/área/país via querystring, e SEMPRE esconde oportunidades
com prazo confirmadamente expirado (segunda camada de proteção, além do
filtro já feito no coletor).
"""

import json
import os
from datetime import date, datetime

from flask import Flask, render_template, request

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
ARQUIVO_DADOS = os.path.join(DATA_DIR, "oportunidades.json")


def carregar_oportunidades():
    if not os.path.exists(ARQUIVO_DADOS):
        return {"atualizado_em": None, "total": 0, "oportunidades": []}
    with open(ARQUIVO_DADOS, encoding="utf-8") as f:
        return json.load(f)


def esta_expirado(item):
    prazo_iso = (item.get("prazo_iso") or "").strip()
    if not prazo_iso:
        return False
    try:
        return datetime.strptime(prazo_iso, "%Y-%m-%d").date() < date.today()
    except ValueError:
        return False


def dias_restantes(item):
    prazo_iso = (item.get("prazo_iso") or "").strip()
    if not prazo_iso:
        return None
    try:
        return (datetime.strptime(prazo_iso, "%Y-%m-%d").date() - date.today()).days
    except ValueError:
        return None


def urgencia(dias):
    """Classe CSS conforme a urgência do prazo."""
    if dias is None:
        return "prazo-desconhecido"
    if dias <= 7:
        return "prazo-urgente"
    if dias <= 30:
        return "prazo-atencao"
    return "prazo-tranquilo"


@app.route("/")
def index():
    dados = carregar_oportunidades()
    itens = [i for i in dados.get("oportunidades", []) if not esta_expirado(i)]

    # filtros vindos da querystring
    nivel_f = request.args.get("nivel", "").strip()
    area_f = request.args.get("area", "").strip()
    busca = request.args.get("q", "").strip().lower()

    if nivel_f:
        itens = [i for i in itens if i.get("nivel", "").lower() == nivel_f.lower()]
    if area_f:
        itens = [i for i in itens if area_f.lower() in i.get("area", "").lower()]
    if busca:
        itens = [
            i for i in itens
            if busca in i.get("titulo", "").lower()
            or busca in i.get("instituicao", "").lower()
            or busca in i.get("pais", "").lower()
            or busca in i.get("area", "").lower()
        ]

    # anexa metadados de exibição
    for i in itens:
        d = dias_restantes(i)
        i["_dias_restantes"] = d
        i["_urgencia"] = urgencia(d)

    # ordena por prazo mais próximo primeiro (desconhecidos por último)
    itens.sort(key=lambda i: i["_dias_restantes"] if i["_dias_restantes"] is not None else 99999)

    niveis_disponiveis = sorted({i.get("nivel", "") for i in dados.get("oportunidades", []) if i.get("nivel")})

    return render_template(
        "index.html",
        itens=itens,
        total=len(itens),
        atualizado_em=dados.get("atualizado_em"),
        niveis_disponiveis=niveis_disponiveis,
        filtro_nivel=nivel_f,
        filtro_area=area_f,
        filtro_busca=request.args.get("q", ""),
    )


if __name__ == "__main__":
    # Uso local apenas. Em produção, o Gunicorn é quem sobe a aplicação
    # (ver deploy/cadebolsa.service).
    app.run(host="127.0.0.1", port=8000, debug=True)
