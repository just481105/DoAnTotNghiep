import fs from "fs";
import path from "path";

export type WritingPrompt = {
  id: string; // tên file, dùng cho ?topic=
  title: string; // tên hiện trên thẻ
  promptTitle: string; // tiêu đề đề bài
  type: string; // "VSTEP Task 1 (Letter)" / "VSTEP Task 2 (Essay)"
  taskType: "VSTEP_TASK_1" | "VSTEP_TASK_2";
  description: string; // nội dung đề (phần thân file)
  order: number;
  grade: number;
  emoji: string;
  tone: string;
};

const DIR = path.join(process.cwd(), "content", "writing");

function parse(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2].trim() };
}

export function getWritingPrompts(): WritingPrompt[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, body } = parse(fs.readFileSync(path.join(DIR, file), "utf-8"));
      const type = data.type || "VSTEP Task 2";
      return {
        id: file.replace(/\.md$/, ""),
        title: data.title || file,
        promptTitle: data.promptTitle || data.title || file,
        type,
        taskType: type.includes("Task 1") ? "VSTEP_TASK_1" : "VSTEP_TASK_2",
        description: body,
        order: Number(data.order) || 99,
        grade: Number(data.grade) || 12,
        emoji: data.emoji || "📝",
        tone: data.tone || "from-sky-100 to-indigo-200",
        published: data.published !== "false",
      } as WritingPrompt & { published: boolean };
    })
    .filter((p) => (p as any).published)
    .sort((a, b) => a.order - b.order);
}
