import requests
from config import SPACELYNK_URL, SPACELYNK_USER, SPACELYNK_PASS

def enviar(alias, valor):
    params = {"m": "json", "r": "grp", "fn": "write", "alias": alias, "value": valor}
    try:
        r = requests.get(SPACELYNK_URL, params=params, auth=(SPACELYNK_USER, SPACELYNK_PASS), timeout=3)
        return r.status_code == 200
    except Exception as e:
        print(f"Error KNX: {e}")
        return False

def leer(alias):
    params = {"m": "json", "r": "grp", "fn": "find", "alias": alias}
    try:
        r = requests.get(SPACELYNK_URL, params=params, auth=(SPACELYNK_USER, SPACELYNK_PASS), timeout=3)
        if r.status_code == 200:
            return r.json()
    except:
        pass
    return None
