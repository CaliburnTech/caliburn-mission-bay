import { useState } from 'react'
import MarketplacePage from './components/MarketplacePage'
import SplashPageB from './components/SplashPageB'
import SplashPageC from './components/SplashPageC'
import useNavigationStore from './store/navigationStore'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashVersion, setSplashVersion] = useState('B') // 'B' or 'C'
  const { setSelectedView } = useNavigationStore()

  const handleEnter = (view) => {
    if (view) {
      setSelectedView(view)
    }
    setShowSplash(false)
  }

  if (showSplash) {
    return (
      <>
        {/* Dev toggle to compare versions */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setSplashVersion('B')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              splashVersion === 'B'
                ? 'bg-lime-brand text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Version B
          </button>
          <button
            onClick={() => setSplashVersion('C')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              splashVersion === 'C'
                ? 'bg-lime-brand text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Version C
          </button>
        </div>

        {splashVersion === 'B' ? (
          <SplashPageB onEnter={handleEnter} />
        ) : (
          <SplashPageC onEnter={handleEnter} />
        )}
      </>
    )
  }

  return <MarketplacePage />
}

export default App
