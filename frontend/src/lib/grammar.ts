import fs from "node:fs";
import path from "node:path";

// Chỉ dùng ở phía server (đọc file trong thư mục content)
const DIR = path.join(process.cwd(), "content", "grammar");

export interface LessonMeta {
  slug: string;
  title: string;
  order: number;
  grade?: number | null;
  topic?: string | null;
  summary?: string | null;
}

export interface Lesson extends LessonMeta {
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

function readLesson(file: string): (Lesson & { published: boolean }) | null {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
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

// Danh sách bài đã công khai, sắp xếp theo lớp rồi theo số bài
export async function getAllLessons(): Promise<LessonMeta[]> {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readLesson)
    .filter((l): l is Lesson & { published: boolean } => !!l && l.published)
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

export async function getLesson(slug: string): Promise<Lesson | null> {
  // chặn ký tự lạ để không đọc được file ngoài thư mục content
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(DIR, file))) return null;
  const lesson = readLesson(file);
  if (!lesson || !lesson.published) return null;
  const { published: _published, ...rest } = lesson;
  void _published;
  return rest;
}
