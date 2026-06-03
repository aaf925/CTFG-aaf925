from flask import Blueprint, jsonify
from services.spacelynk import enviar
from maps.dispositivos_knx import TODAS_LUCES_INDIVIDUALES, LUCES, PERSIANAS

escenas_bp = Blueprint("escenas", __name__)


@escenas_bp.route("/escena/<nombre>", methods=["POST"])
def escena(nombre):
    if nombre == "bienvenida":
        for nombre_luz in TODAS_LUCES_INDIVIDUALES:
            if nombre_luz in LUCES:
                for alias in LUCES[nombre_luz]:
                    enviar(alias, 1)
        if "todas las persianas" in PERSIANAS:
            _enviar_lista(PERSIANAS["todas las persianas"]["mov"], 0)
        return jsonify({"ok": True, "mensaje": "Bienvenida activada (todas las luces y persianas)"})

    if nombre == "salida":
        for nombre_luz in TODAS_LUCES_INDIVIDUALES:
            if nombre_luz in LUCES:
                for alias in LUCES[nombre_luz]:
                    enviar(alias, 0)
        if "todas las persianas" in PERSIANAS:
            _enviar_lista(PERSIANAS["todas las persianas"]["mov"], 1)
        return jsonify({"ok": True, "mensaje": "Salida activada (todo apagado y persianas bajadas)"})

    return jsonify({"ok": False, "mensaje": "escena no encontrada"}), 404


def _enviar_lista(alias_o_lista, valor):
    if isinstance(alias_o_lista, list):
        for a in alias_o_lista:
            enviar(a, valor)
    else:
        enviar(alias_o_lista, valor)
