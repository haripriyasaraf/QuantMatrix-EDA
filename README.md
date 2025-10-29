# Interactive EDA Application - FMCG Retail Analytics Dashboard

A full-stack web application for Exploratory Data Analysis (EDA) of FMCG retail data, built with React frontend and Django backend.

## 🚀 Features

### Interactive Dashboard
- **Real-time Data Visualization**: Dynamic charts that update based on filter selections
- **Comprehensive Filtering**: Filter by Brand, Pack Type, PPG, Channel, and Year
- **Multiple Chart Types**: 
  - Horizontal bar charts for Sales Value by Year and Volume
  - Vertical bar chart for Year-wise Sales Value
  - Line chart for Monthly Sales Trend
  - Pie/Donut chart for Market Share analysis
- **Summary Statistics**: Key metrics displayed in interactive cards
- **Responsive Design**: Optimized for desktop and mobile devices

### Technical Features
- **Modern UI/UX**: Material-UI components with custom theming
- **Real-time Updates**: Instant chart updates when filters change
- **Error Handling**: Comprehensive error handling and loading states
- **Performance Optimized**: Efficient data aggregation and rendering
- **Scalable Architecture**: Modular component structure

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Chart.js** and **React-ChartJS-2** for data visualization
- **Axios** for API communication
- **Recharts** for additional chart components

### Backend
- **Django 5.2** with Django REST Framework
- **SQLite** database (easily configurable for PostgreSQL/MySQL)
- **Pandas** for data processing
- **CORS** support for cross-origin requests

## 📊 Dataset

The application analyzes FMCG retail data with the following key dimensions:
- **Market**: Market segments
- **Channel**: Sales channels (Convenience, etc.)
- **Brand**: Product brands (Brand 1, Brand 2, etc.)
- **Pack Type**: Packaging types
- **PPG**: Price Per Gram categories
- **Time Series**: Year, Month, Week, Date
- **Metrics**: Sales Value, Volume, Volume Units

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Quick Start (Recommended)
```bash
# Clone the repository
git clone https://github.com/lakshmeeshman/Interactive-EDA-Application---FMCG-Retail-Analytics-Dashboard.git
cd Interactive-EDA-Application---FMCG-Retail-Analytics-Dashboard

# Start both servers automatically
./start.sh  # Unix/Mac
# or
start.bat   # Windows
```

**Access the application:**
- Frontend: http://localhost:3009
- Backend API: http://localhost:8000

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework django-cors-headers pandas numpy python-dateutil
   ```

4. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Import data**:
   ```bash
   python import_data.py
   ```

6. **Start Django server**:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open browser**: Navigate to `http://localhost:3000`

## 📁 Project Structure

```
EDA/
├── backend/
│   ├── eda_backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── analytics/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── import_data.py
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── SummaryCards.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Filter Options
- `GET /api/sales/filter_options/` - Get available filter options

### Analytics Endpoints
- `POST /api/sales/sales_by_year_volume/` - Sales value by year and volume
- `POST /api/sales/yearly_sales_value/` - Year-wise sales value
- `POST /api/sales/monthly_trend/` - Monthly sales trend
- `POST /api/sales/market_share/` - Market share analysis
- `POST /api/sales/summary_stats/` - Summary statistics

### Request Format
```json
{
  "filters": {
    "brands": ["Brand 1", "Brand 2"],
    "pack_types": ["AllPackType"],
    "ppgs": ["Small Single", "Standard Single"],
    "channels": ["Convenience"],
    "years": [2021, 2022, 2023]
  }
}
```

## 🎨 Design Decisions

### Frontend Architecture
- **Component-based Design**: Modular, reusable components
- **TypeScript**: Type safety and better development experience
- **Material-UI**: Consistent, professional UI components
- **Chart.js Integration**: High-performance chart rendering
- **Responsive Layout**: Mobile-first design approach

### Backend Architecture
- **Django REST Framework**: Robust API development
- **Model-based Data Structure**: Efficient database queries
- **Aggregation Functions**: Optimized data processing
- **CORS Support**: Cross-origin request handling
- **Error Handling**: Comprehensive error responses

### Data Processing
- **Pandas Integration**: Efficient data manipulation
- **Bulk Operations**: Optimized database insertions
- **Date Parsing**: Robust date handling with error recovery
- **Data Validation**: Input validation and sanitization

## 🚀 Deployment

### Production Considerations
1. **Database**: Switch to PostgreSQL or MySQL for production
2. **Environment Variables**: Use environment variables for sensitive data
3. **Static Files**: Configure static file serving
4. **CORS**: Restrict CORS origins for security
5. **HTTPS**: Enable SSL/TLS for secure communication

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Chart Rendering**: Efficient chart updates with Chart.js
- **Component Memoization**: React.memo for performance optimization
- **Lazy Loading**: Component lazy loading for better initial load
- **Data Pagination**: Efficient data handling for large datasets

## 🔍 Key Features Implemented

✅ **Interactive Filters**: Multi-select filters with real-time updates
✅ **Chart Visualizations**: All required chart types implemented
✅ **Responsive Design**: Mobile-friendly interface
✅ **Real-time Updates**: Instant chart updates on filter changes
✅ **Error Handling**: Comprehensive error states and loading indicators
✅ **Modern UI**: Professional Material-UI design
✅ **TypeScript**: Full type safety implementation
✅ **API Integration**: RESTful API with Django backend
✅ **Data Processing**: Efficient data aggregation and analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is created for evaluation purposes.

## 👨‍💻 Author

Built with ❤️ for the EDA Application Challenge

---

**Note**: This application demonstrates modern full-stack development practices with React, Django, and comprehensive data visualization capabilities.
