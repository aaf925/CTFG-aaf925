import os
from maps.dispositivos_knx import TODOS

# --- Ollama ---
OLLAMA_URL = "http://localhost:11434/api/generate"
MODELO_LLM = "qwen2.5:1.5b"

# --- Whisper ---
MODELO_WHISPER = "tiny"
IDIOMA = "es"

# --- SpaceLynk ---
SPACELYNK_IP = "192.168.X.X"
SPACELYNK_USER = "USUARIO"
SPACELYNK_PASS = "PONER_AQUI_CONTRASENA"
SPACELYNK_URL = f"http://{SPACELYNK_IP}/scada-remote"

# --- Wake word ---
MODELS_DIR = os.path.join(os.getcwd(), "..", "models")
WAKE_WORD_NAME = "alexa_v0.1"

# --- Servidor ---
HOST = "0.0.0.0"
PORT = 5000

# --- Lista de todos los dispositivos para el prompt del LLM ---
TODOS_LOS_NOMBRES = TODOS
