from django.contrib import admin
from .models import Transaction, MonthlyStats


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'date', 'category', 'amount', 'type', 'month_key']
    list_filter = ['user', 'type', 'category', 'month_key']
    search_fields = ['transaction_id', 'description', 'category']
    date_hierarchy = 'date'
    ordering = ['-date']


@admin.register(MonthlyStats)
class MonthlyStatsAdmin(admin.ModelAdmin):
    list_display = ['user', 'month_key', 'total_spent', 'total_income', 'num_transactions', 'updated_at']
    list_filter = ['user', 'month_key']
    search_fields = ['user__username', 'month_key']
    ordering = ['-month_key']
