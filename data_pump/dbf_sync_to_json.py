import pyodbc
import json
import os

def fetch_express_data():
    # 1. กำหนด Path หลักสำหรับ Staging Area
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # ปรับไปที่โฟลเดอร์ staging โดยตรง
    staging_dir = os.path.abspath(os.path.join(base_dir, "..", "api", "data", "staging"))
    os.makedirs(staging_dir, exist_ok=True)

    # 2. รายชื่อตารางที่ต้องการดึง (Focus ตามที่คุณระบุ)
    # ARMAS = ลูกค้า, ARTRN = รายการเคลื่อนไหว, ARBIL = ใบวางบิล, 
    # ARBAL = ยอดคงเหลือ, ARRCPCQ = เช็ครับ, ARRCPIT = รายการรับชำระ
    tables_to_sync = [
        "ARMAS", "ARTRN", "ARBIL", "ARBAL", "ARRCPCQ", "ARRCPIT"
    ]

    print(f"🚀 Starting Multi-Table Sync to: {staging_dir}")

    try:
        # เชื่อมต่อผ่าน DSN
        conn = pyodbc.connect("DSN=ExpressDB;", autocommit=True)
        cursor = conn.cursor()

        for table_name in tables_to_sync:
            print(f"📦 Fetching data from: {table_name}...")
            
            # ดึงข้อมูลทั้งหมดของตารางนั้นๆ 
            # Note: ในอนาคตถ้าข้อมูลเยอะมาก สามารถใส่ WHERE เพื่อเอาเฉพาะปีปัจจุบันได้
            sql = f"SELECT * FROM {table_name}"
            cursor.execute(sql)
            
            # ดึงชื่อ Columns
            columns = [column[0].lower() for column in cursor.description]
            results = []
            
            # วนลูปเก็บข้อมูล
            for row in cursor.fetchall():
                # แปลง Row เป็น Dict และจัดการเรื่อง String ที่มีช่องว่าง (Trim)
                row_dict = {}
                for i, value in enumerate(row):
                    if isinstance(value, str):
                        value = value.strip()
                    row_dict[columns[i]] = value
                results.append(row_dict)

            # 3. บันทึกแยกตามชื่อตาราง (e.g., armas.json, artrn.json)
            file_name = f"{table_name.lower()}.json"
            output_path = os.path.join(staging_dir, file_name)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=4, default=str)
                
            print(f"✅ Exported {table_name}: {len(results)} records")

    except Exception as e:
        print(f"❌ Critical Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🏁 All sync tasks completed. Connection closed.")

if __name__ == "__main__":
    fetch_express_data()