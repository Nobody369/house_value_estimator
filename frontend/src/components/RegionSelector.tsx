import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { toggleRegion, clearAllRegions } from '../store/store'

interface RegionSelectorProps {
  availableRegions: string[]
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ availableRegions }) => {
  const dispatch = useDispatch()
  const { selectedRegions, maxSelections, showLimitMessage } = useSelector(
    (state: RootState) => state.regions
  )

  const handleRegionToggle = (region: string) => {
    dispatch(toggleRegion(region))
  }

  const handleClearAll = () => {
    dispatch(clearAllRegions())
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Select Regions</h2>
        <div className="text-sm text-gray-600">
          {selectedRegions.length}/{maxSelections} selected
        </div>
      </div>

      {/* Limit Message */}
      {showLimitMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Maximum {maxSelections} regions can be selected. Please deselect a region first.
        </div>
      )}

      {/* Region Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {availableRegions.map((region) => {
          const isSelected = selectedRegions.includes(region)
          const isDisabled = !isSelected && selectedRegions.length >= maxSelections

          return (
            <button
              key={region}
              onClick={() => handleRegionToggle(region)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                ${isSelected
                  ? 'bg-blue-500 border-blue-500 text-white shadow-md'
                  : isDisabled
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              {region}
            </button>
          )
        })}
      </div>

      {/* Clear All Button */}
      {selectedRegions.length > 0 && (
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          Clear All
        </button>
      )}

      {/* Selected Regions Display */}
      {selectedRegions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Selected Regions:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((region) => (
              <span
                key={region}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {region}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RegionSelector 