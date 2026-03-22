export interface Invoice {
  doc_num: string;
  cus_code: string;
  doc_date: string;
  rem_amt: number;
  net_amt: number;
  age_days: number; // เรามีฟิลด์นี้จาก Serializer แล้ว
}