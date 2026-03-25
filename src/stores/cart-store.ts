'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  formatId: string;
  formatSize: string;
  quantity: number;
  withAlcohol: boolean;
  unitPrice: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (formatId: string) => void;
  updateQuantity: (formatId: string, quantity: number) => void;
  toggleAlcohol: (formatId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.formatId === newItem.formatId &&
              item.withAlcohol === newItem.withAlcohol
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.formatId === newItem.formatId &&
                item.withAlcohol === newItem.withAlcohol
                  ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
          };
        });
      },

      removeItem: (formatId) => {
        set((state) => ({
          items: state.items.filter((item) => item.formatId !== formatId),
        }));
      },

      updateQuantity: (formatId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(formatId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.formatId === formatId ? { ...item, quantity } : item
          ),
        }));
      },

      toggleAlcohol: (formatId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.formatId === formatId
              ? { ...item, withAlcohol: !item.withAlcohol }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        ),
    }),
    {
      name: 'cali-t-cart',
    }
  )
);
