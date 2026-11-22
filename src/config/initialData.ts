import type { ClientBoutique, Product } from '../types'

export const INITIAL_PRODUCTS: Product[] = []

export const INITIAL_CLIENTS: ClientBoutique[] = [
  {
    id: 'client_jimmy',
    name: 'Boutique Jimmy',
    phone: '621614204',
    location: 'Face Marché',
    balance: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'client_oumar',
    name: 'Alimentation Oumar',
    phone: '677036805',
    location: 'Grand Carrefour',
    balance: 0,
    created_at: new Date().toISOString(),
  },
]
