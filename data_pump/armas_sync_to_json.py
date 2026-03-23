import pyodbc
import json
import os

def fetch_armas_joined_data():
    # 1. กำหนด Path สำหรับจัดเก็บไฟล์ JSON (ไปที่ api/data/staging)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # ปรับ path ให้ไปที่โฟลเดอร์ staging ของโปรเจกต์ Django
    staging_dir = os.path.abspath(os.path.join(base_dir, "..", "api", "data", "staging"))
    os.makedirs(staging_dir, exist_ok=True)
    
    output_file = os.path.join(staging_dir, "armas.json")

    print(f"🚀 Starting ARMAS Joined Sync to: {output_file}")

    try:
        # 2. เชื่อมต่อผ่าน DSN ที่ตั้งค่าไว้ (ExpressDB)
        conn = pyodbc.connect("DSN=EXPRESS_DATA;", autocommit=True)
        cursor = conn.cursor()

        # 3. SQL Query ตามที่ระบุ (ใช้ DISTINCT เพื่อเอาข้อมูลลูกค้าที่ไม่ซ้ำ)
        sql = """
            SELECT DISTINCT 
                artrn.cuscod, armas.cusnam, armas.addr01, armas.addr02, 
                armas.slmcod, oeslm.slmnam, armas.paytrm, armas.paycond
            FROM (artrn 
            INNER JOIN armas ON artrn.cuscod = armas.cuscod) 
            INNER JOIN oeslm ON artrn.slmcod = oeslm.slmcod
        """
        
        cursor.execute(sql)
        
        # ดึงชื่อ Columns จาก cursor description
        columns = [column[0].lower() for column in cursor.description]
        results = []
        
        # 4. วนลูปจัดการข้อมูลและแก้ปัญหา char(160)
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                if isinstance(value, str):
                    # แก้ปัญหา char(160) โดยการ replace '\xa0' เป็นช่องว่างปกติ และ strip ช่องว่าง
                    value = value.replace('\xa0', ' ').strip()
                row_dict[columns[i]] = value
            results.append(row_dict)

        # 5. บันทึกข้อมูลลงไฟล์ armas.json
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4, default=str)
                
        print(f"✅ Exported ARMAS (Customers): {len(results)} records")

    except Exception as e:
        print(f"❌ Error during export: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("🏁 Connection closed.")

if __name__ == "__main__":
    fetch_armas_joined_data()