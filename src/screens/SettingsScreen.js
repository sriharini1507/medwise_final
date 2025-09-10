// src/screens/SettingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Switch, Pressable, Alert, Linking, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  notifications: "settings_notifications",
  priceAlerts: "settings_price_alerts",
};

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);

  // Load saved settings
  useEffect(() => {
    (async () => {
      try {
        const n = await AsyncStorage.getItem(STORAGE_KEYS.notifications);
        const p = await AsyncStorage.getItem(STORAGE_KEYS.priceAlerts);
        if (n !== null) setNotifications(n === "1");
        if (p !== null) setPriceAlerts(p === "1");
      } catch (e) {
        // best-effort; keep defaults
      }
    })();
  }, []);

  // Persist when toggled
  const onToggle = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value ? "1" : "0");
    } catch (e) {
      // ignore
    }
  };

  const handleHelp = () =>
    Alert.alert(
      "Help & FAQ",
      "• Search by brand or ingredient (e.g., “Avil”, “Azithromycin”).\n• Tap a result to see alternatives with the same ingredients.\n• Prices are approximate from your JSON data.",
      [{ text: "OK" }]
    );

  const handleAbout = () =>
    Alert.alert(
      "About",
      "Medicine Finder v1.0.0\nThis app compares drugs using a local JSON dataset.\nAlways consult healthcare professionals.",
      [{ text: "OK" }]
    );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f6f7fb" }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Settings</Text>

      {/* Preferences */}
      <View style={{ backgroundColor: "white", borderRadius: 14, padding: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>Preferences</Text>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
          <Text style={{ fontSize: 16 }}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={(v) => {
              setNotifications(v);
              onToggle(STORAGE_KEYS.notifications, v);
            }}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 6 }} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
          <Text style={{ fontSize: 16 }}>Price Alerts</Text>
          <Switch
            value={priceAlerts}
            onValueChange={(v) => {
              setPriceAlerts(v);
              onToggle(STORAGE_KEYS.priceAlerts, v);
            }}
          />
        </View>
      </View>

      {/* Support */}
      <View style={{ backgroundColor: "white", borderRadius: 14, padding: 14, marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>Support</Text>

        <Pressable onPress={handleHelp} style={{ paddingVertical: 10 }}>
          <Text style={{ fontSize: 16 }}>Help & FAQ</Text>
        </Pressable>

        <View style={{ height: 1, backgroundColor: "#eee" }} />

        <Pressable onPress={handleAbout} style={{ paddingVertical: 10 }}>
          <Text style={{ fontSize: 16 }}>About</Text>
        </Pressable>
      </View>

      {/* Footer disclaimer */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: "white",
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: "#f1f1f1",
        }}
      >
        <Text style={{ color: "#8a0000", fontWeight: "700", marginBottom: 6 }}>Medical Disclaimer</Text>
        <Text style={{ color: "#6b6b6b" }}>
          This app is for informational purposes only and should not replace professional medical advice. Always consult your
          healthcare provider. Prices are approximate and may vary by location and pharmacy.
        </Text>
      </View>
    </ScrollView>
  );
}
