# Zillow Housing Data Analyzer

A powerful web-based data analysis tool specifically designed for Zillow housing market data. Import CSV files from Zillow Research Data and perform comprehensive housing market analysis, filtering, visualization, and trend analysis with beautiful interactive charts.

## 🚀 Features

### 📊 Data Import & Management
- **Zillow CSV Import**: Upload CSV files from Zillow Research Data
- **Sample Housing Data**: Built-in sample dataset for immediate testing
- **Real-time Processing**: Instant data parsing and validation
- **Error Handling**: Comprehensive error messages and validation

### 🔍 Advanced Filtering System
- **Multi-level Filtering**: Filter by Region Type, State Name, and Region Name
- **Dynamic Filter Options**: Filters update based on available data
- **Real-time Filtering**: Instant results as you apply filters
- **Filter State Management**: Persistent filter selections

### 📈 Interactive Data Visualization
- **Multiple Chart Types**: Line charts, bar charts, and trend analysis
- **Responsive Design**: Charts adapt to different screen sizes
- **Interactive Tooltips**: Hover for detailed data points
- **Color-coded Regions**: Different colors for each region in multi-line charts
- **Professional Styling**: Clean, modern UI with proper spacing and margins

### 📋 Detailed Analysis Features
- **Timeline Analysis**: Track value changes over time periods
- **Value Breakdown**: Detailed breakdown by time periods
- **Trend Analysis**: 
  - Monthly price changes
  - Likelihood of increase/decrease
  - Average monthly change percentages
  - Volatility calculations
  - Forecast predictions
- **Statistical Metrics**: Average, range, and historical patterns

### 🎨 Modern User Interface
- **Gradient Backgrounds**: Beautiful visual design
- **Material-UI Components**: Professional component library
- **Responsive Layout**: Works on desktop and mobile devices
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Usage

1. **Load Sample Data**: Click the "Load Sample Data" button to see the application in action with pre-loaded Zillow housing data
2. **Upload Zillow CSV**: Use the file upload area to import CSV files from [Zillow Research Data](https://www.zillow.com/research/data/)
3. **Apply Filters**: Use the filter dropdowns to narrow down your housing data by Region Type, State Name, and Region Name
4. **Explore Visualizations**: Switch between different chart tabs to analyze your housing market data:
   - **Detailed Timeline**: View housing price changes over time
   - **Value Analysis**: Breakdown by periods with housing statistics
   - **Trend Analysis**: Advanced housing market trend calculations and forecasts

## 📁 Project Structure

```
src/
├── components/
│   ├── CSVImporter.tsx      # File upload and CSV parsing
│   ├── Dashboard.tsx        # Main application layout
│   ├── DataFilters.tsx      # Filter controls
│   ├── DataTable.tsx        # Data visualization and charts
│   ├── MultiLineChart.tsx   # Multi-line chart component
│   └── RegionSelector.tsx   # Region selection component
├── store/
│   └── store.ts            # Redux store configuration
├── App.tsx                 # Root application component
└── main.tsx               # Application entry point
```

## 🎯 Key Features Explained

### Data Filtering
The application provides a sophisticated three-level filtering system:
- **Region Type**: Filter by different types of regions (e.g., Metro, County, City)
- **State Name**: Filter by specific states
- **Region Name**: Filter by specific regions within selected states

### Chart Visualizations
- **Value Range Over Time**: Line chart showing value trends over time periods
- **Value Breakdown by Period**: Bar chart displaying values for each time period
- **Monthly Price Changes**: Bar chart showing percentage changes between periods
- **Trend Metrics**: Statistical analysis including likelihood of increases, volatility, and forecasts

### Data Analysis
The application automatically calculates:
- Average values and ranges
- Monthly change percentages
- Trend likelihood and volatility
- Forecast predictions based on historical patterns
- Complete timeline with change tracking

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- React best practices and hooks

## 📊 Zillow Data Format

The application is designed to work with CSV files from [Zillow Research Data](https://www.zillow.com/research/data/). Expected data structure includes:
- Region identification columns (RegionID, RegionName, RegionType, etc.)
- State information (StateName, State)
- Geographic information (City, Metro, CountyName)
- Time series housing data columns (typically date-based column names with housing prices/values)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, TypeScript, and Material-UI**
