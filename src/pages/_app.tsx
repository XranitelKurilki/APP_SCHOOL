import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session} refetchInterval={0}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/logo.png" />
                <link rel="apple-touch-icon" href="/logo.png" />
                <meta name="theme-color" content="#2563eb" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-title" content="Школа №35" />
            </Head>
            <Component {...pageProps} />
        </SessionProvider>
    );
} 