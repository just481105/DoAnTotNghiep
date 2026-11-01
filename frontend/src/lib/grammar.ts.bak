const API = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:5001";

export interface LessonMeta {
  id?: string;
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

export async function getAllLessons(): Promise<LessonMeta[]> {
  try {
    const res = await fetch(`${API}/grammar`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as LessonMeta[];
  } catch {
    return [];
  }
}

export async function getLesson(slug: string): Promise<Lesson | null> {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  try {
    const res = await fetch(`${API}/grammar/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Lesson;
  } catch {
    return null;
  }
}
