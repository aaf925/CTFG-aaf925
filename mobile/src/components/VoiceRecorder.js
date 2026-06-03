import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Text, Icon } from "react-native-paper";

export default function VoiceRecorder({ grabando, procesando, onPress, nivelAudio = 0 }) {
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (grabando) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulso, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulso, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulso.stopAnimation();
      Animated.timing(pulso, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [grabando]);

  const bgColor = procesando
    ? "#2D2D40"
    : grabando
    ? "#C0392B"
    : "#4A00E0";

  const label = procesando
    ? "Procesando..."
    : grabando
    ? "Escuchando..."
    : "Toca para hablar";

  return (
    <View style={styles.wrapper}>
      <View style={styles.buttonGroup}>
        {grabando && (
          <Animated.View
            style={[
              styles.ring,
              { transform: [{ scale: pulso }], opacity: 0.4 },
            ]}
          />
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: bgColor }]}
          onPress={onPress}
          disabled={procesando}
          activeOpacity={0.8}
        >
          {procesando ? (
            <ActivityIndicator color="#FFF" size="large" />
          ) : (
            <Icon
              source={grabando ? "stop-circle" : "microphone"}
              size={48}
              color="#FFF"
            />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>{label}</Text>
      {grabando && (
        <Text style={styles.hint}>
          Vuelve a tocar para parar o espera 8 segundos
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonGroup: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ring: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#C0392B",
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#4A00E0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  label: {
    marginTop: 20,
    color: "#A0AEC0",
    fontSize: 15,
    fontWeight: "500",
  },
  hint: {
    marginTop: 6,
    color: "#4A5568",
    fontSize: 12,
    fontStyle: "italic",
  },
});
