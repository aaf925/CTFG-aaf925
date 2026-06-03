import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, Icon } from "react-native-paper";
import Slider from "@react-native-community/slider";

function formatearNombre(nombre) {
  let n = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  return n;
}

export default function ShutterControl({ nombre, posicion = 50, onRegular, onSubir, onBajar }) {
  const [localPos, setLocalPos] = useState(posicion);

  const formatLabel = (v) => {
    if (v === 0) return "Cerrado";
    if (v === 100) return "Abierto";
    return `${v}%`;
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={formatearNombre(nombre)}
        titleStyle={styles.title}
        subtitle={formatLabel(localPos)}
        subtitleStyle={styles.subtitle}
        left={(props) => <Icon source="blinds" size={22} color="#6C91C2" />}
      />
      <Card.Content>
        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setLocalPos(0);
              if (onBajar) onBajar();
              else if (onRegular) onRegular(0);
            }}
          >
            <Icon source="chevron-down" size={18} color="#A0AEC0" />
            <Text style={styles.btnText}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setLocalPos(100);
              if (onSubir) onSubir();
              else if (onRegular) onRegular(100);
            }}
          >
            <Icon source="chevron-up" size={18} color="#A0AEC0" />
            <Text style={styles.btnText}>Abrir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sliderRow}>
          <Icon source="arrow-collapse-down" size={16} color="#6C91C2" />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={5}
            value={localPos}
            minimumTrackTintColor="#6C91C2"
            maximumTrackTintColor="#444"
            thumbTintColor="#6C91C2"
            onValueChange={setLocalPos}
            onSlidingComplete={onRegular}
          />
          <Icon source="arrow-expand-up" size={16} color="#6C91C2" />
        </View>
      </Card.Content>
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
    borderLeftWidth: 3,
    borderLeftColor: "#6C91C2",
  },
  title: {
    color: "#ECECEC",
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    color: "#6C91C2",
    fontSize: 12,
  },
  quickButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: "#252A3E",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  btnText: {
    color: "#A0AEC0",
    fontSize: 12,
    fontWeight: "600",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
