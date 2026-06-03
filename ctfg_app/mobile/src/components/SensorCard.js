import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Icon } from "react-native-paper";

const SENSOR_CONFIG = {
  "temperatura actual salon": { label: "Temperatura Salón", icon: "thermometer", unidad: "°C", color: "#FF6B6B" },
  "temperatura cocina": { label: "Temperatura Cocina", icon: "thermometer", unidad: "°C", color: "#DA77F2" },
  "temperatura exterior": { label: "Temperatura Exterior", icon: "weather-sunny", unidad: "°C", color: "#74C0FC" },
  "consigna salon": { label: "Consigna Salón", icon: "target", unidad: "°C", color: "#FFD166" },
  "modo clima salon": { label: "Modo Clima Salón", icon: "snowflake", unidad: "", color: "#69DB7C" },
  "calidad aire cocina": { label: "Calidad Aire Cocina", icon: "air-filter", unidad: "ppm", color: "#748FFC" },
};

export default function SensorCard({ nombre, valor }) {
  const config = SENSOR_CONFIG[nombre] || { label: nombre, icon: "chart-line", unidad: "", color: "#A0AEC0" };
  const fmtValor = (v) => {
    if (v === undefined || v === null) return "—";
    if (nombre === "modo clima salon") {
      const modos = ["Apagado", "Calor", "Frío", "Auto"];
      return modos[v] || `Modo ${v}`;
    }
    return `${v}${config.unidad ? " " + config.unidad : ""}`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Icon source={config.icon} size={22} color={config.color} />
        <View style={styles.info}>
          <Text style={styles.nombre}>{config.label}</Text>
          <Text style={styles.valor}>{fmtValor(valor)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: "#16161F",
    borderWidth: 1,
    borderColor: "#1E1E30",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  info: {
    flex: 1,
  },
  nombre: {
    color: "#A0AEC0",
    fontSize: 13,
  },
  valor: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ECECEC",
  },
});
