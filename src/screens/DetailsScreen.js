// src/screens/DetailsScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataset from "../../data/medicines.json";
import {
  analyzeAlternatives,
  getPrice,
  getIngredients
} from "../utils/analyze";

const STORAGE_KEY = "saved_ids";

export default function DetailsScreen({ route }) {
  const { item } = route.params;

  // Build the report for same-ingredient alternatives
  const report = useMemo(() => analyzeAlternatives(item, dataset), [item]);
  const { priceRange, cheapest, manufacturers, diffs, activeKey, anyDiscontinued } = report;

  const price = getPrice(item);
  const ingredients = getIngredients(item);

  // ----- Save / Unsave handling -----
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const ids = raw ? JSON.parse(raw) : [];
        setIsSaved(ids.includes(item.id));
      } catch {
        // ignore
      }
    })();
  }, [item.id]);

  const toggleSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      if (ids.includes(item.id)) {
        const next = ids.filter((x) => x !== item.id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setIsSaved(false);
      } else {
        const next = Array.from(new Set([...ids, item.id]));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setIsSaved(true);
      }
    } catch (e) {
      Alert.alert("Error", "Could not update saved list. Please try again.");
    }
  };
  // -----------------------------------

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" }}>{item.name}</Text>
        <Text style={{ color: "#555", marginTop: 4 }}>
          Ingredients: {(item.short_composition1 || "").trim()}
          {item.short_composition2 ? ` + ${(item.short_composition2 || "").trim()}` : ""}
        </Text>
        <Text style={{ color: "#777", marginTop: 2 }}>
          Grouped by ingredient set: {activeKey || "—"}
        </Text>
        <Text style={{ marginTop: 4 }}>{item.pack_size_label || "—"}</Text>
        {price != null && <Text style={{ marginTop: 4 }}>Listed price: ₹{price}</Text>}
        {String(item.Is_discontinued || "").toUpperCase() === "TRUE" && (
          <Text style={{ color: "#8a0000", marginTop: 4 }}>This item is discontinued.</Text>
        )}

        {/* Save / Unsave button */}
        <Pressable
          onPress={toggleSave}
          style={{
            alignSelf: "flex-start",
            backgroundColor: isSaved ? "#10b981" : "#2f5ef2",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 10,
            marginTop: 12
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            {isSaved ? "Saved ✓" : "Save"}
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 6 }}>
          Other brands/generics with the same active ingredient(s)
        </Text>
        <Text style={{ color: "#333" }}>
          Manufacturers: {manufacturers.join(", ") || "—"}
        </Text>

        <Text style={{ marginTop: 6 }}>
          Price range (approx):{" "}
          {priceRange.min == null ? "n/a" : `₹${priceRange.min}`} –{" "}
          {priceRange.max == null ? "n/a" : `₹${priceRange.max}`}
        </Text>

        {cheapest ? (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#e9f9ef",
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#bfeccc"
            }}
          >
            <Text style={{ fontWeight: "700" }}>Lowest-cost option</Text>
            <Text>
              {cheapest.name} • ₹{cheapest._price} • {cheapest.manufacturer_name}
            </Text>
          </View>
        ) : null}

        {anyDiscontinued && (
          <Text style={{ marginTop: 8, color: "#8a3b00" }}>
            Note: Some versions in this group are discontinued (availability may vary).
          </Text>
        )}
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
          Composition & packaging differences
        </Text>
        {diffs.map((d) => (
          <View
            key={d.id}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10
            }}
          >
            <Text style={{ fontWeight: "600" }}>{d.name}</Text>
            <Text style={{ color: "#666" }}>{d.manufacturer}</Text>
            <Text>Comp-1: {d.comp1 || "—"}</Text>
            {d.comp2 ? <Text>Comp-2: {d.comp2}</Text> : null}
            <Text>Pack: {d.pack_size_label}</Text>
            <Text>Type: {d.type}</Text>
            <Text>Price: {d.price == null ? "n/a" : `₹${d.price}`}</Text>
            {d.discontinued && (
              <Text style={{ marginTop: 4, color: "#8a0000" }}>Discontinued</Text>
            )}
          </View>
        ))}
      </View>

      <View
        style={{
          margin: 16,
          backgroundColor: "#fff4f4",
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: "#ffdede"
        }}
      >
        <Text style={{ fontWeight: "700", color: "#8a0000" }}>
          Medical disclaimer
        </Text>
        <Text style={{ marginTop: 4, color: "#7b2d2d" }}>
          This app is for informational purposes only and should not replace
          professional medical advice. Always consult a qualified healthcare
          provider before changing medication. Prices are approximate and may
          vary by location and pharmacy.
        </Text>
      </View>
    </ScrollView>
  );
}
