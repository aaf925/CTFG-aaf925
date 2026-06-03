# Asistente SmartHome - CTFG

Aplicación móvil para controlar el asistente de voz del TFG mediante una API REST.

## Requisitos

- Python 3.12
- Node.js y npm
- Expo Go en el móvil
- El asistente del TFG ejecutándose en el PC (ver repositorio TFG)

## Instalación

```bash
# Backend
cd ctfg_app/backend
pip install -r requirements.txt

# App móvil
cd ctfg_app/mobile
npm install
```

## Configuración

1. Asignar una IP fija al PC donde se ejecuta el backend
2. Configurar `ctfg_app/backend/config.py` con la IP de SpaceLynk
3. En la app, ir a Ajustes e introducir la IP del PC

## Uso

```bash
# Iniciar backend
cd ctfg_app/backend
python app.py

# Iniciar app móvil
cd ctfg_app/mobile
npx expo start
```

Escanear el código QR con Expo Go.

## Dependencia con TFG

Este proyecto requiere el asistente del TFG ejecutándose en el PC.
Clonar ambos repositorios en la misma carpeta:

```bash
git clone <url-repo-tfg> ../TFG
```
