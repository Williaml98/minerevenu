import { apiSlice } from "./ApiSlice";

export interface CommunicationMessage {
    id: number;
    sender: number;
    receiver: number;
    message_content: string;
    subject: string;
    message_type: string;
    priority: string;
    is_read: boolean;
    timestamp: string;
    time_since?: string;
    sender_details?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
    receiver_details?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
}

export interface SendMessagePayload {
    receiver: number;
    subject: string;
    message_content: string;
    message_type?: string;
    priority?: string;
}

export interface CommunicationUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
}

export interface UnreadMessagesResponse {
    count: number;
    messages: CommunicationMessage[];
}

export const communicationSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllMessages: builder.query<CommunicationMessage[], unknown>({
            query: () => ({
                url: "communications/",
                method: "GET",
            }),
            providesTags: ["Communications"],
        }),
        getCommunicationUsers: builder.query<CommunicationUser[], unknown>({
            query: () => ({
                url: "communications/users/",
                method: "GET",
            }),
            providesTags: ["Communications"],
        }),
        getUnreadMessages: builder.query<UnreadMessagesResponse, void>({
            query: () => ({
                url: "communications/unread/",
                method: "GET",
            }),
            providesTags: ["Communications"],
        }),
        sendMessage: builder.mutation<CommunicationMessage, SendMessagePayload>({
            query: (message) => ({
                url: "communications/",
                method: "POST",
                body: message,
            }),
            invalidatesTags: ["Communications"],
        }),
        markMessageAsRead: builder.mutation<{ message: string }, number>({
            query: (messageId) => ({
                url: `communications/${messageId}/mark_read/`,
                method: "POST",
            }),
            invalidatesTags: ["Communications"],
        }),
        markMultipleMessagesAsRead: builder.mutation<
            { message: string; updated_count: number },
            number[]
        >({
            query: (messageIds) => ({
                url: "communications/mark_multiple_read/",
                method: "POST",
                body: { message_ids: messageIds },
            }),
            invalidatesTags: ["Communications"],
        }),
    }),
});

export const {
    useGetAllMessagesQuery,
    useGetCommunicationUsersQuery,
    useGetUnreadMessagesQuery,
    useSendMessageMutation,
    useMarkMessageAsReadMutation,
    useMarkMultipleMessagesAsReadMutation,
} = communicationSlice;
