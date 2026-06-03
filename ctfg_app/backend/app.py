import sys, os
_backend_dir = os.path.dirname(__file__)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from flask import Flask
from flask_cors import CORS
from routes.dispositivos import dispositivos_bp
from routes.comandos import comandos_bp
from routes.voz import voz_bp
from routes.escenas import escenas_bp
from routes.asistente import asistente_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(dispositivos_bp)
app.register_blueprint(comandos_bp)
app.register_blueprint(voz_bp)
app.register_blueprint(escenas_bp)
app.register_blueprint(asistente_bp)

if __name__ == "__main__":
    import config
    app.run(host=config.HOST, port=config.PORT, debug=True)
