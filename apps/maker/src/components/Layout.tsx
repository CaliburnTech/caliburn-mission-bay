import { LayoutDashboard, Package, Building2, Settings, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import missionBayLogotype from '../assets/Mission Bay Logotype.png'

type NavItem = {
  id: string
  label: string
  icon: React.ReactNode
  hash: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'products', label: 'My Products', icon: <Package size={16} />, hash: 'products' },
  { id: 'add', label: 'Add Product', icon: <LayoutDashboard size={16} />, hash: 'add-product' },
  { id: 'company', label: 'Company Profile', icon: <Building2 size={16} />, hash: 'company' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, hash: 'settings' },
]

function isActive(itemHash: string, currentHash: string) {
  if (itemHash === 'products' && (currentHash === '' || currentHash === 'products')) return true
  if (currentHash === itemHash) return true
  if (itemHash === 'products' && currentHash.startsWith('stats/')) return true
  return false
}

export function Layout({
  children,
  currentHash,
}: {
  children: React.ReactNode
  currentHash: string
}) {
  const handleLogout = () => {
    // signOut fires onAuthStateChange in App.tsx which flips authenticated → false
    void supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen bg-[#0f1419] text-white">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col bg-[#1a2530] border-r border-gray-700/40">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-700/40">
          <img src={missionBayLogotype} alt="Mission Bay" className="h-6 w-auto" />
          <div className="text-gray-500 text-xs mt-1">Maker Portal</div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.hash}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(item.hash, currentHash)
                  ? 'bg-[#cbfd00]/10 text-[#cbfd00]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Log out */}
        <div className="px-3 py-4 border-t border-gray-700/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {action}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg text-sm">
      {message}
    </div>
  )
}
