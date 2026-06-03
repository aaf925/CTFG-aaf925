import json, os, re, tempfile
from flask import Blueprint, request, jsonify
from services.whisper_service import transcribir
from services.ollama_service import consultar
from services.spacelynk import enviar
from maps.dispositivos_knx import LUCES, LUCES_REGULABLES, PERSIANAS, TODAS_LUCES_INDIVIDUALES

asistente_bp = Blueprint("asistente", __name__)

@asistente_bp.route("/procesar_voz", methods=["POST"])
def procesar_voz():
    if "audio" not in request.files:
        return jsonify({"ok": False, "mensaje": "no se envió audio"}), 400

    audio = request.files["audio"]
    ruta = os.path.join(tempfile.gettempdir(), "orden.wav")
    audio.save(ruta)

    texto = transcribir(ruta)
    if not texto:
        return jsonify({"ok": False, "mensaje": "no se pudo transcribir el audio"})

    comando = consultar(texto)
    if comando:
        try:
            cmd = json.loads(comando)
        except json.JSONDecodeError:
            cmd = None
    else:
        cmd = None

    if not cmd:
        cmd = fallback_parser(texto)

    if not cmd:
        return jsonify({"ok": True, "texto": texto, "accion": None, "dispositivo": None, "mensaje": "No entendí la orden"})

    accion = cmd.get("accion")
    dispositivo = cmd.get("dispositivo")
    valor = cmd.get("valor")
    mensaje = ""

    if accion == "leer":
        mensaje = f"Consulta de {dispositivo} no implementada en voz"
    elif accion in ("encender", "apagar"):
        if dispositivo in LUCES:
            v = 1 if accion == "encender" else 0
            for alias in LUCES[dispositivo]:
                enviar(alias, v)
            mensaje = f"{accion} {dispositivo}"
        elif dispositivo in LUCES_REGULABLES:
            v = 1 if accion == "encender" else 0
            for alias in LUCES.get(dispositivo, []):
                enviar(alias, v)
            mensaje = f"{accion} {dispositivo}"
        else:
            mensaje = f"Dispositivo '{dispositivo}' no encontrado"
    elif accion == "regular" and valor is not None:
        if dispositivo in LUCES_REGULABLES:
            enviar(LUCES_REGULABLES[dispositivo], valor)
            mensaje = f"{dispositivo} al {valor}%"
        elif dispositivo in PERSIANAS:
            info = PERSIANAS[dispositivo]
            if isinstance(info, dict) and "mov" in info:
                valor_inv = 100 - valor
                _enviar_lista(info["mov"], valor_inv)
            elif isinstance(info, list):
                for a in info:
                    enviar(a, valor)
            mensaje = f"{dispositivo} al {valor}%"
        elif dispositivo in LUCES:
            alias_dim = LUCES_REGULABLES.get(dispositivo)
            if alias_dim:
                enviar(alias_dim, valor)
            else:
                v = 1 if valor and valor > 50 else 0
                for alias in LUCES[dispositivo]:
                    enviar(alias, v)
            mensaje = f"{'encender' if (alias_dim and valor > 50) or (not alias_dim and v) else 'apagar'} {dispositivo}"
        else:
            mensaje = f"No se pudo regular '{dispositivo}'"
    else:
        mensaje = f"Acción '{accion}' no reconocida"

    return jsonify({
        "ok": True,
        "texto": texto,
        "accion": accion,
        "dispositivo": dispositivo,
        "valor": valor,
        "mensaje": mensaje
    })


def fallback_parser(orden):
    orden_lower = orden.lower()
    accion = None
    valor_fijo = None

    if any(w in orden_lower for w in ["apaga", "apagar", "quita", "desactiva"]):
        accion = "apagar"
    elif any(w in orden_lower for w in ["enciende", "encender", "prende", "pon", "activa"]):
        accion = "encender"
    elif any(w in orden_lower for w in ["sube", "subir", "abre", "abrir", "levanta"]):
        accion = "regular"
        valor_fijo = 0
    elif any(w in orden_lower for w in ["baja", "bajar", "cierra", "cerrar"]):
        accion = "regular"
        valor_fijo = 100
    elif any(w in orden_lower for w in ["regula", "ajusta"]):
        accion = "regular"
    elif any(w in orden_lower for w in ["dime", "consulta", "cuanto", "temperatura"]):
        accion = "leer"

    if not accion:
        return None

    todos = {}
    for d in [LUCES, LUCES_REGULABLES]:
        todos.update(d)
    for nombre in PERSIANAS:
        if isinstance(PERSIANAS[nombre], dict):
            todos[nombre] = True
        elif isinstance(PERSIANAS[nombre], list):
            todos[nombre] = True

    mejor_disp = None
    mejor_score = 0
    for nombre in todos:
        score = sum(1 for p in nombre.lower().split() if p in orden_lower)
        if score > mejor_score:
            mejor_score = score
            mejor_disp = nombre

    if not mejor_disp:
        return None

    nums = re.findall(r'\d+', orden_lower)
    if valor_fijo is not None:
        valor = valor_fijo
    elif nums:
        valor = int(nums[0])
    else:
        valor = None

    return {"accion": accion, "dispositivo": mejor_disp, "valor": valor}


def _enviar_lista(alias_o_lista, valor):
    if isinstance(alias_o_lista, list):
        for a in alias_o_lista:
            enviar(a, valor)
    else:
        enviar(alias_o_lista, valor)
