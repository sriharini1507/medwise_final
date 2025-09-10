// src/screens/SearchScreen.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import data from "../../data/medicines.json";
import DrugCard from "../components/DrugCard";
import Fuse from "fuse.js";
import { getPrice } from "../utils/analyze";

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");       // committed query (set only when you tap Search)
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Faster search: prebuilt index + tuned keys/weights ----
  const SEARCH_KEYS = useMemo(
    () => [
      { name: "name", weight: 0.6 },
      { name: "short_composition1", weight: 0.25 },
      { name: "short_composition2", weight: 0.1 },
      { name: "manufacturer_name", weight: 0.05 },
    ],
    []
  );

  const fuseIndex = useMemo(
    () => Fuse.createIndex(SEARCH_KEYS, data),
    [SEARCH_KEYS]
  );

  const fuse = useMemo(
    () =>
      new Fuse(data, {
        keys: SEARCH_KEYS,
        includeScore: true,
        useExtendedSearch: false,
        threshold: 0.28,         // a bit stricter → better precision for "avil"
        ignoreLocation: true,
        minMatchCharLength: 2,
      }, fuseIndex),
    [SEARCH_KEYS, fuseIndex]
  );
  // ----------------------------------------------------------------

  const runSearch = useCallback(() => {
    setTerm(q.trim());
  }, [q]);

  // Also allow Enter/Return to search
  const onSubmit = useCallback(() => runSearch(), [runSearch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!term) {
        setResults([]);
        return;
      }
      setLoading(true);

      // Yield to UI so the spinner can render
      requestAnimationFrame(() => {
        // 1) Ask Fuse for a reasonably large, relevant pool
        const pool = fuse.search(term, { limit: 200 }); // indexed → fast

        // 2) Dedupe by id (keep best score)
        const bestById = new Map();
        for (const r of pool) {
          const prev = bestById.get(r.item.id);
          if (!prev || (r.score ?? 1) < prev.score) bestById.set(r.item.id, r);
        }
        let arr = Array.from(bestById.values());

        // 3) Sort by relevance, take top 50
        arr.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));
        arr = arr.slice(0, 50);

        // 4) Sort those strictly by price ASC, missing prices last
        arr.sort(
          (a, b) => (getPrice(a.item) ?? Infinity) - (getPrice(b.item) ?? Infinity)
        );

        // 5) Keep only top 10 for display
        const top10 = arr.slice(0, 10).map((x) => x.item);

        if (!cancelled) setResults(top10);
        if (!cancelled) setLoading(false);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [term, fuse]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f7fb" }}>
      {/* Search bar with button */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <TextInput
          placeholder="Search brand or ingredient (e.g., Avil, Azithromycin)"
          value={q}
          onChangeText={setQ}
          onSubmitEditing={onSubmit}              // press Enter to search
          autoCapitalize="none"
          style={{
            flex: 1,
            backgroundColor: "white",
            height: 48,
            paddingHorizontal: 16,
            borderRadius: 12,
          }}
        />
        <Pressable
          onPress={runSearch}
          style={{
            height: 48,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: "#2f5ef2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Search</Text>
        </Pressable>
      </View>

      {/* Empty / loading states */}
      {!term ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#777" }}>Enter a query and press Search</Text>
        </View>
      ) : loading ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#777" }}>Searching…</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#777", fontSize: 16 }}>No medicines found</Text>
          <Text style={{ color: "#999", marginTop: 6, textAlign: "center" }}>
            Try another brand name or ingredient spelling
          </Text>
        </View>
      ) : null}

      {/* Results (already top-10 & price-sorted) */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DrugCard
            item={item}
            onPress={(it) => navigation.navigate("Details", { item: it })}
          />
        )}
      />
    </View>
  );
}
