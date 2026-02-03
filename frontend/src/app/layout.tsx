"use client";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Mining Revenue Tracking</title>
        <meta name="description" content="Mining Revenue Tracking System" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/login.jpg" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <Provider store={store}>
            <Toaster position={`top-right`} />
            <main className="flex-grow">{children}</main>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
