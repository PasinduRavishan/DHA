import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartPage() {
    return (
        <div className="bg-background min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8 text-foreground">Shopping Cart</h1>
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="w-10 h-10 text-secondary-400" />
                    </div>
                    <p className="text-xl font-medium text-foreground mb-2">Your cart is empty</p>
                    <p className="text-secondary-500 dark:text-secondary-400 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/retail" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
                        Start Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
