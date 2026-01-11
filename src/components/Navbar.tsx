'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import useCart from '@/lib/store/cart';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const cart = useCart();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHomePage = pathname === '/';
    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navbar Style Logic
    // HomePage: Transparent at top, Black Glass when scrolled
    // Other Pages: Standard Theme Aware or always Black Glass if we want consistent premium feel?
    // Let's stick to: Other pages = Standard Theme Aware (so white pages have white nav), 
    // unless user wants "Dark Mode" everywhere. But user said "Landing page black... Navbar blended".
    // So for HomePage:
    //   - Top: bg-transparent, border-transparent, text-white (forced)
    //   - Scrolled: bg-black/80 backdrop-blur, border-white/10, text-white
    
    // We need to handle text colors carefully.
    // If HomePage (Dark enforced): Text is always white-ish.
    // If Other Pages: Text follows theme.

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isHomePage 
                    ? scrolled 
                        ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg" 
                        : "bg-transparent border-b border-transparent"
                    : "bg-background/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-800 sticky top-0"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center group">
                            <span className={cn(
                                "text-2xl font-black tracking-tight transition-colors group-hover:text-primary-500",
                                isHomePage ? "text-white" : "text-foreground",
                                isHomePage && !scrolled && "text-shadow-sm"
                            )}>
                                DHA
                                <span className="text-primary-500">.</span>
                            </span>
                        </Link>
                        <div className="hidden sm:ml-12 sm:flex sm:space-x-10">
                            {[
                                { name: 'Retail Shop', href: '/retail' },
                                { name: 'Wholesale', href: '/wholesale' }
                            ].map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "inline-flex items-center text-sm font-bold uppercase tracking-wider transition-all duration-300 relative group py-2",
                                        isHomePage
                                            ? "text-white/80 hover:text-white"
                                            : "text-secondary-600 dark:text-secondary-400 hover:text-foreground dark:hover:text-white",
                                        isActive(link.href) && !isHomePage && "text-primary-600 dark:text-primary-400"
                                    )}
                                >
                                    {link.name}
                                    <span className={cn(
                                        "absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                        isActive(link.href) && !isHomePage && "scale-x-100"
                                    )}></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-6">
                        {!isHomePage && <ThemeToggle />}
                        {/* On HomePage, we hide ThemeToggle or force it to likely stick to dark? 
                            User said "Landing page black... no matter theme". 
                            Hiding toggle on home page might clarify this enforced style. 
                            Let's keep it but maybe it feels weird if it doesn't do anything on the page. 
                            Actually, simpler to HIDE it on HomePage if the page is strictly black.
                        */}

                        <button
                            onClick={() => cart.onOpen()}
                            className={cn(
                                "relative p-2 transition-colors group",
                                isHomePage 
                                    ? "text-white/80 hover:text-primary-500" 
                                    : "text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400"
                            )}
                        >
                            <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            {mounted && cart.items.length > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary-600 rounded-full shadow-md">
                                    {cart.items.length}
                                </span>
                            )}
                        </button>

                        {session ? (
                            <div className="relative group">
                                <button className={cn(
                                    "flex items-center space-x-2 transition-colors",
                                    isHomePage 
                                        ? "text-white/90 hover:text-primary-500" 
                                        : "text-secondary-700 dark:text-secondary-300 hover:text-primary-600"
                                )}>
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
                                        isHomePage
                                            ? "bg-white/10 border-white/20 group-hover:border-primary-500" 
                                            : "bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700"
                                    )}>
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-sm">{session.user?.name || 'Account'}</span>
                                </button>
                                
                                <div className="absolute right-0 w-56 mt-4 origin-top-right bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                                     {/* Dropdown content remains standard theme-aware */}
                                    <div className="py-2">
                                        {session.user?.role === 'ADMIN' && (
                                            <Link href="/admin" className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Link href="/orders" className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                            My Orders
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full text-left px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/auth/signin" className="relative overflow-hidden group bg-primary-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5">
                                <span className="relative z-10">Sign In</span>
                                <div className="absolute inset-0 h-full w-full bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                            </Link>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center space-x-4 sm:hidden">
                        {!isHomePage && <ThemeToggle />}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500",
                                isHomePage ? "text-white hover:bg-white/10" : "text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                            )}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden animate-slide-down bg-background dark:bg-zinc-950 border-t border-secondary-200 dark:border-secondary-800">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/retail" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Retail Shop
                        </Link>
                        <Link href="/wholesale" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Wholesale
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-secondary-200 dark:border-secondary-800">
                        {session ? (
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <User className="h-10 w-10 text-secondary-400 bg-secondary-100 dark:bg-secondary-800 rounded-full p-2" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-secondary-800 dark:text-secondary-200">{session.user?.name}</div>
                                    <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{session.user?.email}</div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="ml-auto flex-shrink-0 bg-background p-1 rounded-full text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-1 px-4">
                                <Link href="/auth/signin" className="block w-full text-center bg-primary-600 text-white px-4 py-3 rounded-lg font-bold shadow-md hover:bg-primary-700 transition-colors">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
