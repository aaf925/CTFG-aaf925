import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React, { useEffect } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import DashboardScreen from "./src/screens/DashboardScreen";
import VoiceScreen from "./src/screens/VoiceScreen";
import ScenesScreen from "./src/screens/ScenesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard: { focused: "home", unfocused: "home-outline" },
  Voz: { focused: "mic", unfocused: "mic-outline" },
  Escenas: { focused: "color-wand", unfocused: "color-wand-outline" },
  Ajustes: { focused: "settings", unfocused: "settings-outline" },
};

export default function App() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#0D0D1A");
    NavigationBar.setButtonStyleAsync("light");
  }, []);

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                const icons = ICONS[route.name];
                return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#4A00E0",
              tabBarInactiveTintColor: "#718096",
              tabBarStyle: {
                backgroundColor: "#12121F",
                borderTopColor: "#1E1E30",
                borderTopWidth: 1,
                paddingBottom: 6,
                paddingTop: 6,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: "600",
              },
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Voz" component={VoiceScreen} />
            <Tab.Screen name="Escenas" component={ScenesScreen} />
            <Tab.Screen name="Ajustes" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
}

registerRootComponent(App);
