from django.db import models

class ExpenseTransaction(models.Model):
    EXPENSE_SOURCE = [
        ('FACTORY', 'Factory Expense'),
        ('OFFICE', 'Office Expense'),
    ]
    
    # 1. ข้อมูลส่วนงานและแผนก
    source_type = models.CharField(max_length=10, choices=EXPENSE_SOURCE, db_index=True, verbose_name="ประเภทแหล่งข้อมูล")
    dept_name = models.CharField(max_length=100, null=True, blank=True, verbose_name="ส่วนงาน") 
    dept_code = models.CharField(max_length=20, verbose_name="รหัสแผนก") 
    
    # 2. ข้อมูลบัญชี
    account_code = models.CharField(max_length=20, db_index=True, verbose_name="รหัสบัญชี")
    account_name = models.CharField(max_length=255, verbose_name="รายการค่าใช้จ่าย")
    
    # 3. ข้อมูลเอกสารและวันที่
    period = models.CharField(max_length=50, null=True, blank=True, verbose_name="เดือน/ปี") 
    expense_date = models.DateField(verbose_name="ว.ด.ป") 
    doc_number = models.CharField(max_length=100, null=True, blank=True, verbose_name="เลขที่เอกสาร") 
    supplier_code = models.CharField(max_length=50, null=True, blank=True, verbose_name="SUP") 
    
    # 4. ข้อมูลการเงินและรายละเอียด
    quantity = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="จำนวน") # ปรับชื่อจาก quant เป็น quantity
    unit = models.CharField(max_length=50, null=True, blank=True, verbose_name="หน่วยนับ") # เพิ่มฟิลด์หน่วยนับ
    vat_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="VAT") 
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="จำนวนเงิน")
    note = models.TextField(null=True, blank=True, verbose_name="หมายเหตุ") # เพิ่มฟิลด์หมายเหตุ
    description = models.TextField(null=True, blank=True, verbose_name="รายละเอียด")
    
    # ระบบจัดการข้อมูลภายใน
    external_id = models.CharField(max_length=100, unique=True, null=True, blank=True, help_text="ID อ้างอิงจากไฟล์ต้นฉบับ")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "รายการค่าใช้จ่าย"
        verbose_name_plural = "รายการค่าใช้จ่าย"
        ordering = ['-expense_date', 'account_code']
        # ปรับ Unique Constraint เพื่อป้องกันข้อมูลซ้ำ (รวม doc_number เพื่อความแม่นยำ)
        unique_together = ['source_type', 'account_code', 'expense_date', 'amount', 'doc_number']

    def __str__(self):
        return f"{self.expense_date} | {self.doc_number} | {self.account_code} - {self.amount}"