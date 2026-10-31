const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const mongoose = require("mongoose");

const DIR = path.resolve(process.cwd(), "../frontend/content/grammar");
const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eng_platform";

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, content: m[2] };
}

async function main() {
  await mongoose.connect(URI);
  const col = mongoose.connection.collection("grammar_lessons");
  await col.createIndex({ slug: 1 }, { unique: true });

  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const { data, content } = parseFrontmatter(
      fs.readFileSync(path.join(DIR, file), "utf8"),
    );
    const now = new Date();
    await col.updateOne(
      { slug },
      {
        $set: {
          title: data.title || slug,
          order: Number(data.order) || 0,
          grade: data.grade ? Number(data.grade) : null,
          topic: data.topic || null,
          summary: data.summary || null,
          content: content.trim(),
          isPublished: String(data.published).toLowerCase() !== "false",
          updatedAt: now,
        },
        $setOnInsert: { slug, createdAt: now },
      },
      { upsert: true },
    );
    console.log("✓", slug);
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
