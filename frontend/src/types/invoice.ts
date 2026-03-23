// frontend/src/types/invoice.ts

export interface Invoice {
  doc_num: string;      // เลขที่เอกสาร (docnum จาก backend)
  cus_code: string;     // ชื่อลูกค้าหรือรหัสลูกค้า
  net_amt: number;      // ยอดเงินสุทธิ
  rem_amt: number;      // ยอดเงินคงค้าง
  doc_date: string;     // วันที่เอกสาร
  age_days: number;     // อายุหนี้ (นับจากวันที่เอกสาร)
  
  // ✅ เพิ่มฟิลด์เหล่านี้เพื่อให้ตรงกับลอจิกใหม่
  paytrm: number;       // เงื่อนไขการชำระเงิน (Credit Term)
  duedat: string;       // วันครบกำหนดชำระ
  overdue_days?: number; // จำนวนวันที่ค้างชำระจริง (Optional)
}