import pdfplumber
import pandas as pd
import re

def clean_text(text):
    if text is None:
        return ""
    # แก้ปัญหาตัวอักษรขยะหรือช่องว่างที่เกินมา
    text = text.replace('\xa0', ' ')
    return " ".join(text.split())

def parse_factory_expense(pdf_path):
    all_data = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # ดึงตารางจากหน้า PDF
            table = page.extract_table({
                "vertical_strategy": "lines", 
                "horizontal_strategy": "lines"
            })
            
            if not table:
                continue
                
            for row in table[1:]:  # ข้าม Header row แรก
                # ตรวจสอบว่าแถวมีข้อมูลรหัสบัญชีหรือไม่
                if row[2] and any(c.isdigit() for c in row[2]):
                    # แยก Account Code และ Name (เช่น "508074 ค่าบริการ")
                    acc_info = clean_text(row[2])
                    acc_match = re.match(r'(\d+)\s*(.*)', acc_info)
                    acc_code = acc_match.group(1) if acc_match else ""
                    acc_name = acc_match.group(2) if acc_match else acc_info
                    
                    # จัดการรูปแบบวันที่ (เช่น 25/1/68 หรือ Jan-68)
                    date_info = clean_text(row[3])
                    
                    data_entry = {
                        "dept_name": clean_text(row[0]),     # ส่วนงานโรงงาน
                        "dept_code": clean_text(row[1]),     # F100
                        "account_code": acc_code,
                        "account_name": acc_name,
                        "date_str": date_info,
                        "amount": float(clean_text(row[5]).replace(',', '') or 0), # จำนวนเงิน
                        "supplier": clean_text(row[4]),      # SUP
                        "description": clean_text(row[7])    # รายละเอียด
                    }
                    all_data.append(data_entry)

    return pd.DataFrame(all_data)

# วิธีใช้งาน
df = parse_factory_expense("Input_Data1_Factory_Expense.pdf")

# บันทึกเป็น Excel เพื่อตรวจสอบข้อมูล
df.to_excel("Parsed_Factory_Expense.xlsx", index=False)
print(f"✅ Parse ข้อมูลสำเร็จ: {len(df)} รายการ")