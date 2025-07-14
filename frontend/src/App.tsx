import { Provider } from 'react-redux'
import { store } from './store/store'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <Provider store={store}>
          <div className="min-h-screen bg-gray-50">
        <div className="relative z-10">
          <Dashboard />
        </div>
      </div>
    </Provider>
  )
}

export default App
