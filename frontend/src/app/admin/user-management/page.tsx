"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCreateUserMutation, useGetAllUsersQuery } from '@/lib/redux/slices/AuthSlice';
import { useUpdateUserMutation, useDeleteUserMutation, useToggleUserActiveMutation } from '@/lib/redux/slices/AuthSlice';
import { toast } from 'react-toastify';

const roles = ["All Roles", "Admin", "Officer", "Stakeholder"];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    isActive?: boolean;
    active?: boolean;
    is_active?: boolean;
}

interface NewUser {
    username: string;
    email: string;
    role: string;
    status: string;
}

const UserManagementDashboard = () => {
    // RTK Query hooks
    const { data: usersData, isLoading, isError, refetch } = useGetAllUsersQuery({});
    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [toggleUserActive, { isLoading: isToggling }] = useToggleUserActiveMutation();

    // Local state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const usersPerPage = 5;
    const [newUser, setNewUser] = useState<NewUser>({
        username: '',
        email: '',
        role: 'Officer',
        status: 'Active'
    });


    const normalizeUserData = (userData: unknown[]): User[] => {
        if (!userData || !Array.isArray(userData)) {
            console.log('Invalid user data received:', userData);
            return [];
        }

        return userData.map((userRaw) => {
            const user = userRaw as Record<string, unknown>;
            console.log('Raw user data:', user);

            let status = 'Inactive';

            if (typeof user.status === 'string') {
                status = user.status;
            } else if (typeof user.isActive === 'boolean') {
                status = user.isActive ? 'Active' : 'Inactive';
            } else if (typeof user.active === 'boolean') {
                status = user.active ? 'Active' : 'Inactive';
            } else if (typeof user.is_active === 'boolean') {
                status = user.is_active ? 'Active' : 'Inactive';
            }

            const normalizedUser = {
                id: user.id as number,
                username: String(user.username || user.name || user.full_name || ''),
                email: String(user.email || ''),
                role: String(user.role || ''),
                status: status,
                ...user
            };

            console.log('Normalized user:', normalizedUser);
            return normalizedUser;
        });
    };

    // Initialize users from API data with proper normalization
    useEffect(() => {
        console.log('Raw usersData from API:', usersData);

        if (usersData) {
            const normalizedUsers = normalizeUserData(usersData);
            console.log('Normalized users:', normalizedUsers);

            setUsers(normalizedUsers);
            setFilteredUsers(normalizedUsers);
        }
    }, [usersData]);

    // Filter users based on search and role
    useEffect(() => {
        if (!users.length) return;

        let filtered = [...users];

        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedRole !== 'All Roles') {
            filtered = filtered.filter(user => user.role === selectedRole);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchQuery, selectedRole, users]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        setShowRoleDropdown(false);
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.email) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await createUser({
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            }).unwrap();

            toast.success('User created successfully! An email has been sent with login details.');
            setShowAddUserModal(false);
            setNewUser({
                username: '',
                email: '',
                role: 'Police',
                status: 'Active'
            });
            refetch();
        } catch (error) {
            toast.error('Failed to create user. Please try again.');
            console.error('Error creating user:', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId).unwrap();
                toast.success('User deleted successfully');
                refetch();
            } catch (error) {
                toast.error('Failed to delete user. Please try again.');
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            await updateUser({
                id: editingUser.id,
                data: {
                    username: editingUser.username,
                    email: editingUser.email,
                    role: editingUser.role,
                }
            }).unwrap();

            toast.success('User updated successfully');
            setShowEditModal(false);
            setEditingUser(null);
            refetch();
        } catch (error) {
            toast.error('Failed to update user. Please try again.');
            console.error('Error updating user:', error);
        }
    };

    const handleToggleUserStatus = async (userId: number) => {
        try {
            console.log('Attempting to toggle user status for userId:', userId);
            console.log('User ID type:', typeof userId);

            // Make the API call first without optimistic updates
            const result = await toggleUserActive(userId).unwrap();
            console.log('Toggle API response:', result);

            // If successful, refetch the data to get the updated status
            await refetch();

            toast.success('User status updated successfully');
        } catch (error) {
            const err = error as { status?: number; data?: unknown; message?: string };
            console.error('Full error object:', err);
            console.error('Error status:', err?.status);
            console.error('Error data:', err?.data);
            console.error('Error message:', err?.message);
            if (err?.status === 400) {
                const errorMessage =
                    err?.data && typeof err.data === 'object' && 'message' in err.data
                        ? (err.data as { message?: string }).message
                        : 'Invalid request parameters';
                toast.error(`Bad Request: ${errorMessage}`);
            } else if (err?.status === 404) {
                toast.error('User not found');
            } else if (err?.status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error('Failed to update user status. Please try again.');
            }
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const getStatusBadge = (status: string): string => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all duration-200";
        return status === 'Active'
            ? `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
            : `${baseClasses} bg-red-100 text-red-800 hover:bg-red-200`;
    };

    useEffect(() => {
        currentUsers.forEach((user, index) => {
            console.log(`User ${index}:`, {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                statusType: typeof user.status
            });
        });
    }, [currentUsers]);

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (isError) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Error loading users</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search User by name"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Add New User Button */}
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="bg-indigo-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-800 transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Add New User
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Role Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="flex items-center justify-between w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            <span className="text-gray-700">{selectedRole}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {showRoleDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {roles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${selectedRole === role ? 'bg-indigo-50 text-indigo-900' : 'text-gray-700'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Results info */}
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="px-4 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-100 px-6 py-4">
                        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                            <div className="col-span-2">Name</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-3">Action</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-2">
                                            <span className="text-sm font-medium text-gray-900">{user.username}</span>
                                        </div>
                                        <div className="col-span-3">
                                            <a href={`mailto:${user.email}`} className="text-sm text-blue-600 hover:text-blue-800 underline">
                                                {user.email}
                                            </a>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-900">{user.role}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span
                                                className={getStatusBadge(user.status || 'Inactive')}
                                                onClick={() => handleToggleUserStatus(user.id)}
                                                title="Click to toggle status"
                                            >
                                                {user.status || 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={isUpdating}
                                                    className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
                                                    title="Edit user"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={isDeleting}
                                                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id)}
                                                    disabled={isToggling}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                                                    title="Toggle user status"
                                                >
                                                    {isToggling ? 'Toggling...' : 'Toggle Status'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No users found matching your criteria
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {getPageNumbers().map((pageNum, index) => (
                                    <React.Fragment key={index}>
                                        {pageNum === '...' ? (
                                            <span className="px-2 text-gray-500">...</span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(pageNum as number)}
                                                className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )}
                                    </React.Fragment>
                                ))}

                                <button
                                    className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter full name"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter email address"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="Officer">Officer</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Stakeholder">Stakeholder</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={newUser.status}
                                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={isCreating}
                                className="flex-1 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
                            >
                                {isCreating ? 'Creating...' : 'Add User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter full name"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="Enter email address"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    <option value="Officer">Officer</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Stakeholder">Stakeholder</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
                            >
                                {isUpdating ? 'Updating...' : 'Update User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside handler for role dropdown */}
            {showRoleDropdown && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowRoleDropdown(false)}
                ></div>
            )}
        </div>
    );
};

export default UserManagementDashboard;