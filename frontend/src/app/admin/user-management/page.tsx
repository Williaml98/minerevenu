'use client';
import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, RefreshCw, X, Key, Shield } from 'lucide-react';

// Types
interface User {
    id: string;
    avatar: string;
    fullName: string;
    email: string;
    role: 'Admin' | 'Finance Officer' | 'Auditor';
    status: 'Active' | 'Inactive' | 'Suspended';
    lastActive: string;
}

// Sample data
const sampleUsers: User[] = [
    { id: '1', avatar: 'KT', fullName: 'Kamanzi Tresor', email: 'kamanzi@minerevenue.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
    { id: '2', avatar: 'UD', fullName: 'Uwineza Dianna', email: 'dianna@minerevenue.com', role: 'Finance Officer', status: 'Active', lastActive: '1 day ago' },
    { id: '3', avatar: 'MT', fullName: 'Mbagariye Thomas', email: 'thomas@minerevenue.com', role: 'Auditor', status: 'Active', lastActive: '3 hours ago' },
    { id: '4', avatar: 'KV', fullName: 'Keza Valiante', email: 'keza@minerevenue.com', role: 'Finance Officer', status: 'Inactive', lastActive: '1 week ago' },
    { id: '5', avatar: 'MR', fullName: 'Mugabo Ronard', email: 'ronard@minerevenue.com', role: 'Auditor', status: 'Suspended', lastActive: '2 weeks ago' },
];

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(sampleUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showPermissionsDrawer, setShowPermissionsDrawer] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'Finance Officer',
        status: 'Active',
        password: generatePassword()
    });

    function generatePassword() {
        return Math.random().toString(36).slice(-8);
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Admin': return 'bg-blue-900 text-white';
            case 'Finance Officer': return 'bg-green-600 text-white';
            case 'Auditor': return 'bg-purple-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-600 text-white';
            case 'Inactive': return 'bg-gray-500 text-white';
            case 'Suspended': return 'bg-red-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };

    const handleAddUser = () => {
        const newUser: User = {
            id: Date.now().toString(),
            avatar: formData.fullName.split(' ').map(n => n[0]).join(''),
            fullName: formData.fullName,
            email: formData.email,
            role: formData.role as User['role'],
            status: formData.status as User['status'],
            lastActive: 'Just now'
        };
        setUsers([...users, newUser]);
        setShowAddModal(false);
        setFormData({ fullName: '', email: '', role: 'Finance Officer', status: 'Active', password: generatePassword() });
    };

    const handleEditUser = () => {
        if (selectedUser) {
            setUsers(users.map(u => u.id === selectedUser.id ? {
                ...u,
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role as User['role'],
                status: formData.status as User['status']
            } : u));
            setShowEditModal(false);
            setSelectedUser(null);
        }
    };

    const handleDeleteUser = (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            password: generatePassword()
        });
        setShowEditModal(true);
    };

    const openResetModal = (user: User) => {
        setSelectedUser(user);
        setShowResetModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage system users, roles, and access permissions.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search user by name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Finance Officer</option>
                        <option>Auditor</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Suspended</option>
                    </select>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Active</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                                                {user.avatar}
                                            </div>
                                            <span className="font-medium text-gray-900">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.lastActive}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} className="text-red-600" />
                                            </button>
                                            <button
                                                onClick={() => openResetModal(user)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                title="Reset Password"
                                            >
                                                <RefreshCw size={18} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => setShowPermissionsDrawer(true)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                                                title="Manage Permissions"
                                            >
                                                <Shield size={18} className="text-purple-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                        >
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm">Previous</button>
                        <button className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">1</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm">2</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm">3</button>
                        <button className="px-3 py-1 rounded-lg hover:bg-gray-100 text-sm">Next</button>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="john@minerevenue.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Admin</option>
                                    <option>Finance Officer</option>
                                    <option>Auditor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.password}
                                        readOnly
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
                                    />
                                    <button
                                        onClick={() => setFormData({ ...formData, password: generatePassword() })}
                                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                            >
                                Save User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Admin</option>
                                    <option>Finance Officer</option>
                                    <option>Auditor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                    <option>Suspended</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => openResetModal(selectedUser!)}
                                    className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition font-medium flex items-center justify-center gap-2"
                                >
                                    <Key size={18} />
                                    Reset Password
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedUser) {
                                            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: 'Inactive' } : u));
                                            setShowEditModal(false);
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition font-medium"
                                >
                                    Deactivate
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditUser}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Key size={32} className="text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                            <p className="text-gray-600">
                                Are you sure you want to reset this user's password? A new password will be sent to their email.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert('Password reset email sent!');
                                    setShowResetModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permissions Drawer */}
            {showPermissionsDrawer && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPermissionsDrawer(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Assign Permissions</h2>
                                <button onClick={() => setShowPermissionsDrawer(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {['Dashboard', 'Mining Revenue Tracking', 'AI Analytics', 'Compliance Reports', 'User Management', 'System Settings'].map((module) => (
                                    <div key={module} className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">{module}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['View', 'Create', 'Edit', 'Delete'].map((permission) => (
                                                <label key={permission} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span className="text-sm text-gray-700">{permission}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowPermissionsDrawer(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Permissions saved!');
                                        setShowPermissionsDrawer(false);
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}