import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Button,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Fade,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  FilterList,
  Clear,
  Tune,
  Refresh,
  DateRange,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FilterOptions, Filters } from '../services/api';

interface FilterPanelProps {
  filterOptions: FilterOptions | null;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  darkMode?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  filters,
  onFiltersChange,
  darkMode = false,
}) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [showFilters, setShowFilters] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMultiSelectChange = (key: keyof Filters) => (event: SelectChangeEvent<string[] | number[]>) => {
    const value = event.target.value as string[] | number[];
    handleFilterChange(key, value);
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    const newFilters = { 
      ...localFilters, 
      startDate: start?.toISOString().split('T')[0],
      endDate: end?.toISOString().split('T')[0]
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {};
    setLocalFilters(clearedFilters);
    setStartDate(null);
    setEndDate(null);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null
  );

  if (!filterOptions) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          color: '#2c3e50',
          borderRadius: 3,
          border: '2px solid #e9ecef',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Tune sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Advanced Filters
          </Typography>
        </Box>
        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          Loading filter options...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={4}
      sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        color: '#2c3e50',
        borderRadius: 3,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #e9ecef',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Tune sx={{ fontSize: 28, color: '#f39c12' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            Advanced Filters
        </Typography>
        {hasActiveFilters && (
            <Chip 
              label={`${Object.values(localFilters).filter(v => Array.isArray(v) ? v.length > 0 : v !== undefined).length} Active`}
              size="small"
              sx={{ 
                backgroundColor: '#f39c12',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Toggle Filters">
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              sx={{ color: '#f39c12' }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          {hasActiveFilters && (
            <Tooltip title="Clear All Filters">
              <IconButton 
                onClick={clearFilters}
                sx={{ color: '#e74c3c' }}
              >
                <Clear />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Fade in={showFilters}>
        <Box>
          {/* Date Range Picker */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#2c3e50' }}>
              <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
              Date Range
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue: Date | null) => handleDateRangeChange(newValue, endDate)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.8)' : 'rgba(255,255,255,0.8)',
                          '& fieldset': {
                            borderColor: darkMode ? '#555' : '#bdc3c7',
                          },
                          '&:hover fieldset': {
                            borderColor: '#f39c12',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f39c12',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#b0b0b0' : '#7f8c8d',
                          '&.Mui-focused': {
                            color: '#f39c12',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#ffffff' : '#2c3e50',
                        },
                        '& .MuiSvgIcon-root': {
                          color: darkMode ? '#f39c12' : '#7f8c8d',
                        },
                      }
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: darkMode ? '#b0b0b0' : '#7f8c8d' }}>to</Typography>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue: Date | null) => handleDateRangeChange(startDate, newValue)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: darkMode ? 'rgba(45, 45, 45, 0.8)' : 'rgba(255,255,255,0.8)',
                          '& fieldset': {
                            borderColor: darkMode ? '#555' : '#bdc3c7',
                          },
                          '&:hover fieldset': {
                            borderColor: '#f39c12',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f39c12',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#b0b0b0' : '#7f8c8d',
                          '&.Mui-focused': {
                            color: '#f39c12',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: darkMode ? '#ffffff' : '#2c3e50',
                        },
                        '& .MuiSvgIcon-root': {
                          color: darkMode ? '#f39c12' : '#7f8c8d',
                        },
                      }
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          {/* Horizontal Filter Layout */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)', 
                lg: 'repeat(5, 1fr)' 
              }, 
              gap: 2,
              mb: 2
            }}
          >
      {/* Brand Filter */}
            <FormControl 
              size="small" 
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: '#2c3e50',
                  '& fieldset': {
                    borderColor: '#bdc3c7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#f39c12',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f39c12',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8c8d',
                  '&.Mui-focused': {
                    color: '#f39c12',
                  },
                },
                '& .MuiChip-root': {
                  backgroundColor: '#f39c12',
                  color: 'white',
                }
              }}
            >
        <InputLabel>Brand</InputLabel>
        <Select
          multiple
          value={localFilters.brands || []}
          onChange={handleMultiSelectChange('brands')}
          input={<OutlinedInput label="Brand" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {filterOptions.brands.map((brand) => (
            <MenuItem key={brand} value={brand}>
              <Checkbox checked={(localFilters.brands || []).indexOf(brand) > -1} />
              <ListItemText primary={brand} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Pack Type Filter */}
            <FormControl 
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: '#2c3e50',
                  '& fieldset': {
                    borderColor: '#bdc3c7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#f39c12',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f39c12',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8c8d',
                  '&.Mui-focused': {
                    color: '#f39c12',
                  },
                },
                '& .MuiChip-root': {
                  backgroundColor: '#f39c12',
                  color: 'white',
                }
              }}
            >
        <InputLabel>Pack Type</InputLabel>
        <Select
          multiple
          value={localFilters.pack_types || []}
          onChange={handleMultiSelectChange('pack_types')}
          input={<OutlinedInput label="Pack Type" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {filterOptions.pack_types.map((packType) => (
            <MenuItem key={packType} value={packType}>
              <Checkbox checked={(localFilters.pack_types || []).indexOf(packType) > -1} />
              <ListItemText primary={packType} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* PPG Filter */}
            <FormControl 
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: '#2c3e50',
                  '& fieldset': {
                    borderColor: '#bdc3c7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#f39c12',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f39c12',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8c8d',
                  '&.Mui-focused': {
                    color: '#f39c12',
                  },
                },
                '& .MuiChip-root': {
                  backgroundColor: '#f39c12',
                  color: 'white',
                }
              }}
            >
        <InputLabel>PPG</InputLabel>
        <Select
          multiple
          value={localFilters.ppgs || []}
          onChange={handleMultiSelectChange('ppgs')}
          input={<OutlinedInput label="PPG" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {filterOptions.ppgs.map((ppg) => (
            <MenuItem key={ppg} value={ppg}>
              <Checkbox checked={(localFilters.ppgs || []).indexOf(ppg) > -1} />
              <ListItemText primary={ppg} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Channel Filter */}
            <FormControl 
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: '#2c3e50',
                  '& fieldset': {
                    borderColor: '#bdc3c7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#f39c12',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f39c12',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8c8d',
                  '&.Mui-focused': {
                    color: '#f39c12',
                  },
                },
                '& .MuiChip-root': {
                  backgroundColor: '#f39c12',
                  color: 'white',
                }
              }}
            >
        <InputLabel>Channel</InputLabel>
        <Select
          multiple
          value={localFilters.channels || []}
          onChange={handleMultiSelectChange('channels')}
          input={<OutlinedInput label="Channel" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {filterOptions.channels.map((channel) => (
            <MenuItem key={channel} value={channel}>
              <Checkbox checked={(localFilters.channels || []).indexOf(channel) > -1} />
              <ListItemText primary={channel} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Year Filter */}
            <FormControl 
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: '#2c3e50',
                  '& fieldset': {
                    borderColor: '#bdc3c7',
                  },
                  '&:hover fieldset': {
                    borderColor: '#f39c12',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f39c12',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7f8c8d',
                  '&.Mui-focused': {
                    color: '#f39c12',
                  },
                },
                '& .MuiChip-root': {
                  backgroundColor: '#f39c12',
                  color: 'white',
                }
              }}
            >
        <InputLabel>Year</InputLabel>
        <Select
          multiple
          value={localFilters.years || []}
          onChange={(event) => {
            const value = event.target.value as number[];
            handleFilterChange('years', value);
          }}
          input={<OutlinedInput label="Year" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((value) => (
                <Chip key={value} label={value.toString()} size="small" />
              ))}
            </Box>
          )}
        >
          {filterOptions.years.map((year) => (
            <MenuItem key={year} value={year}>
              <Checkbox checked={(localFilters.years || []).indexOf(year) > -1} />
              <ListItemText primary={year.toString()} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
          </Box>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
            <Fade in={hasActiveFilters}>
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(243, 156, 18, 0.1)',
                  borderRadius: 2,
                  border: '1px solid rgba(243, 156, 18, 0.3)'
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Active Filters:
          </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {localFilters.brands?.map((brand) => (
                    <Chip 
                      key={`brand-${brand}`} 
                      label={`Brand: ${brand}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f39c12',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
            ))}
            {localFilters.pack_types?.map((packType) => (
                    <Chip 
                      key={`pack-${packType}`} 
                      label={`Pack: ${packType}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f39c12',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
            ))}
            {localFilters.ppgs?.map((ppg) => (
                    <Chip 
                      key={`ppg-${ppg}`} 
                      label={`PPG: ${ppg}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f39c12',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
            ))}
            {localFilters.channels?.map((channel) => (
                    <Chip 
                      key={`channel-${channel}`} 
                      label={`Channel: ${channel}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f39c12',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
            ))}
            {localFilters.years?.map((year) => (
                    <Chip 
                      key={`year-${year}`} 
                      label={`Year: ${year}`} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f39c12',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
            ))}
          </Box>
        </Box>
            </Fade>
      )}
        </Box>
      </Fade>
    </Paper>
  );
};

export default FilterPanel;
