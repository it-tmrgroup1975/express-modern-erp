from rest_framework import serializers
from .models import ExpenseTransaction

class ExpenseTransactionSerializer(serializers.ModelSerializer):
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("จำนวนเงินต้องมากกว่า 0")
        return value

class ExpenseSerializer(serializers.ModelSerializer):
    # แสดงผลชื่อแหล่งข้อมูลแบบอ่านง่าย (Factory Expense / Office Expense)
    source_display = serializers.CharField(source='get_source_type_display', read_only=True)
    
    # ฟิลด์คำนวณเพิ่มเติมสำหรับการแสดงผลเพื่อให้หน้าบ้าน (React) ใช้งานง่าย
    formatted_amount = serializers.SerializerMethodField()
    formatted_vat = serializers.SerializerMethodField()
    month_name_th = serializers.SerializerMethodField()
    formatted_quantity = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseTransaction
        fields = [
            'id', 
            'source_type', 
            'source_display', 
            'dept_name', 
            'dept_code', 
            'account_code', 
            'account_name', 
            'period', 
            'expense_date', 
            'month_name_th',
            'doc_number', 
            'supplier_code',
            'quantity', 
            'formatted_quantity',
            'unit',
            'vat_amount', 
            'formatted_vat',
            'amount', 
            'formatted_amount', 
            'note',
            'description'
        ]
        # กำหนดความเข้มงวดของข้อมูลตาม Logic ใน Model และ Business Flow
        extra_kwargs = {
            'expense_date': {'required': True},
            'amount': {'required': True},
            'account_code': {'required': True},
            'account_name': {'required': True}
        }

    def get_formatted_amount(self, obj):
        """จัดรูปแบบจำนวนเงินให้มีคอมม่า (e.g., 2,500.00)"""
        return "{:,.2f}".format(obj.amount) if obj.amount is not None else "0.00"

    def get_formatted_vat(self, obj):
        """จัดรูปแบบ VAT ให้มีคอมม่า"""
        return "{:,.2f}".format(obj.vat_amount) if obj.vat_amount is not None else "0.00"

    def get_formatted_quantity(self, obj):
        """จัดรูปแบบจำนวน (Quantity)"""
        return "{:,.2f}".format(obj.quantity) if obj.quantity is not None else "0.00"

    def get_month_name_th(self, obj):
        """แปลงเดือนจากวันที่เป็นชื่อเดือนภาษาไทย (ว.ด.ป)"""
        months_th = [
            '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ]
        try:
            return months_th[obj.expense_date.month]
        except (AttributeError, IndexError, TypeError):
            return ""