import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { INITIAL_CLIENTS, INITIAL_PRODUCTS } from '../config/initialData'
import type { ClientBoutique, DailySheet, Product, VendorUser } from '../types'

interface VendorTrackerDB extends DBSchema {
  products: {
    key: string
    value: Product
    indexes: { 'by-date': string }
  }
  sheets: {
    key: string
    value: DailySheet
    indexes: { 'by-date': string }
  }
  clients: {
    key: string
    value: ClientBoutique
  }
  meta: {
    key: string
    value: unknown
  }
}

const DB_NAME = 'vendor_tracker_db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<VendorTrackerDB>> | null = null

export function getDB(): Promise<IDBPDatabase<VendorTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VendorTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' })
          productStore.createIndex('by-date', 'updated_at')
        }
        if (!db.objectStoreNames.contains('sheets')) {
          const sheetStore = db.createObjectStore('sheets', { keyPath: 'id' })
          sheetStore.createIndex('by-date', 'date')
        }
        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta')
        }
      },
    })
  }
  return dbPromise
}

export async function initDefaultDataIfEmpty(): Promise<void> {
  const db = await getDB()
  const count = await db.count('products')
  if (count === 0) {
    const tx = db.transaction(['products', 'clients', 'meta'], 'readwrite')
    for (const p of INITIAL_PRODUCTS) await tx.objectStore('products').put(p)
    for (const c of INITIAL_CLIENTS) await tx.objectStore('clients').put(c)
    await tx.objectStore('meta').put('0000', 'manager_pin')
    await tx.done
  }
}

// Products
export async function getProducts(): Promise<Product[]> {
  const db = await getDB()
  return (await db.getAll('products')).filter((p) => !p.deleted)
}

export async function saveProduct(product: Product): Promise<void> {
  const db = await getDB()
  await db.put('products', product)
}

// Sheets
export async function getSheets(): Promise<DailySheet[]> {
  const db = await getDB()
  return (await db.getAll('sheets')).filter((s) => !s.deleted)
}

export async function getSheetByDate(date: string): Promise<DailySheet | undefined> {
  const db = await getDB()
  const all = await db.getAllFromIndex('sheets', 'by-date', date)
  return all.find((s) => !s.deleted)
}

export async function saveSheet(sheet: DailySheet): Promise<void> {
  const db = await getDB()
  await db.put('sheets', sheet)
}

// Clients
export async function getClients(): Promise<ClientBoutique[]> {
  const db = await getDB()
  return await db.getAll('clients')
}

export async function saveClient(client: ClientBoutique): Promise<void> {
  const db = await getDB()
  await db.put('clients', client)
}

// Meta & Session
export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return (await db.get('meta', key)) as T | undefined
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('meta', value, key)
}

export async function getAuthUser(): Promise<VendorUser | null> {
  return (await getMeta<VendorUser>('auth_user')) || null
}

export async function setAuthSession(token: string | null, user: VendorUser | null): Promise<void> {
  await setMeta('auth_token', token)
  await setMeta('auth_user', user)
}
