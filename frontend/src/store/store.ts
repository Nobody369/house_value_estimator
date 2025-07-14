import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define the CSV data structure
export interface CSVRow {
  RegionID: string
  SizeRank: string
  RegionName: string
  RegionType: string
  StateName: string
  State: string
  City: string
  Metro: string
  CountyName: string
  [key: string]: string // For any additional columns
}

// Define the state interface
interface CSVState {
  data: CSVRow[]
  filteredData: CSVRow[]
  filters: {
    regionType: string
    stateName: string
    regionName: string
  }
  pendingFilters: {
    regionType: string
    stateName: string
    regionName: string
  }
  availableFilters: {
    regionTypes: string[]
    stateNames: string[]
    regionNames: string[]
  }
  cascadingFilters: {
    stateNamesByRegionType: Record<string, string[]>
    regionNamesByState: Record<string, string[]>
  }
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: CSVState = {
  data: [],
  filteredData: [],
  filters: {
    regionType: '',
    stateName: '',
    regionName: ''
  },
  pendingFilters: {
    regionType: '',
    stateName: '',
    regionName: ''
  },
  availableFilters: {
    regionTypes: [],
    stateNames: [],
    regionNames: []
  },
  cascadingFilters: {
    stateNamesByRegionType: {},
    regionNamesByState: {}
  },
  isLoading: false,
  error: null
}

// Helper function to build cascading filter data
const buildCascadingFilters = (data: CSVRow[]) => {
  const stateNamesByRegionType: Record<string, string[]> = {}
  const regionNamesByState: Record<string, string[]> = {}

  // Group data by region type
  data.forEach(row => {
    const regionType = row.RegionType
    const stateName = row.StateName
    const regionName = row.RegionName

    if (regionType && stateName) {
      if (!stateNamesByRegionType[regionType]) {
        stateNamesByRegionType[regionType] = []
      }
      if (!stateNamesByRegionType[regionType].includes(stateName)) {
        stateNamesByRegionType[regionType].push(stateName)
      }
    }

    if (stateName && regionName) {
      if (!regionNamesByState[stateName]) {
        regionNamesByState[stateName] = []
      }
      if (!regionNamesByState[stateName].includes(regionName)) {
        regionNamesByState[stateName].push(regionName)
      }
    }
  })

  // Sort all arrays
  Object.keys(stateNamesByRegionType).forEach(regionType => {
    stateNamesByRegionType[regionType].sort()
  })
  Object.keys(regionNamesByState).forEach(stateName => {
    regionNamesByState[stateName].sort()
  })

  return { stateNamesByRegionType, regionNamesByState }
}

// Create the CSV slice
const csvSlice = createSlice({
  name: 'csv',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setData: (state, action: PayloadAction<CSVRow[]>) => {
      console.log('Store: setData called with', action.payload.length, 'rows');
      console.log('Store: First row sample:', action.payload[0]);
      
      state.data = action.payload
      state.filteredData = action.payload
      
      // Extract unique values for filters
      const regionTypes = [...new Set(action.payload.map(row => row.RegionType).filter(Boolean))]
      const stateNames = [...new Set(action.payload.map(row => row.StateName).filter(Boolean))]
      const regionNames = [...new Set(action.payload.map(row => row.RegionName).filter(Boolean))]
      
      console.log('Store: Unique region types:', regionTypes.length);
      console.log('Store: Unique state names:', stateNames.length);
      console.log('Store: Unique region names:', regionNames.length);
      
      state.availableFilters = {
        regionTypes: regionTypes.sort(),
        stateNames: stateNames.sort(),
        regionNames: regionNames.sort()
      }

      // Build cascading filter data
      const cascadingData = buildCascadingFilters(action.payload)
      state.cascadingFilters = cascadingData
      
      console.log('Store: Cascading filters built:', {
        regionTypeCount: Object.keys(cascadingData.stateNamesByRegionType).length,
        stateCount: Object.keys(cascadingData.regionNamesByState).length
      });
      console.log('Store: availableFilters set to:', state.availableFilters);
      console.log('Store: Data and filters updated');
    },
    setPendingFilter: (state, action: PayloadAction<{ key: keyof CSVState['pendingFilters']; value: string }>) => {
      const { key, value } = action.payload
      console.log('Store: setPendingFilter called with', { key, value });
      
      // Clear dependent filters when parent filter changes
      if (key === 'regionType') {
        state.pendingFilters.stateName = ''
        state.pendingFilters.regionName = ''
      } else if (key === 'stateName') {
        state.pendingFilters.regionName = ''
      }
      
      state.pendingFilters[key] = value
      console.log('Store: Updated pendingFilters:', state.pendingFilters);
    },
    applyFilters: (state) => {
      console.log('Store: applyFilters called');
      console.log('Store: Applying pending filters:', state.pendingFilters);
      
      // Copy pending filters to active filters
      state.filters = { ...state.pendingFilters }
      
      // Apply filters
      let filtered = state.data
      console.log('Store: Starting with', filtered.length, 'rows');
      
      if (state.filters.regionType) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(row => {
          const matches = row.RegionType?.toLowerCase() === state.filters.regionType.toLowerCase();
          if (!matches) {
            console.log('Store: RegionType mismatch - expected:', state.filters.regionType, 'got:', row.RegionType);
          }
          return matches;
        });
        console.log('Store: After regionType filter:', filtered.length, 'rows (removed', beforeCount - filtered.length, ')');
      }
      
      if (state.filters.stateName) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(row => {
          const matches = row.StateName?.toLowerCase() === state.filters.stateName.toLowerCase();
          if (!matches) {
            console.log('Store: StateName mismatch - expected:', state.filters.stateName, 'got:', row.StateName);
          }
          return matches;
        });
        console.log('Store: After stateName filter:', filtered.length, 'rows (removed', beforeCount - filtered.length, ')');
      }
      
      if (state.filters.regionName) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(row => {
          const matches = row.RegionName?.toLowerCase() === state.filters.regionName.toLowerCase();
          if (!matches) {
            console.log('Store: RegionName mismatch - expected:', state.filters.regionName, 'got:', row.RegionName);
          }
          return matches;
        });
        console.log('Store: After regionName filter:', filtered.length, 'rows (removed', beforeCount - filtered.length, ')');
      }
      
