import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface CartItem {
    id: string; // Product ID, potentially combined with variant ID later
    uniqueId: string; // generated ID for cart item (productID + variants)
    name: string;
    price: number;
    image: string;
    quantity: number;
    maxStock: number;
    selectedVariants?: Record<string, string>;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    addItem: (data: CartItem) => void;
    removeItem: (id: string) => void;
    removeAll: () => void;
    updateQuantity: (id: string, quantity: number) => void;
}

const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            isOpen: false,
            onOpen: () => set({ isOpen: true }),
            onClose: () => set({ isOpen: false }),
            addItem: (data: CartItem) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.uniqueId === data.uniqueId);

                if (existingItem) {
                    // Provide feedback or just increment?
                    toast('Item already in cart. Use cart to update quantity.', { icon: 'ℹ️' });
                    return;
                }

                set({ items: [...get().items, data] });
                toast.success('Added to cart');
            },
            removeItem: (id: string) => {
                set({ items: [...get().items.filter((item) => item.uniqueId !== id)] });
                toast.success('Item removed from cart');
            },
            removeAll: () => set({ items: [] }),
            updateQuantity: (id: string, quantity: number) => {
                const currentItems = get().items;
                const updatedItems = currentItems.map(item => {
                    if (item.uniqueId === id) {
                        return { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) };
                    }
                    return item;
                });
                set({ items: updatedItems });
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCart;
