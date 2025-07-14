import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setPendingFilter, applyFilters, clearFilters } from '../store/store';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Divider,
  Stack,
  Alert,
  FormHelperText
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Clear,
  FilterList,
  Close,
  Search,
  Warning
} from '@mui/icons-material';

const DataFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    data, 
    filteredData, 
    pendingFilters, 
    filters, 
    availableFilters,
    cascadingFilters 
  } = useSelector((state: RootState) => state.csv);
  
  console.log('DataFilters: data length:', data.length, 'filteredData length:', filteredData?.length, 'pendingFilters:', pendingFilters);
  
  // Get cascading filter options based on current selections
  const getAvailableStateNames = () => {
    if (!pendingFilters.regionType) {
      return availableFilters.stateNames;
    }
    return cascadingFilters.stateNamesByRegionType[pendingFilters.regionType] || [];
  };

  const getAvailableRegionNames = () => {
    if (!pendingFilters.stateName) {
      return availableFilters.regionNames;
    }
    return cascadingFilters.regionNamesByState[pendingFilters.stateName] || [];
  };

  const availableStateNames = getAvailableStateNames();
  const availableRegionNames = getAvailableRegionNames();

  const handleFilterChange = (filterType: string, value: string) => {
    dispatch(setPendingFilter({ 
      key: filterType as keyof typeof pendingFilters, 
      value 
    }));
  };

  const handleApplyFilters = () => {
    dispatch(applyFilters());
  };

  const clearFilter = (filterType: string) => {
    dispatch(setPendingFilter({ 
      key: filterType as keyof typeof pendingFilters, 
      value: '' 
    }));
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
  };

  // Check if pending filters are different from applied filters
  const hasPendingChanges = 
    pendingFilters.regionType !== filters.regionType ||
    pendingFilters.stateName !== filters.stateName ||
    pendingFilters.regionName !== filters.regionName;

  // Check if all required filters are selected
  const allFiltersSelected = 
    pendingFilters.regionType && 
    pendingFilters.stateName && 
    pendingFilters.regionName;

  const activeFiltersCount = [filters.regionType, filters.stateName, filters.regionName].filter(Boolean).length;
  const pendingFiltersCount = [pendingFilters.regionType, pendingFilters.stateName, pendingFilters.regionName].filter(Boolean).length;

  if (!data || data.length === 0) {
    console.log('DataFilters: No data, returning null');
    return null;
  }

  console.log('DataFilters: Rendering with', availableFilters.regionTypes.length, 'region types,', availableStateNames.length, 'available states,', availableRegionNames.length, 'available regions');

  return (
    <Card sx={{ 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FilterList />
            Data Filters
            {activeFiltersCount > 0 && (
              <Chip 
                label={activeFiltersCount} 
                size="small" 
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
            {hasPendingChanges && (
              <Chip 
                label={`${pendingFiltersCount}/3 selected`} 
                size="small" 
                color={allFiltersSelected ? "success" : "warning"}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyFilters}
              disabled={!allFiltersSelected}
              startIcon={<Search />}
              sx={{
                backgroundColor: allFiltersSelected ? 'success.main' : 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: allFiltersSelected ? 'success.dark' : 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.38)'
                }
              }}
            >
              {allFiltersSelected ? 'Search Data' : 'Select All Filters'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={clearAllFilters}
              startIcon={<Clear />}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white'
                }
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Alert for filter requirements */}
        {!allFiltersSelected && (pendingFiltersCount > 0) && (
          <Alert 
            severity="info" 
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            Please select all three filters (Region Type, State, and Region) before searching. 
            Currently selected: {pendingFiltersCount}/3
          </Alert>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <FormControl fullWidth required error={!pendingFilters.regionType && pendingFiltersCount > 0}>
            <InputLabel id="region-type-label">Region Type *</InputLabel>
            <Select
              labelId="region-type-label"
              value={pendingFilters.regionType}
              label="Region Type *"
              onChange={(e: SelectChangeEvent) => handleFilterChange('regionType', e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>Select Region Type</em>
              </MenuItem>
              {availableFilters.regionTypes.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            {!pendingFilters.regionType && pendingFiltersCount > 0 && (
              <FormHelperText error>Region Type is required</FormHelperText>
            )}
          </FormControl>
          
          <FormControl 
            fullWidth 
            required 
            error={!pendingFilters.stateName && pendingFiltersCount > 0}
            disabled={!pendingFilters.regionType}
          >
            <InputLabel id="state-name-label">
              State Name * {!pendingFilters.regionType && '(Select Region Type first)'}
            </InputLabel>
            <Select
              labelId="state-name-label"
              value={pendingFilters.stateName}
              label={!pendingFilters.regionType ? "State Name * (Select Region Type first)" : "State Name *"}
              onChange={(e: SelectChangeEvent) => handleFilterChange('stateName', e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>
                  {!pendingFilters.regionType 
                    ? 'Select Region Type first' 
                    : `Select State (${availableStateNames.length} available)`
                  }
                </em>
              </MenuItem>
              {availableStateNames.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            {!pendingFilters.stateName && pendingFiltersCount > 0 && (
              <FormHelperText error>State Name is required</FormHelperText>
            )}
            {pendingFilters.regionType && (
              <FormHelperText>
                {availableStateNames.length} states available for {pendingFilters.regionType}
              </FormHelperText>
            )}
          </FormControl>
          
          <FormControl 
            fullWidth 
            required 
            error={!pendingFilters.regionName && pendingFiltersCount > 0}
            disabled={!pendingFilters.stateName}
          >
            <InputLabel id="region-name-label">
              Region Name * {!pendingFilters.stateName && '(Select State first)'}
            </InputLabel>
            <Select
              labelId="region-name-label"
              value={pendingFilters.regionName}
              label={!pendingFilters.stateName ? "Region Name * (Select State first)" : "Region Name *"}
              onChange={(e: SelectChangeEvent) => handleFilterChange('regionName', e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>
                  {!pendingFilters.stateName 
                    ? 'Select State first' 
                    : `Select Region (${availableRegionNames.length} available)`
                  }
                </em>
              </MenuItem>
              {availableRegionNames.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            {!pendingFilters.regionName && pendingFiltersCount > 0 && (
              <FormHelperText error>Region Name is required</FormHelperText>
            )}
            {pendingFilters.stateName && (
              <FormHelperText>
                {availableRegionNames.length} regions available for {pendingFilters.stateName}
              </FormHelperText>
            )}
          </FormControl>
        </Stack>

        {/* Active filters display */}
        {(filters.regionType || filters.stateName || filters.regionName || pendingFilters.regionType || pendingFilters.stateName || pendingFilters.regionName) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                mb: 2,
                color: '#2c3e50'
              }}>
                {hasPendingChanges ? 'Pending Filters:' : 'Active Filters:'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(hasPendingChanges ? pendingFilters.regionType : filters.regionType) && (
                  <Chip
                    label={`Region Type: ${hasPendingChanges ? pendingFilters.regionType : filters.regionType}`}
                    onDelete={() => clearFilter('regionType')}
                    color={hasPendingChanges ? "warning" : "primary"}
                    variant="filled"
                    deleteIcon={<Close />}
                    sx={{ mb: 1 }}
                  />
                )}
                {(hasPendingChanges ? pendingFilters.stateName : filters.stateName) && (
                  <Chip
                    label={`State: ${hasPendingChanges ? pendingFilters.stateName : filters.stateName}`}
                    onDelete={() => clearFilter('stateName')}
                    color={hasPendingChanges ? "warning" : "secondary"}
                    variant="filled"
                    deleteIcon={<Close />}
                    sx={{ mb: 1 }}
                  />
                )}
                {(hasPendingChanges ? pendingFilters.regionName : filters.regionName) && (
                  <Chip
                    label={`Region: ${hasPendingChanges ? pendingFilters.regionName : filters.regionName}`}
                    onDelete={() => clearFilter('regionName')}
                    color={hasPendingChanges ? "warning" : "success"}
                    variant="filled"
                    deleteIcon={<Close />}
                    sx={{ mb: 1 }}
                  />
                )}
              </Stack>
              {hasPendingChanges && (
                <Typography variant="caption" sx={{ 
                  color: allFiltersSelected ? 'success.main' : 'warning.main', 
                  mt: 1, 
                  display: 'block',
                  fontWeight: 600
                }}>
                  {allFiltersSelected 
                    ? '✓ All filters selected! Click "Search Data" to update the charts' 
                    : '⚠ Please select all required filters before searching'
                  }
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* Debug Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Debug: Total data: {data.length}, Filtered data: {filteredData?.length || 0}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Active filters: {Object.values(filters).filter(Boolean).length}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Available options: {availableStateNames.length} states, {availableRegionNames.length} regions
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Filter values: {JSON.stringify(filters)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataFilters; 