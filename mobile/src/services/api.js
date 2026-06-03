import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEFAULT_IP =
  Platform.OS === "android" ? "10.0.2.2" : "192.168.X.X";
const DEFAULT_PORT = "5000";

async function getBaseUrl() {
  try {
    const val = await AsyncStorage.getItem("BACKEND_IP");
    if (val && val.includes(".")) return `http://${val}`;
  } catch {}
  return `http://${DEFAULT_IP}:${DEFAULT_PORT}`;
}

async function fetchWithTimeout(url, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  async getDispositivos() {
    const base = await getBaseUrl();
    const res = await fetchWithTimeout(`${base}/dispositivos`);
    if (!res.ok) throw new Error("Error en la respuesta del servidor");
    return res.json();
  },

  async getEstados() {
    const base = await getBaseUrl();
    const res = await fetchWithTimeout(`${base}/dispositivos/estados`);
    if (!res.ok) throw new Error("Error al obtener estados");
    return res.json();
  },

  async getDispositivo(nombre) {
    const base = await getBaseUrl();
    const res = await fetchWithTimeout(
      `${base}/dispositivo/${encodeURIComponent(nombre)}`
    );
    return res.json();
  },

  async enviarComando(dispositivo, accion, valor) {
    const base = await getBaseUrl();
    const res = await fetchWithTimeout(`${base}/comando`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dispositivo, accion, valor }),
    });
    return res.json();
  },

  async enviarAudio(audioUri) {
    const base = await getBaseUrl();
    const form = new FormData();
    form.append("audio", {
      uri: audioUri,
      type: "audio/wav",
      name: "orden.wav",
    });
    const res = await fetchWithTimeout(`${base}/voz`, {
      method: "POST",
      body: form,
      timeout: 15000,
    });
    return res.json();
  },

  async procesarVoz(audioUri) {
    const base = await getBaseUrl();
    const form = new FormData();
    form.append("audio", {
      uri: audioUri,
      type: "audio/wav",
      name: "orden.wav",
    });
    const res = await fetchWithTimeout(`${base}/procesar_voz`, {
      method: "POST",
      body: form,
      timeout: 15000,
    });
    return res.json();
  },

  async ejecutarEscena(nombre) {
    const base = await getBaseUrl();
    const res = await fetchWithTimeout(`${base}/escena/${nombre}`, {
      method: "POST",
    });
    return res.json();
  },
};
