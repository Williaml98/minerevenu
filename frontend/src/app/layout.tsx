import "./globals.css";
import ClientProviders from "@/lib/ClientProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MineRevenue — AI-Powered Revenue Forecasting</title>
        <meta name="description" content="Intelligent mining revenue tracking and AI-powered forecasting system" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Theme init — runs before paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ClientProviders>
          <main className="flex-grow">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
