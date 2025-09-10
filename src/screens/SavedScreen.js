// src/screens/SavedScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrugCard from "../components/DrugCard";
import data from "../../data/medicines.json";

const STORAGE_KEY = "saved_ids";

export default function SavedScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      // keep saved order; fallback to dataset order
      const idSet = new Set(ids);
      const filtered = data.filter((x) => idSet.has(x.id));
      const ordered = ids.map((id) => filtered.find((x) => x.id === id)).filter(Boolean);
      setItems(ordered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    return unsub;
  }, [navigation, load]);

  const removeOne = async (id) => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    const next = ids.filter((x) => x !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clearAll = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setItems([]);
  };

  const renderItem = ({ item }) => (
    <View>
      <DrugCard
        item={item}
        onPress={(it) => navigation.navigate("Details", { item: it })}
      />
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginRight: 16, marginTop: -4 }}>
        <Pressable
          onPress={() => removeOne(item.id)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: "#f1f2f6",
            marginBottom: 6
          }}
        >
          <Text style={{ color: "#8a0000", fontWeight: "600" }}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!items.length) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f6f7fb",
          alignItems: "center",
          justifyContent: "center",
          padding: 24
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
          No saved drugs yet
        </Text>
        <Text style={{ color: "#777", textAlign: "center" }}>
          Save drugs from your search results to access them quickly here.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
      <View style={{ position: "absolute", right: 16, bottom: 16 }}>
        <Pressable
          onPress={clearAll}
          style={{
            backgroundColor: "#2f5ef2",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Clear All</Text>
        </Pressable>
      </View>
    </View>
  );
}
