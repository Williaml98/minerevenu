"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Toaster } from "sonner";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Provider store={store}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: { fontFamily: "var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)" },
                    }}
                />
                {children}
            </Provider>
        </SessionProvider>
    );
}
