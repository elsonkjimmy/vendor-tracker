import { useEffect, useState } from 'react'
import { BottomNav, Sidebar, type AppMode } from './components/Navigation'
import { AuthModal, ClosingModal, DeliveryModal, ProductModal } from './components/Modals'
import { PinDialog } from './components/PinDialog'
import { calculateDailySheetTotals } from './lib/calc'
import * as db from './lib/db'
import { AdminScreen } from './screens/AdminScreen'
import { DriverScreen } from './screens/DriverScreen'
import { LandingScreen } from './screens/LandingScreen'
import { ManagerScreen } from './screens/ManagerScreen'
import type { ClientBoutique, DailySheet, DeliveryItem, Product, VendorUser } from './types'

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing')
  const [driverTab, setDriverTab] = useState('tour')
  const [managerTab, setManagerTab] = useState('today')

  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<ClientBoutique[]>([])
  const [allSheets, setAllSheets] = useState<DailySheet[]>([])
  const [activeDate, setActiveDate] = useState(() => new Date().toISOString().slice(0, 10))

  const [user, setUser] = useState<VendorUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [managerPin, setManagerPin] = useState('0000')
  const [managerUnlocked, setManagerUnlocked] = useState(false)

  // Modals state
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showClosingModal, setShowClosingModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Load initial local data
  const loadData = async () => {
    await db.initDefaultDataIfEmpty()
    const p = await db.getProducts()
    const c = await db.getClients()
    const s = await db.getSheets()
    const pin = (await db.getMeta<string>('manager_pin')) || '0000'
    const storedToken = (await db.getMeta<string>('auth_token')) || null
    const storedUser = await db.getAuthUser()

    setProducts(p)
    setClients(c)
    setAllSheets(s)
    setManagerPin(pin)
    setToken(storedToken)
    setUser(storedUser)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Find or create active sheet for the selected date
  const currentSheet: DailySheet = allSheets.find((s) => s.date === activeDate) || {
    id: `sheet_${activeDate}`,
    date: activeDate,
    deliveries: [],
    unsold: {},
    closing_done: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted: false,
  }

  const totals = calculateDailySheetTotals(currentSheet, products)

  // Delivered totals map for closing modal
  const deliveredTotals: Record<string, number> = {}
  for (const b of currentSheet.deliveries) {
    for (const item of b.items) {
      deliveredTotals[item.product_id] = (deliveredTotals[item.product_id] || 0) + item.quantity
    }
  }

  // Handlers
  const handleSwitchMode = (targetMode: AppMode) => {
    if (targetMode === 'manager' && !managerUnlocked) {
      setShowPinDialog(true)
      return
    }
    setMode(targetMode)
  }

  const handlePinSuccess = () => {
    setManagerUnlocked(true)
    setShowPinDialog(false)
    setMode('manager')
  }

  const handleSaveDelivery = async (items: DeliveryItem[], supplierName?: string) => {
    const newBatch = {
      id: `batch_${Date.now()}`,
      at: new Date().toISOString(),
      supplier_name: supplierName,
      items,
    }
    const updatedSheet: DailySheet = {
      ...currentSheet,
      deliveries: [...currentSheet.deliveries, newBatch],
      updated_at: new Date().toISOString(),
    }
    await db.saveSheet(updatedSheet)
    setAllSheets((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSheet.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updatedSheet
        return copy
      }
      return [updatedSheet, ...prev]
    })
  }

  const handleSaveClosing = async (unsolds: Record<string, number>, cashCollected?: number) => {
    const updatedSheet: DailySheet = {
      ...currentSheet,
      unsold: unsolds,
      closing_done: true,
      closed_at: new Date().toISOString(),
      cash_collected: cashCollected,
      updated_at: new Date().toISOString(),
    }
    await db.saveSheet(updatedSheet)
    setAllSheets((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSheet.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updatedSheet
        return copy
      }
      return [updatedSheet, ...prev]
    })
  }

  const handleSaveProduct = async (prodData: Partial<Product>) => {
    if (selectedProduct) {
      const updated: Product = {
        ...selectedProduct,
        ...prodData,
        updated_at: new Date().toISOString(),
      }
      await db.saveProduct(updated)
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } else {
      const created: Product = {
        id: `prod_${Date.now()}`,
        name: prodData.name || 'Nouveau Produit',
        category: prodData.category,
        selling_price: prodData.selling_price || 0,
        cost_price: prodData.cost_price || 0,
        returnable: prodData.returnable ?? true,
        supplier_name: prodData.supplier_name,
        margin_type: prodData.margin_type || 'direct',
        rebate_type: prodData.rebate_type,
        rebate_value: prodData.rebate_value,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted: false,
      }
      await db.saveProduct(created)
      setProducts((prev) => [...prev, created])
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const p = products.find((prod) => prod.id === id)
    if (p) {
      const deleted = { ...p, deleted: true, updated_at: new Date().toISOString() }
      await db.saveProduct(deleted)
      setProducts((prev) => prev.filter((prod) => prod.id !== id))
    }
  }

  const handleChangePin = async (newPin: string) => {
    await db.setMeta('manager_pin', newPin)
    setManagerPin(newPin)
  }

  const handleAuthSuccess = async (newToken: string, newUser: VendorUser) => {
    await db.setAuthSession(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
  }

  const handleLogout = async () => {
    await db.setAuthSession(null, null)
    setToken(null)
    setUser(null)
  }

  // --- RENDER LANDING PAGE ---
  if (mode === 'landing') {
    return (
      <LandingScreen
        onStartApp={() => setMode('manager')}
        onOpenDriver={() => setMode('driver')}
        onOpenAdmin={() => setMode('admin')}
      />
    )
  }

  // --- RENDER APPLICATION (DESKTOP + MOBILE RESPONSIVE) ---
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-zinc-900">
      {/* Desktop Sidebar */}
      <Sidebar
        mode={mode}
        activeTab={mode === 'driver' ? driverTab : managerTab}
        user={user}
        onSelectTab={(tab) => {
          if (mode === 'driver') setDriverTab(tab)
          else setManagerTab(tab)
        }}
        onSwitchMode={handleSwitchMode}
        onOpenNewDelivery={() => setShowDeliveryModal(true)}
        onLogout={user ? handleLogout : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-24 lg:pb-12">
          {mode === 'admin' ? (
            <AdminScreen
              token={token}
              onBack={() => setMode('manager')}
              onLoginRequest={() => setShowAuthModal(true)}
            />
          ) : mode === 'driver' ? (
            <DriverScreen
              activeTab={driverTab}
              totals={totals}
              todaySheet={currentSheet}
              clients={clients}
              onOpenNewDelivery={() => setShowDeliveryModal(true)}
              onOpenClosing={() => setShowClosingModal(true)}
              onSwitchToManager={() => handleSwitchMode('manager')}
            />
          ) : (
            <ManagerScreen
              activeTab={managerTab}
              totals={totals}
              allSheets={allSheets}
              products={products}
              user={user}
              onChangePin={handleChangePin}
              onOpenNewDelivery={() => setShowDeliveryModal(true)}
              onOpenClosing={() => setShowClosingModal(true)}
              onOpenProductModal={(p) => {
                setSelectedProduct(p || null)
                setShowProductModal(true)
              }}
              onSelectDate={(date) => setActiveDate(date)}
              onOpenAuth={() => setShowAuthModal(true)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {mode !== 'admin' && (
          <BottomNav
            mode={mode}
            activeTab={mode === 'driver' ? driverTab : managerTab}
            onSelectTab={(tab) => {
              if (mode === 'driver') setDriverTab(tab)
              else setManagerTab(tab)
            }}
          />
        )}
      </div>

      {/* Modals & Dialogs */}
      {showPinDialog && (
        <PinDialog
          currentPin={managerPin}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinDialog(false)}
        />
      )}

      {showDeliveryModal && (
        <DeliveryModal
          products={products}
          onSave={handleSaveDelivery}
          onClose={() => setShowDeliveryModal(false)}
        />
      )}

      {showClosingModal && (
        <ClosingModal
          products={products}
          deliveredTotals={deliveredTotals}
          initialUnsolds={currentSheet.unsold}
          onSave={handleSaveClosing}
          onClose={() => setShowClosingModal(false)}
        />
      )}

      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
          onClose={() => {
            setSelectedProduct(null)
            setShowProductModal(false)
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
