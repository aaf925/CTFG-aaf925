# Mapa completo de dispositivos KNX (sincronizado con config.py del asistente + antiguos)

# --- MAPA DE ZONAS: nombre zona -> lista de nombres de dispositivos ---
# Coincide con la organización lógica del asistente.py raíz
MAP_ZONAS = {
    "salon":  ["luz salon 3", "luz salon 7", "luz salon 9", "luz salon 10", "luz salon 11", "luces salon"],
    "cocina": ["luz cocina", "luces cocina", "persiana cocina"],
    "bano":   ["luz bano 5", "luz bano 6", "luces bano", "persiana bano"],
    "entrada":["luz entrada 1", "luz entrada 4", "luces entrada"],
    "dormitorio":["luz dormitorio 12", "luz dormitorio 13", "luz dormitorio 14", "luces dormitorio", "persiana dormitorio", "estor dormitorio"],
    "aula":   ["luz aula 16", "luz aula 17", "luz aula 18", "luces aula", "estor aula"],
    "ordenador":["luz ordenador", "luces ordenador", "estor salon"],
}

# --- LUCES ON/OFF (individuales y grupos) ---
# Cada entrada es {nombre: [lista de direcciones KNX]}
LUCES = {
    # Individuales
    "luz aula 16": ["1/1/1"],
    "luz aula 17": ["1/1/3"],
    "luz aula 18": ["1/2/26"],
    "luz bano 5": ["1/1/11"],
    "luz bano 6": ["1/1/13"],
    "luz cocina": ["1/1/7"],
    "luz entrada 1": ["1/1/5"],
    "luz entrada 4": ["1/1/9"],
    "luz salon 3": ["1/2/1"],
    "luz salon 7": ["1/1/15"],
    "luz salon 9": ["1/2/11"],
    "luz salon 10": ["1/2/16"],
    "luz salon 11": ["1/2/21"],
    "luz ordenador": ["1/2/6"],
    "luz dormitorio 12": ["1/1/17"],
    "luz dormitorio 13": ["1/1/19"],
    "luz dormitorio 14": ["1/1/21"],

    # Grupos por zona
    "luces aula": ["1/1/1", "1/1/3", "1/2/26"],
    "luces bano": ["1/1/11", "1/1/13"],
    "luces cocina": ["1/1/7"],
    "luces entrada": ["1/1/5", "1/1/9"],
    "luces salon": ["1/2/1", "1/1/15", "1/2/21", "1/2/11", "1/2/16"],
    "luces dormitorio": ["1/1/17", "1/1/19", "1/1/21"],
    "luces ordenador": ["1/2/6"],

    # Grupo global
    "todas las luces de la casa": [
        "1/2/1", "1/1/15", "1/2/6", "1/2/21", "1/2/11", "1/2/16",
        "1/1/11", "1/1/13",
        "1/1/7",
        "1/1/5", "1/1/9",
        "1/2/26", "1/1/1", "1/1/3",
        "1/1/17", "1/1/19", "1/1/21"
    ],
}

# --- LUCES REGULABLES (dimmers) ---
# Dirección de regulación absoluta (REG ABS / DPT_Scaling 0-100%)
LUCES_REGULABLES = {
    "luz aula 18": "1/2/28",
    "luz ordenador": "1/2/8",
    "luz salon 3": "1/2/3",
    "luz salon 9": "1/2/13",
    "luz salon 10": "1/2/18",
    "luz salon 11": "1/2/23",
}

