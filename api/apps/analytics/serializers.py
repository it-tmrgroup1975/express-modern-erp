from rest_framework import serializers
from .models import ArTransaction
from datetime import date

class ArTransactionSerializer(serializers.ModelSerializer):
    # ดึง @property age_days จาก Model มาแสดงใน API
    age_days = serializers.ReadOnlyField()
    overdue_days = serializers.ReadOnlyField()

    class Meta:
        model = ArTransaction
        fields = [
            'id', 'rectyp', 'docnum', 'docstat', 'docdat', 
            'flgvat', 'cusnam', 'slmcod', 'slmnam', 
            'paytrm', 'duedat', 'amount', 'netamt', 
            'remamt', 'age_days', 'last_sync', 'overdue_days'
        ]
