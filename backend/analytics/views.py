from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from django.core.paginator import Paginator
from .models import SalesData
from .serializers import SalesDataSerializer, FilterOptionsSerializer, ChartDataSerializer
import json


class SalesDataViewSet(viewsets.ModelViewSet):
    """ViewSet for SalesData with analytics endpoints"""
    
    queryset = SalesData.objects.all()
    serializer_class = SalesDataSerializer
    
    @action(detail=False, methods=['get'])
    def filter_options(self, request):
        """Get available filter options"""
        brands = SalesData.objects.values_list('brand', flat=True).distinct().order_by('brand')
        pack_types = SalesData.objects.values_list('pack_type', flat=True).distinct().order_by('pack_type')
        ppgs = SalesData.objects.values_list('ppg', flat=True).distinct().order_by('ppg')
        channels = SalesData.objects.values_list('channel', flat=True).distinct().order_by('channel')
        years = SalesData.objects.values_list('year', flat=True).distinct().order_by('year')
        
        return Response({
            'brands': list(brands),
            'pack_types': list(pack_types),
            'ppgs': list(ppgs),
            'channels': list(channels),
            'years': list(years)
        })
    
    @action(detail=False, methods=['post'])
    def sales_by_year_volume(self, request):
        """Horizontal bar chart: Sales Value by Year and Volume"""
        filters = request.data.get('filters', {})
        queryset = self._apply_filters(filters)
        
        # Group by year and calculate totals
        data = queryset.values('year').annotate(
            sales_value=Sum('sales_value'),
            volume=Sum('volume')
        ).order_by('year')
        
        return Response({
            'labels': [str(item['year']) for item in data],
            'sales_data': [float(item['sales_value']) for item in data],
            'volume_data': [float(item['volume']) for item in data]
        })
    
    @action(detail=False, methods=['post'])
    def yearly_sales_value(self, request):
        """Vertical bar chart: Year-wise Sales Value"""
        filters = request.data.get('filters', {})
        queryset = self._apply_filters(filters)
        
        data = queryset.values('year').annotate(
            total_sales=Sum('sales_value')
        ).order_by('year')
        
        return Response({
            'labels': [str(item['year']) for item in data],
            'data': [float(item['total_sales']) for item in data]
        })
    
    @action(detail=False, methods=['post'])
    def monthly_trend(self, request):
        """Line chart: Monthly Sales Trend"""
        filters = request.data.get('filters', {})
        queryset = self._apply_filters(filters)
        
        # Group by year-month and calculate totals
        data = queryset.annotate(
            year_month=TruncMonth('date')
        ).values('year_month').annotate(
            total_sales=Sum('sales_value')
        ).order_by('year_month')
        
        return Response({
            'labels': [item['year_month'].strftime('%Y-%m') for item in data],
            'data': [float(item['total_sales']) for item in data]
        })
    
    @action(detail=False, methods=['post'])
    def market_share(self, request):
        """Pie/Donut chart: Market Share by Sales/Volume"""
        filters = request.data.get('filters', {})
        chart_type = request.data.get('chart_type', 'sales')  # 'sales' or 'volume'
        queryset = self._apply_filters(filters)
        
        if chart_type == 'sales':
            data = queryset.values('brand').annotate(
                total=Sum('sales_value')
            ).order_by('-total')[:10]  # Top 10 brands
            field_name = 'total'
        else:
            data = queryset.values('brand').annotate(
                total=Sum('volume')
            ).order_by('-total')[:10]  # Top 10 brands
            field_name = 'total'
        
        return Response({
            'labels': [item['brand'] for item in data],
            'data': [float(item[field_name]) for item in data]
        })
    
    @action(detail=False, methods=['post'])
    def summary_stats(self, request):
        """Get summary statistics"""
        filters = request.data.get('filters', {})
        queryset = self._apply_filters(filters)
        
        stats = queryset.aggregate(
            total_sales=Sum('sales_value'),
            total_volume=Sum('volume'),
            avg_sales=Avg('sales_value'),
            avg_volume=Avg('volume'),
            record_count=Count('id')
        )
        
        return Response({
            'total_sales': float(stats['total_sales']) if stats['total_sales'] else 0,
            'total_volume': float(stats['total_volume']) if stats['total_volume'] else 0,
            'avg_sales': float(stats['avg_sales']) if stats['avg_sales'] else 0,
            'avg_volume': float(stats['avg_volume']) if stats['avg_volume'] else 0,
            'record_count': stats['record_count']
        })
    
    def _apply_filters(self, filters):
        """Apply filters to queryset"""
        queryset = SalesData.objects.all()
        
        if filters.get('brands'):
            queryset = queryset.filter(brand__in=filters['brands'])
        
        if filters.get('pack_types'):
            queryset = queryset.filter(pack_type__in=filters['pack_types'])
        
        if filters.get('ppgs'):
            queryset = queryset.filter(ppg__in=filters['ppgs'])
        
        if filters.get('channels'):
            queryset = queryset.filter(channel__in=filters['channels'])
        
        if filters.get('years'):
            queryset = queryset.filter(year__in=filters['years'])
        
        return queryset