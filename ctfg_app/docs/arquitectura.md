# CTFG — Arquitectura del sistema

## Visión general

El CTFG consiste en dos componentes que se comunican por red local:

```
[App React Native] ←→ HTTP REST ←→ [Backend Python (Flask)]
                                        ↓
                              [Ollama + Whisper + SpaceLynk]
                                        ↓
                                      [Bus KNX]
```

El móvil **no ejecuta el LLM**. Hace peticiones HTTP al backend, que corre en el PC
donde ya tienes Ollama funcionando. Ambos deben estar en la misma red WiFi.

---

## Componentes

### Backend Python (Flask)

Expone una API REST para que la app se comunique con el asistente.
Escucha en `http://0.0.0.0:5000` (accesible desde cualquier dispositivo de la red).

Endpoints:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/dispositivos` | Lista todos los dispositivos KNX |
| `GET` | `/dispositivo/<nombre>` | Estado actual de un dispositivo |
| `POST` | `/comando` | Ejecuta un comando |
| `POST` | `/voz` | Recibe audio y lo procesa |
| `POST` | `/escena/<nombre>` | Ejecuta escena (bienvenida/salida) |

### App React Native

Se conecta al backend usando la IP local del PC. Pantallas:

- **Dashboard**: luces con toggles, persianas con sliders, sensores
- **Voz**: grabación y envío de audio
- **Escenas**: botones de bienvenida/salida

---

## Flujo de comunicación

### Comando manual (toggle luz)

```
App → POST /comando → {"dispositivo": "luz salon 7", "accion": "encender"}
Backend → traduce a JSON KNX → SpaceLynk → KNX
Backend → responde {"ok": true, "mensaje": "Luz salon 7 encendida"}
```

### Comando por voz

```
App → graba audio (3-5s) → POST /voz (multipart)
Backend → Whisper transcribe → Ollama interpreta → SpaceLynk ejecuta
Backend → responde {"ok": true, "texto": "...", "accion": "..."}
```

### Lectura de sensores

```
App → GET /dispositivo/<nombre>
Backend → SpaceLynk (GET value) para el sensor
Backend → responde {"nombre": "temperatura salon", "valor": 22.5}
```

---

## Cómo servir el backend en red local

```bash
cd ctfg_app/backend
pip install -r requirements.txt
python app.py
```

Esto levanta Flask en `http://0.0.0.0:5000`.
Desde la app solo hace falta poner la IP del PC en la configuración:

```
BACKEND_URL = "http://192.168.X.X:5000"
```

---

## Estructura de carpetas

```
ctfg_app/
├── backend/
│   ├── app.py                    # Punto de entrada de la API
│   ├── config.py                 # Configuración (rutas, IP, credenciales)
│   ├── requirements.txt          # Dependencias Python
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── dispositivos.py      # GET /dispositivos, GET /dispositivo/<id>
│   │   ├── comandos.py          # POST /comando
│   │   ├── voz.py               # POST /voz (subida de audio)
│   │   └── escenas.py           # POST /escena/<nombre>
│   ├── services/
│   │   ├── __init__.py
│   │   ├── spacelynk.py         # Llamadas HTTP a SpaceLynk
│   │   ├── ollama_service.py    # Llamadas a Ollama
│   │   └── whisper_service.py   # Transcripción Whisper
│   └── maps/
│       └── dispositivos_knx.py  # Mapas de direcciones KNX
│
├── mobile/
│   ├── App.js                   # Punto de entrada React Native
│   ├── package.json
│   ├── src/
│   │   ├── screens/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── VoiceScreen.js
│   │   │   ├── ScenesScreen.js
│   │   │   └── SettingsScreen.js
│   │   ├── components/
│   │   │   ├── LightCard.js
│   │   │   ├── ShutterControl.js
│   │   │   ├── SensorCard.js
│   │   │   └── VoiceRecorder.js
│   │   └── services/
│   │       └── api.js            # Cliente HTTP
│
└── docs/
    └── arquitectura.md           # Este documento
```
