'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { addLine, cartTotals, removeLine, setLineQty, type CartItem } from './cart-utils'

export type { CartItem }

const STORAGE_KEY = 'box33_cart_v1'

interface CartContextValue {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string, size: string | null) => void
  setQuantity: (productId: string, size: string | null, quantity: number) => void
  clear: () => void
  totalCents: number
  count: number
  isOpen: boolean
  open: () => void
  close: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage after mount (SSR-safe). Deferred so the first
  // client render matches SSR exactly, then the saved cart streams in.
  useEffect(() => {
    const kickoff = setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved) setItems(JSON.parse(saved) as CartItem[])
      } catch {
        /* corrupt storage — start empty */
      }
      setHydrated(true)
    }, 0)
    return () => clearTimeout(kickoff)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage full/blocked — cart stays in memory */
    }
  }, [items, hydrated])

  const add = useCallback((item: CartItem) => setItems((prev) => addLine(prev, item)), [])
  const remove = useCallback(
    (productId: string, size: string | null) =>
      setItems((prev) => removeLine(prev, productId, size)),
    []
  )
  const setQuantity = useCallback(
    (productId: string, size: string | null, quantity: number) =>
      setItems((prev) => setLineQty(prev, productId, size, quantity)),
    []
  )
  const clear = useCallback(() => setItems([]), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartContextValue>(() => {
    const { totalCents, count } = cartTotals(items)
    return { items, add, remove, setQuantity, clear, totalCents, count, isOpen, open, close }
  }, [items, add, remove, setQuantity, clear, isOpen, open, close])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
