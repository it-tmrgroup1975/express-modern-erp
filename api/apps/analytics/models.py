from django.db import models
from datetime import date

class Customer(models.Model):
    """
    ข้อมูลหลักลูกค้า (ARMAS)
    เก็บไว้เพื่อรองรับการเชื่อมโยงกับโมดูลอื่นๆ ในอนาคต
    """
    cuscod = models.CharField(max_length=20, primary_key=True, verbose_name="รหัสลูกค้า")
    cusnam = models.CharField(max_length=200, null=True, blank=True, verbose_name="ชื่อลูกค้า")
    addr01 = models.CharField(max_length=200, null=True, blank=True, verbose_name="ที่อยู่")
    telnum = models.CharField(max_length=50, null=True, blank=True, verbose_name="เบอร์โทรศัพท์")
    crline = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="วงเงิน")
    last_sync = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.cuscod} - {self.cusnam}"

    class Meta:
        verbose_name = "ข้อมูลลูกค้า"
        verbose_name_plural = "ข้อมูลลูกค้า"


class ArTransaction(models.Model):
    """
    รายการเคลื่อนไหวลูกหนี้ (ARTRN) 
    ที่ทำการ Join ข้อมูลชื่อลูกค้าและพนักงานขายมาแล้วจากต้นทาง
    """
    # ฟิลด์หลักจาก ARTRN
    rectyp = models.CharField(max_length=1, verbose_name="ประเภทเอกสาร")
    docnum = models.CharField(max_length=20, unique=True, verbose_name="เลขที่เอกสาร")
    docstat = models.CharField(max_length=1, null=True, blank=True, verbose_name="สถานะเอกสาร")
    docdat = models.DateField(verbose_name="วันที่เอกสาร")
    flgvat = models.CharField(max_length=1, null=True, blank=True, verbose_name="ประเภท VAT")
    
    # ข้อมูลที่ Join มาจาก ARMAS
    cusnam = models.CharField(max_length=200, null=True, blank=True, verbose_name="ชื่อลูกค้า (Joined)")
    
    # ข้อมูลที่ Join มาจาก OESLM
    slmcod = models.CharField(max_length=10, null=True, blank=True, verbose_name="รหัสพนักงานขาย")
    slmnam = models.CharField(max_length=100, null=True, blank=True, verbose_name="ชื่อพนักงานขาย (Joined)")
    
    # ข้อมูลตัวเลขและการเงิน
    paytrm = models.IntegerField(default=0, verbose_name="เงื่อนไขการชำระ (วัน)")
    duedat = models.DateField(null=True, blank=True, verbose_name="วันครบกำหนด")
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="ยอดรวม")
    netamt = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="ยอดสุทธิ")
    remamt = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="ยอดคงค้าง")
    
    last_sync = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.docnum} | {self.cusnam}"

    @property
    def age_days(self):
        """คำนวณอายุหนี้นับจากวันที่เอกสาร"""
        from datetime import date
        return (date.today() - self.docdat).days

    @property
    def overdue_days(self):
        """คำนวณจำนวนวันที่ค้างชำระจริงจากวันครบกำหนด (duedat)"""
        if not self.duedat:
            return 0
        diff = (date.today() - self.duedat).days
        return max(0, diff) # คืนค่า 0 หากยังไม่ถึงกำหนด, คืนค่าจำนวนวันที่เกินหากเลยกำหนดแล้ว

    class Meta:
        verbose_name = "รายการเคลื่อนไหวลูกหนี้"
        verbose_name_plural = "รายการเคลื่อนไหวลูกหนี้"
        ordering = ['-docdat']


class ReceiptItem(models.Model):
    """
    รายละเอียดการรับชำระ (ARRCPIT)
    ใช้เชื่อมโยงว่า ArTransaction (บิล) ใบไหนถูกจ่ายแล้วบ้าง
    """
    invoice = models.ForeignKey(
        ArTransaction, 
        on_delete=models.CASCADE, 
        related_name='payments', 
        to_field='docnum',
        null=True
    )
    docnum = models.CharField(max_length=20, verbose_name="เลขที่ใบเสร็จ")
    docdat = models.DateField(verbose_name="วันที่รับชำระ")
    invnum = models.CharField(max_length=20, verbose_name="เลขที่บิลที่อ้างถึง")
    cutamt = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="ยอดที่ตัดจ่าย")
    last_sync = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "รายละเอียดการรับชำระ"
        verbose_name_plural = "รายละเอียดการรับชำระ"


class ReceiptCheck(models.Model):
    """
    รายละเอียดเช็ครับ (ARRCPCQ)
    """
    rcp_num = models.CharField(max_length=20, verbose_name="เลขที่ใบเสร็จอ้างอิง")
    cqnum = models.CharField(max_length=20, primary_key=True, verbose_name="เลขที่เช็ค")
    bankcod = models.CharField(max_length=10, verbose_name="รหัสธนาคาร")
    chqdat = models.DateField(verbose_name="วันที่หน้าเช็ค")
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="ยอดเงินหน้าเช็ค")
    stat = models.CharField(max_length=1, verbose_name="สถานะเช็ค")
    last_sync = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "รายละเอียดเช็ครับ"
        verbose_name_plural = "รายละเอียดเช็ครับ"