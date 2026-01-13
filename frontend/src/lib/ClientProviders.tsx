"use client";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";

interface Props {
    children: React.ReactNode;
}

export default function ClientProviders({ children }: Props) {
    return <Provider store={store}>{children}</Provider>;
}
