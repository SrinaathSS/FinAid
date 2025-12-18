from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, MonthlyStats


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'transaction_id', 'sender', 'receiver', 
                  'category', 'amount', 'type', 'description', 'month_key', 'created_at']
        read_only_fields = ['id', 'created_at']


class MonthlyStatsSerializer(serializers.ModelSerializer):
    """Serializer for MonthlyStats model"""
    class Meta:
        model = MonthlyStats
        fields = ['id', 'month_key', 'total_spent', 'total_income', 
                  'num_transactions', 'stats_json', 'updated_at', 'created_at']
        read_only_fields = ['id', 'updated_at', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
