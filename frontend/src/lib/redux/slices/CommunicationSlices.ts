import { apiSlice } from "./ApiSlice";

export interface CommunicationMessage {
    id: number;
    sender: number;
    receiver: number;
    content: string;
    message_type: string;
    priority: string;
    is_read: boolean;
    timestamp: string;
}

export interface SendMessagePayload {
    receiver: number;
    content: string;
    message_type?: string;
    priority?: string;
}

export const communicationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllMessages: builder.query<CommunicationMessage[], unknown>({
            query: () => ({
                url: "communications/",
                method: "GET",
            }),
        }),
        sendMessage: builder.mutation<CommunicationMessage, SendMessagePayload>({
            query: (message) => ({
                url: "communications/",
                method: "POST",
                body: message,
            }),
        }),
    }),
});

export const { useGetAllMessagesQuery, useSendMessageMutation } = communicationSlice;
