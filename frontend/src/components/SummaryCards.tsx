import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Fade,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Scale,
  Assessment,
  Analytics,
} from '@mui/icons-material';
import { SummaryStats } from '../services/api';

interface SummaryCardsProps {
  stats: SummaryStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return `$${formatNumber(num)}`;
  };

  const cards = [
    {
      title: 'Total Sales Value',
      value: formatCurrency(stats.total_sales),
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      iconBg: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      trend: '+12.5%',
      trendColor: '#4caf50',
    },
    {
      title: 'Total Volume',
      value: `${formatNumber(stats.total_volume)} kg`,
      icon: <Scale sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      iconBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      trend: '+8.2%',
      trendColor: '#4caf50',
    },
    {
      title: 'Average Sales',
      value: formatCurrency(stats.avg_sales),
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      iconBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      trend: '+5.7%',
      trendColor: '#4caf50',
    },
    {
      title: 'Average Volume',
      value: `${formatNumber(stats.avg_volume)} kg`,
      icon: <Assessment sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      iconBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      trend: '+3.1%',
      trendColor: '#4caf50',
    },
    {
      title: 'Total Records',
      value: stats.record_count.toLocaleString(),
      icon: <Analytics sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      iconBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      trend: '+15.3%',
      trendColor: '#4caf50',
    },
  ];

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, 
      gap: 3, 
      mb: 4 
    }}>
      {cards.map((card, index) => (
        <Fade in={true} timeout={600 + index * 100} key={index}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: card.gradient,
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                pointerEvents: 'none',
              }
            }}
          >
            <CardContent sx={{ 
              flexGrow: 1, 
              p: 3, 
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Header with Icon and Trend */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {card.icon}
                </Box>
                <Chip
                  label={card.trend}
                  size="small"
                  sx={{
                    backgroundColor: card.trendColor,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              </Box>

              {/* Value and Title */}
              <Box>
                <Typography 
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                  }}
                >
                  {card.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.875rem',
                    opacity: 0.9,
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {card.title}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      ))}
    </Box>
  );
};

export default SummaryCards;