import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DataPoint {
  date: string
  [key: string]: string | number
}

interface MultiLineChartProps {
  data: DataPoint[]
  dataKey: string
  title: string
}

// Color palette for different regions
const COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#ff0000', // Red
  '#00ff00', // Lime
  '#0000ff', // Blue
  '#ff00ff', // Magenta
]

const MultiLineChart: React.FC<MultiLineChartProps> = ({ data, dataKey, title }) => {
  const { filters } = useSelector((state: RootState) => state.csv)

  // For single region analysis, we'll use the selected region from filters
  const selectedRegion = filters.regionName

  // Filter data to only include the selected region
  const filteredData = data.map(item => {
    const filteredItem: DataPoint = { date: item.date }
    if (selectedRegion && item[selectedRegion] !== undefined) {
      filteredItem[selectedRegion] = item[selectedRegion]
    }
    return filteredItem
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      
      {!selectedRegion ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>Please select a region to view the chart</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 30,
              left: 60,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: dataKey, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <Legend />
            
            {selectedRegion && (
              <Line
                key={selectedRegion}
                type="monotone"
                dataKey={selectedRegion}
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={selectedRegion}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default MultiLineChart 