      state.filteredData = filtered
      console.log('Store: Final filteredData length:', state.filteredData.length);
      
      // Log sample of filtered data if any exists
      if (filtered.length > 0) {
        console.log('Store: Sample filtered row:', filtered[0]);
      } else {
        console.log('Store: No rows match the current filters');
        console.log('Store: Available values in data:');
        console.log('Store: - RegionTypes:', [...new Set(state.data.map(row => row.RegionType))].slice(0, 10));
        console.log('Store: - StateNames:', [...new Set(state.data.map(row => row.StateName))].slice(0, 10));
        console.log('Store: - RegionNames:', [...new Set(state.data.map(row => row.RegionName))].slice(0, 10));
      }
    },
    clearFilters: (state) => {
      state.filters = {
        regionType: '',
        stateName: '',
        regionName: ''
      }
      state.pendingFilters = {
        regionType: '',
        stateName: '',
        regionName: ''
      }
      state.filteredData = state.data
    },
    clearData: (state) => {
      state.data = []
      state.filteredData = []
      state.filters = {
        regionType: '',
        stateName: '',
        regionName: ''
      }
      state.availableFilters = {
        regionTypes: [],
        stateNames: [],
        regionNames: []
      }
      state.cascadingFilters = {
        stateNamesByRegionType: {},
        regionNamesByState: {}
      }
    }
  }
})

export const { 
  setLoading, 
  setError, 
  setData, 
  setPendingFilter, 
  applyFilters, 
  clearFilters, 
  clearData 
} = csvSlice.actions

// Create the store
export const store = configureStore({
  reducer: {
    csv: csvSlice.reducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 