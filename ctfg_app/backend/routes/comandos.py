from flask import Blueprint, request, jsonify
from services.spacelynk import enviar
from maps.dispositivos_knx import LUCES, LUCES_REGULABLES, PERSIANAS

comandos_bp = Blueprint("comandos", __name__)


@comandos_bp.route("/comando", methods=["POST"])
def comando():
    data = request.get_json()
    dispositivo = data.get("dispositivo")
    accion = data.get("accion")
    valor = data.get("valor")

    # --- LUCES (on/off individual, grupos y regulables) ---
    if dispositivo in LUCES or dispositivo in LUCES_REGULABLES:
        if accion in ("encender", "apagar"):
            v = 1 if accion == "encender" else 0
            if dispositivo in LUCES:
                for alias in LUCES[dispositivo]:
                    enviar(alias, v)
            return jsonify({"ok": True, "mensaje": f"{accion} {dispositivo}"})

        if accion == "regular" and valor is not None:
            alias_dim = LUCES_REGULABLES.get(dispositivo)
            if alias_dim:
                enviar(alias_dim, valor)
                return jsonify({"ok": True, "mensaje": f"{dispositivo} al {valor}%"})
            if dispositivo in LUCES:
                v = 1 if valor > 50 else 0
                for alias in LUCES[dispositivo]:
                    enviar(alias, v)
                return jsonify({"ok": True, "mensaje": f"{'encender' if v else 'apagar'} {dispositivo}"})
            return jsonify({"ok": False, "mensaje": f"{dispositivo} no es regulable"}), 400

    # --- PERSIANAS ---
    # mov: 0=subir/abrir, 1=bajar/cerrar (cualquier >0 = cerrar)
    # En "regular" invertimos el slider (0->100, 100->0) para que
    # 0% = cerrado y 100% = abierto
    if dispositivo in PERSIANAS:
        info = PERSIANAS[dispositivo]
        if accion == "subir":
            _enviar_lista(info["mov"], 0)
            return jsonify({"ok": True, "mensaje": f"Subiendo {dispositivo}"})
        if accion == "bajar":
            _enviar_lista(info["mov"], 1)
            return jsonify({"ok": True, "mensaje": f"Bajando {dispositivo}"})
        if accion == "regular" and valor is not None:
            valor_inv = 100 - valor
            _enviar_lista(info["mov"], valor_inv)
            return jsonify({"ok": True, "mensaje": f"{dispositivo} al {valor}%"})

    return jsonify({"ok": False, "mensaje": "comando no reconocido"}), 400


def _enviar_lista(alias_o_lista, valor):
    if isinstance(alias_o_lista, list):
        for a in alias_o_lista:
            enviar(a, valor)
    else:
        enviar(alias_o_lista, valor)
