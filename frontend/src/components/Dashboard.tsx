import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { setLoading, setError, setData } from '../store/store'
import Papa from 'papaparse'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Alert, 

  CircularProgress,
  Card,
  CardContent
} from '@mui/material'
import { Analytics } from '@mui/icons-material'
import CSVImporter from './CSVImporter'
import DataFilters from './DataFilters'
import DataVisualization from './DataTable'

const Dashboard: React.FC = () => {
  const dispatch = useDispatch()
  const { data, filteredData, filters, isLoading, error } = useSelector((state: RootState) => state.csv)

  console.log('Dashboard: Current state - data length:', data.length, 'filteredData length:', filteredData?.length, 'isLoading:', isLoading, 'error:', error);

  // Check if filters have been applied
  const hasAppliedFilters = filters.regionType && filters.stateName && filters.regionName;
  const hasFilteredData = filteredData && filteredData.length > 0;

  const loadSampleData = async () => {
    try {
      console.log('Starting to load sample data...');
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      console.log('Fetching sample-data.csv...');
      const response = await fetch('/sample-data.csv');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('CSV text length:', csvText.length);
      console.log('First 500 characters:', csvText.substring(0, 500));
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Papa parse complete:', results);
          console.log('Parsed data length:', results.data.length);
          console.log('First row:', results.data[0]);
          
          dispatch(setLoading(false));
          
          if (results.errors.length > 0) {
            console.error('Papa parse errors:', results.errors);
            dispatch(setError(`Error parsing CSV: ${results.errors[0].message}`));
            return;
          }

          // Transform data to match our interface
          const transformedData = results.data.map((row: any) => ({
            RegionID: row.RegionID || '',
            SizeRank: row.SizeRank || '',
            RegionName: row.RegionName || '',
            RegionType: row.RegionType || '',
            StateName: row.StateName || '',
            State: row.State || '',
            City: row.City || '',
            Metro: row.Metro || '',
            CountyName: row.CountyName || '',
            ...row // Include any additional columns
          }));

          console.log('Transformed data length:', transformedData.length);
          console.log('Transformed first row:', transformedData[0]);
          
          dispatch(setData(transformedData));
          console.log('Data dispatched to store');
        },
        error: (error: any) => {
          console.error('Papa parse error:', error);
          dispatch(setLoading(false));
          dispatch(setError(`Error reading file: ${error.message}`));
        }
      });
    } catch (error: unknown) {
      console.error('Load sample data error:', error);
      dispatch(setLoading(false));
      dispatch(setError(`Error loading sample data: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              color: '#1f2937',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Zillow Housing Data Analyzer
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#6b7280', 
              maxWidth: 600, 
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Analyze Zillow housing market data with advanced filtering, interactive visualizations, and trend analysis
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280', 
                mb: 1
              }}
            >
              Get your data from{' '}
              <a 
                href="https://www.zillow.com/research/data/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Zillow Research Data
              </a>
            </Typography>
          </Box>
        </Box>

        {/* Centered CSV Import Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4 
        }}>
          <Box sx={{ maxWidth: 600, width: '100%' }}>
            <CSVImporter />
          </Box>
        </Box>

        {/* Centered Test Button */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={loadSampleData}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Analytics />}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                color: '#f3f4f6'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Loading...' : 'Load Sample Data (Full Dataset)'}
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ mb: 4 }}>
            <Alert severity="error" sx={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#ffebee'
            }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Data Filters - Always show when data is loaded */}
        {data.length > 0 && (
          <>
            {console.log('Dashboard: Rendering data section with', data.length, 'rows')}
            {/* Debug Info */}
            <Card sx={{ mb: 4, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#1f2937', mb: 2 }}>
                  Debug Info:
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Total rows loaded: {data.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Sample columns: {Object.keys(data[0] || {}).slice(0, 10).join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Sample data: {JSON.stringify(data[0], null, 2).substring(0, 200)}...
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
                ✓ About to render DataFilters...
              </Typography>
              <DataFilters />
            </Box>
          </>
        )}

        {/* Data Visualization - Only show after filters are applied */}
        {hasAppliedFilters && hasFilteredData && (
          <Box>
            <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
              ✓ About to render DataVisualization with filtered data...
            </Typography>
            <DataVisualization />
          </Box>
        )}

        {/* Instructions when no data */}
        {data.length === 0 && !isLoading && (
          <Card sx={{ 
            backgroundColor: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
            py: 6
          }}>
            <CardContent>
              <Typography variant="h1" sx={{ mb: 3, color: '#6b7280' }}>
                📊
              </Typography>
              <Typography variant="h4" component="h2" sx={{ 
                color: '#1f2937', 
                mb: 2,
                fontWeight: 600
              }}>
                Get Started
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#6b7280', 
                mb: 2,
                fontWeight: 400
              }}>
                Import a CSV file or click the button above to load sample data
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  href="https://www.zillow.com/research/data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(59, 130, 246, 0.04)'
                    }
                  }}
                >
                  📊 Download Zillow Data
                </Button>
              </Box>
              <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  <strong>Supported columns:</strong> RegionID, RegionName, RegionType, StateName
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  <strong>Optional columns:</strong> SizeRank, State, City, Metro, CountyName
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  💡 <strong>Tip:</strong> Look for datasets like "ZHVI" (Zillow Home Value Index) or "ZORI" (Zillow Observed Rent Index) on the Zillow Research Data page
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Instructions when data is loaded but no filters applied */}
        {data.length > 0 && !hasAppliedFilters && (
          <Card sx={{ 
            backgroundColor: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
            py: 6
          }}>
            <CardContent>
              <Typography variant="h1" sx={{ mb: 3, color: '#6b7280' }}>
                🔍
              </Typography>
              <Typography variant="h4" component="h2" sx={{ 
                color: '#1f2937', 
                mb: 2,
                fontWeight: 600
              }}>
                Apply Filters to View Analysis
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#6b7280', 
                mb: 4,
                fontWeight: 400
              }}>
                Select Region Type, State, and Region above to see detailed market analysis and trends
              </Typography>
              <Box sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                  <strong>What you'll see:</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  • Market trends over time
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  • Regional analysis and comparisons
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  • Value distribution statistics
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  • Summary statistics for your selected area
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}

export default Dashboard 