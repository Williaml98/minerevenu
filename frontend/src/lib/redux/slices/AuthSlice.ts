import { apiSlice } from "./ApiSlice";

const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({ url: "auth/login/", method: "POST", body: data }),
        }),
        register: builder.mutation({
            query: (data) => ({ url: "auth/register/", method: "POST", body: data }),
        }),
        createUser: builder.mutation({
            query: (data) => ({
                url: "auth/admin/users/create/",
                method: "POST",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: "auth/update-profile/",
                method: "PUT",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: "auth/forgot-password/",
                method: "POST",
                body: data,
            }),
        }),
        getAllUsers: builder.query({
            query: () => ({
                url: "auth/users/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        getMyDetails: builder.mutation({
            query: () => ({
                url: "auth/me/",
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        // New user management endpoints
        updateUser: builder.mutation({
            query: ({ id, data }) => ({
                url: `auth/admin/users/${id}/update/`,
                method: "PUT",
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `auth/admin/users/${id}/delete/`,
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
        toggleUserActive: builder.mutation({
            query: (id) => ({
                url: `auth/admin/users/${id}/toggle-active/`,
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access')}`,
                },
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useForgotPasswordMutation,
    useRegisterMutation,
    useUpdateProfileMutation,
    useGetAllUsersQuery,
    useGetMyDetailsMutation,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserActiveMutation
} = authApi;