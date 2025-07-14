import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar
} from 'recharts';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Chip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Timeline,
  Analytics
} from '@mui/icons-material';

interface DataPoint {
  RegionType: string;
  StateName: string;
  RegionName: string;
  [key: string]: string | number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DataVisualization: React.FC = () => {
  const { data, filteredData, filters } = useSelector((state: RootState) => state.csv);
  const [tabValue, setTabValue] = React.useState(0);
  
  console.log('DataVisualization: data length:', data.length, 'filteredData length:', filteredData?.length);
  console.log('DataVisualization: Current filters:', filters);
  
  // Check if filters are active and we have filtered data
  const hasActiveFilters = filters.regionType && filters.stateName && filters.regionName;
  const hasFilteredData = filteredData && filteredData.length > 0;
  
  // Use filteredData when filters are applied, otherwise show empty state
  const displayData = hasActiveFilters && hasFilteredData ? filteredData : [];
  
  console.log('DataVisualization: displayData length:', displayData?.length);
  console.log('DataVisualization: Has active filters?', hasActiveFilters);
  console.log('DataVisualization: Has filtered data?', hasFilteredData);

  // Process data for housing analysis
  const processedData = useMemo(() => {
    console.log('DataVisualization: Processing data - displayData length:', displayData?.length);
    console.log('DataVisualization: First row sample:', displayData?.[0]);
    
    if (!displayData || displayData.length === 0) {
      console.log('DataVisualization: No display data, returning null');
      return null;
    }

    // Convert string values to numbers for visualization
    const numericData = displayData.map((row: DataPoint) => {
      const numericRow: Record<string, any> = { ...row };
      
      // Convert numeric columns to numbers
      Object.keys(row).forEach(key => {
        if (key !== 'RegionType' && key !== 'StateName' && key !== 'RegionName' && 
            key !== 'RegionID' && key !== 'State' && key !== 'City' && 
            key !== 'Metro' && key !== 'CountyName') {
          const value = parseFloat(row[key] as string);
          numericRow[key] = isNaN(value) ? 0 : value;
        }
      });
      
      return numericRow;
    });

    // Get numeric columns (likely housing values over time)
    const numericColumns = Object.keys(displayData[0] || {}).filter(
      key => key !== 'RegionType' && key !== 'StateName' && key !== 'RegionName' && 
             key !== 'RegionID' && key !== 'State' && key !== 'City' && 
             key !== 'Metro' && key !== 'CountyName' && key !== 'SizeRank'
    );

    // Sort numeric columns (assuming they're dates or time periods)
    numericColumns.sort();
    
    console.log('DataVisualization: Numeric columns found:', numericColumns);
    console.log('DataVisualization: All columns in first row:', Object.keys(displayData[0] || {}));

    // Calculate market statistics for filtered data
    const marketStats = {
      totalRegions: displayData.length,
      uniqueStates: [...new Set(displayData.map(row => row.StateName))].length,
      uniqueRegionTypes: [...new Set(displayData.map(row => row.RegionType))].length,
      numericColumns: numericColumns.length,
      selectedRegion: filters.regionName,
      selectedState: filters.stateName,
      selectedRegionType: filters.regionType
    };

    // Prepare value breakdown for the selected region
    const selectedRegionData = numericData.find(row => row.RegionName === filters.regionName);
    
    // Prepare time series data for detailed analysis
    const timeSeriesData = numericColumns.map((column, index) => {
      // For single region analysis, we only have one value per period
      const regionValue = selectedRegionData ? (selectedRegionData[column] || 0) : 0;
      
      return {
        period: column,
        value: Math.round(regionValue),
        index
      };
    });


    const valueBreakdown = numericColumns.map(column => ({
      period: column,
      value: selectedRegionData ? (selectedRegionData[column] || 0) : 0,
      formattedValue: selectedRegionData ? `$${(selectedRegionData[column] || 0).toLocaleString()}` : '$0'
    }));

    // Calculate trend analysis
    const calculateTrendAnalysis = () => {
      if (valueBreakdown.length < 2) return null;

      // Calculate monthly changes
      const changes = valueBreakdown.map((item, index) => {
        if (index === 0) return { period: item.period, change: 0, changePercent: 0 };
        
        const prevValue = valueBreakdown[index - 1].value;
        const currentValue = item.value;
        const change = currentValue - prevValue;
        const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
        
        return {
          period: item.period,
          change,
          changePercent,
          value: currentValue
        };
      }).slice(1); // Remove first item (no change)

      // Calculate trend metrics
      const changesOnly = changes.filter(c => c.value > 0);
      const avgChangePercent = changesOnly.length > 0 
        ? changesOnly.reduce((sum, c) => sum + c.changePercent, 0) / changesOnly.length 
        : 0;
      
      const positiveChanges = changesOnly.filter(c => c.changePercent > 0).length;
      const negativeChanges = changesOnly.filter(c => c.changePercent < 0).length;
      const likelihoodOfIncrease = changesOnly.length > 0 
        ? (positiveChanges / changesOnly.length) * 100 
        : 0;

      // Calculate volatility (standard deviation of changes)
      const variance = changesOnly.length > 0 
        ? changesOnly.reduce((sum, c) => sum + Math.pow(c.changePercent - avgChangePercent, 2), 0) / changesOnly.length 
        : 0;
      const volatility = Math.sqrt(variance);

      // Simple forecast (last 3 periods average)
      const recentChanges = changesOnly.slice(-3);
      const forecastChangePercent = recentChanges.length > 0 
        ? recentChanges.reduce((sum, c) => sum + c.changePercent, 0) / recentChanges.length 
        : 0;
      
      const currentValue = valueBreakdown[valueBreakdown.length - 1]?.value || 0;
      const forecastValue = currentValue * (1 + forecastChangePercent / 100);

      return {
        changes,
        avgChangePercent,
        likelihoodOfIncrease,
        volatility,
        forecastChangePercent,
        forecastValue,
        positiveChanges,
        negativeChanges,
        totalChanges: changesOnly.length
      };
    };

    const trendAnalysis = calculateTrendAnalysis();

    console.log('DataVisualization: Processed data summary:', {
      numericDataLength: numericData.length,
      numericColumnsLength: numericColumns.length,
      selectedRegionData: selectedRegionData ? 'Found' : 'Not found',
      timeSeriesDataLength: timeSeriesData.length
    });
    
    return {
      numericColumns,
      marketStats,
      timeSeriesData,
      valueBreakdown,
      trendAnalysis
    };
  }, [displayData, filters, data]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!hasActiveFilters) {
    return (
      <Card sx={{ 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BarChartIcon />
            Housing Market Analysis
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Apply Filters to View Analysis
              </Typography>
              <Typography variant="body2">
                Please select Region Type, State, and Region in the filters above to see detailed market analysis.
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!hasFilteredData) {
    return (
      <Card sx={{ 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <BarChartIcon />
            Housing Market Analysis
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Data Matches Current Filters
              </Typography>
              <Typography variant="body2">
                Your current filters returned 0 results. Try adjusting your filter criteria.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                Total data available: {data.length} rows
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!processedData) {
    return (
      <Card sx={{ 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 3,
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrendingUp />
            Housing Market Analysis
          </Typography>
          <Alert severity="warning">
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Housing Data Available
            </Typography>
            <Typography variant="body2">
              The selected region doesn't have housing value data. This might be because:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>The region doesn't have housing price data</li>
              <li>The data format doesn't include numeric housing values</li>
              <li>All numeric columns were filtered out</li>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
              Available columns: {Object.keys(displayData[0] || {}).join(', ')}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { numericColumns, marketStats, timeSeriesData, valueBreakdown, trendAnalysis } = processedData;

  return (
    <Card sx={{ 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 3,
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUp />
          Housing Market Analysis
          {hasActiveFilters && (
            <Chip 
              label={`${filters.regionType} • ${filters.stateName} • ${filters.regionName}`} 
              size="small" 
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>

        {/* Market Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {marketStats.totalRegions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filtered Regions
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
            <Typography variant="h4" color="secondary" fontWeight="bold">
              {marketStats.uniqueStates}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              States in Results
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {marketStats.uniqueRegionTypes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Region Types
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {marketStats.numericColumns}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Time Periods
            </Typography>
          </Paper>
        </Box>

        {/* Chart Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="housing charts">
            <Tab icon={<Timeline />} label="Detailed Timeline" />
            <Tab icon={<Analytics />} label="Value Analysis" />
            <Tab icon={<TrendingUp />} label="Trend Analysis" />
          </Tabs>
        </Box>

        {/* Detailed Timeline Tab */}
        <TabPanel value={tabValue} index={0}>
          {timeSeriesData.length >= 1 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Detailed Timeline Analysis - {filters.regionName}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Min/Max Range Chart */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Value Range Over Time
                    </Typography>
                    <Box sx={{ height: 300 }}>
                                              <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={timeSeriesData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 60,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={3}
                              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>

                {/* Timeline Table */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                      Timeline Data
                    </Typography>
                    <TableContainer sx={{ maxHeight: 300 }}>
                                              <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Period</TableCell>
                              <TableCell align="right">Value</TableCell>
                              <TableCell align="right">Change</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {timeSeriesData.map((row, index) => {
                              const prevValue = index > 0 ? timeSeriesData[index - 1].value : row.value;
                              const change = row.value - prevValue;
                              const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
                              
                              return (
                                <TableRow key={index}>
                                  <TableCell>{row.period}</TableCell>
                                  <TableCell align="right">${row.value.toLocaleString()}</TableCell>
                                  <TableCell align="right" sx={{ 
                                    color: change >= 0 ? 'success.main' : 'error.main',
                                    fontWeight: 'bold'
                                  }}>
                                    {change >= 0 ? '+' : ''}{change.toLocaleString()} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              No timeline data available for detailed analysis.
            </Alert>
          )}
        </TabPanel>

        {/* Value Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          {valueBreakdown.length >= 1 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Value Analysis - {filters.regionName}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Value Breakdown Chart */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Value Breakdown by Period
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={valueBreakdown}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 60,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                          />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>

                {/* Value Statistics */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                      Value Statistics
                    </Typography>
                    {(() => {
                      const values = valueBreakdown.map(item => item.value).filter(v => v > 0);
                      const avg = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
                      const min = values.length > 0 ? Math.min(...values) : 0;
                      const max = values.length > 0 ? Math.max(...values) : 0;
                      const latest = valueBreakdown[valueBreakdown.length - 1]?.value || 0;
                      
                      return (
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Latest Value
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                              ${latest.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Average</Typography>
                              <Typography variant="h6" fontWeight="bold">${avg.toLocaleString()}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Range</Typography>
                              <Typography variant="h6" fontWeight="bold">${(max - min).toLocaleString()}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Value Table */}
                <Card variant="outlined" sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                      Complete Value Timeline
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Period</TableCell>
                            <TableCell align="right">Value</TableCell>
                            <TableCell align="right">Change</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {valueBreakdown.map((row, index) => {
                            const prevValue = index > 0 ? valueBreakdown[index - 1].value : row.value;
                            const change = row.value - prevValue;
                            const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>{row.period}</TableCell>
                                <TableCell align="right">{row.formattedValue}</TableCell>
                                <TableCell align="right" sx={{ 
                                  color: change >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold'
                                }}>
                                  {change >= 0 ? '+' : ''}{change.toLocaleString()} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              No value data available for analysis.
            </Alert>
          )}
        </TabPanel>

        {/* Trend Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          {trendAnalysis ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Trend Analysis - {filters.regionName}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Price Change Chart */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      Monthly Price Changes
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={trendAnalysis.changes}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 60,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: string) => [
                              name === 'changePercent' ? `${value.toFixed(1)}%` : `$${value.toLocaleString()}`,
                              name === 'changePercent' ? 'Change %' : 'Change $'
                            ]}
                          />
                          <Bar 
                            dataKey="changePercent" 
                            fill="#8884d8"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>

                {/* Trend Metrics */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main' }}>
                      Trend Metrics
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Likelihood of Increase</Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {trendAnalysis.likelihoodOfIncrease.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Avg Monthly Change</Typography>
                        <Typography variant="h6" fontWeight="bold" color={trendAnalysis.avgChangePercent >= 0 ? 'success.main' : 'error.main'}>
                          {trendAnalysis.avgChangePercent >= 0 ? '+' : ''}{trendAnalysis.avgChangePercent.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Volatility</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {trendAnalysis.volatility.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Next Period Forecast</Typography>
                        <Typography variant="h6" fontWeight="bold" color={trendAnalysis.forecastChangePercent >= 0 ? 'success.main' : 'error.main'}>
                          {trendAnalysis.forecastChangePercent >= 0 ? '+' : ''}{trendAnalysis.forecastChangePercent.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Forecast Summary */}
                <Card variant="outlined" sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                      Forecast Summary
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Current Value
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          ${(valueBreakdown[valueBreakdown.length - 1]?.value || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Predicted Next Value
                        </Typography>
                        <Typography variant="h5" color="secondary" fontWeight="bold">
                          ${trendAnalysis.forecastValue.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Historical Pattern
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trendAnalysis.positiveChanges} increases, {trendAnalysis.negativeChanges} decreases
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Based on {trendAnalysis.totalChanges} periods
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              Need at least 2 data points to calculate trends.
            </Alert>
          )}
        </TabPanel>

        {/* Debug Info */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Debug: {displayData.length} filtered data points, {numericColumns.length} numeric columns
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Filters: {filters.regionType} • {filters.stateName} • {filters.regionName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Numeric columns: {numericColumns.join(', ')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataVisualization; 