import type { ParsedInvoiceItem } from "./xml-parser";
import type { PDVIngredient } from "@/hooks/use-pdv-ingredients";

export interface LearnedLink {
  product_code: string | null;
  product_ean: string | null;
  ingredient_id: string;
}

export type MatchConfidence = "auto" | "suggest" | "none";

export interface MatchCandidate {
  ingredient: PDVIngredient;
  score: number;
  reason: string;
}

export interface InvoiceItemMatch {
  confidence: MatchConfidence;
  best?: PDVIngredient;
  candidates: MatchCandidate[];
}

const STOP_WORDS = new Set([
  "kg", "g", "mg", "un", "und", "unid", "unidade", "pc", "pcs", "pç",
  "cx", "caixa", "lt", "l", "lts", "litro", "litros", "ml",
  "pct", "pacote", "fd", "fardo", "saco", "sc", "gr",
  "de", "da", "do", "das", "dos", "com", "sem", "para", "e",
]);

const UNIT_GROUPS: string[][] = [
  ["un", "und", "unid", "unidade", "pc", "pcs", "pç", "peca", "peça"],
  ["kg", "quilo", "quilos", "kilo"],
  ["g", "gr", "grama", "gramas"],
  ["lt", "l", "lts", "litro", "litros"],
  ["ml", "mililitro"],
  ["cx", "caixa"],
  ["pct", "pacote"],
  ["fd", "fardo"],
];

function normalizeText(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritics
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(str?: string | null): Set<string> {
  const norm = normalizeText(str);
  if (!norm) return new Set();
  const tokens = norm
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
  return new Set(tokens);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  a.forEach((t) => {
    if (b.has(t)) intersection += 1;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function unitsCompatible(a?: string | null, b?: string | null): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  return UNIT_GROUPS.some((g) => g.includes(na) && g.includes(nb));
}

function eanEqual(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  const na = String(a).replace(/\D/g, "");
  const nb = String(b).replace(/\D/g, "");
  if (!na || na === "0" || na.length < 8) return false;
  return na === nb;
}

function codeEqual(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return normalizeText(a) === normalizeText(b);
}

export function matchInvoiceItem(
  item: ParsedInvoiceItem,
  ingredients: PDVIngredient[],
  learnedLinks: LearnedLink[] = [],
  options: { itemNcm?: string | null } = {}
): InvoiceItemMatch {
  // 1) Learned link wins
  const learned = learnedLinks.find(
    (l) =>
      (item.productEan && eanEqual(l.product_ean, item.productEan)) ||
      (item.productCode && codeEqual(l.product_code, item.productCode))
  );
  if (learned) {
    const ing = ingredients.find((i) => i.id === learned.ingredient_id);
    if (ing) {
      return {
        confidence: "auto",
        best: ing,
        candidates: [{ ingredient: ing, score: 1, reason: "Vínculo aprendido" }],
      };
    }
  }

  // 2) EAN exact
  if (item.productEan) {
    const byEan = ingredients.find((i) => eanEqual(i.ean, item.productEan));
    if (byEan) {
      return {
        confidence: "auto",
        best: byEan,
        candidates: [{ ingredient: byEan, score: 1, reason: "EAN igual" }],
      };
    }
  }

  // 3) Code exact
  if (item.productCode) {
    const byCode = ingredients.find((i) => codeEqual(i.code, item.productCode));
    if (byCode) {
      return {
        confidence: "auto",
        best: byCode,
        candidates: [{ ingredient: byCode, score: 1, reason: "Código igual" }],
      };
    }
  }

  // 4) Name similarity (ranked, with NCM/unit boost)
  const itemTokens = tokenize(item.productName);
  if (itemTokens.size === 0) {
    return { confidence: "none", candidates: [] };
  }

  const ranked: MatchCandidate[] = [];
  for (const ing of ingredients) {
    const sim = jaccard(itemTokens, tokenize(ing.name));
    if (sim < 0.4) continue;
    let score = sim;
    const reasons: string[] = [`Nome ${(sim * 100).toFixed(0)}% similar`];
    if (unitsCompatible(item.unit, ing.unit)) {
      score += 0.05;
    } else {
      score -= 0.1;
      reasons.push("unidade diferente");
    }
    ranked.push({ ingredient: ing, score, reason: reasons.join(" • ") });
  }

  ranked.sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 3);

  if (top.length === 0) {
    return { confidence: "none", candidates: [] };
  }

  const best = top[0];
  // Auto-link only if very high name match AND unit compatible AND no close runner-up
  if (
    best.score >= 0.9 &&
    unitsCompatible(item.unit, best.ingredient.unit) &&
    (top[1] === undefined || best.score - top[1].score >= 0.2)
  ) {
    return { confidence: "auto", best: best.ingredient, candidates: top };
  }

  if (best.score >= 0.5) {
    return { confidence: "suggest", best: best.ingredient, candidates: top };
  }

  return { confidence: "none", candidates: top };
}
