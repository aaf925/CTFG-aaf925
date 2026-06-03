import os, tempfile
from flask import Blueprint, request, jsonify
from services.whisper_service import transcribir

voz_bp = Blueprint("voz", __name__)

@voz_bp.route("/voz", methods=["POST"])
def voz():
    if "audio" not in request.files:
        return jsonify({"ok": False, "mensaje": "no se envió audio"}), 400

    audio = request.files["audio"]
    ruta = os.path.join(tempfile.gettempdir(), "orden.wav")
    audio.save(ruta)

    texto = transcribir(ruta)
    if not texto:
        return jsonify({"ok": False, "mensaje": "no se pudo transcribir"})

    return jsonify({"ok": True, "texto": texto})
