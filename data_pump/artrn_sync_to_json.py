import pyodbc
import json
import os

def fetch_artrn_joined_data():
    # 1. กำหนด Path สำหรับจัดเก็บไฟล์ JSON (อ้างอิงจากโครงสร้างโปรเจกต์เดิม)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    staging_dir = os.path.abspath(os.path.join(base_dir, "..", "api", "data", "staging"))
    os.makedirs(staging_dir, exist_ok=True)
    
    output_file = os.path.join(staging_dir, "artrn_joined.json")

    print(f"🚀 Starting ARTRN Joined Sync to: {output_file}")

    try:
        # 2. เชื่อมต่อผ่าน DSN ที่ตั้งค่าไว้
        conn = pyodbc.connect("DSN=EXPRESS_DATA;", autocommit=True)
        cursor = conn.cursor()

        # 3. SQL Query ตามที่ระบุ พร้อม Join ARMAS และ OESLM
        sql = """
            SELECT 
                artrn.rectyp, artrn.docnum, artrn.docstat, artrn.docdat, 
                artrn.flgvat, armas.cusnam, artrn.slmcod, oeslm.slmnam, 
                artrn.paytrm, artrn.duedat, artrn.amount, artrn.netamt, artrn.remamt
            FROM (artrn 
            INNER JOIN armas ON artrn.cuscod = armas.cuscod) 
            INNER JOIN oeslm ON artrn.slmcod = oeslm.slmcod
            WHERE (((artrn.rectyp)="3"))
        """
        
        cursor.execute(sql)
        
        # ดึงชื่อ Columns และแปลงเป็นตัวเล็ก
        columns = [column[0].lower() for column in cursor.description]
        results = []
        
        # 4. วนลูปจัดการข้อมูลและแก้ปัญหา char(160)
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, str):
                    # แก้ปัญหา char(160) โดยการ replace เป็นช่องว่างปกติ และ strip ช่องว่างหัวท้าย
                    # char(160) คือ '\xa0' ใน Python
                    value = value.replace('\xa0', ' ').strip()
                row_dict[columns[i]] = value
            results.append(row_dict)

        # 5. บันทึกข้อมูลลงไฟล์ JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4, default=str)
                
        print(f"✅ Exported ARTRN Joined: {len(results)} records")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("🏁 Connection closed.")

if __name__ == "__main__":
    fetch_artrn_joined_data()