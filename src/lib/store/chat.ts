import { create } from 'zustand';

export interface SharedProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
}

export interface SharedOrder {
    id: string;
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
    status: string;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
        variants?: Record<string, string>;
    }>;
}

interface ChatStore {
    isOpen: boolean;
    prefilledMessage: string;
    sharedProduct: SharedProduct | null;
    sharedOrder: SharedOrder | null;
    onOpen: (msg?: string) => void;
    onClose: () => void;
    toggle: () => void;
    shareProduct: (product: SharedProduct, message?: string) => void;
    shareOrder: (order: SharedOrder, message?: string) => void;
    clearShared: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
    isOpen: false,
    prefilledMessage: '',
    sharedProduct: null,
    sharedOrder: null,
    onOpen: (msg = '') => set({ isOpen: true, ...(msg ? { prefilledMessage: msg } : {}) }),
    onClose: () => set({ isOpen: false, prefilledMessage: '', sharedProduct: null, sharedOrder: null }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    shareProduct: (product, message = '') => set({
        isOpen: true,
        sharedProduct: product,
        prefilledMessage: message || `I'm interested in this product: ${product.name}`,
        sharedOrder: null
    }),
    shareOrder: (order, message = '') => set({
        isOpen: true,
        sharedOrder: order,
        prefilledMessage: message || `I have a question about order #${order.orderNumber}`,
        sharedProduct: null
    }),
    clearShared: () => set({ sharedProduct: null, sharedOrder: null }),
}));

export default useChatStore;
