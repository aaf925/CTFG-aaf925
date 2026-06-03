import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { Appbar, Text, Chip } from "react-native-paper";
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from "expo-audio";
import { api } from "../services/api";
import VoiceRecorder from "../components/VoiceRecorder";

const AUTO_STOP_MS = 8000;

export default function VoiceScreen() {
  const [grabando, setGrabando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const autoStopRef = useRef(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const agregarHistorial = (texto, ok, accion) => {
    setHistorial((h) => [
      { texto, ok, accion, ts: new Date().toLocaleTimeString() },
      ...h,
    ].slice(0, 10));
  };

  const detenerGrabacion = async () => {
    setProcesando(true);
    setGrabando(false);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri && typeof uri === "string") {
        const res = await api.procesarVoz(uri);
        if (res.accion && res.mensaje) {
          agregarHistorial(res.mensaje, true, res.accion);
        } else {
          const texto = res.texto || "No se entendió la orden";
          agregarHistorial(texto, res.ok, null);
        }
      }
    } catch (e) {
      agregarHistorial("Error al procesar el audio.", false, null);
    } finally {
      setProcesando(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
    };
  }, []);

  useEffect(() => {
    if (grabando) {
      autoStopRef.current = setTimeout(() => {
        detenerGrabacion();
      }, AUTO_STOP_MS);
    } else {
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
        autoStopRef.current = null;
      }
    }
  }, [grabando]);

  const iniciarGrabacion = async () => {
    try {
      const permiso = await requestRecordingPermissionsAsync();
      if (!permiso.granted) {
        agregarHistorial("Permiso de micrófono denegado.", false, null);
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      setGrabando(true);
    } catch (e) {
      agregarHistorial("Error al acceder al micrófono.", false, null);
    }
  };

  const handlePress = async () => {
    if (grabando) {
      await detenerGrabacion();
    } else if (!procesando) {
      await iniciarGrabacion();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Control por voz" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.recorderZone}>
        <VoiceRecorder
          grabando={grabando}
          procesando={procesando}
          onPress={handlePress}
        />
      </View>

      {historial.length > 0 && (
        <View style={styles.historialContainer}>
          <Text style={styles.historialTitle}>Historial</Text>
          <ScrollView style={styles.historialScroll} showsVerticalScrollIndicator={false}>
            {historial.map((entry, idx) => (
              <View key={idx} style={styles.entryRow}>
                <Chip
                  icon={entry.ok ? "check-circle" : "alert-circle"}
                  style={[
                    styles.chip,
                    entry.ok ? styles.chipOk : styles.chipError,
                  ]}
                  textStyle={styles.chipText}
                >
                  {entry.texto}
                </Chip>
                <Text style={styles.ts}>{entry.ts}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
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
  recorderZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  historialContainer: {
    maxHeight: 260,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#12121F",
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E1E30",
  },
  historialTitle: {
    color: "#A0AEC0",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  historialScroll: {
    flex: 1,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    flex: 1,
    borderRadius: 20,
  },
  chipOk: {
    backgroundColor: "#1A3A2A",
  },
  chipError: {
    backgroundColor: "#3A1A1A",
  },
  chipText: {
    color: "#ECECEC",
    fontSize: 13,
  },
  ts: {
    color: "#4A5568",
    fontSize: 11,
    minWidth: 55,
    textAlign: "right",
  },
});
