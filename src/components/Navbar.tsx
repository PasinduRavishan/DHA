'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut, Settings, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useCart from '@/lib/store/cart';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const pathname = usePathname();
    const cart = useCart();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isHomePage = pathname === '/';
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    const isAdmin = session?.user?.role === 'ADMIN';

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync cart with user session
    useEffect(() => {
        if (mounted) {
            cart.setUserId(session?.user?.id || null);
        }
    }, [session?.user?.id, mounted]);

    const navLinks = [
        { name: 'Retail', href: '/retail' },
        { name: 'Wholesale', href: '/wholesale' },
        { name: 'Bathroom Fittings', href: '/bathroom-fittings' },
    ];

    // Modern Customer Navbar
    if (!isAdmin) {
        return (
            <nav
                className={cn(
                    "fixed top-0 w-full z-50 transition-all duration-500",
                    scrolled
                        ? "bg-neutral-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
                        : "bg-neutral-950/80 backdrop-blur-md border-b border-white/5"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <span className="text-3xl font-black tracking-tighter text-white group-hover:text-primary-400 transition-colors">
                                DHA
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-bold tracking-wide transition-all duration-300 rounded-lg group",
                                        isActive(link.href)
                                            ? "text-white bg-white/10"
                                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {link.name}
                                    {isActive(link.href) && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                                    )}
                                </Link>
                            ))}

                            {session && (
                                <Link
                                    href="/chat"
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-bold tracking-wide transition-all duration-300 rounded-lg group",
                                        isActive('/chat')
                                            ? "text-white bg-white/10"
                                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    Chat
                                    {isActive('/chat') && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                                    )}
                                </Link>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {/* Cart Button */}
                            <button
                                onClick={() => cart.onOpen()}
                                className="relative p-2.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all group"
                            >
                                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                {mounted && cart.items.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary-600 rounded-full ring-2 ring-neutral-950">
                                        {cart.items.length}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {session ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-white max-w-[100px] truncate hidden lg:block">
                                            {session.user?.name}
                                        </span>
                                        <ChevronDown className={cn(
                                            "h-4 w-4 text-neutral-400 transition-transform",
                                            showUserMenu && "rotate-180"
                                        )} />
                                    </button>

                                    {/* Dropdown */}
                                    {showUserMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowUserMenu(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-scale-up">
                                                <div className="px-4 py-3 border-b border-white/10">
                                                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                                    <p className="text-xs text-neutral-400 truncate">{session.user?.email}</p>
                                                </div>

                                                <Link
                                                    href="/orders"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                                                >
                                                    <Package className="h-4 w-4" />
                                                    My Orders
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        signOut();
                                                    }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/auth/signin"
                                    className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-primary-400 hover:text-white transition-all hover:scale-105 shadow-lg"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden border-t border-white/10 bg-neutral-950/98 backdrop-blur-xl animate-slide-down">
                        <div className="px-4 py-6 space-y-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block px-4 py-3 rounded-lg text-sm font-bold transition-all",
                                        isActive(link.href)
                                            ? "bg-white/10 text-white"
                                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {session && (
                                <Link
                                    href="/chat"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block px-4 py-3 rounded-lg text-sm font-bold transition-all",
                                        isActive('/chat')
                                            ? "bg-white/10 text-white"
                                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    Chat
                                </Link>
                            )}

                            <button
                                onClick={() => {
                                    cart.onOpen();
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-bold text-neutral-400 hover:bg-white/5 hover:text-white transition-all"
                            >
                                <span>Cart</span>
                                {mounted && cart.items.length > 0 && (
                                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary-600 rounded-full">
                                        {cart.items.length}
                                    </span>
                                )}
                            </button>

                            {session ? (
                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <div className="px-4 py-2">
                                        <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                        <p className="text-xs text-neutral-400">{session.user?.email}</p>
                                    </div>

                                    <Link
                                        href="/orders"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-all"
                                    >
                                        My Orders
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            signOut();
                                        }}
                                        className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/auth/signin"
                                    onClick={() => setIsOpen(false)}
                                    className="block mt-4 px-4 py-3 bg-white text-black text-center rounded-lg text-sm font-bold hover:bg-primary-400 hover:text-white transition-all"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        );
    }

    // Old Admin Navbar
    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isHomePage
                    ? scrolled
                        ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg"
                        : "bg-transparent border-b border-transparent"
                    : "bg-background/80 dark:bg-black/80 backdrop-blur-md border-b border-secondary-200 dark:border-transparent sticky top-0 shadow-sm dark:shadow-none"
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
                                <span className="text-primary-500"></span>
                            </span>
                        </Link>
                        <div className="hidden sm:ml-12 sm:flex sm:space-x-10">
                            {[
                                { name: 'Retail Shop', href: '/retail' },
                                { name: 'Wholesale', href: '/wholesale' },
                                { name: 'Bathroom Fittings', href: '/bathroom-fittings' },
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
                            <Link
                                href="/admin"
                                className={cn(
                                    "inline-flex items-center text-sm font-bold uppercase tracking-wider transition-all duration-300 relative group py-2",
                                    isHomePage
                                        ? "text-white/80 hover:text-white"
                                        : "text-secondary-600 dark:text-secondary-400 hover:text-foreground dark:hover:text-white",
                                    isActive('/admin') && !isHomePage && "text-primary-600 dark:text-primary-400"
                                )}
                            >
                                Admin Dashboard
                                <span className={cn(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                    isActive('/admin') && !isHomePage && "scale-x-100"
                                )}></span>
                            </Link>
                            <Link
                                href="/admin/chats"
                                className={cn(
                                    "inline-flex items-center text-sm font-bold uppercase tracking-wider transition-all duration-300 relative group py-2",
                                    isHomePage
                                        ? "text-white/80 hover:text-white"
                                        : "text-secondary-600 dark:text-secondary-400 hover:text-foreground dark:hover:text-white",
                                    isActive('/admin/chats') && !isHomePage && "text-primary-600 dark:text-primary-400"
                                )}
                            >
                                Chat Management
                                <span className={cn(
                                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left",
                                    isActive('/admin/chats') && !isHomePage && "scale-x-100"
                                )}></span>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-6">
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
                                <div className="py-2">
                                    <Link href="/admin" className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                        Admin Dashboard
                                    </Link>
                                    <Link
                                        href="/admin/chats"
                                        className="block px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    >
                                        Chat Management
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
                    </div>

                    <div className="-mr-2 flex items-center space-x-4 sm:hidden">
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
                        <Link href="/bathroom-fittings" className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-900 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Bathroom Fittings
                        </Link>
                    </div>
                    <div className="pt-4 pb-4 border-t border-secondary-200 dark:border-secondary-800">
                        <div className="space-y-3 px-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <User className="h-10 w-10 text-secondary-400 bg-secondary-100 dark:bg-secondary-800 rounded-full p-2" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-secondary-800 dark:text-secondary-200">{session.user?.name}</div>
                                    <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{session.user?.email}</div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Link href="/admin" className="block w-full text-center bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700">
                                    Admin Dashboard
                                </Link>
                                <Link
                                    href="/admin/chats"
                                    className="block w-full text-center bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700"
                                >
                                    Chat Management
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="block w-full text-center border border-secondary-300 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-50 dark:hover:bg-secondary-800"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
