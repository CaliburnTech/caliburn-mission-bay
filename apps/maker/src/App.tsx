import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { meApi } from './api/me'
import { signOut } from './api/client'
import { Layout } from './components/Layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Login } from './pages/Login'
import { Onboarding, PendingApproval, BannedNotice } from './pages/Onboarding'
import { MyProducts } from './pages/MyProducts'
import { AddProduct } from './pages/AddProduct'
import { EditProduct } from './pages/EditProduct'
import { CompanyProfile } from './pages/CompanyProfile'
import { ProductStats } from './pages/ProductStats'
import { Settings } from './pages/Settings'
import type { Me } from './types'

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

  // /api/me drives onboarding + approval gating. null = not loaded yet.
  const [me, setMe] = useState<Me | null>(null)
  const [meError, setMeError] = useState<string | null>(null)

  const loadMe = useCallback(async () => {
    setMeError(null)
    try {
      const data = await meApi.get()
      setMe(data)
    } catch (e) {
      // A 401 already triggered sign-out inside the client; anything else is
      // a real error the user should see.
      setMe(null)
      setMeError(e instanceof Error ? e.message : 'Failed to load your account')
    }
  }, [])

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

  // Fetch /api/me whenever we become authenticated; clear it on sign-out.
  useEffect(() => {
    if (authenticated) {
      void loadMe()
    } else {
      setMe(null)
      setMeError(null)
    }
  }, [authenticated, loadMe])

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

  // ── Authenticated: resolve /api/me before showing anything ────────────────
  if (meError) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {meError}
          </div>
          <button
            onClick={() => void loadMe()}
            className="text-sm text-[#cbfd00] hover:text-[#b8e600] transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => void signOut()}
            className="block mx-auto mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // ── Onboarding / approval gates ────────────────────────────────────────────
  if (!me.companyId) {
    return <Onboarding email={me.email} onComplete={loadMe} />
  }

  if (me.company?.status === 'PENDING_APPROVAL') {
    return <PendingApproval companyName={me.company.name} />
  }

  if (me.company?.status === 'BANNED') {
    return <BannedNotice companyName={me.company.name} />
  }

  // ── Approved company: full portal ──────────────────────────────────────────
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
        return <Settings role={me.role} />
    }
  })()

  return <Layout currentHash={currentHash}>{content}</Layout>
}
