import { apiSlice } from "./ApiSlice";

export const communicationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllMessages: builder.query({
            query: () => ({
                url: 'communications/',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        sendMessage: builder.mutation({
            query: (message) => ({
                url: 'communications/',
                method: 'POST',
                body: message,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                    'Content-Type': 'application/json',
                },
            }),
        }),
    }),
});

export const { useGetAllMessagesQuery, useSendMessageMutation } = communicationSlice;
