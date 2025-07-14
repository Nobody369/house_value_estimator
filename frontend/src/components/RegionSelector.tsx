// This component is not currently used in the application
// The filtering is handled by DataFilters component instead
import React from 'react'

interface RegionSelectorProps {
  availableRegions: string[]
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ availableRegions: _availableRegions }) => {
  // This component is deprecated - using DataFilters instead
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center text-gray-500">
        <p>This component is deprecated. Please use the Data Filters above.</p>
      </div>
    </div>
  )
}

export default RegionSelector 