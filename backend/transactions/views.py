from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Transaction, MonthlyStats
from .serializers import (
    TransactionSerializer, MonthlyStatsSerializer, 
    UserSerializer, UserRegistrationSerializer
)
from datetime import datetime


# Authentication Views
class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class CurrentUserView(generics.RetrieveAPIView):
    """Get current authenticated user"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


# Transaction Views
class UploadTransactionsView(APIView):
    """Upload monthly transaction data"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        transactions_data = request.data.get('transactions', [])
        stats_data = request.data.get('stats', {})
        month_key = request.data.get('month_key')
        
        print(f"📥 Received upload request:")
        print(f"  - Month key: {month_key}")
        print(f"  - Transactions count: {len(transactions_data)}")
        print(f"  - Stats keys: {stats_data.keys() if stats_data else 'None'}")
        print(f"  - Stats data: {stats_data}")
        
        if not month_key:
            # Extract month from first transaction
            if transactions_data:
                first_date = transactions_data[0].get('date')
                month_key = datetime.strptime(first_date, '%Y-%m-%d').strftime('%Y-%m')
            else:
                return Response({'error': 'month_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete existing data for this month (if any) to avoid duplicates
        Transaction.objects.filter(user=request.user, month_key=month_key).delete()
        MonthlyStats.objects.filter(user=request.user, month_key=month_key).delete()
        
        # Save transactions
        transactions_saved = []
        failed_count = 0
        for txn_data in transactions_data:
            txn_data['user'] = request.user.id
            txn_data['month_key'] = month_key
            serializer = TransactionSerializer(data=txn_data)
            if serializer.is_valid():
                transactions_saved.append(serializer.save(user=request.user))
            else:
                failed_count += 1
                print(f"❌ Transaction failed validation: {serializer.errors}")
                print(f"   Data: {txn_data}")
        
        print(f"✅ Saved {len(transactions_saved)} transactions, {failed_count} failed")
        
        # Save monthly stats - only use fields that exist in the model
        monthly_stats_data = {
            'user': request.user.id,
            'month_key': month_key,
            'total_spent': stats_data.get('total_spent', 0),
            'total_income': stats_data.get('total_income', 0),
            'num_transactions': len(transactions_saved),
            'stats_json': stats_data.get('stats_json', stats_data)  # Use nested stats_json if provided, otherwise use entire stats_data
        }
        
        stats_serializer = MonthlyStatsSerializer(data=monthly_stats_data)
        if stats_serializer.is_valid():
            monthly_stats = stats_serializer.save(user=request.user)
        else:
            return Response(
                {'error': 'Invalid monthly stats data', 'details': stats_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': f'Successfully uploaded {len(transactions_saved)} transactions',
            'month_key': month_key,
            'transactions_saved': len(transactions_saved),
            'stats': MonthlyStatsSerializer(monthly_stats).data
        }, status=status.HTTP_201_CREATED)


class MonthlyDataListView(generics.ListAPIView):
    """Get all monthly summaries for current user"""
    permission_classes = [IsAuthenticated]
    serializer_class = MonthlyStatsSerializer
    
    def get_queryset(self):
        return MonthlyStats.objects.filter(user=self.request.user)


class MonthlyDataDetailView(APIView):
    """Get specific month's data including transactions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, month_key):
        try:
            stats = MonthlyStats.objects.get(user=request.user, month_key=month_key)
            transactions = Transaction.objects.filter(user=request.user, month_key=month_key)
            
            return Response({
                'stats': MonthlyStatsSerializer(stats).data,
                'transactions': TransactionSerializer(transactions, many=True).data
            })
        except MonthlyStats.DoesNotExist:
            return Response(
                {'error': 'No data found for this month'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, month_key):
        """Delete a month's data"""
        deleted_trans = Transaction.objects.filter(user=request.user, month_key=month_key).delete()
        deleted_stats = MonthlyStats.objects.filter(user=request.user, month_key=month_key).delete()
        
        return Response({
            'message': f'Deleted data for {month_key}',
            'transactions_deleted': deleted_trans[0],
            'stats_deleted': deleted_stats[0]
        }, status=status.HTTP_200_OK)
