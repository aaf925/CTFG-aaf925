from faster_whisper import WhisperModel
from config import MODELO_WHISPER, IDIOMA

_model = None

def get_model():
    global _model
    if _model is None:
        _model = WhisperModel(MODELO_WHISPER, device="cpu", compute_type="int8")
    return _model

def transcribir(ruta_audio):
    model = get_model()
    segments, _ = model.transcribe(ruta_audio, language=IDIOMA)
    return "".join([s.text for s in segments]).strip().lower()
