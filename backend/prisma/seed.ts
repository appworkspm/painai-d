import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ข้อมูลวันหยุดราชการไทยปี 2025
const thaiHolidays2025 = [
  // วันหยุดประจำปีที่แน่นอน
  { date: '2025-01-01', name: 'วันขึ้นปีใหม่', nameEn: 'New Year\'s Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-04-06', name: 'วันจักรี', nameEn: 'Chakri Memorial Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-05-01', name: 'วันแรงงานแห่งชาติ', nameEn: 'National Labour Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-05-05', name: 'วันฉัตรมงคล', nameEn: 'Coronation Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-07-28', name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', nameEn: 'King\'s Birthday', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-08-12', name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ', nameEn: 'Queen\'s Birthday', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-10-13', name: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว', nameEn: 'King Chulalongkorn Memorial Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-12-05', name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช', nameEn: 'King Bhumibol Memorial Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-12-10', name: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-12-31', name: 'วันสิ้นปี', nameEn: 'New Year\'s Eve', type: 'PUBLIC_HOLIDAY' },
  
  // วันหยุดตามปฏิทินจันทรคติ (ประมาณการ)
  { date: '2025-02-13', name: 'วันมาฆบูชา', nameEn: 'Makha Bucha Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-05-11', name: 'วันวิสาขบูชา', nameEn: 'Visakha Bucha Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-07-09', name: 'วันอาสาฬหบูชา', nameEn: 'Asarnha Bucha Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-07-10', name: 'วันเข้าพรรษา', nameEn: 'Khao Phansa Day', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-10-06', name: 'วันออกพรรษา', nameEn: 'Ok Phansa Day', type: 'PUBLIC_HOLIDAY' },
  
  // วันหยุดเพิ่มเติมที่อาจประกาศโดยรัฐบาล
  { date: '2025-04-14', name: 'วันหยุดชดเชยวันสงกรานต์', nameEn: 'Songkran Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
  { date: '2025-12-29', name: 'วันหยุดชดเชยวันสิ้นปี', nameEn: 'New Year Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
];

async function main() {
  console.log('🌴 Seeding Thai holidays 2025...');
  
  // เพิ่มข้อมูลวันหยุดราชการไทยปี 2025
  for (const holiday of thaiHolidays2025) {
    await prisma.holiday.upsert({
      where: { 
        date: new Date(holiday.date),
        name: holiday.name 
      },
      update: {
        nameEn: holiday.nameEn,
        type: holiday.type,
      },
      create: {
        date: new Date(holiday.date),
        name: holiday.name,
        nameEn: holiday.nameEn,
        type: holiday.type,
      },
    });
  }
  
  console.log('✅ Thai holidays 2025 seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 