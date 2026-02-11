import { useState } from 'react'
import MarketplacePage from './components/MarketplacePage'
import SplashPageC from './components/SplashPageC'
import useNavigationStore from './store/navigationStore'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { setSelectedView } = useNavigationStore()

  const handleEnter = (view) => {
    if (view) {
      setSelectedView(view)
    }
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashPageC onEnter={handleEnter} />
  }

  return <MarketplacePage />
}

export default App
