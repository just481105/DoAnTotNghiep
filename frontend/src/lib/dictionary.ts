import fs from "node:fs";
import path from "node:path";

// Chỉ dùng ở phía server
const FILE = path.join(
  process.cwd(),
  "content",
  "vocabulary",
  "grade-10",
  "oxford-3000.md",
);

export interface DictEntry {
  word: string;
  pos: string;
  ipa: string;
  meaning: string;
}

interface Indexed extends DictEntry {
  wordKey: string;
  meaningKey: string;
}

/** Bỏ dấu tiếng Việt và hạ chữ thường để so sánh. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

const ROW = /^\|\s*\d+\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/;

let cache: Indexed[] | null = null;

function load(): Indexed[] {
  if (cache) return cache;
  const raw = fs.readFileSync(FILE, "utf8");
  const rows: Indexed[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(ROW);
    if (!m) continue;
    const [, word, pos, ipa, meaning] = m;
    rows.push({
      word,
      pos,
      ipa,
      meaning,
      wordKey: normalize(word),
      meaningKey: normalize(meaning),
    });
  }
  cache = rows;
  return rows;
}

/**
 * Xếp hạng: 0 trùng hẳn, 1 bắt đầu bằng, 2 chứa trong từ, 3 khớp nghĩa tiếng Việt.
 * Trong cùng hạng, từ ngắn đứng trước.
 */
export function searchDictionary(query: string, limit = 30): DictEntry[] {
  const q = normalize(query);
  if (!q) return [];

  const hits: { rank: number; e: Indexed }[] = [];
  for (const e of load()) {
    let rank = -1;
    if (e.wordKey === q) rank = 0;
    else if (e.wordKey.startsWith(q)) rank = 1;
    else if (e.wordKey.includes(q)) rank = 2;
    else if (e.meaningKey.includes(q)) rank = 3;
    if (rank >= 0) hits.push({ rank, e });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.e.word.length - b.e.word.length ||
      a.e.word.localeCompare(b.e.word),
  );

  return hits.slice(0, limit).map(({ e }) => ({
    word: e.word,
    pos: e.pos,
    ipa: e.ipa,
    meaning: e.meaning,
  }));
}

export function dictionarySize(): number {
  return load().length;
}
