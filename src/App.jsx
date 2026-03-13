import { useState, useEffect } from 'react'
import MarketplacePage from './components/MarketplacePage'
import SplashPageC from './components/SplashPageC'
import SplashPageD from './components/SplashPageD'

// Toggle between splash page concepts: 'C' = Mission Control, 'D' = The Transformation
const SPLASH_VERSION = 'C'
import useNavigationStore, { isValidView } from './store/navigationStore'
import './App.css'

function App() {
  const { setSelectedView } = useNavigationStore()

  // Initialize from URL hash - #splash or empty = splash, valid view = app
  const getInitialSplashState = () => {
    const hash = window.location.hash.replace('#', '')
    if (!hash || hash === 'splash') return true
    return !isValidView(hash)
  }

  const [showSplash, setShowSplash] = useState(getInitialSplashState)

  const handleEnter = (view) => {
    if (view) {
      setSelectedView(view)
      window.location.hash = view
    } else {
      window.location.hash = 'stacks'
    }
    setShowSplash(false)
  }

  const handleReturnToSplash = () => {
    window.location.hash = 'splash'
    setShowSplash(true)
  }

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'splash' || !hash) {
        setShowSplash(true)
      } else if (isValidView(hash)) {
        setShowSplash(false)
        setSelectedView(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [setSelectedView])

  if (showSplash) {
    const SplashPage = SPLASH_VERSION === 'D' ? SplashPageD : SplashPageC
    return <SplashPage onEnter={handleEnter} />
  }

  return <MarketplacePage onLogoClick={handleReturnToSplash} />
}

export default App
