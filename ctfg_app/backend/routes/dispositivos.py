from flask import Blueprint, jsonify
from concurrent.futures import ThreadPoolExecutor, as_completed
from services.spacelynk import enviar, leer
from maps.dispositivos_knx import (
    LUCES, LUCES_REGULABLES, PERSIANAS, CLIMA,
    ESTADOS, TODAS_LUCES_INDIVIDUALES,
    GRUPOS_ZONA, ZONA_LUCES, MAP_ZONAS
)

dispositivos_bp = Blueprint("dispositivos", __name__)
_executor = ThreadPoolExecutor(max_workers=15)


@dispositivos_bp.route("/dispositivos", methods=["GET"])
def listar():
    todos = []
    vistas = set()

    for nombre in LUCES:
        if nombre in vistas:
            continue
        vistas.add(nombre)
        if nombre in TODAS_LUCES_INDIVIDUALES:
            es_reg = bool(nombre in LUCES_REGULABLES)
            zona = ZONA_LUCES.get(nombre, "")
            todos.append({
                "nombre": nombre,
                "tipo": "luz",
                "regulable": es_reg,
                "zona": zona,
            })
        else:
            zona = GRUPOS_ZONA.get(nombre, "global")
            todos.append({
                "nombre": nombre,
                "tipo": "grupo_luz",
                "zona": zona,
            })

    for nombre in PERSIANAS:
        if nombre in vistas:
            continue
        vistas.add(nombre)
        if nombre == "todas las persianas":
            todos.append({"nombre": nombre, "tipo": "grupo_persiana", "zona": "global"})
        else:
            info = PERSIANAS[nombre]
            zona = info.get("zona", "global")
            todos.append({"nombre": nombre, "tipo": "persiana", "zona": zona})

    for nombre in CLIMA:
        if nombre in vistas:
            continue
        vistas.add(nombre)
        zona = "global"
        for z, ds in MAP_ZONAS.items():
            if nombre in ds:
                zona = z
                break
        todos.append({"nombre": nombre, "tipo": "sensor", "zona": zona})

    return jsonify(todos)


@dispositivos_bp.route("/dispositivo/<nombre>", methods=["GET"])
def estado(nombre):
    if nombre in CLIMA:
        val = leer(CLIMA[nombre])
        return jsonify({"nombre": nombre, "valor": val})
    return jsonify({"error": "dispositivo no encontrado"}), 404


def _extraer_valor(resp):
    if resp is None:
        return None
    if isinstance(resp, dict):
        return resp.get("value")
    if isinstance(resp, (int, float)):
        return resp
    if isinstance(resp, str):
        try:
            return int(resp)
        except ValueError:
            return resp
    return resp


@dispositivos_bp.route("/dispositivos/estados", methods=["GET"])
def leer_estados():
    futuros = {}

    for nombre in TODAS_LUCES_INDIVIDUALES:
        alias_estado = ESTADOS.get(nombre)
        if alias_estado:
            futuros[_executor.submit(lambda n=nombre, a=alias_estado: (n, _extraer_valor(leer(a))))] = nombre

    for nombre, alias in CLIMA.items():
        futuros[_executor.submit(lambda n=nombre, a=alias: (n, _extraer_valor(leer(a))))] = nombre

    estados = {}
    for futuro in as_completed(futuros):
        try:
            n, v = futuro.result()
            estados[n] = v
        except Exception:
            pass

    return jsonify(estados)
