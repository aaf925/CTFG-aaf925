import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { Appbar, Text, Snackbar, Icon } from "react-native-paper";
import { api } from "../services/api";

const ESCENAS = [
  {
    id: "bienvenida",
    label: "Bienvenida",
    descripcion: "Enciende el salon y sube persianas",
    icon: "home-variant",
    color: "#FFD166",
    colorBg: "#2A2410",
  },
  {
    id: "salida",
    label: "Salida",
    descripcion: "Apaga todas las luces y baja persianas",
    icon: "door-open",
    color: "#FF6B6B",
    colorBg: "#2A1010",
  },
];

export default function ScenesScreen() {
  const [snack, setSnack] = useState({ visible: false, mensaje: "", ok: true });
  const [cargando, setCargando] = useState({});

  const ejecutar = async (id) => {
    setCargando((c) => ({ ...c, [id]: true }));
    try {
      const res = await api.ejecutarEscena(id);
      setSnack({ visible: true, mensaje: res.mensaje || "Escena ejecutada", ok: res.ok });
    } catch {
      setSnack({ visible: true, mensaje: "Error de conexion", ok: false });
    } finally {
      setCargando((c) => ({ ...c, [id]: false }));
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Escenas" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Activa una escena para controlar varios dispositivos a la vez.
        </Text>

        <View style={styles.cardsContainer}>
          {ESCENAS.map((escena) => (
            <SceneCard
              key={escena.id}
              escena={escena}
              cargando={!!cargando[escena.id]}
              onPress={() => ejecutar(escena.id)}
            />
          ))}
        </View>
      </View>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={3000}
        style={[styles.snack, snack.ok ? styles.snackOk : styles.snackError]}
      >
        {snack.mensaje}
      </Snackbar>
    </View>
  );
}

function SceneCard({ escena, cargando, onPress }) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.sceneCard, { transform: [{ scale }] }]}>
      <TouchableOpacity
        style={[
          styles.sceneInner,
          { backgroundColor: escena.colorBg, borderColor: escena.color },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={cargando}
        activeOpacity={0.9}
      >
        <Icon source={escena.icon} size={48} color={escena.color} />
        <Text style={[styles.sceneLabel, { color: escena.color }]}>
          {escena.label}
        </Text>
        <Text style={styles.sceneDesc}>{escena.descripcion}</Text>
        {cargando && (
          <Text style={styles.cargandoText}>Ejecutando...</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  header: {
    backgroundColor: "#12121F",
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  headerTitle: {
    color: "#ECECEC",
    fontWeight: "700",
    fontSize: 20,
  },
  body: {
    flex: 1,
    padding: 24,
  },
  subtitle: {
    color: "#718096",
    fontSize: 14,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 20,
  },
  sceneCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
  },
  sceneInner: {
    padding: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 8,
  },
  sceneLabel: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sceneDesc: {
    color: "#718096",
    fontSize: 13,
    textAlign: "center",
  },
  cargandoText: {
    color: "#A0AEC0",
    fontSize: 12,
    fontStyle: "italic",
  },
  snack: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  snackOk: {
    backgroundColor: "#1A3A2A",
  },
  snackError: {
    backgroundColor: "#3A1A1A",
  },
});
