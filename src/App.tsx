import { useCallback, useEffect, useState } from 'react'
import { AuthModal, ClosingModal, DeliveryModal, ProductModal } from './components/Modals'
import { BottomNav, Sidebar, type AppMode } from './components/Navigation'
import { PinDialog } from './components/PinDialog'
import { ToastContainer, type ToastMessage } from './components/Toast'
import { TopBar } from './components/TopBar'
import { api } from './lib/api'
import { calculateDailySheetTotals } from './lib/calc'
import * as db from './lib/db'
import { formatFCFA } from './lib/format'
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
  const [syncing, setSyncing] = useState(false)
  const [managerPin, setManagerPin] = useState('0000')
  const [managerUnlocked, setManagerUnlocked] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Modals state
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [showClosingModal, setShowClosingModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const notify = useCallback((tone: ToastMessage['tone'], title: string, detail?: string) => {
    setToast({ id: String(Date.now()), tone, title, detail })
  }, [])

  // Load initial local data
  const loadData = useCallback(async () => {
    await db.initDefaultDataIfEmpty()
    const [p, c, s, pin, storedToken, storedUser] = await Promise.all([
      db.getProducts(),
      db.getClients(),
      db.getSheets(),
      db.getMeta<string>('manager_pin'),
      db.getMeta<string>('auth_token'),
      db.getAuthUser(),
    ])

    setProducts(p)
    setClients(c)
    setAllSheets(s.sort((a, b) => b.date.localeCompare(a.date)))
    setManagerPin(pin || '0000')
    setToken(storedToken || null)
    setUser(storedUser)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

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

  // Cloud Sync Handler
  const handleSyncNow = async () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }
    setSyncing(true)
    try {
      const cursor = (await db.getMeta<number>('sync_cursor')) || 0
      const recordsToPush = [
        ...products.map((value) => ({ kind: 'product' as const, value })),
        ...allSheets.map((value) => ({ kind: 'daily_sheet' as const, value })),
      ]
      const res = await api.sync(token, cursor, recordsToPush)
      for (const rec of res.records) {
        if (rec.kind === 'product') await db.saveProduct(rec.value)
        else if (rec.kind === 'daily_sheet') await db.saveSheet(rec.value)
      }
      await db.setMeta('sync_cursor', res.cursor)
      await loadData()
      notify('success', 'Synchronisation réussie', `${res.records.length} élément(s) mis à jour depuis Cloudflare D1.`)
    } catch (err) {
      notify('error', 'Synchronisation impossible', err instanceof Error ? err.message : 'Vérifiez votre connexion.')
    } finally {
      setSyncing(false)
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
    notify('info', 'Espace Gérant déverrouillé')
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
    const totalQty = items.reduce((s, i) => s + i.quantity, 0)
    notify('success', 'Réception enregistrée', `${totalQty} pièce(s) ajoutée(s) à la journée du ${activeDate}.`)
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
    const updatedTotals = calculateDailySheetTotals(updatedSheet, products)
    notify('success', 'Clôture du jour validée', `Recette caisse : ${formatFCFA(updatedTotals.total_employee_revenue)}`)
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
      notify('success', 'Produit mis à jour', updated.name)
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
      notify('success', 'Produit ajouté au catalogue', created.name)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const p = products.find((prod) => prod.id === id)
    if (p) {
      const deleted = { ...p, deleted: true, updated_at: new Date().toISOString() }
      await db.saveProduct(deleted)
      setProducts((prev) => prev.filter((prod) => prod.id !== id))
      notify('info', 'Produit supprimé', p.name)
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
    notify('success', `Bienvenue, ${newUser.name}`, 'Votre session Cloud est active.')
  }

  const handleLogout = async () => {
    await db.setAuthSession(null, null)
    setToken(null)
    setUser(null)
    notify('info', 'Déconnecté', 'Vous êtes repassé en mode local hors-ligne.')
  }

  // --- RENDER LANDING PAGE ---
  if (mode === 'landing') {
    return (
      <>
        <ToastContainer toast={toast} onClose={() => setToast(null)} />
        <LandingScreen
          onStartApp={() => {
            setManagerUnlocked(true)
            setMode('manager')
          }}
          onOpenDriver={() => setMode('driver')}
          onOpenAdmin={() => setMode('admin')}
          onOpenAuth={() => setShowAuthModal(true)}
        />
        {showAuthModal && (
          <AuthModal
            onSuccess={(t, u) => {
              void handleAuthSuccess(t, u)
              setManagerUnlocked(true)
              setMode(u.is_admin ? 'admin' : 'manager')
            }}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </>
    )
  }

  // --- RENDER APPLICATION (DESKTOP + MOBILE RESPONSIVE) ---
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <ToastContainer toast={toast} onClose={() => setToast(null)} />

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
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={user ? handleLogout : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          mode={mode}
          activeDate={activeDate}
          user={user}
          syncing={syncing}
          onDateChange={(d) => {
            setActiveDate(d)
            if (mode === 'manager' && managerTab === 'history') setManagerTab('today')
          }}
          onSyncNow={() => void handleSyncNow()}
          onSwitchMode={handleSwitchMode}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full pb-24 lg:pb-12">
          {mode === 'admin' ? (
            <AdminScreen
              token={token}
              onBack={() => setMode('manager')}
              onLoginRequest={() => setShowAuthModal(true)}
              onNotify={notify}
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
              onSelectDate={(date) => {
                setActiveDate(date)
                setManagerTab('today')
              }}
              onOpenAuth={() => setShowAuthModal(true)}
              onLogout={handleLogout}
              onNotify={notify}
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
          onSuccess={(t, u) => void handleAuthSuccess(t, u)}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}
