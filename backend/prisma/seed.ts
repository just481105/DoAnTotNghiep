import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'e6de30ce-ac04-487f-b376-163240602f84';

  // 1. Tạo/cập nhật User mẫu
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'student@example.com',
      passwordHash: 'dummy_hash',
      fullName: 'Bùi Đức Nam',
      role: Role.STUDENT,
    },
  });

  // 2. Dữ liệu từ vựng: Chủ đề "HuyForum: Economy"
  const economyWords = [
    {
      word: 'inflation',
      pos: 'noun',
      cefrLevel: 'B2',
      ipa: '/ɪnˈfleɪ.ʃən/',
      meaningVi: 'Sự lạm phát',
      meaningEn: 'A general increase in prices and fall in the purchasing value of money',
      exampleEn: 'High inflation reduces the purchasing power of consumers.',
      exampleVi: 'Lạm phát cao làm giảm sức mua của người tiêu dùng.',
      topic: 'HuyForum: Economy',
    },
    {
      word: 'revenue',
      pos: 'noun',
      cefrLevel: 'B2',
      ipa: '/ˈrev.ə.nuː/',
      meaningVi: 'Doanh thu, thu nhập',
      meaningEn: 'Income that a company or government receives regularly',
      exampleEn: 'The company reported a 15% increase in annual revenue.',
      exampleVi: 'Công ty đã báo cáo doanh thu hàng năm tăng 15%.',
      topic: 'HuyForum: Economy',
    },
    {
      word: 'investment',
      pos: 'noun',
      cefrLevel: 'B1',
      ipa: '/ɪnˈvest.mənt/',
      meaningVi: 'Sự đầu tư, vốn đầu tư',
      meaningEn: 'The act of putting money into something to make a profit',
      exampleEn: 'Foreign investment is crucial for economic growth.',
      exampleVi: 'Đầu tư nước ngoài rất quan trọng cho sự tăng trưởng kinh tế.',
      topic: 'HuyForum: Economy',
    },
  ];

  for (const item of economyWords) {
    await prisma.vocabulary.upsert({
      where: { word: item.word },
      update: { topic: item.topic },
      create: item,
    });
  }
  console.log('✅ Đã nạp thành công bộ từ vựng: HuyForum: Economy');

  // 3. Dữ liệu từ vựng: Chủ đề "Du lịch & Khám phá"
  const travelWords = [
    {
      word: 'itinerary',
      pos: 'noun',
      cefrLevel: 'B2',
      ipa: '/aɪˈtɪn.ər.ər.i/',
      meaningVi: 'Lịch trình, lộ trình chuyến đi',
      meaningEn: 'A detailed plan or route of a journey',
      exampleEn: 'We planned our itinerary carefully before traveling.',
      exampleVi: 'Chúng tôi đã lên lịch trình cẩn thận trước chuyến đi.',
      topic: 'Du lịch & Khám phá',
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
      topic: 'Du lịch & Khám phá',
    },
  ];

  for (const item of travelWords) {
    await prisma.vocabulary.upsert({
      where: { word: item.word },
      update: { topic: item.topic },
      create: item,
    });
  }
  console.log('✅ Đã nạp thành công bộ từ vựng: Du lịch & Khám phá');

  // 4. Dữ liệu Đề thi mẫu VSTEP Reading Mock Test 01
  const examSample = await (prisma as any).exam.upsert({
    where: { id: 'exam-vstep-b2-01' },
    update: {},
    create: {
      id: 'exam-vstep-b2-01',
      title: 'VSTEP Reading Mock Test 01 (B1 - B2)',
      description: 'Đề thi thử kỹ năng Đọc hiểu định dạng VSTEP kiểm tra từ vựng ngữ cảnh kinh tế và xã hội.',
      examType: 'VSTEP',
      durationMin: 15,
      totalMarks: 30,
      isPublished: true,
      questions: {
        create: [
          {
            skillType: 'READING',
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
            skillType: 'READING',
            prompt: 'Complete the sentence: "The government took strict measures to stimulate economic ______."',
            explanation: '"growth" collocated with economic represents overall progress in GDP.',
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
            skillType: 'READING',
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
  console.log('✅ Đã nạp thành công Đề thi mẫu:', examSample.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
