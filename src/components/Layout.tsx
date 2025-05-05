import { ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LessonTimer } from './LessonTimer';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <img src="/logo.png" alt="Логотип школы" className="h-24 w-auto mb-4 animate-pulse" />
                <span className="text-xl text-gray-700 font-semibold">Загрузка...</span>
            </div>
        );
    }

    if (!session && router.pathname !== '/login') {
        router.push('/login');
        return null;
    }

    if (router.pathname === '/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-20 items-center w-full">
                        {/* Логотип слева */}
                        <div className="flex items-center flex-shrink-0">
                            <img src="/logo.png" alt="Логотип школы" className="h-10 w-auto" />
                        </div>
                        {/* Таймер */}
                        <div className="ml-0 sm:ml-10 flex-1 flex justify-center sm:justify-start">
                            <LessonTimer />
                        </div>
                        {/* Меню и имя/выход */}
                        <div className="hidden sm:flex flex-1 items-center justify-between ml-14">
                            {/* Меню */}
                            <div className="flex space-x-8 ml-8 pr-16">
                                <Link href="/schedule" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Расписание</Link>
                                <Link href="/calendar" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Календарь</Link>
                                {session?.user?.role !== undefined && session.user.role >= 1 && (
                                    <>
                                        <Link href="/tickets" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Тикеты</Link>
                                        <Link href="/orders" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Заказы</Link>
                                    </>
                                )}
                                {session?.user?.role === 3 && (
                                    <>
                                        <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Админка</Link>
                                    </>
                                )}
                                <Link href="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Профиль</Link>
                            </div>
                            {/* Имя и Выйти */}
                            <div className="flex items-center">
                                <Link href="/api/auth/signout" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Выйти</Link>
                            </div>
                        </div>
                        {/* Mobile burger */}
                        <div className="sm:hidden flex items-center ml-auto">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label="Открыть меню"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden bg-white shadow-lg px-4 pt-2 pb-4 space-y-2 z-50">
                        <Link href="/schedule" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Расписание</Link>
                        <Link href="/calendar" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Календарь</Link>
                        {session?.user?.role !== undefined && session.user.role >= 1 && (
                            <>
                                <Link href="/tickets" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Тикеты</Link>
                                <Link href="/orders" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Заказы</Link>
                            </>
                        )}
                        {session?.user?.role === 3 && (
                            <>
                                <Link href="/admin" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Админка</Link>
                            </>
                        )}
                        <Link href="/profile" className="block py-2 text-gray-700 font-medium" onClick={() => setMobileMenuOpen(false)}>Профиль</Link>
                        <Link href="/api/auth/signout" className="block py-2 text-gray-700 font-medium">Выйти</Link>
                    </div>
                )}
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 px-4 lg:px-8 w-full">
                {children}
            </main>
        </div>
    );
} 