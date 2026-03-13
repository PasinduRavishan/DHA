'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                toast.error('Invalid email or password');
            } else {
                toast.success('Signed in successfully');
                router.refresh();

                // Fetch current session to check role
                const res = await fetch('/api/auth/session');
                const session = await res.json();

                if (session?.user?.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-black p-8 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Sign in
                    </h2>
                    <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
                        Welcome back to Dhanuka Enterprises
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 placeholder-secondary-400 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors sm:text-sm"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 placeholder-secondary-400 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors sm:text-sm"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-6 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-800">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider font-semibold mb-2">
                        Demo Credentials
                    </p>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        Email: <span className="font-mono text-primary-600 dark:text-primary-400">admin@dhanuka.com</span>
                    </p>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        Password: <span className="font-mono text-primary-600 dark:text-primary-400">admin123</span>
                    </p>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
