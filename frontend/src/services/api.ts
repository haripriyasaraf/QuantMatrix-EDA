import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface FilterOptions {
  brands: string[];
  pack_types: string[];
  ppgs: string[];
  channels: string[];
  years: number[];
}

export interface ChartData {
  labels: string[];
  data: number[];
  sales_data?: number[];
  volume_data?: number[];
}

export interface SummaryStats {
  total_sales: number;
  total_volume: number;
  avg_sales: number;
  avg_volume: number;
  record_count: number;
}

export interface Filters {
  brands?: string[];
  pack_types?: string[];
  ppgs?: string[];
  channels?: string[];
  years?: number[];
  startDate?: string;
  endDate?: string;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await this.api.get('/sales/filter_options/');
    return response.data;
  }

  async getSalesByYearVolume(filters: Filters): Promise<ChartData> {
    const response = await this.api.post('/sales/sales_by_year_volume/', { filters });
    return response.data;
  }

  async getYearlySalesValue(filters: Filters): Promise<ChartData> {
    const response = await this.api.post('/sales/yearly_sales_value/', { filters });
    return response.data;
  }

  async getMonthlyTrend(filters: Filters): Promise<ChartData> {
    const response = await this.api.post('/sales/monthly_trend/', { filters });
    return response.data;
  }

  async getMarketShare(filters: Filters, chartType: 'sales' | 'volume' = 'sales'): Promise<ChartData> {
    const response = await this.api.post('/sales/market_share/', { 
      filters, 
      chart_type: chartType 
    });
    return response.data;
  }

  async getSummaryStats(filters: Filters): Promise<SummaryStats> {
    const response = await this.api.post('/sales/summary_stats/', { filters });
    return response.data;
  }
}

export default new ApiService();
