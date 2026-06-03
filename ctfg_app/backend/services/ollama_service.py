import requests
from config import OLLAMA_URL, MODELO_LLM, TODOS_LOS_NOMBRES

def consultar(orden):
    prompt = f"""Eres el cerebro domótico de la casa. Responde SOLO con un JSON.
Acciones: 'encender', 'apagar', 'regular', 'leer'.
Dispositivos: {", ".join(TODOS_LOS_NOMBRES)}.
Ejemplo: {{"accion": "encender", "dispositivo": "luz salon 7"}}"""

    payload = {
        "model": MODELO_LLM,
        "prompt": f"{prompt}\nOrden: {orden[:100]}\nJSON:",
        "stream": False,
        "format": "json",
        "options": {"num_predict": 50, "temperature": 0},
    }
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=8)
        return r.json().get("response")
    except:
        return None
