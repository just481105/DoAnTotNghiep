const fs = require("node:fs");
const path = require("node:path");

const DIR = path.resolve(__dirname, "../../frontend/content/grammar");

// [slug, tiêu đề, chuyên đề] — số thứ tự = vị trí trong mảng, tính riêng cho từng lớp
const SYLLABUS = {
  10: [
    ["cau-don", "Câu đơn trong tiếng Anh", "Câu"],
    ["cau-ghep", "Câu ghép trong tiếng Anh", "Câu"],
    ["cau-phuc", "Câu phức trong tiếng Anh", "Câu"],
    ["hien-tai-don-tiep-dien", "Thì hiện tại đơn và hiện tại tiếp diễn", "Thì"],
    ["qua-khu-don-tiep-dien", "Thì quá khứ đơn và quá khứ tiếp diễn", "Thì"],
    ["thi-hien-tai-hoan-thanh", "Thì hiện tại hoàn thành và quá khứ đơn", "Thì"],
    ["tuong-lai-will-going-to", "Diễn đạt tương lai: will, be going to, hiện tại tiếp diễn", "Thì"],
    ["danh-tu-dem-duoc", "Danh từ đếm được, không đếm được và số nhiều bất quy tắc", "Danh từ"],
    ["mao-tu-luong-tu", "Mạo từ a/an/the và lượng từ", "Mạo từ & lượng từ"],
    ["dai-tu-so-huu", "Đại từ, tính từ sở hữu và sở hữu cách", "Đại từ"],
    ["tinh-tu-trang-tu", "Tính từ và trạng từ", "Từ loại"],
    ["so-sanh-hon-nhat", "So sánh hơn và so sánh nhất", "So sánh"],
    ["so-sanh-bang", "So sánh bằng và các cấu trúc so sánh khác", "So sánh"],
    ["dong-tu-khuyet-thieu", "Động từ khuyết thiếu (modal verbs)", "Động từ"],
    ["to-v-nguyen-mau", "To V và động từ nguyên mẫu không to", "Động từ"],
    ["v-ing-to-v", "V-ing và to V: nhận biết và phân biệt", "Động từ"],
    ["gioi-tu-thoi-gian-noi-chon", "Giới từ chỉ thời gian và nơi chốn", "Giới từ"],
    ["cau-hoi-cau-hoi-duoi", "Câu hỏi Wh-, Yes/No và câu hỏi đuôi", "Câu hỏi"],
    ["cau-bi-dong-co-ban", "Câu bị động cơ bản", "Bị động"],
    ["cau-dieu-kien-loai-0-1", "Câu điều kiện loại 0 và loại 1", "Câu điều kiện"],
    ["lien-tu-tu-noi", "Liên từ và từ nối thông dụng", "Liên từ"],
    ["muc-dich-ly-do-ket-qua", "Diễn đạt mục đích, lý do, kết quả", "Mệnh đề trạng ngữ"],
    ["used-to-be-used-to", "Used to, be used to và get used to", "Cấu trúc"],
    ["on-tap-lop-10", "Ôn tập tổng hợp ngữ pháp lớp 10", "Ôn tập"],
  ],
  11: [
    ["hien-tai-hoan-thanh-tiep-dien", "Thì hiện tại hoàn thành tiếp diễn", "Thì"],
    ["qua-khu-hoan-thanh", "Thì quá khứ hoàn thành", "Thì"],
    ["tuong-lai-tiep-dien-hoan-thanh", "Thì tương lai tiếp diễn và tương lai hoàn thành", "Thì"],
    ["hoa-hop-chu-ngu-dong-tu", "Sự hòa hợp giữa chủ ngữ và động từ", "Hòa hợp"],
    ["cau-bi-dong-cac-thi", "Câu bị động ở các thì và với động từ khuyết thiếu", "Bị động"],
    ["bi-dong-dac-biet", "Bị động đặc biệt: It is said that... và have/get something done", "Bị động"],
    ["menh-de-quan-he", "Mệnh đề quan hệ", "Mệnh đề"],
    ["rut-gon-menh-de-quan-he", "Rút gọn mệnh đề quan hệ", "Mệnh đề"],
    ["cau-dieu-kien", "Câu điều kiện loại 1, 2, 3", "Câu điều kiện"],
    ["dieu-kien-hon-hop-unless", "Câu điều kiện hỗn hợp và các cách thay thế if", "Câu điều kiện"],
    ["cau-uoc-wish", "Câu ước với wish và if only", "Câu ước"],
    ["tuong-thuat-tran-thuat", "Câu tường thuật: câu trần thuật", "Câu tường thuật"],
    ["tuong-thuat-hoi-menh-lenh", "Câu tường thuật: câu hỏi, mệnh lệnh và lời đề nghị", "Câu tường thuật"],
    ["dong-tu-theo-sau-v-ing-to-v", "Động từ theo sau bởi V-ing hoặc to V", "Động từ"],
    ["menh-de-danh-tu", "Mệnh đề danh từ", "Mệnh đề"],
    ["menh-de-nhuong-bo", "Diễn đạt sự nhượng bộ: although, despite, however", "Mệnh đề trạng ngữ"],
    ["nguyen-nhan-ket-qua", "Nguyên nhân và kết quả: so...that, such...that, too, enough", "Mệnh đề trạng ngữ"],
    ["cum-dong-tu-thong-dung", "Cụm động từ (phrasal verbs) thông dụng", "Cụm động từ"],
    ["tu-han-dinh-luong-tu", "Từ hạn định: each, every, both, either, neither, all, none", "Từ hạn định"],
    ["gioi-tu-di-kem", "Giới từ đi kèm động từ, tính từ và danh từ", "Giới từ"],
    ["on-tap-lop-11", "Ôn tập tổng hợp ngữ pháp lớp 11", "Ôn tập"],
  ],
  12: [
    ["on-tap-cac-thi-phoi-thi", "Ôn tập các thì và sự phối thì", "Thì"],
    ["bi-dong-causative", "Bị động nâng cao và cấu trúc nhờ bảo: have, get, make, let", "Bị động"],
    ["menh-de-quan-he-nang-cao", "Mệnh đề quan hệ nâng cao", "Mệnh đề"],
    ["menh-de-phan-tu", "Mệnh đề phân từ và cụm phân từ", "Mệnh đề"],
    ["cau-dieu-kien-nang-cao", "Câu điều kiện nâng cao", "Câu điều kiện"],
    ["tuong-thuat-nang-cao", "Câu tường thuật nâng cao và động từ tường thuật", "Câu tường thuật"],
    ["lien-tu-tuong-quan", "Liên từ tương quan và cấu trúc song song", "Liên từ"],
    ["cau-che-nhan-manh", "Câu chẻ và cấu trúc nhấn mạnh (mở rộng)", "Nâng cao"],
    ["dao-ngu", "Đảo ngữ (mở rộng)", "Nâng cao"],
    ["menh-de-trang-ngu-tong-hop", "Mệnh đề trạng ngữ: thời gian, mục đích, nhượng bộ (tổng hợp)", "Mệnh đề trạng ngữ"],
    ["cum-dong-tu-theo-chu-de", "Cụm động từ theo chủ đề", "Cụm động từ"],
    ["collocations-thanh-ngu", "Cụm từ cố định và collocations thông dụng", "Từ vựng"],
    ["tu-noi-lien-ket-doan-van", "Từ nối và liên kết trong đoạn văn", "Luyện thi"],
    ["doc-dien-thong-bao", "Dạng bài đọc điền thông báo", "Luyện thi"],
    ["doc-dien-to-roi-quang-cao", "Dạng bài đọc điền tờ rơi, quảng cáo", "Luyện thi"],
    ["sap-xep-hoi-thoai-thu", "Dạng bài sắp xếp đoạn hội thoại, thư, đoạn văn", "Luyện thi"],
    ["ky-thuat-doc-hieu-dien-tu", "Kỹ thuật làm bài đọc hiểu và điền từ vào đoạn văn", "Luyện thi"],
    ["on-tap-lop-12", "Ôn tập tổng hợp và luyện đề tốt nghiệp", "Ôn tập"],
  ],
};

