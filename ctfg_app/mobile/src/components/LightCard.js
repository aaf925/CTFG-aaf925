import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Switch, Text, Icon } from "react-native-paper";
import Slider_ from "@react-native-community/slider";

function formatearNombre(nombre) {
  let n = nombre
    .replace(/^intensidad luz /, "")
    .replace(/^luz /, "")
    .replace(/^luces /, "Luces ");
  n = n.charAt(0).toUpperCase() + n.slice(1);
  return n;
}

export default function LightCard({
  nombre,
  encendido = false,
  intensidad = 50,
  regulable = false,
  onToggle,
  onRegular,
}) {
  const [localIntensidad, setLocalIntensidad] = useState(0);

  useEffect(() => {
    if (!encendido) {
      setLocalIntensidad(0);
    } else {
      setLocalIntensidad(intensidad);
    }
  }, [encendido, intensidad]);

  return (
    <Card style={[styles.card, encendido ? styles.cardOn : styles.cardOff]}>
      <Card.Title
        title={formatearNombre(nombre)}
        titleStyle={styles.title}
        left={(props) => (
          <Icon
            source={encendido ? "lightbulb-on" : "lightbulb-outline"}
            size={22}
            color={encendido ? "#FFD166" : "#555"}
          />
        )}
        right={() => (
          <Switch
            value={encendido}
            onValueChange={onToggle}
            style={styles.switch}
            color="#FFD166"
          />
        )}
      />
      {regulable && (
        <Card.Content>
          <View style={styles.sliderRow}>
            <Icon source="brightness-5" size={16} color="#888" />
            <Slider_
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={localIntensidad}
              minimumTrackTintColor="#FFD166"
              maximumTrackTintColor="#444"
              thumbTintColor="#FFD166"
              onValueChange={setLocalIntensidad}
              onSlidingComplete={onRegular}
            />
            <Icon source="brightness-7" size={20} color="#FFD166" />
          </View>
          <Text style={styles.intensidadText}>{localIntensidad}%</Text>
        </Card.Content>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardOn: {
    backgroundColor: "#1E1E10",
    borderColor: "#3A3A10",
    borderLeftWidth: 3,
    borderLeftColor: "#FFD166",
  },
  cardOff: {
    backgroundColor: "#16161F",
    borderColor: "#1E1E30",
  },
  title: {
    color: "#ECECEC",
    fontSize: 15,
    fontWeight: "600",
  },
  switch: {
    marginRight: 12,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  intensidadText: {
    color: "#FFD166",
    fontSize: 12,
    textAlign: "right",
    marginTop: 2,
  },
});
