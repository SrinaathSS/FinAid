from django.db import models
from django.contrib.auth.models import User


class Transaction(models.Model):
    """Model to store individual transaction records"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField(null=True, blank=True)
    transaction_id = models.CharField(max_length=100)
    sender = models.CharField(max_length=255, blank=True)
    receiver = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=[('debit', 'Debit'), ('credit', 'Credit')])
    description = models.TextField(blank=True)
    month_key = models.CharField(max_length=7)  # Format: "YYYY-MM"
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'month_key']),
            models.Index(fields=['user', 'date']),
        ]
    
    def __str__(self):
        return f"{self.transaction_id} - {self.category} - ${self.amount}"


class MonthlyStats(models.Model):
    """Model to store aggregated monthly statistics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_stats')
    month_key = models.CharField(max_length=7)  # Format: "YYYY-MM"
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    num_transactions = models.IntegerField(default=0)
    stats_json = models.JSONField(default=dict)  # Store full stats object
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'month_key']
        ordering = ['-month_key']
        verbose_name_plural = "Monthly Statistics"
    
    def __str__(self):
        return f"{self.user.username} - {self.month_key}"
