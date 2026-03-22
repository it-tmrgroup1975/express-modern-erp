import pandas as pd
from datetime import datetime
from django.db import transaction, IntegrityError
from django.db.models import Sum, Q, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ExpenseTransaction

class ExpensePivotReportView(APIView):
    def get(self, request):
        # รับพารามิเตอร์ปีจาก Query String (ถ้าไม่มีใช้ปีปัจจุบัน)
        year = request.query_params.get('year', datetime.now().year)
        source_type = request.query_params.get('source_type')
        
        # สร้าง Queryset พื้นฐาน
        query = ExpenseTransaction.objects.filter(expense_date__year=year)
        
        # กรองตามประเภทแหล่งข้อมูล (Factory/Office) ถ้ามีการระบุมา
        if source_type:
            query = query.filter(source_type=source_type)

        # ทำ Pivot Logic โดย Group ตามรหัสบัญชีและชื่อบัญชี
        # เพิ่มการ Sum ฟิลด์ vat_amount และ quantity เพื่อให้รายงานสมบูรณ์ขึ้น
        data = query.values('account_code', 'account_name', 'dept_code') \
            .annotate(
                # ยอดเงินรวมรายเดือน (Amount)
                jan=Sum('amount', filter=Q(expense_date__month=1)),
                feb=Sum('amount', filter=Q(expense_date__month=2)),
                mar=Sum('amount', filter=Q(expense_date__month=3)),
                apr=Sum('amount', filter=Q(expense_date__month=4)),
                may=Sum('amount', filter=Q(expense_date__month=5)),
                jun=Sum('amount', filter=Q(expense_date__month=6)),
                jul=Sum('amount', filter=Q(expense_date__month=7)),
                aug=Sum('amount', filter=Q(expense_date__month=8)),
                sep=Sum('amount', filter=Q(expense_date__month=9)),
                oct=Sum('amount', filter=Q(expense_date__month=10)),
                nov=Sum('amount', filter=Q(expense_date__month=11)),
                dec=Sum('amount', filter=Q(expense_date__month=12)),
                
                # ยอดรวมสุทธิรายปีแยกตามประเภท
                total_amount=Sum('amount'),
                total_vat=Sum('vat_amount'),
                total_quantity=Sum('quantity'),
                
                # นับจำนวนรายการที่เกิดขึ้น (Optional)
                transaction_count=Count('id') 
            ).order_by('account_code')
            
        return Response({
            "year": year,
            "source_type": source_type or "ALL",
            "data": data
        })

class ExpenseImportView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        source_type = request.data.get('source_type', 'FACTORY') 
        
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # อ่านไฟล์ Excel และล้างช่องว่างที่ชื่อคอลัมน์
            df = pd.read_excel(file)
            df.columns = [str(c).strip() for c in df.columns]
            
            # --- แก้ไขปัญหา "nan" value must be a decimal number ---
            # กำหนดคอลัมน์ที่ต้องเป็นตัวเลขและเติม 0 แทนค่าว่าง (NaN)
            numeric_fields = ['จำนวนเงิน', 'VAT', 'จำนวน']
            for field in numeric_fields:
                if field in df.columns:
                    df[field] = pd.to_numeric(df[field], errors='coerce').fillna(0)
            
            count_created = 0
            count_skipped = 0

            with transaction.atomic():
                for _, row in df.iterrows():
                    # 1. จัดการเรื่องวันที่ (พ.ศ. -> ค.ศ.)
                    raw_date = row.get('ว.ด.ป') or row.get('ว/ด/ป') or row.get('วันที่')
                    expense_date = None

                    if isinstance(raw_date, str):
                        try:
                            parts = raw_date.split('/')
                            day, month = int(parts[0]), int(parts[1])
                            year_val = int(parts[2])
                            if year_val < 100:
                                full_year = year_val + 1943
                            elif year_val > 2500:
                                full_year = year_val - 543
                            else:
                                full_year = year_val
                            expense_date = datetime(full_year, month, day).date()
                        except:
                            pass
                    elif isinstance(raw_date, datetime):
                        expense_date = raw_date.date()
                    elif hasattr(raw_date, 'to_pydatetime'): # กรณีเป็น pandas Timestamp
                        expense_date = raw_date.date()

                    # 2. เตรียมข้อมูลและตรวจสอบค่าว่าง
                    acc_code = str(row.get('รหัสบัญชี', '')).strip()
                    doc_num = str(row.get('เลขที่เอกสาร', '')).strip()
                    
                    # ถ้าไม่มีรหัสบัญชี หรือ วันที่ หรือ เป็นค่าว่าง/NaN ให้ข้ามรายการนี้
                    if not acc_code or acc_code.lower() == 'nan' or expense_date is None:
                        count_skipped += 1
                        continue

                    # ฟังก์ชันช่วยจัดการค่า String ที่อาจเป็น NaN
                    def clean_str(val):
                        return str(val).strip() if pd.notna(val) and str(val).lower() != 'nan' else ''

                    try:
                        # 3. บันทึกข้อมูล (ค่าตัวเลขถูก fillna(0) ไว้ด้านบนแล้ว)
                        _, created = ExpenseTransaction.objects.update_or_create(
                            source_type=source_type,
                            account_code=acc_code,
                            expense_date=expense_date,
                            amount=row.get('จำนวนเงิน', 0),
                            doc_number=doc_num if doc_num.lower() != 'nan' else '',
                            defaults={
                                'dept_name': clean_str(row.get('ส่วนงาน')),
                                'dept_code': clean_str(row.get('รหัสแผนก')),
                                'account_name': clean_str(row.get('รายการค่าใช้จ่าย')),
                                'period': clean_str(row.get('เดือน/ปี')),
                                'supplier_code': clean_str(row.get('SUP')),
                                'quantity': row.get('จำนวน', 0),
                                'unit': clean_str(row.get('หน่วยนับ')),
                                'vat_amount': row.get('VAT', 0),
                                'note': clean_str(row.get('หมายเหตุ')),
                                'description': clean_str(row.get('รายละเอียด')),
                            }
                        )
                        if created: count_created += 1
                        else: count_skipped += 1
                    except IntegrityError:
                        count_skipped += 1

            return Response({
                "status": "success", 
                "message": f"นำเข้าสำเร็จ {count_created} รายการ, ข้ามรายการซ้ำ {count_skipped} รายการ"
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ExpenseSummaryStatsView(APIView):
    def get(self, request):
        year = request.query_params.get('year', datetime.now().year)
        stats = ExpenseTransaction.objects.filter(expense_date__year=year) \
            .values('source_type') \
            .annotate(total_amount=Sum('amount')) \
            .order_by('source_type')
            
        total_sum = sum(item['total_amount'] for item in stats) if stats else 0
        formatted_stats = []
        for item in stats:
            formatted_stats.append({
                "category": item['source_type'],
                "value": float(item['total_amount']),
                "percentage": round((float(item['total_amount']) / float(total_sum) * 100), 2) if total_sum > 0 else 0
            })
            
        return Response({
            "year": year,
            "grand_total": float(total_sum),
            "breakdown": formatted_stats
        }, status=status.HTTP_200_OK)