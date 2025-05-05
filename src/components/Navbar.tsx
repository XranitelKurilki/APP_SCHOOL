import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const Navbar = () => {
    const router = useRouter()
    const session = useSession()

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 px-4 md:px-0">
                <div className="flex items-center space-x-4 w-full md:w-auto pl-4 md:pl-0">
                    <Link
                        href="/"
                        className={`${router.pathname === '/'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/schedule"
                        className={`${router.pathname === '/schedule'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                        Schedule
                    </Link>
                </div>
                <div className="flex items-center space-x-6 w-full md:w-auto justify-end pr-4 md:pr-0">
                    {session?.data?.user?.role === 1 && (
                        <Link
                            href="/tickets"
                            className={`${router.pathname === '/tickets'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } px-3 py-2 rounded-md text-sm font-medium`}
                        >
                            Tickets
                        </Link>
                    )}
                    {session?.data?.user?.role === 2 && (
                        <Link
                            href="/tickets"
                            className={`${router.pathname === '/tickets'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } px-3 py-2 rounded-md text-sm font-medium`}
                        >
                            Tickets
                        </Link>
                    )}
                    {session?.data?.user?.role === 3 && (
                        <>
                            <Link
                                href="/admin"
                                className={`${router.pathname === '/admin'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    } px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                Admin
                            </Link>
                            <Link
                                href="/tickets"
                                className={`${router.pathname === '/tickets'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    } px-3 py-2 rounded-md text-sm font-medium`}
                            >
                                Tickets
                            </Link>
                        </>
                    )}
                </div>
                <div className="hidden md:flex items-center ml-8">
                    <button className="text-gray-700 hover:text-red-500">Выйти</button>
                </div>
            </div>
        </div>
    )
}

export default Navbar 