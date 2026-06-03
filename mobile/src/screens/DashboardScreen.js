import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Appbar, Text, ActivityIndicator, Banner, Card, Icon } from "react-native-paper";
import { api } from "../services/api";
import LightCard from "../components/LightCard";
import ShutterControl from "../components/ShutterControl";
import SensorCard from "../components/SensorCard";

const GRUPO_A_INDIVIDUALES = {
  "luces aula": ["luz aula 16", "luz aula 17", "luz aula 18"],
  "luces bano": ["luz bano 5", "luz bano 6"],
  "luces cocina": ["luz cocina"],
  "luces entrada": ["luz entrada 1", "luz entrada 4"],
  "luces salon": ["luz salon 3", "luz salon 7", "luz salon 9", "luz salon 10", "luz salon 11"],
  "luces dormitorio": ["luz dormitorio 12", "luz dormitorio 13", "luz dormitorio 14"],
  "luces ordenador": ["luz ordenador"],
  "todas las luces de la casa": [
    "luz aula 16", "luz aula 17", "luz aula 18",
    "luz bano 5", "luz bano 6",
    "luz cocina",
    "luz entrada 1", "luz entrada 4",
    "luz salon 3", "luz salon 7", "luz salon 9", "luz salon 10", "luz salon 11",
    "luz ordenador",
    "luz dormitorio 12", "luz dormitorio 13", "luz dormitorio 14",
  ],
};

const ZONAS = [
  { key: "salon", label: "Salon", icon: "sofa", color: "#FFD166", desc: "Luces y estores" },
  { key: "cocina", label: "Cocina", icon: "stove", color: "#FF6B6B", desc: "Luces y persianas" },
  { key: "bano", label: "Bano", icon: "bathtub", color: "#74C0FC", desc: "Luces y persianas" },
  { key: "entrada", label: "Entrada", icon: "door-open", color: "#69DB7C", desc: "Luces" },
  { key: "dormitorio", label: "Dormitorio", icon: "bed-king", color: "#DA77F2", desc: "Luces, persianas y estores" },
  { key: "aula", label: "Aula", icon: "bookshelf", color: "#4DABF7", desc: "Luces y estores" },
  { key: "ordenador", label: "Ordenador", icon: "laptop", color: "#748FFC", desc: "Luz y estor" },
];

