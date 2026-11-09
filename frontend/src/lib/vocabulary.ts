import fs from "node:fs";
import path from "node:path";

// Chỉ dùng ở phía server (đọc file trong thư mục content/vocabulary)
const DIR = path.join(process.cwd(), "content", "vocabulary");

export interface VocabLessonMeta {
  slug: string;
  title: string;
  order: number;
  grade?: number | null;
  topic?: string | null;
  summary?: string | null;
}

export interface VocabLesson extends VocabLessonMeta {
  content: string;
}

function parseHeader(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2] };
}

// Quét tất cả file .md, kể cả trong thư mục con (grade-10, grade-11, grade-12)
function listMarkdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

function readLesson(filePath: string): (VocabLesson & { published: boolean }) | null {
  const slug = path.basename(filePath, ".md");
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseHeader(raw);
  return {
    slug,
    title: data.title || slug,
    order: Number(data.order) || 0,
    grade: data.grade ? Number(data.grade) : null,
    topic: data.topic || null,
    summary: data.summary || null,
    content: body.trim(),
    // bài có dòng "published: false" thì ẩn
    published: String(data.published).toLowerCase() !== "false",
  };
}

// Danh sách bài từ vựng đã công khai, sắp xếp theo lớp rồi theo số bài
export async function getAllVocabulary(): Promise<VocabLessonMeta[]> {
  if (!fs.existsSync(DIR)) return [];
  return listMarkdownFiles(DIR)
    .map(readLesson)
    .filter((l): l is VocabLesson & { published: boolean } => !!l && l.published)
    .sort((a, b) => (a.grade ?? 0) - (b.grade ?? 0) || a.order - b.order)
    .map(({ slug, title, order, grade, topic, summary }) => ({
      slug,
      title,
      order,
      grade,
      topic,
      summary,
    }));
}

export async function getVocabulary(slug: string): Promise<VocabLesson | null> {
  // chặn ký tự lạ để không đọc được file ngoài thư mục content
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  if (!fs.existsSync(DIR)) return null;
  const filePath = listMarkdownFiles(DIR).find(
    (f) => path.basename(f, ".md") === slug,
  );
  if (!filePath) return null;
  const lesson = readLesson(filePath);
  if (!lesson || !lesson.published) return null;
  const { published: _published, ...rest } = lesson;
  void _published;
  return rest;
}
