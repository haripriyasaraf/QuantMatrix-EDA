import os
import sys
import django
import pandas as pd
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eda_backend.settings')
django.setup()

from analytics.models import SalesData


def import_data():
    """Import CSV data into Django database"""
    
    # Read the CSV file
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Technical Evaluation.csv')
    
    print(f"Reading CSV from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    print(f"Found {len(df)} rows in CSV")
    
    # Clear existing data
    SalesData.objects.all().delete()
    print("Cleared existing data")
    
    # Convert data and create objects
    sales_objects = []
    batch_size = 1000
    
    for index, row in df.iterrows():
        try:
            # Parse date
            date_str = str(row['date'])
            if '-' in date_str:
                date_obj = datetime.strptime(date_str, '%d-%m-%Y').date()
            else:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            sales_obj = SalesData(
                market=row['Market'],
                channel=row['Channel'],
                region=row['Region'],
                category=row['Category'],
                sub_category=row['SubCategory'],
                brand=row['Brand'],
                variant=row['Variant'],
                pack_type=row['PackType'],
                ppg=row['PPG'],
                pack_size=row['PackSize'],
                year=int(row['Year']),
                month=int(row['Month']),
                week=int(row['Week']),
                date=date_obj,
                br_cat_id=row['BrCatId'],
                sales_value=float(row['SalesValue']),
                volume=float(row['Volume']),
                volume_units=float(row['VolumeUnits']),
                d1=float(row['D1']) if pd.notna(row['D1']) else 0,
                d2=float(row['D2']) if pd.notna(row['D2']) else 0,
                d3=float(row['D3']) if pd.notna(row['D3']) else 0,
                d4=float(row['D4']) if pd.notna(row['D4']) else 0,
                d5=float(row['D5']) if pd.notna(row['D5']) else 0,
                d6=float(row['D6']) if pd.notna(row['D6']) else 0,
                av1=float(row['AV1']) if pd.notna(row['AV1']) else 0,
                av2=float(row['AV2']) if pd.notna(row['AV2']) else 0,
                av3=float(row['AV3']) if pd.notna(row['AV3']) else 0,
                av4=float(row['AV4']) if pd.notna(row['AV4']) else 0,
                av5=float(row['AV5']) if pd.notna(row['AV5']) else 0,
                av6=float(row['AV6']) if pd.notna(row['AV6']) else 0,
                ev1=float(row['EV1']) if pd.notna(row['EV1']) else 0,
                ev2=float(row['EV2']) if pd.notna(row['EV2']) else 0,
                ev3=float(row['EV3']) if pd.notna(row['EV3']) else 0,
                ev4=float(row['EV4']) if pd.notna(row['EV4']) else 0,
                ev5=float(row['EV5']) if pd.notna(row['EV5']) else 0,
                ev6=float(row['EV6']) if pd.notna(row['EV6']) else 0,
            )
            
            sales_objects.append(sales_obj)
            
            # Bulk create in batches
            if len(sales_objects) >= batch_size:
                SalesData.objects.bulk_create(sales_objects)
                print(f"Imported {len(sales_objects)} records (total: {index + 1})")
                sales_objects = []
                
        except Exception as e:
            print(f"Error processing row {index}: {e}")
            continue
    
    # Create remaining objects
    if sales_objects:
        SalesData.objects.bulk_create(sales_objects)
        print(f"Imported final batch of {len(sales_objects)} records")
    
    print(f"Import completed! Total records: {SalesData.objects.count()}")


if __name__ == '__main__':
    import_data()