function parseHeader(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { data, body: m[2] };
}

function buildHeader(d) {
  const lines = Object.entries(d)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`);
  return ["---", ...lines, "---"].join("\n");
}

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const autoSummary = (title) => `Lý thuyết, ví dụ và bài tập về ${lowerFirst(title)}.`;

const stubBody = (title) => `
> Bài này đang được soạn.

## I. ${title}

(Nội dung đang cập nhật)

## II. Ví dụ

## III. Bài tập nhanh
`;

fs.mkdirSync(DIR, { recursive: true });

const kept = new Set();
let created = 0;

for (const [gradeStr, lessons] of Object.entries(SYLLABUS)) {
  const grade = Number(gradeStr);
  lessons.forEach(([slug, title, topic], i) => {
    const file = path.join(DIR, `${slug}.md`);
    const order = i + 1;

    if (fs.existsSync(file)) {
      // Bài đã có nội dung: chỉ cập nhật tiêu đề, thứ tự, lớp, chuyên đề
      const parsed = parseHeader(fs.readFileSync(file, "utf8"));
      if (!parsed) {
        console.warn("Bỏ qua (thiếu phần đầu ---):", slug);
        return;
      }
      const d = {
        title,
        order,
        grade,
        topic,
        summary: parsed.data.summary || autoSummary(title),
      };
      if (parsed.data.published) d.published = parsed.data.published;
      fs.writeFileSync(file, buildHeader(d) + "\n" + parsed.body);
      kept.add(slug);
    } else {
      const d = { title, order, grade, topic, summary: autoSummary(title), published: "false" };
      fs.writeFileSync(file, buildHeader(d) + "\n" + stubBody(title));
      created++;
    }
  });
}

let total = 0;
for (const [g, lessons] of Object.entries(SYLLABUS)) {
  total += lessons.length;
  console.log(`\nLớp ${g} (${lessons.length} bài)`);
  lessons.forEach(([slug, title], i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${title}${kept.has(slug) ? "   [giữ nội dung]" : ""}`);
  });
}
console.log(`\nTổng ${total} bài: ${kept.size} bài giữ nội dung, ${created} bài nháp mới (đang ẩn).`);
