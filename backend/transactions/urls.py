from django.urls import path
from .views import (
    RegisterView, LoginView, CurrentUserView,
    UploadTransactionsView, MonthlyDataListView, MonthlyDataDetailView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
    
    # Transaction endpoints
    path('transactions/upload/', UploadTransactionsView.as_view(), name='upload-transactions'),
    path('transactions/monthly/', MonthlyDataListView.as_view(), name='monthly-list'),
    path('transactions/monthly/<str:month_key>/', MonthlyDataDetailView.as_view(), name='monthly-detail'),
]