export default function DashboardScreen() {
  const [dispositivos, setDispositivos] = useState([]);
  const [estados, setEstados] = useState({});
  const [intensidades, setIntensidades] = useState({});
  const [posiciones, setPosiciones] = useState({});
  const [sensoresValores, setSensoresValores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [zonaActual, setZonaActual] = useState(null);

  const cargarEstados = useCallback(async () => {
    try {
      const data = await api.getEstados();
      const nuevos = {};
      const intens = {};
      for (const [nombre, valor] of Object.entries(data)) {
        if (typeof valor === "boolean") {
          nuevos[nombre] = valor;
        } else if (typeof valor === "number") {
          if (valor > 1) {
            intens[nombre] = valor;
            nuevos[nombre] = valor >= 1;
          } else {
            nuevos[nombre] = valor >= 1;
          }
        } else if (typeof valor === "string") {
          nuevos[nombre] = valor === "1" || valor.toLowerCase() === "on" || valor.toLowerCase() === "true";
        }
      }
      setEstados((s) => ({ ...s, ...nuevos }));
      setIntensidades((s) => ({ ...s, ...intens }));
      setSensoresValores((s) => ({ ...s, ...data }));
    } catch {}
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await api.getDispositivos();
      setDispositivos(data);
      cargarEstados();
    } catch (e) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [cargarEstados]);

  useEffect(() => {
    cargar();
  }, []);

  const handleToggle = async (nombre, actualEncendido) => {
    const accion = actualEncendido ? "apagar" : "encender";
    try {
      const res = await api.enviarComando(nombre, accion);
      if (res.ok) {
        const nuevoValor = !actualEncendido;
        setEstados((s) => {
          const actualizados = { ...s, [nombre]: nuevoValor };
          const hijos = GRUPO_A_INDIVIDUALES[nombre];
          if (hijos) {
            for (const h of hijos) {
              actualizados[h] = nuevoValor;
            }
          }
          return actualizados;
        });
      }
    } catch {
      setError("Error al enviar el comando.");
    }
  };

  const handleRegularLuz = async (nombre, valor) => {
    try {
      const res = await api.enviarComando(nombre, "regular", valor);
      if (res.ok) setIntensidades((s) => ({ ...s, [nombre]: valor }));
    } catch {
      setError("Error al regular la luz.");
    }
  };

  const handleRegularPersiana = async (nombre, valor) => {
    try {
      const res = await api.enviarComando(nombre, "regular", valor);
      if (res.ok) setPosiciones((s) => ({ ...s, [nombre]: valor }));
    } catch {
      setError("Error al mover la persiana.");
    }
  };

  const handleSubirPersiana = async (nombre) => {
    try {
      const res = await api.enviarComando(nombre, "subir");
      if (res.ok) setPosiciones((s) => ({ ...s, [nombre]: 100 }));
    } catch {
      setError("Error al mover la persiana.");
    }
  };

  const handleBajarPersiana = async (nombre) => {
    try {
      const res = await api.enviarComando(nombre, "bajar");
      if (res.ok) setPosiciones((s) => ({ ...s, [nombre]: 0 }));
    } catch {
      setError("Error al mover la persiana.");
    }
  };

  const totalLuz = dispositivos.find((d) => d.nombre === "todas las luces de la casa");
  const totalPersianas = dispositivos.find((d) => d.nombre === "todas las persianas");
  const sensores = dispositivos.filter((d) => d.tipo === "sensor");

  const getDispsPorZona = (zonaKey) => {
    const luces = dispositivos.filter((d) => d.zona === zonaKey && d.tipo === "luz");
    const grupos = dispositivos.filter((d) => d.zona === zonaKey && d.tipo === "grupo_luz");
    const persianas = dispositivos.filter((d) => d.zona === zonaKey && d.tipo === "persiana");
    return { luces, grupos, persianas };
  };

  const zonaInfo = ZONAS.find((z) => z.key === zonaActual);
  const dispsZona = zonaActual ? getDispsPorZona(zonaActual) : null;

  function formatearNombre(nombre) {
    let n = nombre
      .replace(/^intensidad luz /, "")
      .replace(/^luz /, "")
      .replace(/^luces /, "Luces ");
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  function renderLight(d) {
    return (
      <LightCard
        key={d.nombre}
        nombre={d.nombre}
        encendido={estados[d.nombre] || false}
        intensidad={intensidades[d.nombre] ?? 50}
        regulable={d.regulable || false}
        onToggle={() => handleToggle(d.nombre, estados[d.nombre] || false)}
        onRegular={(v) => handleRegularLuz(d.nombre, v)}
      />
    );
  }

  function renderGroup(d) {
    return (
      <LightCard
        key={d.nombre}
        nombre={d.nombre}
        encendido={estados[d.nombre] || false}
        onToggle={() => handleToggle(d.nombre, estados[d.nombre] || false)}
      />
    );
  }

  function renderPersiana(d) {
    return (
      <ShutterControl
        key={d.nombre}
        nombre={d.nombre}
        posicion={posiciones[d.nombre] ?? 50}
        onRegular={(v) => handleRegularPersiana(d.nombre, v)}
        onSubir={() => handleSubirPersiana(d.nombre)}
        onBajar={() => handleBajarPersiana(d.nombre)}
      />
    );
  }

  if (zonaActual && zonaInfo) {
    const items = [...(dispsZona.grupos || []), ...(dispsZona.luces || []), ...(dispsZona.persianas || [])];
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction color="#A0AEC0" onPress={() => setZonaActual(null)} />
          <Appbar.Content
            title={zonaInfo.label}
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action icon="refresh" iconColor="#A0AEC0" onPress={cargar} />
        </Appbar.Header>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor="#4A00E0" />}
        >
          {items.map((d) =>
            d.tipo === "grupo_luz" ? renderGroup(d) :
            d.tipo === "luz" ? renderLight(d) :
            d.tipo === "persiana" ? renderPersiana(d) : null
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="SmartHome" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="refresh" iconColor="#A0AEC0" onPress={cargar} />
      </Appbar.Header>

      {error ? (
        <Banner
          visible={!!error}
          actions={[{ label: "Reintentar", onPress: cargar }]}
          icon="wifi-off"
          style={styles.banner}
        >
          {error}
        </Banner>
      ) : null}

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4A00E0" />
          <Text style={styles.loadingText}>Conectando con el hogar...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor="#4A00E0" />}
        >
          {totalLuz && (
            <Card style={styles.globalCard} onPress={() => handleToggle(totalLuz.nombre, estados[totalLuz.nombre] || false)}>
              <Card.Title
                title="Todas las luces"
                titleStyle={styles.globalTitle}
                left={(props) => <Icon source="lightbulb-group" size={22} color="#FFD166" />}
                right={(props) => (
                  <View style={estados[totalLuz.nombre] ? styles.globalBadgeOn : styles.globalBadgeOff}>
                    <Text style={estados[totalLuz.nombre] ? styles.globalBadgeTextOn : styles.globalBadgeTextOff}>
                      {estados[totalLuz.nombre] ? "ON" : "OFF"}
                    </Text>
                  </View>
                )}
              />
            </Card>
          )}

          {totalPersianas && (
            <Card style={styles.globalCard}>
              <Card.Title
                title="Todas las persianas"
                titleStyle={styles.globalTitle}
                left={(props) => <Icon source="blinds" size={22} color="#6C91C2" />}
              />
              <Card.Content style={styles.globalBtns}>
                <TouchableOpacity style={styles.globalBtn} onPress={() => handleSubirPersiana("todas las persianas")}>
                  <Icon source="chevron-up" size={20} color="#6C91C2" />
                  <Text style={styles.globalBtnText}>Subir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.globalBtn} onPress={() => handleBajarPersiana("todas las persianas")}>
                  <Icon source="chevron-down" size={20} color="#6C91C2" />
                  <Text style={styles.globalBtnText}>Bajar</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          )}

          <Text style={styles.sectionTitle}>Zonas</Text>
          <View style={styles.zonasGrid}>
            {ZONAS.map((zona) => {
              const z = getDispsPorZona(zona.key);
              const total = z.luces.length + z.grupos.length + z.persianas.length;
              if (total === 0) return null;
              return (
                <TouchableOpacity
                  key={zona.key}
                  style={styles.zonaCard}
                  activeOpacity={0.7}
                  onPress={() => setZonaActual(zona.key)}
                >
                  <Icon source={zona.icon} size={26} color={zona.color} />
                  <Text style={styles.zonaLabel}>{zona.label}</Text>
                  <Text style={styles.zonaDesc}>{zona.desc}</Text>
                  <Text style={styles.zonaCount}>{total} dispositivo{total !== 1 ? "s" : ""}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {sensores.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Clima</Text>
              {[...sensores].sort((a, b) => {
                const orden = ["temperatura actual salon", "temperatura cocina", "temperatura exterior", "consigna salon", "modo clima salon", "calidad aire cocina"];
                return orden.indexOf(a.nombre) - orden.indexOf(b.nombre);
              }).map((d) => (
                <SensorCard key={d.nombre} nombre={d.nombre} valor={sensoresValores[d.nombre]} />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D1A" },
  header: {
    backgroundColor: "#12121F",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  headerTitle: { color: "#ECECEC", fontWeight: "700", fontSize: 20 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { color: "#A0AEC0", fontSize: 14 },
  banner: { backgroundColor: "#2A1A1A" },

  sectionTitle: {
    color: "#A0AEC0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 12,
  },

  globalCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#1A1E2E",
    borderWidth: 1,
    borderColor: "#252A3E",
  },
  globalTitle: { color: "#ECECEC", fontSize: 15, fontWeight: "600", marginLeft: 4 },
  globalBadgeOn: {
    backgroundColor: "#3A3A1A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  globalBadgeOff: {
    backgroundColor: "#252A3E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  globalBadgeTextOn: { color: "#FFD166", fontSize: 12, fontWeight: "700" },
  globalBadgeTextOff: { color: "#666", fontSize: 12, fontWeight: "700" },
  globalBtns: { flexDirection: "row", gap: 12, paddingBottom: 12 },
  globalBtn: {
    flex: 1,
    backgroundColor: "#252A3E",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  globalBtnText: { color: "#6C91C2", fontSize: 13, fontWeight: "600" },

  zonasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  zonaCard: {
    width: "47%",
    backgroundColor: "#1A1E2E",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#252A3E",
    gap: 6,
  },
  zonaLabel: { color: "#ECECEC", fontSize: 16, fontWeight: "700" },
  zonaDesc: { color: "#A0AEC0", fontSize: 12 },
  zonaCount: { color: "#4A5568", fontSize: 11 },
});