# --- PERSIANAS (nuevas + antiguas) ---
# Cada persiana tiene: mov (subir/bajar), altura (posicion 0-100%)
# Las antiguas que solo tenían una dirección usan la misma para mov y altura
PERSIANAS = {
    # Nuevas (desde config.py raíz)
    "persiana cocina":     {"mov": "2/1/1", "altura": "2/1/4", "zona": "cocina"},
    "persiana bano":      {"mov": "2/1/5", "altura": "2/1/8", "zona": "bano"},
    "persiana dormitorio": {"mov": "2/1/9", "altura": "2/1/12", "zona": "dormitorio"},
    "estor salon":        {"mov": "2/3/1", "altura": "2/3/4", "zona": "ordenador"},
    "estor dormitorio":   {"mov": "2/3/5", "altura": "2/3/8", "zona": "dormitorio"},
    "estor aula":         {"mov": "2/3/9", "altura": "2/3/12", "zona": "aula"},

    # Antiguas (para compatibilidad)
    "estor 1":            {"mov": "2/3/3", "altura": "2/3/3"},
    "estor 2":            {"mov": "2/3/7", "altura": "2/3/7"},
    "estor 3":            {"mov": "2/3/11", "altura": "2/3/11"},
    "persiana 1":         {"mov": "2/1/3", "altura": "2/1/3"},
    "persiana 2":         {"mov": "2/1/7", "altura": "2/1/7"},
    "persiana 3":         {"mov": "2/1/11", "altura": "2/1/11"},

    "todas las persianas": {
        "mov": ["2/1/1", "2/1/5", "2/1/9", "2/3/1", "2/3/5", "2/3/9",
                "2/1/3", "2/1/7", "2/1/11", "2/3/3", "2/3/7", "2/3/11"],
        "altura": ["2/1/4", "2/1/8", "2/1/12", "2/3/4", "2/3/8", "2/3/12",
                    "2/1/3", "2/1/7", "2/1/11", "2/3/3", "2/3/7", "2/3/11"]
    },
}

# --- CLIMA / SENSORES ---
# Coincidir con config.py raíz: "temperatura actual salon", "temperatura exterior"
# Y añadir extras del backend anterior
CLIMA = {
    "temperatura actual salon": "3/1/1",
    "temperatura exterior": "3/2/5",
    "consigna salon": "3/1/2",
    "modo clima salon": "3/1/3",
    "calidad aire cocina": "3/2/1",
    "temperatura cocina": "3/2/3",
}

# --- MAPA: nombre de dispositivo -> direccion de estado KNX ---
# Para leer el estado real de cada luz individual (no grupos)
ESTADOS = {
    "luz aula 16": "1/1/2",
    "luz aula 17": "1/1/4",
    "luz aula 18": "1/2/29",
    "luz bano 5": "1/1/12",
    "luz bano 6": "1/1/14",
    "luz cocina": "1/1/8",
    "luz entrada 1": "1/1/6",
    "luz entrada 4": "1/1/10",
    "luz salon 9": "1/2/14",
    "luz salon 10": "1/2/19",
    "luz salon 3": "1/2/4",
    "luz salon 7": "1/1/16",
    "luz salon 11": "1/2/24",
    "luz ordenador": "1/2/9",
    "luz dormitorio 12": "1/1/18",
    "luz dormitorio 13": "1/1/20",
    "luz dormitorio 14": "1/1/22",
}

# --- UTILIDADES ---
TODOS = (
    list(LUCES.keys())
    + list(LUCES_REGULABLES.keys())
    + list(PERSIANAS.keys())
    + list(CLIMA.keys())
)

TODAS_LUCES_INDIVIDUALES = [
    "luz aula 16", "luz aula 17", "luz aula 18",
    "luz bano 5", "luz bano 6",
    "luz cocina",
    "luz entrada 1", "luz entrada 4",
    "luz salon 3", "luz salon 7", "luz salon 9", "luz salon 10", "luz salon 11",
    "luz ordenador",
    "luz dormitorio 12", "luz dormitorio 13", "luz dormitorio 14",
]

# Mapa de zonas para luces individuales
ZONA_LUCES = {}
for _zona, _disps in MAP_ZONAS.items():
    for _d in _disps:
        if _d in TODAS_LUCES_INDIVIDUALES:
            ZONA_LUCES[_d] = _zona

# Grupo por zona: nombre del grupo -> zona
GRUPOS_ZONA = {
    "luces aula": "aula",
    "luces bano": "bano",
    "luces cocina": "cocina",
    "luces entrada": "entrada",
    "luces salon": "salon",
    "luces dormitorio": "dormitorio",
    "luces ordenador": "ordenador",
}
