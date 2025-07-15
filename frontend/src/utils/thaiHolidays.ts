// ข้อมูลวันหยุดราชการและวันหยุดนักขัตฤกษ์ของประเทศไทย
// อ้างอิงจากประกาศสำนักนายกรัฐมนตรี

export interface ThaiHoliday {
  date: string; // YYYY-MM-DD format
  name: string;
  nameEn: string;
  type: 'PUBLIC_HOLIDAY' | 'GOVERNMENT_HOLIDAY' | 'BANK_HOLIDAY';
  description?: string;
}

// ฟังก์ชันสร้างวันหยุดประจำปี
export const generateThaiHolidays = (year: number): ThaiHoliday[] => {
  const holidays: ThaiHoliday[] = [];

  // วันหยุดประจำปีที่แน่นอน
  const fixedHolidays = [
    { month: 1, day: 1, name: 'วันขึ้นปีใหม่', nameEn: 'New Year\'s Day' },
    { month: 4, day: 6, name: 'วันจักรี', nameEn: 'Chakri Memorial Day' },
    { month: 5, day: 1, name: 'วันแรงงานแห่งชาติ', nameEn: 'National Labour Day' },
    { month: 5, day: 5, name: 'วันฉัตรมงคล', nameEn: 'Coronation Day' },
    { month: 7, day: 28, name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', nameEn: 'King\'s Birthday' },
    { month: 8, day: 12, name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ', nameEn: 'Queen\'s Birthday' },
    { month: 10, day: 13, name: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว', nameEn: 'King Chulalongkorn Memorial Day' },
    { month: 12, day: 5, name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช', nameEn: 'King Bhumibol Memorial Day' },
    { month: 12, day: 10, name: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day' },
    { month: 12, day: 31, name: 'วันสิ้นปี', nameEn: 'New Year\'s Eve' },
  ];

  // เพิ่มวันหยุดประจำปีที่แน่นอน
  fixedHolidays.forEach(holiday => {
    holidays.push({
      date: `${year}-${holiday.month.toString().padStart(2, '0')}-${holiday.day.toString().padStart(2, '0')}`,
      name: holiday.name,
      nameEn: holiday.nameEn,
      type: 'PUBLIC_HOLIDAY'
    });
  });

  // วันหยุดที่ขึ้นกับปฏิทินจันทรคติ (ประมาณการ)
  // วันมาฆบูชา (ขึ้น 15 ค่ำ เดือน 3)
  const makhaBucha = calculateLunarHoliday(year, 3, 15);
  if (makhaBucha) {
    holidays.push({
      date: makhaBucha,
      name: 'วันมาฆบูชา',
      nameEn: 'Makha Bucha Day',
      type: 'PUBLIC_HOLIDAY'
    });
  }

  // วันวิสาขบูชา (ขึ้น 15 ค่ำ เดือน 6)
  const visakhaBucha = calculateLunarHoliday(year, 6, 15);
  if (visakhaBucha) {
    holidays.push({
      date: visakhaBucha,
      name: 'วันวิสาขบูชา',
      nameEn: 'Visakha Bucha Day',
      type: 'PUBLIC_HOLIDAY'
    });
  }

  // วันอาสาฬหบูชา (ขึ้น 15 ค่ำ เดือน 8)
  const asarnhaBucha = calculateLunarHoliday(year, 8, 15);
  if (asarnhaBucha) {
    holidays.push({
      date: asarnhaBucha,
      name: 'วันอาสาฬหบูชา',
      nameEn: 'Asarnha Bucha Day',
      type: 'PUBLIC_HOLIDAY'
    });
  }

  // วันเข้าพรรษา (แรม 1 ค่ำ เดือน 8)
  const khaoPhansa = calculateLunarHoliday(year, 8, -1);
  if (khaoPhansa) {
    holidays.push({
      date: khaoPhansa,
      name: 'วันเข้าพรรษา',
      nameEn: 'Khao Phansa Day',
      type: 'PUBLIC_HOLIDAY'
    });
  }

  // วันออกพรรษา (ขึ้น 15 ค่ำ เดือน 11)
  const okPhansa = calculateLunarHoliday(year, 11, 15);
  if (okPhansa) {
    holidays.push({
      date: okPhansa,
      name: 'วันออกพรรษา',
      nameEn: 'Ok Phansa Day',
      type: 'PUBLIC_HOLIDAY'
    });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
};

// ฟังก์ชันคำนวณวันหยุดตามปฏิทินจันทรคติ (ประมาณการ)
// ในที่นี้ใช้การประมาณการแบบง่าย ในการใช้งานจริงควรใช้ library ที่แม่นยำกว่า
function calculateLunarHoliday(year: number, lunarMonth: number, lunarDay: number): string | null {
  // การประมาณการแบบง่าย - ในทางปฏิบัติควรใช้ library เช่น moment-lunar หรือ similar
  // ตัวอย่างการประมาณการสำหรับปี 2024-2025
  
  const lunarHolidays: { [key: string]: string } = {
    // 2024
    '2024-02-24': 'makha', // วันมาฆบูชา 2024
    '2024-05-22': 'visakha', // วันวิสาขบูชา 2024
    '2024-07-20': 'asarnha', // วันอาสาฬหบูชา 2024
    '2024-07-21': 'khao', // วันเข้าพรรษา 2024
    '2024-10-17': 'ok', // วันออกพรรษา 2024
    
    // 2025
    '2025-02-13': 'makha', // วันมาฆบูชา 2025
    '2025-05-11': 'visakha', // วันวิสาขบูชา 2025
    '2025-07-09': 'asarnha', // วันอาสาฬหบูชา 2025
    '2025-07-10': 'khao', // วันเข้าพรรษา 2025
    '2025-10-06': 'ok', // วันออกพรรษา 2025
  };

  const key = `${year}-${lunarMonth.toString().padStart(2, '0')}-${Math.abs(lunarDay).toString().padStart(2, '0')}`;
  
  // ค้นหาวันหยุดที่ตรงกับ pattern
  for (const [date, type] of Object.entries(lunarHolidays)) {
    if (date.startsWith(`${year}-`) && type === getHolidayType(lunarMonth, lunarDay)) {
      return date;
    }
  }

  return null;
}

function getHolidayType(month: number, day: number): string {
  if (month === 3 && day === 15) return 'makha';
  if (month === 6 && day === 15) return 'visakha';
  if (month === 8 && day === 15) return 'asarnha';
  if (month === 8 && day === -1) return 'khao';
  if (month === 11 && day === 15) return 'ok';
  return '';
}

// ฟังก์ชันตรวจสอบว่าเป็นวันหยุดหรือไม่
export const isThaiHoliday = (date: string, holidays: ThaiHoliday[]): boolean => {
  return holidays.some(holiday => holiday.date === date);
};

// ฟังก์ชันหาวันหยุดตามวันที่
export const getHolidayByDate = (date: string, holidays: ThaiHoliday[]): ThaiHoliday | null => {
  return holidays.find(holiday => holiday.date === date) || null;
};

// ฟังก์ชันคำนวณวันทำงานจริง (ไม่รวมวันหยุด)
export const calculateActualWorkingDays = (year: number, month: number, holidays: ThaiHoliday[]): string[] => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const workingDays: string[] = [];
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];
    
    // นับเฉพาะวันจันทร์-ศุกร์ (1-5) และไม่ใช่วันหยุด
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !isThaiHoliday(dateString, holidays)) {
      workingDays.push(dateString);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// ข้อมูลวันหยุดเพิ่มเติมที่อาจประกาศโดยรัฐบาล
export const getAdditionalHolidays = (year: number): ThaiHoliday[] => {
  const additionalHolidays: { [key: number]: ThaiHoliday[] } = {
    2024: [
      { date: '2024-04-15', name: 'วันหยุดชดเชยวันสงกรานต์', nameEn: 'Songkran Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
      { date: '2024-12-30', name: 'วันหยุดชดเชยวันสิ้นปี', nameEn: 'New Year Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
    ],
    2025: [
      { date: '2025-04-14', name: 'วันหยุดชดเชยวันสงกรานต์', nameEn: 'Songkran Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
      { date: '2025-12-29', name: 'วันหยุดชดเชยวันสิ้นปี', nameEn: 'New Year Holiday Compensation', type: 'PUBLIC_HOLIDAY' },
    ]
  };

  return additionalHolidays[year] || [];
}; 