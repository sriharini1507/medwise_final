import React from "react";
import { Pressable, View, Text } from "react-native";
import { getPrice } from "../utils/analyze";

const compSummary = (it) =>
  [it.short_composition1, it.short_composition2]
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .join(" + ");

export default function DrugCard({ item, onPress }) {
  const price = getPrice(item);
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={{
        backgroundColor: "white",
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
      <Text style={{ color: "#555", marginTop: 2 }}>{compSummary(item) || "—"}</Text>
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        <Text style={{ color: "#777" }}>{item.manufacturer_name || "—"}</Text>
        <Text style={{ color: "#777", marginLeft: 10 }}>
          {item.pack_size_label || "—"}
        </Text>
        <Text style={{ marginLeft: "auto", fontWeight: "600" }}>
          {price != null ? `₹${price}` : "price n/a"}
        </Text>
      </View>
      {String(item.Is_discontinued || "").toUpperCase() === "TRUE" && (
        <Text style={{ color: "#8a0000", marginTop: 4 }}>Discontinued</Text>
      )}
    </Pressable>
  );
}
