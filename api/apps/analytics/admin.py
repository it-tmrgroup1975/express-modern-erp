from django.contrib import admin
from .models import Customer, ArTransaction, ReceiptItem, ReceiptCheck

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('cuscod', 'cusnam', 'telnum', 'crline', 'last_sync')
    search_fields = ('cuscod', 'cusnam')

@admin.register(ArTransaction)
class ArTransactionAdmin(admin.ModelAdmin):
    list_display = ('docnum', 'rectyp', 'docdat', 'cusnam', 'netamt', 'remamt', 'get_age_days')
    list_filter = ('rectyp', 'docstat', 'docdat')
    search_fields = ('docnum', 'cusnam', 'slmnam')
    readonly_fields = ('last_sync',)

    def get_age_days(self, obj):
        return obj.age_days
    get_age_days.short_description = "อายุหนี้ (วัน)"

@admin.register(ReceiptItem)
class ReceiptItemAdmin(admin.ModelAdmin):
    list_display = ('docnum', 'invnum', 'docdat', 'cutamt')
    list_filter = ('docdat',)
    search_fields = ('docnum', 'invnum')

@admin.register(ReceiptCheck)
class ReceiptCheckAdmin(admin.ModelAdmin):
    list_display = ('cqnum', 'bankcod', 'chqdat', 'amount', 'stat')
    list_filter = ('stat', 'bankcod', 'chqdat')
    search_fields = ('cqnum', 'rcp_num')