from rest_framework import serializers
from .models import SalesData


class SalesDataSerializer(serializers.ModelSerializer):
    """Serializer for SalesData model"""
    
    class Meta:
        model = SalesData
        fields = '__all__'


class FilterOptionsSerializer(serializers.Serializer):
    """Serializer for filter options"""
    brands = serializers.ListField(child=serializers.CharField())
    pack_types = serializers.ListField(child=serializers.CharField())
    ppgs = serializers.ListField(child=serializers.CharField())
    channels = serializers.ListField(child=serializers.CharField())
    years = serializers.ListField(child=serializers.IntegerField())


class ChartDataSerializer(serializers.Serializer):
    """Serializer for chart data responses"""
    labels = serializers.ListField(child=serializers.CharField())
    data = serializers.ListField(child=serializers.DecimalField(max_digits=15, decimal_places=2))
    colors = serializers.ListField(child=serializers.CharField(), required=False)
