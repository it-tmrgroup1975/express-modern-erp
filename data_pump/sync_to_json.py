import pyodbc
import json
import os

def fetch_express_data():
    # กำหนด Path ให้ชัดเจน (Absolute Path)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_dir, "..", "api", "data", "staging", "ar_pending.json")
    
    # สร้างโฟลเดอร์รอไว้ถ้ายังไม่มี
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("Connecting to Express via ODBC...")
    try:
        # ใช้ DSN ที่ตั้งไว้ใน SysWOW64
        conn = pyodbc.connect("DSN=ExpressDB;")
        cursor = conn.cursor()

        # --- วางตรงนี้เพื่อดูภาพรวมของข้อมูลในตาราง ARTRN ---
        sql = "SELECT CUSCOD, DOCNUM, DOCDAT, REMAMT, NETAMT, RECTYP FROM ARTRN WHERE RECTYP IN ('0', '3', '4', '5', '9') AND REMAMT <> 0"
        
        print("--- สำรวจประเภทเอกสาร (RECTYP) ในระบบ ---")
        cursor.execute(sql)
        for row in cursor.fetchall():
            print(f"เอกสารประเภท: {row[0]} | จำนวน: {row[4]} รายการ")
        print("✅ ดึงข้อมูลหนี้ค้างชำระสำเร็จ!")
        
        # Query ลูกหนี้ค้างชำระ: RECTYP='S' (Invoice), REMAMT > 0 (ค้างชำระ)
        sql = "SELECT CUSCOD, DOCNUM, DOCDAT, REMAMT, NETAMT FROM ARTRN WHERE RECTYP='3' AND REMAMT > 0"
        cursor.execute(sql)
        
        columns = [column[0] for column in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            # จัดการเรื่อง Encoding ถ้าชื่อลูกค้าหรือข้อมูลมีภาษาไทย
            # โดยปกติ pyodbc จะจัดการให้ แต่ถ้าเพี้ยนเราจะมาแก้ที่นี่
            results.append(dict(zip(columns, row)))
            
        # บันทึกเป็น JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4, default=str)
            
        print(f"✅ Success! Exported {len(results)} records.")
        print(f"📁 File location: {os.path.abspath(output_path)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    fetch_express_data()