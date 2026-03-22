from django.urls import path
from .views import ExpensePivotReportView, ExpenseImportView, ExpenseSummaryStatsView

urlpatterns = [
    path('report/pivot/', ExpensePivotReportView.as_view(), name='expense-pivot-report'),
    path('report/stats/', ExpenseSummaryStatsView.as_view(), name='expense-stats'),
    path('import/', ExpenseImportView.as_view(), name='expense-import'),
]