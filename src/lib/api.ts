import type { AccountType, AdminOverviewResponse, DailySheet, Product, VendorUser } from '../types'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message?: string
  ) {
    super(message || `Erreur API (${status})`)
    this.name = 'ApiError'
  }
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT',
  endpoint: string,
  token?: string | null,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`/api/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
    throw new ApiError(res.status, data?.error, data?.message)
  }

  return (await res.json()) as T
}

export const api = {
  async register(
    name: string,
    phone: string,
    password: string,
    email?: string,
    accountType: AccountType = 'vendor'
  ): Promise<{ ok: boolean; token: string; user: VendorUser }> {
    return request('POST', 'auth/register', null, {
      name,
      phone,
      password,
      email: email?.trim() || undefined,
      account_type: accountType,
    })
  },

  async login(identifier: string, password: string): Promise<{ ok: boolean; token: string; user: VendorUser }> {
    return request('POST', 'auth/login', null, { phone: identifier, email: identifier, password })
  },

  async me(token: string): Promise<{ ok: boolean; user: VendorUser }> {
    return request('GET', 'auth/me', token)
  },

  async adminOverview(token: string): Promise<AdminOverviewResponse> {
    return request('GET', 'admin/overview', token)
  },

  async adminResetPassword(token: string, userId: string, newPassword: string): Promise<{ ok: boolean }> {
    return request('POST', 'admin/reset-password', token, { user_id: userId, new_password: newPassword })
  },

  async sync(
    token: string,
    since: number,
    records: Array<{ kind: 'product'; value: Product } | { kind: 'daily_sheet'; value: DailySheet }>
  ): Promise<{
    records: Array<{ kind: 'product'; value: Product } | { kind: 'daily_sheet'; value: DailySheet }>
    cursor: number
    hasMore: boolean
  }> {
    return request('POST', 'sync', token, { since, records })
  },
}
