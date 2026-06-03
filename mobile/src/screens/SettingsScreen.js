import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  Appbar,
  Text,
  TextInput,
  Button,
  Divider,
  Chip,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "BACKEND_IP";
const DEFAULT_IP = "192.168.X.X";
const DEFAULT_PORT = "5000";

export default function SettingsScreen() {
  const [ip, setIp] = useState(DEFAULT_IP);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [guardado, setGuardado] = useState(false);
  const [testState, setTestState] = useState(null); // null | "ok" | "error"

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        const [savedIp, savedPort] = val.split(":");
        setIp(savedIp || DEFAULT_IP);
        setPort(savedPort || DEFAULT_PORT);
      }
    });
  }, []);

  const guardar = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, `${ip}:${port}`);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const testConexion = async () => {
    setTestState(null);
    try {
      const res = await fetch(`http://${ip}:${port}/dispositivos`, {
        signal: AbortSignal.timeout(3000),
      });
      setTestState(res.ok ? "ok" : "error");
    } catch {
      setTestState("error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Configuración" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.body}>
        {/* Sección servidor */}
        <Text style={styles.sectionLabel}>SERVIDOR BACKEND</Text>

        <TextInput
          label="IP del PC / servidor"
          value={ip}
          onChangeText={setIp}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          outlineColor="#2D2D40"
          activeOutlineColor="#4A00E0"
          textColor="#ECECEC"
          theme={{ colors: { background: "#12121F" } }}
          left={<TextInput.Icon icon="server-network" />}
        />
        <TextInput
          label="Puerto"
          value={port}
          onChangeText={setPort}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          outlineColor="#2D2D40"
          activeOutlineColor="#4A00E0"
          textColor="#ECECEC"
          theme={{ colors: { background: "#12121F" } }}
          left={<TextInput.Icon icon="numeric" />}
        />

        <Text style={styles.urlPreview}>
          URL activa: http://{ip}:{port}
        </Text>

        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={testConexion}
            style={styles.btnTest}
            textColor="#A0AEC0"
          >
            Probar conexión
          </Button>
          <Button
            mode="contained"
            onPress={guardar}
            style={styles.btnSave}
            buttonColor="#4A00E0"
          >
            {guardado ? "¡Guardado!" : "Guardar"}
          </Button>
        </View>

        {testState && (
          <Chip
            icon={testState === "ok" ? "check-circle" : "close-circle"}
            style={[
              styles.testChip,
              testState === "ok" ? styles.testOk : styles.testError,
            ]}
            textStyle={styles.testText}
          >
            {testState === "ok" ? "Servidor accesible ✓" : "No se pudo conectar ✗"}
          </Chip>
        )}

        <Divider style={styles.divider} />

        {/* Info del sistema */}
        <Text style={styles.sectionLabel}>INFORMACIÓN</Text>

        <InfoRow label="LLM" value="Ollama · qwen2.5:1.5b" />
        <InfoRow label="STT" value="Whisper · tiny · es" />
        <InfoRow label="Bus" value="KNX vía SpaceLynk" />
        <InfoRow label="IP SpaceLynk" value="192.168.X.X" />

        <Divider style={styles.divider} />

        <Text style={styles.ayuda}>
          Asegúrate de que el PC con el backend y el móvil estén en la misma red WiFi.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  label: { color: "#718096", fontSize: 13 },
  value: { color: "#ECECEC", fontSize: 13, fontWeight: "600" },
});

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
    padding: 20,
  },
  sectionLabel: {
    color: "#4A5568",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#12121F",
  },
  urlPreview: {
    color: "#4A5568",
    fontSize: 12,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  btnTest: {
    flex: 1,
    borderColor: "#2D2D40",
  },
  btnSave: {
    flex: 1,
  },
  testChip: {
    marginBottom: 8,
    borderRadius: 20,
  },
  testOk: {
    backgroundColor: "#1A3A2A",
  },
  testError: {
    backgroundColor: "#3A1A1A",
  },
  testText: {
    color: "#ECECEC",
    fontSize: 13,
  },
  divider: {
    backgroundColor: "#1E1E30",
    marginVertical: 20,
  },
  ayuda: {
    color: "#4A5568",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
