from django.db import models
from django.core.validators import MinValueValidator


class SalesData(models.Model):
    """Model to store FMCG retail sales data"""
    
    market = models.CharField(max_length=100)
    channel = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    sub_category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    variant = models.CharField(max_length=100)
    pack_type = models.CharField(max_length=100)
    ppg = models.CharField(max_length=100)  # Price Per Gram
    pack_size = models.CharField(max_length=100)
    year = models.IntegerField()
    month = models.IntegerField()
    week = models.IntegerField()
    date = models.DateField()
    br_cat_id = models.CharField(max_length=100)
    sales_value = models.DecimalField(max_digits=15, decimal_places=6, validators=[MinValueValidator(0)])
    volume = models.DecimalField(max_digits=15, decimal_places=6, validators=[MinValueValidator(0)])
    volume_units = models.DecimalField(max_digits=15, decimal_places=6, validators=[MinValueValidator(0)])
    
    # Additional fields for analysis
    d1 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    d2 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    d3 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    d4 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    d5 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    d6 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av1 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av2 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av3 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av4 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av5 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    av6 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev1 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev2 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev3 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev4 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev5 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    ev6 = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sales_data'
        indexes = [
            models.Index(fields=['brand']),
            models.Index(fields=['pack_type']),
            models.Index(fields=['ppg']),
            models.Index(fields=['channel']),
            models.Index(fields=['year']),
            models.Index(fields=['month']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.brand} - {self.year}-{self.month:02d} - ${self.sales_value}"