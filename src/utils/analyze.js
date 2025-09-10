import { norm, uniq } from "./text";

/** Parse price from "price(₹)" or "price" to a number (or null) */
export function getPrice(x) {
  const raw = x["price(₹)"] ?? x.price ?? null;
  if (raw == null || raw === "") return null;
  const n = parseFloat(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Extract ingredient names from short_composition fields (without doses) */
export function getIngredients(item) {
  const pick = (s) => {
    if (!s) return null;
    // keep text before first "(" → "Amoxycillin  (500mg)" -> "Amoxycillin"
    const name = s.split("(")[0].trim().replace(/\s+/g, " ");
    return name || null;
  };
  const a = pick(item.short_composition1);
  const b = pick(item.short_composition2);
  return [a, b].filter(Boolean).map((s) => norm(s));
}

/** Key to group products that share the same active ingredient set */
export function getActiveKey(item) {
  const names = getIngredients(item).sort(); // order independent
  return names.join(" + "); // e.g., "amoxycillin + clavulanic acid"
}

/**
 * Build report of alternatives with same active ingredients.
 * Handles price ranges, cheapest, manufacturers, packaging diffs, etc.
 */
export function analyzeAlternatives(picked, data) {
  const key = getActiveKey(picked);
  const family = data.filter((x) => getActiveKey(x) === key);

  const manufacturers = uniq(
    family.map((x) => x.manufacturer_name).filter(Boolean)
  );

  // price stats
  const withPrice = family.map((x) => ({ ...x, _price: getPrice(x) }));
  const prices = withPrice.filter((x) => x._price != null).map((x) => x._price);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const cheapest = prices.length
    ? withPrice.reduce((a, b) => (a._price <= b._price ? a : b))
    : null;

  // composition/packaging rows
  const diffs = family.map((x) => ({
    id: x.id,
    name: x.name,
    manufacturer: x.manufacturer_name,
    comp1: (x.short_composition1 || "").trim(),
    comp2: (x.short_composition2 || "").trim(),
    pack_size_label: x.pack_size_label || "—",
    type: x.type || "—",
    price: getPrice(x),
    discontinued: String(x.Is_discontinued || "").toUpperCase() === "TRUE"
  }));

  const anyDiscontinued = diffs.some((d) => d.discontinued);

  return {
    family,
    manufacturers,
    priceRange: { min, max },
    cheapest,
    diffs,
    activeKey: key, // normalized ingredient set string
    anyDiscontinued
  };
}
