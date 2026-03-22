# analytics/management/commands/sync_express.py

import json
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from apps.analytics.models import Customer, ArTransaction, ReceiptItem, ReceiptCheck
from datetime import datetime
from django.utils import timezone

class Command(BaseCommand):
    help = 'Sync Joined ARTRN data and related tables from Express JSON'

    def handle(self, *args, **kwargs):
        # กำหนดโฟลเดอร์ที่เก็บไฟล์ JSON
        staging_dir = os.path.join(settings.BASE_DIR, 'data', 'staging')
        
        # ลำดับการ Sync: 
        # 1. Customer (ข้อมูลหลัก)
        # 2. ArTransaction (ข้อมูลบิลที่ Join มาแล้ว)
        # 3. ReceiptItem (รายการรับชำระ)
        # 4. ReceiptCheck (ข้อมูลเช็ค)
        sync_tasks = [
            ('armas.json', Customer, 'cuscod'),
            ('artrn_joined.json', ArTransaction, 'docnum'),
            # ('arrcpit.json', ReceiptItem, None), 
            # ('arrcpcq.json', ReceiptCheck, 'cqnum'),
        ]

        for file_name, ModelClass, p_key in sync_tasks:
            path = os.path.join(staging_dir, file_name)
            if not os.path.exists(path):
                fail_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                self.stdout.write(self.style.WARNING(f'[{fail_time}] Skipping: {file_name} not found'))
                continue

            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            start_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')    
            self.stdout.write(self.style.SUCCESS(f'[{start_time}] Syncing {file_name}...'))
            # ดึงรายชื่อฟิลด์ที่มีอยู่ใน Model เพื่อใช้กรองข้อมูล
            model_fields = [f.name for f in ModelClass._meta.get_fields()]

            count = 0

            for item in data:
                cleaned = self.clean_data(item)
                
                # --- [Mapping Logic พิเศษตามโครงสร้าง Model ใหม่] ---
                
                if ModelClass == ArTransaction:
                    # ใน ArTransaction ไม่ต้องหา Customer object มาเชื่อมแบบ ForeignKey 
                    # เพราะใช้การเก็บชื่อ cusnam ที่ Join มาจากต้นทางแทน
                    pass
                
                elif ModelClass == ReceiptItem:
                    # เชื่อมบิล: ใน ArTransaction เราใช้ to_field='docnum' เป็นหลัก
                    target_inv = cleaned.get('invnum')
                    invoice_obj = ArTransaction.objects.filter(docnum=target_inv).first()
                    
                    if not invoice_obj:
                        continue # ข้ามถ้าหาบิลอ้างอิงไม่เจอ
                    
                    cleaned['invoice'] = invoice_obj

                elif ModelClass == ReceiptCheck:
                    # แมปฟิลด์รหัสใบเสร็จอ้างอิง
                    cleaned['rcp_num'] = cleaned.get('rcpnum') or cleaned.get('docnum')

                # กรองเฉพาะฟิลด์ที่มีอยู่ใน Model เท่านั้น
                final_data = {k: v for k, v in cleaned.items() if k in model_fields}

                try:
                    if ModelClass == ReceiptItem:
                        # ใช้ docnum + invnum เพื่อระบุรายการที่จ่ายในแต่ละบิล ป้องกันข้อมูลซ้ำ
                        ReceiptItem.objects.update_or_create(
                            docnum=cleaned.get('docnum'),
                            invnum=cleaned.get('invnum'),
                            defaults=final_data
                        )
                    else:
                        # ใช้ Primary Key (p_key) ในการ update_or_create
                        unique_val = final_data.get(p_key)
                        if unique_val:
                            ModelClass.objects.update_or_create(
                                **{p_key: unique_val}, 
                                defaults=final_data
                            )
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error syncing item: {e}'))
                    continue
            
            finished_time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            self.stdout.write(
                self.style.SUCCESS(
                    f'[{finished_time}] Successfully synced {file_name}: {count} records'
                )
            )

    def clean_data(self, item):
        """จัดการข้อมูลเบื้องต้นและแปลงรูปแบบวันที่"""
        # แปลง Key เป็นตัวเล็ก และ Strip ช่องว่าง
        cleaned = {k.lower(): (v.strip() if isinstance(v, str) else v) for k, v in item.items()}
        
        # ค้นหาฟิลด์วันที่ (มักลงท้ายด้วย dat) และแปลงเป็น date object ของ Python
        for k, v in cleaned.items():
            if k.endswith('dat') and v:
                try:
                    # รองรับทั้ง format "YYYY-MM-DD" และ "YYYY-MM-DD HH:MM:SS"
                    date_str = str(v).split(' ')[0]
                    cleaned[k] = datetime.strptime(date_str, '%Y-%m-%d').date()
                except (ValueError, IndexError):
                    cleaned[k] = None
        return cleaned