import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Login } from './pages/Login'
import { MyProducts } from './pages/MyProducts'
import { AddProduct } from './pages/AddProduct'
import { EditProduct } from './pages/EditProduct'
import { CompanyProfile } from './pages/CompanyProfile'
import { ProductStats } from './pages/ProductStats'
import { Settings } from './pages/Settings'

type Route =
  | { page: 'products' }
  | { page: 'add-product' }
  | { page: 'edit'; productId: string }
  | { page: 'stats'; productId: string }
  | { page: 'company' }
  | { page: 'settings' }

function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h.startsWith('edit/')) return { page: 'edit', productId: h.slice(5) }
  if (h.startsWith('stats/')) return { page: 'stats', productId: h.slice(6) }
  if (h === 'add-product') return { page: 'add-product' }
  if (h === 'company') return { page: 'company' }
  if (h === 'settings') return { page: 'settings' }
  return { page: 'products' }
}

export default function App() {
  // null = still checking session (show spinner), false = not authed, true = authed
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    // Resolve current session on mount (fast — reads from localStorage)
    supabase.auth.getSession()
      .then(({ data: { session } }) => setAuthenticated(!!session))
      .catch(() => setAuthenticated(false))

    // React to sign-in / sign-out / token-refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuthed = !!session
      setAuthenticated(isAuthed)

      if (isAuthed) {
        // After sign-in, redirect to products unless already on a valid inner page
        const h = window.location.hash.replace(/^#/, '')
        if (!h || h === 'login') {
          window.location.hash = 'products'
          setRoute({ page: 'products' })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Listen to hash changes for inner navigation (same as before)
  useEffect(() => {
    const handleHash = () => {
      setRoute(parseHash(window.location.hash))
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // ── Loading splash (Supabase session check in flight) ─────────────────────
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!authenticated) {
    return <Login />
  }

  // ── Authenticated ─────────────────────────────────────────────────────────
  const currentHash = window.location.hash.replace(/^#/, '')

  const content = (() => {
    switch (route.page) {
      case 'products':
        return <MyProducts />
      case 'add-product':
        return <AddProduct />
      case 'edit':
        return <EditProduct productId={route.productId} />
      case 'stats':
        return <ProductStats productId={route.productId} />
      case 'company':
        return <CompanyProfile />
      case 'settings':
        return <Settings />
    }
  })()

  return <Layout currentHash={currentHash}>{content}</Layout>
}
