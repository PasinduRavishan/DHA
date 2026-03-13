import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface CartItem {
    id: string; // Product ID
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
    userId: string | null;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    addItem: (data: CartItem) => void;
    removeItem: (id: string) => void;
    removeAll: () => void;
    updateQuantity: (id: string, quantity: number) => void;
    setUserId: (userId: string | null) => void;
    clearCartForNewUser: () => void;
}

// Get storage key based on user - this creates separate carts per user
const getStorageKey = () => 'dha-cart-storage';

const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            userId: null,
            isOpen: false,
            onOpen: () => set({ isOpen: true }),
            onClose: () => set({ isOpen: false }),
            addItem: (data: CartItem) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.uniqueId === data.uniqueId);

                if (existingItem) {
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
            },
            setUserId: (userId: string | null) => {
                const currentUserId = get().userId;
                // If user changed, clear the cart
                if (currentUserId !== userId && userId !== null) {
                    // Only clear if switching between different logged-in users
                    if (currentUserId !== null) {
                        set({ items: [], userId });
                    } else {
                        // Keep cart items when logging in (guest -> user)
                        set({ userId });
                    }
                } else if (userId === null && currentUserId !== null) {
                    // User logged out - clear cart
                    set({ items: [], userId: null });
                }
            },
            clearCartForNewUser: () => set({ items: [], userId: null }),
        }),
        {
            name: getStorageKey(),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                items: state.items,
                userId: state.userId,
                isOpen: false,
                onOpen: state.onOpen,
                onClose: state.onClose,
                addItem: state.addItem,
                removeItem: state.removeItem,
                removeAll: state.removeAll,
                updateQuantity: state.updateQuantity,
                setUserId: state.setUserId,
                clearCartForNewUser: state.clearCartForNewUser,
            }),
        }
    )
);

export default useCart;
