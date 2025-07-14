import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import Papa from 'papaparse'
import { setLoading, setError, setData } from '../store/store'
import type { CSVRow } from '../store/store'
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Fade,
  CircularProgress
} from '@mui/material'
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  UploadFile
} from '@mui/icons-material'

const CSVImporter: React.FC = () => {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if it's a CSV file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      dispatch(setError('Please select a valid CSV file'))
      return
    }

    dispatch(setLoading(true))
    dispatch(setError(null))

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        dispatch(setLoading(false))
        
        if (results.errors.length > 0) {
          dispatch(setError(`Error parsing CSV: ${results.errors[0].message}`))
          return
        }

        // Validate required columns
        const requiredColumns = ['RegionID', 'RegionName', 'RegionType', 'StateName']
        const headers = results.meta.fields || []
        const missingColumns = requiredColumns.filter(col => !headers.includes(col))
        
        if (missingColumns.length > 0) {
          dispatch(setError(`Missing required columns: ${missingColumns.join(', ')}`))
          return
        }

        // Transform data to match our interface
        const transformedData: CSVRow[] = results.data.map((row: any) => ({
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
        }))

        dispatch(setData(transformedData))
      },
      error: (error) => {
        dispatch(setLoading(false))
        dispatch(setError(`Error reading file: ${error.message}`))
      }
    })
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (fileInputRef.current) {
        fileInputRef.current.files = files
        handleFileUpload({ target: { files } } as any)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  return (
    <Card sx={{ 
      backgroundColor: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" sx={{ 
          fontWeight: 600, 
          mb: 3,
          color: '#2c3e50',
          textAlign: 'center'
        }}>
          Import CSV Data
        </Typography>
        
        <Paper
          elevation={isDragOver ? 8 : 2}
          sx={{
            border: '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: isDragOver ? 'primary.50' : 'background.paper',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Fade in={true} timeout={500}>
            <Box sx={{ py: 2 }}>
              <CloudUpload sx={{ 
                fontSize: 64, 
                color: isDragOver ? 'primary.main' : 'grey.400',
                mb: 2
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 500, 
                mb: 1,
                color: isDragOver ? 'primary.main' : 'text.primary'
              }}>
                Drop your CSV file here or click to browse
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 2
              }}>
                Supported format: CSV with columns RegionID, RegionName, RegionType, StateName
              </Typography>
              <Chip 
                icon={<UploadFile />} 
                label="Choose File" 
                variant="outlined"
                sx={{ 
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
            </Box>
          </Fade>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Paper>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: '#2c3e50'
          }}>
            Column Requirements
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Card variant="outlined" sx={{ flex: 1, minWidth: 250 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Error fontSize="small" />
                  Required Columns
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {['RegionID', 'RegionName', 'RegionType', 'StateName'].map((col) => (
                    <ListItem key={col} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={col} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: 1, minWidth: 250 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Description fontSize="small" />
                  Optional Columns
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {['SizeRank', 'State', 'City', 'Metro', 'CountyName'].map((col) => (
                    <ListItem key={col} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={col} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CSVImporter 