import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
        prepareHeaders: async (headers) => {
            if (headers.get("X-Skip-Auth") === "true") {
                headers.delete("X-Skip-Auth");
                headers.delete("Authorization");
                return headers;
            }
            if (typeof window !== "undefined") {
                const accessToken = localStorage.getItem("access");
                if (accessToken) {
                    headers.set("Authorization", `Bearer ${accessToken}`);
                    return headers;
                }
            }
            const session = await getSession();
            if (session?.user.token) {
                headers.set("Authorization", `Bearer ${session.user.token}`);
            }
            return headers;
        },
    }),
    tagTypes: [
        "Mines",
        "Production",
        "Sales",
        "Forecasts",
        "RevenueSummary",
        "Analytics",
        "Communications",
    ],
    endpoints: () => ({}),
});
