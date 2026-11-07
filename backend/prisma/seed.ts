import { PrismaClient, Role, ExamType, SkillType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'student@example.com';
const DEMO_PASSWORD = 'Demo@12345';

// Thêm chủ đề mới: copy một object bên dưới, đổi nội dung và topic.
const vocabularies = [
  {
    word: 'inflation',
    pos: 'noun',
    cefrLevel: 'B2',
    ipa: '/ɪnˈfleɪ.ʃən/',
    meaningVi: 'Sự lạm phát',
    meaningEn: 'A general increase in prices and fall in the purchasing value of money',
    exampleEn: 'High inflation reduces the purchasing power of consumers.',
    exampleVi: 'Lạm phát cao làm giảm sức mua của người tiêu dùng.',
    collocations: ['rising inflation (lạm phát gia tăng)', 'control inflation (kiềm chế lạm phát)'],
    topic: 'Economy',
  },
  {
    word: 'revenue',
    pos: 'noun',
    cefrLevel: 'B2',
    ipa: '/ˈrev.ə.nuː/',
    meaningVi: 'Doanh thu, thu nhập',
    meaningEn: 'Income that a company or government receives regularly',
    exampleEn: 'The company reported a 15% increase in annual revenue.',
    exampleVi: 'Công ty báo cáo doanh thu hàng năm tăng 15%.',
    collocations: ['annual revenue (doanh thu hàng năm)', 'generate revenue (tạo ra doanh thu)'],
    topic: 'Economy',
  },
  {
    word: 'investment',
    pos: 'noun',
    cefrLevel: 'B1',
    ipa: '/ɪnˈvest.mənt/',
    meaningVi: 'Sự đầu tư, vốn đầu tư',
    meaningEn: 'The act of putting money into something to make a profit',
    exampleEn: 'Foreign investment is crucial for economic growth.',
    exampleVi: 'Đầu tư nước ngoài rất quan trọng cho tăng trưởng kinh tế.',
    collocations: ['foreign investment (đầu tư nước ngoài)', 'make an investment (thực hiện đầu tư)'],
    topic: 'Economy',
  },
  {
    word: 'itinerary',
    pos: 'noun',
    cefrLevel: 'B2',
    ipa: '/aɪˈtɪn.ər.ər.i/',
    meaningVi: 'Lịch trình chuyến đi',
    meaningEn: 'A detailed plan or route of a journey',
    exampleEn: 'We planned our itinerary carefully before traveling.',
    exampleVi: 'Chúng tôi lên lịch trình cẩn thận trước chuyến đi.',
    collocations: ['plan an itinerary (lên lịch trình)', 'a detailed itinerary (lịch trình chi tiết)'],
    topic: 'Du lịch',
  },
  {
    word: 'destination',
    pos: 'noun',
    cefrLevel: 'B1',
    ipa: '/ˌdes.tɪˈneɪ.ʃən/',
    meaningVi: 'Điểm đến',
    meaningEn: 'The place where someone is going',
    exampleEn: 'Paris is a popular tourist destination.',
    exampleVi: 'Paris là một điểm đến du lịch nổi tiếng.',
    collocations: ['tourist destination (điểm đến du lịch)', 'reach your destination (đến nơi)'],
    topic: 'Du lịch',
  },
];

async function main() {
  // 1. User demo (đăng nhập được)
  const passwordHash = await hash(DEMO_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      fullName: 'Bùi Đức Nam',
      role: Role.STUDENT,
    },
  });
  console.log(`✅ User demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // 2. Từ vựng
  for (const item of vocabularies) {
    await prisma.vocabulary.upsert({
      where: { word: item.word },
      update: item,
      create: item,
    });
  }
  console.log(`✅ Đã nạp ${vocabularies.length} từ vựng`);

  // 3. Đề thi mẫu
  const examId = 'exam-vstep-b2-01';
  const exam = await prisma.exam.upsert({
    where: { id: examId },
    update: {},
    create: {
      id: examId,
      title: 'VSTEP Reading Mock Test 01 (B1 - B2)',
      description: 'Đề thi thử kỹ năng Đọc hiểu định dạng VSTEP, từ vựng kinh tế và xã hội.',
      examType: ExamType.VSTEP,
      durationMin: 15,
      totalMarks: 30,
      isPublished: true,
      questions: {
        create: [
          {
            skillType: SkillType.READING,
            prompt: 'Which word is closest in meaning to "inflation" in an economic context?',
            explanation: 'Inflation means a general increase in prices and fall in the purchasing value of money.',
            orderIndex: 1,
            options: {
              create: [
                { optionLabel: 'A', content: 'A decrease in product quality', isCorrect: false },
                { optionLabel: 'B', content: 'A general increase in prices', isCorrect: true },
                { optionLabel: 'C', content: 'An increase in unemployment', isCorrect: false },
                { optionLabel: 'D', content: 'A reduction in taxes', isCorrect: false },
              ],
            },
          },
          {
            skillType: SkillType.READING,
            prompt: 'Complete the sentence: "The government took strict measures to stimulate economic ______."',
            explanation: '"growth" is the noun that collocates with "economic".',
            orderIndex: 2,
            options: {
              create: [
                { optionLabel: 'A', content: 'growth', isCorrect: true },
                { optionLabel: 'B', content: 'grow', isCorrect: false },
                { optionLabel: 'C', content: 'grew', isCorrect: false },
                { optionLabel: 'D', content: 'grown', isCorrect: false },
              ],
            },
          },
          {
            skillType: SkillType.READING,
            prompt: 'Choose the word closest in meaning to "resilient":',
            explanation: 'Resilient means able to recover quickly from difficult conditions.',
            orderIndex: 3,
            options: {
              create: [
                { optionLabel: 'A', content: 'Fragile and weak', isCorrect: false },
                { optionLabel: 'B', content: 'Quick to recover', isCorrect: true },
                { optionLabel: 'C', content: 'Slow to respond', isCorrect: false },
                { optionLabel: 'D', content: 'Careless', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Đã nạp đề thi:', exam.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
