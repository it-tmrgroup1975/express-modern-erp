# api/apps/analytics/views.py

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ArTransaction
from .serializers import ArTransactionSerializer

class ArTransactionViewSet(viewsets.ModelViewSet):
    # แก้ไขบรรทัดนี้: ใช้ .order_by() เพื่อเรียงลำดับข้อมูล
    queryset = ArTransaction.objects.all().order_by('-docdat') 
    serializer_class = ArTransactionSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rectyp', 'docstat', 'slmcod']
    search_fields = ['docnum', 'cusnam', 'slmnam']
    ordering_fields = ['docdat', 'remamt']