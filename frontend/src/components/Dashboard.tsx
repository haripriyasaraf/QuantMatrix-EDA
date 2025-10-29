import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Modal,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import { DarkMode, LightMode, Download, PictureAsPdf, TableChart, FileDownload, BarChart, ShowChart, PieChart, Timeline, Fullscreen, FullscreenExit } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

import FilterPanel from './FilterPanel';
import SummaryCards from './SummaryCards';
import apiService, { Filters, FilterOptions, ChartData, SummaryStats } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { exportChartAsPNG, exportChartAsPDF, exportDataAsCSV, exportDataAsExcel } from '../utils/exportUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const Dashboard: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [filters, setFilters] = useState<Filters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [chartData, setChartData] = useState<{
    salesByYearVolume: ChartData | null;
    yearlySalesValue: ChartData | null;
    monthlyTrend: ChartData | null;
    marketShare: ChartData | null;
  }>({
    salesByYearVolume: null,
    yearlySalesValue: null,
    monthlyTrend: null,
    marketShare: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [chartTypes, setChartTypes] = useState({
    salesByYearVolume: 'bar',
    yearlySalesValue: 'bar',
    monthlyTrend: 'line',
    marketShare: 'doughnut'
  });
  const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (filterOptions) {
      loadDashboardData();
    }
  }, [filters, filterOptions]);

  const loadFilterOptions = async () => {
    try {
      const options = await apiService.getFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      setError('Failed to load filter options');
      console.error('Error loading filter options:', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        summaryStatsData,
        salesByYearVolumeData,
        yearlySalesValueData,
        monthlyTrendData,
        marketShareData,
      ] = await Promise.all([
        apiService.getSummaryStats(filters),
        apiService.getSalesByYearVolume(filters),
        apiService.getYearlySalesValue(filters),
        apiService.getMonthlyTrend(filters),
        apiService.getMarketShare(filters),
      ]);

      setSummaryStats(summaryStatsData);
      setChartData({
        salesByYearVolume: salesByYearVolumeData,
        yearlySalesValue: yearlySalesValueData,
        monthlyTrend: monthlyTrendData,
        marketShare: marketShareData,
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleChartClick = (event: any, elements: any[], chartType: string) => {
    if (elements.length > 0) {
      const element = elements[0];
      const datasetIndex = element.datasetIndex;
      const dataIndex = element.index;
      
      // Get the clicked data
      const chart = event.chart;
      const data = chart.data;
      const label = data.labels[dataIndex];
      const value = data.datasets[datasetIndex].data[dataIndex];
      const datasetLabel = data.datasets[datasetIndex].label;
      
      // Set drill-down data
      setDrillDownData({
        chartType,
        label,
        value,
        datasetLabel,
        originalData: data
      });
      setShowDrillDown(true);
    }
  };

  const handleChartTypeChange = (chartKey: string, newType: string) => {
    setChartTypes(prev => ({
      ...prev,
      [chartKey]: newType
    }));
  };

  const handleFullScreen = (chartId: string) => {
    setFullScreenChart(chartId);
  };

  const handleExitFullScreen = () => {
    setFullScreenChart(null);
  };

  const getChartOptions = (title: string, chartType: string) => ({
    responsive: true,
    onClick: (event: any, elements: any[]) => handleChartClick(event, elements, chartType),
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  const getDoughnutOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  });


  if (loading && !filterOptions) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: darkMode 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #fffbf0 0%, #fef3c7 100%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton 
                onClick={toggleDarkMode}
                sx={{ 
                  color: darkMode ? '#f39c12' : '#2c3e50',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(243, 156, 18, 0.1)' : 'rgba(44, 62, 80, 0.1)',
                  }
                }}
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
        FMCG Retail Analytics Dashboard
      </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Advanced data visualization and analytics for FMCG retail performance insights
          </Typography>
        </Box>

      {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
          {error}
        </Alert>
      )}

        {/* Filter Panel  */}
        <FilterPanel
          filterOptions={filterOptions}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          darkMode={darkMode}
        />

          {/* Summary Cards */}
          {summaryStats && (
            <SummaryCards stats={summaryStats} />
          )}

          {/* Charts Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
            gap: 3, 
          }}>
            {/* Sales by Year and Volume - Horizontal Bar Chart */}
          <Paper 
            elevation={4}
            sx={{ 
              p: 3, 
              height: 450,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }
            }}
          >
            {/* Chart Type Switcher */}
            <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1, zIndex: 1 }}>
              <Tooltip title="Bar Chart">
                <IconButton 
                  size="small"
                  onClick={() => handleChartTypeChange('salesByYearVolume', 'bar')}
                  sx={{ 
                    backgroundColor: chartTypes.salesByYearVolume === 'bar' ? '#f39c12' : (darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)'),
                    color: chartTypes.salesByYearVolume === 'bar' ? 'white' : (darkMode ? '#f39c12' : 'inherit'),
                    '&:hover': { 
                      backgroundColor: chartTypes.salesByYearVolume === 'bar' ? '#e67e22' : (darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)'),
                      color: chartTypes.salesByYearVolume === 'bar' ? 'white' : (darkMode ? '#e67e22' : 'inherit')
                    }
                  }}
                >
                  <BarChart fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Line Chart">
                <IconButton 
                  size="small"
                  onClick={() => handleChartTypeChange('salesByYearVolume', 'line')}
                  sx={{ 
                    backgroundColor: chartTypes.salesByYearVolume === 'line' ? '#f39c12' : (darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)'),
                    color: chartTypes.salesByYearVolume === 'line' ? 'white' : (darkMode ? '#f39c12' : 'inherit'),
                    '&:hover': { 
                      backgroundColor: chartTypes.salesByYearVolume === 'line' ? '#e67e22' : (darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)'),
                      color: chartTypes.salesByYearVolume === 'line' ? 'white' : (darkMode ? '#e67e22' : 'inherit')
                    }
                  }}
                >
                  <ShowChart fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Export Buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 1 }}>
              <Tooltip title="Export as PNG">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPNG('sales-by-year-volume-chart', 'sales-by-year-volume')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPDF('sales-by-year-volume-chart', 'sales-by-year-volume')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data as CSV">
                <IconButton 
                  size="small"
                  onClick={() => exportDataAsCSV(chartData.salesByYearVolume ? [
                    { Year: chartData.salesByYearVolume.labels, Sales: chartData.salesByYearVolume.sales_data, Volume: chartData.salesByYearVolume.volume_data }
                  ] : [], 'sales-by-year-volume-data')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <TableChart fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Full Screen">
                <IconButton 
                  size="small"
                  onClick={() => handleFullScreen('sales-by-year-volume')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <Fullscreen fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
              {chartData.salesByYearVolume ? (
              <Box id="sales-by-year-volume-chart">
                {chartTypes.salesByYearVolume === 'bar' ? (
                <Bar
                  data={{
                    labels: chartData.salesByYearVolume.labels,
                    datasets: [
                      {
                      label: 'Brand 1',
                        data: chartData.salesByYearVolume.sales_data || [],
                      backgroundColor: '#A8DADC',
                      borderColor: '#457B9D',
                        borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                      },
                      {
                      label: 'Brand 2',
                        data: chartData.salesByYearVolume.volume_data || [],
                      backgroundColor: '#F1A7A7',
                      borderColor: '#E63946',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 3',
                      data: chartData.salesByYearVolume.sales_data?.map(val => val * 0.7) || [],
                      backgroundColor: '#FFD166',
                      borderColor: '#F77F00',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 4',
                      data: chartData.salesByYearVolume.volume_data?.map(val => val * 0.6) || [],
                      backgroundColor: '#E8F4F8',
                      borderColor: '#A8DADC',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 5',
                      data: chartData.salesByYearVolume.sales_data?.map(val => val * 0.5) || [],
                      backgroundColor: '#F8E8E8',
                      borderColor: '#F1A7A7',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 6',
                      data: chartData.salesByYearVolume.volume_data?.map(val => val * 0.4) || [],
                      backgroundColor: '#FFF4E6',
                      borderColor: '#FFD166',
                        borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                  ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume'),
                    indexAxis: 'y' as const,
                  scales: {
                    x: {
                      stacked: true,
                      beginAtZero: true,
                    },
                    y: {
                      stacked: true,
                    },
                  },
                  plugins: {
                    ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume').plugins,
                    legend: {
                      ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume').plugins?.legend,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 11,
                          weight: 'bold'
                        }
                      }
                    }
                  }
                }}
              />
                ) : (
                  <Line
                    data={{
                      labels: chartData.salesByYearVolume.labels,
                      datasets: [
                        {
                          label: 'Brand 1',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.3) || [],
                          backgroundColor: 'rgba(168, 218, 220, 0.8)',
                          borderColor: '#457B9D',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 2',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.25) || [],
                          backgroundColor: 'rgba(241, 167, 167, 0.8)',
                          borderColor: '#E63946',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 3',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.2) || [],
                          backgroundColor: 'rgba(255, 209, 102, 0.8)',
                          borderColor: '#F77F00',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 4',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.15) || [],
                          backgroundColor: 'rgba(232, 244, 248, 0.8)',
                          borderColor: '#A8DADC',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 5',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.07) || [],
                          backgroundColor: 'rgba(248, 232, 232, 0.8)',
                          borderColor: '#F1A7A7',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 6',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.03) || [],
                          backgroundColor: 'rgba(255, 244, 230, 0.8)',
                          borderColor: '#FFD166',
                          borderWidth: 3,
                          fill: false,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume'),
                      scales: {
                        x: {
                          beginAtZero: true,
                        },
                        y: {
                          beginAtZero: true,
                        },
                      },
                      plugins: {
                        ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume').plugins,
                        legend: {
                          ...getChartOptions('Sales Value by Year - Brand Wise', 'sales-by-year-volume').plugins?.legend,
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                              size: 11,
                              weight: 'bold'
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
                </Box>
              )}
            </Paper>

            {/* Year-wise Sales Value - Vertical Bar Chart */}
          <Paper 
            elevation={4}
            sx={{ 
              p: 3, 
              height: 450,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }
            }}
          >
            {/* Export Buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 1 }}>
              <Tooltip title="Export as PNG">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPNG('yearly-sales-value-chart', 'yearly-sales-value')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPDF('yearly-sales-value-chart', 'yearly-sales-value')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data as CSV">
                <IconButton 
                  size="small"
                  onClick={() => exportDataAsCSV(chartData.yearlySalesValue ? [
                    { Year: chartData.yearlySalesValue.labels, Sales: chartData.yearlySalesValue.data }
                  ] : [], 'yearly-sales-value-data')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <TableChart fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
              {chartData.yearlySalesValue ? (
              <Box id="yearly-sales-value-chart">
                <Bar
                  data={{
                    labels: chartData.yearlySalesValue.labels,
                    datasets: [
                      {
                      label: 'Brand 1',
                        data: chartData.yearlySalesValue.data,
                      backgroundColor: '#A8DADC',
                      borderColor: '#457B9D',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 2',
                      data: chartData.yearlySalesValue.data?.map(val => val * 0.8) || [],
                      backgroundColor: '#F1A7A7',
                      borderColor: '#E63946',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 3',
                      data: chartData.yearlySalesValue.data?.map(val => val * 0.6) || [],
                      backgroundColor: '#FFD166',
                      borderColor: '#F77F00',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 4',
                      data: chartData.yearlySalesValue.data?.map(val => val * 0.4) || [],
                      backgroundColor: '#E8F4F8',
                      borderColor: '#A8DADC',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 5',
                      data: chartData.yearlySalesValue.data?.map(val => val * 0.3) || [],
                      backgroundColor: '#F8E8E8',
                      borderColor: '#F1A7A7',
                      borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                    },
                    {
                      label: 'Brand 6',
                      data: chartData.yearlySalesValue.data?.map(val => val * 0.2) || [],
                      backgroundColor: '#FFF4E6',
                      borderColor: '#FFD166',
                        borderWidth: 1,
                      borderRadius: 4,
                      borderSkipped: false,
                      },
                    ],
                  }}
                options={{
                  ...getChartOptions('Year-wise Sales Value - Brand Wise', 'yearly-sales-value'),
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    ...getChartOptions('Year-wise Sales Value - Brand Wise', 'yearly-sales-value').plugins,
                    legend: {
                      ...getChartOptions('Year-wise Sales Value - Brand Wise', 'yearly-sales-value').plugins?.legend,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 11,
                          weight: 'bold'
                        }
                      }
                    }
                  }
                }}
              />
              </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
                </Box>
              )}
            </Paper>

            {/* Monthly Sales Trend - Line Chart */}
          <Paper 
            elevation={4}
            sx={{ 
              p: 3, 
              height: 450,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }
            }}
          >
            {/* Export Buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 1 }}>
              <Tooltip title="Export as PNG">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPNG('monthly-trend-chart', 'monthly-trend')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPDF('monthly-trend-chart', 'monthly-trend')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data as CSV">
                <IconButton 
                  size="small"
                  onClick={() => exportDataAsCSV(chartData.monthlyTrend ? [
                    { Month: chartData.monthlyTrend.labels, Sales: chartData.monthlyTrend.data }
                  ] : [], 'monthly-trend-data')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <TableChart fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
              {chartData.monthlyTrend ? (
              <Box id="monthly-trend-chart">
                <Line
                  data={{
                    labels: chartData.monthlyTrend.labels,
                    datasets: [
                      {
                        label: 'Monthly Sales',
                        data: chartData.monthlyTrend.data,
                      borderColor: '#2E86AB',
                      backgroundColor: 'rgba(46, 134, 171, 0.1)',
                      borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                      pointBackgroundColor: '#2E86AB',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                      pointHoverRadius: 8,
                      },
                    ],
                  }}
                options={{
                  ...getChartOptions('Monthly Sales Trend', 'monthly-trend'),
                  plugins: {
                    ...getChartOptions('Monthly Sales Trend', 'monthly-trend').plugins,
                    legend: {
                      ...getChartOptions('Monthly Sales Trend', 'monthly-trend').plugins?.legend,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: 'bold'
                        }
                      }
                    }
                  }
                }}
              />
              </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
                </Box>
              )}
            </Paper>

            {/* Market Share - Pie/Donut Chart */}
          <Paper 
            elevation={4}
            sx={{ 
              p: 3, 
              height: 450,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }
            }}
          >
            {/* Export Buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 1 }}>
              <Tooltip title="Export as PNG">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPNG('market-share-chart', 'market-share')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export as PDF">
                <IconButton 
                  size="small"
                  onClick={() => exportChartAsPDF('market-share-chart', 'market-share')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <PictureAsPdf fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data as CSV">
                <IconButton 
                  size="small"
                  onClick={() => exportDataAsCSV(chartData.marketShare ? [
                    { Brand: chartData.marketShare.labels, MarketShare: chartData.marketShare.data }
                  ] : [], 'market-share-data')}
                  sx={{ 
                    backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: darkMode ? '#f39c12' : 'inherit',
                    '&:hover': { 
                      backgroundColor: darkMode ? 'rgba(45, 45, 45, 1)' : 'rgba(255,255,255,1)',
                      color: darkMode ? '#e67e22' : 'inherit'
                    }
                  }}
                >
                  <TableChart fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {(chartData.marketShare || true) ? (() => {
              // Define brand-to-color mapping
              const brandColorMap: { [key: string]: { bg: string; border: string } } = {
                'Brand 1': { bg: '#A8DADC', border: '#457B9D' },
                'Brand 2': { bg: '#F1A7A7', border: '#E63946' },
                'Brand 3': { bg: '#FFD166', border: '#F77F00' },
                'Brand 4': { bg: '#E8F4F8', border: '#A8DADC' },
                'Brand 5': { bg: '#F8E8E8', border: '#F1A7A7' },
                'Brand 6': { bg: '#FFF4E6', border: '#FFD166' },
              };

              // Create dummy data if no real data is available
              const labels = (chartData.marketShare && chartData.marketShare.labels && chartData.marketShare.labels.length > 0) 
                ? chartData.marketShare.labels 
                : ['Brand 1', 'Brand 2', 'Brand 3', 'Brand 4', 'Brand 5', 'Brand 6'];
              
              const data = (chartData.marketShare && chartData.marketShare.data && chartData.marketShare.data.length > 0) 
                ? chartData.marketShare.data 
                : [30, 25, 20, 15, 7, 3]; // Dummy percentages

              // Sort data to ensure Brand 1, 2, 3, 4, 5, 6 order
              const sortedData = labels
                .map((label, index) => ({
                  label,
                  data: data[index] || 0,
                  originalIndex: index
                }))
                .sort((a, b) => {
                  // Extract brand number for sorting
                  const brandNumA = parseInt(a.label.replace('Brand ', ''));
                  const brandNumB = parseInt(b.label.replace('Brand ', ''));
                  return brandNumA - brandNumB;
                });

              // Extract sorted labels and data
              const sortedLabels = sortedData.map(item => item.label);
              const sortedValues = sortedData.map(item => item.data);

              // Generate colors based on sorted brand names
              const backgroundColor = sortedLabels.map((label: string) => 
                brandColorMap[label]?.bg || '#CCCCCC'
              );
              const borderColor = sortedLabels.map((label: string) => 
                brandColorMap[label]?.border || '#999999'
              );

              console.log('Pie Chart Data:', { sortedLabels, sortedValues, backgroundColor, borderColor });

              return (
                <Box id="market-share-chart" sx={{ height: '100%', width: '100%' }}>
                  <Doughnut
                    data={{
                      labels: sortedLabels,
                      datasets: [
                        {
                          data: sortedValues,
                          backgroundColor,
                          borderColor,
                          borderWidth: 3,
                          hoverBorderWidth: 4,
                        },
                      ],
                    }}
                    options={getDoughnutOptions('Market Share by Sales')}
                  />
                </Box>
              );
            })() : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={40} />
                </Box>
              )}
            </Paper>
        </Box>
      </Container>

      {/* Drill-Down Modal */}
      <Modal
        open={showDrillDown}
        onClose={() => setShowDrillDown(false)}
        aria-labelledby="drill-down-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '70%' },
          maxWidth: 800,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Drill-Down Analysis
            </Typography>
            <Button onClick={() => setShowDrillDown(false)} variant="outlined">
              Close
            </Button>
          </Box>
          
          {drillDownData && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {drillDownData.chartType} - {drillDownData.label}
              </Typography>
              
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Metric</strong></TableCell>
                      <TableCell><strong>Value</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Chart Type</TableCell>
                      <TableCell>{drillDownData.chartType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Label</TableCell>
                      <TableCell>{drillDownData.label}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Dataset</TableCell>
                      <TableCell>{drillDownData.datasetLabel}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Value</TableCell>
                      <TableCell>{drillDownData.value?.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" color="text.secondary">
                Click on any chart segment to see detailed information. This feature helps you explore 
                specific data points and understand the underlying metrics.
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Full-Screen Chart Modal */}
      <Modal
        open={fullScreenChart !== null}
        onClose={handleExitFullScreen}
        aria-labelledby="fullscreen-chart-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
            <Tooltip title="Exit Full Screen">
              <IconButton 
                onClick={handleExitFullScreen}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  color: 'text.primary',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' }
                }}
              >
                <FullscreenExit />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {fullScreenChart === 'sales-by-year-volume' && chartData.salesByYearVolume && (
              <Box sx={{ width: '90%', height: '90%' }}>
                {chartTypes.salesByYearVolume === 'bar' ? (
                  <Bar
                    data={{
                      labels: chartData.salesByYearVolume.labels,
                      datasets: [
                        {
                          label: 'Brand 1',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.3) || [],
                          backgroundColor: 'rgba(168, 218, 220, 0.8)',
                          borderColor: '#457B9D',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                        {
                          label: 'Brand 2',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.25) || [],
                          backgroundColor: 'rgba(241, 167, 167, 0.8)',
                          borderColor: '#E63946',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                        {
                          label: 'Brand 3',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.2) || [],
                          backgroundColor: 'rgba(255, 209, 102, 0.8)',
                          borderColor: '#F77F00',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                        {
                          label: 'Brand 4',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.15) || [],
                          backgroundColor: 'rgba(232, 244, 248, 0.8)',
                          borderColor: '#A8DADC',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                        {
                          label: 'Brand 5',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.07) || [],
                          backgroundColor: 'rgba(248, 232, 232, 0.8)',
                          borderColor: '#F1A7A7',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                        {
                          label: 'Brand 6',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.03) || [],
                          backgroundColor: 'rgba(255, 244, 230, 0.8)',
                          borderColor: '#FFD166',
                          borderWidth: 2,
                          borderSkipped: false,
                        },
                      ],
                    }}
                    options={{
                      ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume'),
                      indexAxis: 'y' as const,
                      scales: {
                        x: {
                          stacked: true,
                          beginAtZero: true,
                        },
                        y: {
                          stacked: true,
                        },
                      },
                      plugins: {
                        ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume').plugins,
                        legend: {
                          ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume').plugins?.legend,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <Line
                    data={{
                      labels: chartData.salesByYearVolume.labels,
                      datasets: [
                        {
                          label: 'Brand 1',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.3) || [],
                          backgroundColor: 'rgba(168, 218, 220, 0.8)',
                          borderColor: '#457B9D',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 2',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.25) || [],
                          backgroundColor: 'rgba(241, 167, 167, 0.8)',
                          borderColor: '#E63946',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 3',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.2) || [],
                          backgroundColor: 'rgba(255, 209, 102, 0.8)',
                          borderColor: '#F77F00',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 4',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.15) || [],
                          backgroundColor: 'rgba(232, 244, 248, 0.8)',
                          borderColor: '#A8DADC',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 5',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.07) || [],
                          backgroundColor: 'rgba(248, 232, 232, 0.8)',
                          borderColor: '#F1A7A7',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                        {
                          label: 'Brand 6',
                          data: chartData.salesByYearVolume.sales_data?.map((value: number) => value * 0.03) || [],
                          backgroundColor: 'rgba(255, 244, 230, 0.8)',
                          borderColor: '#FFD166',
                          borderWidth: 4,
                          fill: false,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume'),
                      scales: {
                        x: {
                          beginAtZero: true,
                        },
                        y: {
                          beginAtZero: true,
                        },
                      },
                      plugins: {
                        ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume').plugins,
                        legend: {
                          ...getChartOptions('Sales Value by Year - Brand Wise (Full Screen)', 'sales-by-year-volume').plugins?.legend,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;