import React, { useMemo, useState } from "react";
import { View, TextInput, Text, FlatList } from "react-native";
import DrugCard from "../components/DrugCard";
import data from "../../data/medicines.json";
import Fuse from "fuse.js";
import { getPrice } from "../utils/analyze";

export default function CompareScreen() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [picked, setPicked] = useState({ left: null, right: null });

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        threshold: 0.32,
        ignoreLocation: true,
        keys: ["name", "short_composition1", "short_composition2"]
      }),
    []
  );

  const list = (q) => (!q.trim() ? [] : fuse.search(q).map((r) => r.item).slice(0, 10));

  const renderCompareBox = (label, q, setQ, side) => (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "700", marginBottom: 6 }}>{label}</Text>
      <TextInput
        placeholder="Search brand or ingredient"
        value={q}
        onChangeText={(t) => {
          setQ(t);
          setPicked((p) => ({ ...p, [side]: null }));
        }}
        style={{
          backgroundColor: "white",
          height: 42,
          borderRadius: 10,
          paddingHorizontal: 12
        }}
      />
      {!picked[side] ? (
        <FlatList
          style={{ maxHeight: 180, marginTop: 8 }}
          data={list(q)}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <DrugCard item={item} onPress={() => setPicked((p) => ({ ...p, [side]: item }))} />
          )}
        />
      ) : (
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#f3f7ff",
            borderRadius: 12,
            padding: 12
          }}
        >
          <Text style={{ fontWeight: "600" }}>{picked[side].name}</Text>
          <Text>
            {(picked[side].short_composition1 || "").trim()}
            {picked[side].short_composition2
              ? ` + ${(picked[side].short_composition2 || "").trim()}`
              : ""}
          </Text>
          <Text>{picked[side].manufacturer_name}</Text>
          <Text>{picked[side].pack_size_label}</Text>
          <Text>
            {getPrice(picked[side]) != null ? `₹${getPrice(picked[side])}` : "price n/a"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7fb", padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        Drug Comparison
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {renderCompareBox("Drug A", left, setLeft, "left")}
        {renderCompareBox("Drug B", right, setRight, "right")}
      </View>
      {picked.left && picked.right ? (
        <View style={{ marginTop: 16, backgroundColor: "white", borderRadius: 12, padding: 12 }}>
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Summary</Text>
          <Text>
            Ingredients A: {(picked.left.short_composition1 || "").trim()}
            {picked.left.short_composition2 ? ` + ${(picked.left.short_composition2 || "").trim()}` : ""}
          </Text>
          <Text>
            Ingredients B: {(picked.right.short_composition1 || "").trim()}
            {picked.right.short_composition2 ? ` + ${(picked.right.short_composition2 || "").trim()}` : ""}
          </Text>
          <Text>
            Pack: {picked.left.pack_size_label || "—"} vs {picked.right.pack_size_label || "—"}
          </Text>
          <Text>
            Price: {getPrice(picked.left) != null ? `₹${getPrice(picked.left)}` : "n/a"}
            {"  "}vs{"  "}
            {getPrice(picked.right) != null ? `₹${getPrice(picked.right)}` : "n/a"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
