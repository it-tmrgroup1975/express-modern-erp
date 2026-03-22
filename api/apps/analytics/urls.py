from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArTransactionViewSet

# สร้าง Router และลงทะเบียน ViewSet
router = DefaultRouter()
router.register(r'transactions', ArTransactionViewSet, basename='transactions')

urlpatterns = [
    path('', include(router.urls)),
]