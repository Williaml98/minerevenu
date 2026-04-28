"use client";
import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, X, ChevronDown, ChevronLeft,
    ChevronRight, Download, Users, Shield, UserCheck, UserX,
    Mail, Phone, MapPin, Briefcase, FileText
} from 'lucide-react';
import { useCreateUserMutation, useGetAllUsersQuery } from '@/lib/redux/slices/AuthSlice';
import { useUpdateUserMutation, useDeleteUserMutation, useToggleUserActiveMutation } from '@/lib/redux/slices/AuthSlice';
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const roles = ["All Roles", "Admin", "Officer", "Stakeholder"];
const pageSizeOptions = [5, 10, 20, 50];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    employee_id?: string | null;
    telephone?: string | null;
    location?: string | null;
    bachelor_degree?: string | null;
    isActive?: boolean;
    active?: boolean;
    is_active?: boolean;
}

interface NewUser {
    username: string;
    email: string;
    role: string;
    status: string;
    employee_id: string;
    telephone: string;
    location: string;
    bachelor_degree: File | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
    Active:    { label: 'Active',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: UserCheck },
    Inactive:  { label: 'Inactive',  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', icon: UserX },
    Suspended: { label: 'Suspended', color: '#e11d48', bg: 'rgba(225,29,72,0.12)',   border: 'rgba(225,29,72,0.25)',   icon: Shield },
};

const roleConfig: Record<string, { color: string; bg: string }> = {
    Admin:       { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
    Officer:     { color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
    Stakeholder: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--card-border)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const UserManagementDashboard = () => {
    const { data: usersData, isLoading, isError, refetch } = useGetAllUsersQuery({});
    const [createUser,     { isLoading: isCreating }]  = useCreateUserMutation();
    const [updateUser,     { isLoading: isUpdating }]  = useUpdateUserMutation();
    const [deleteUser,     { isLoading: isDeleting }]  = useDeleteUserMutation();
    const [toggleUserActive, { isLoading: isToggling }] = useToggleUserActiveMutation();

    const [users, setUsers]               = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery]   = useState('');
    const [selectedRole, setSelectedRole] = useState('All Roles');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [currentPage, setCurrentPage]   = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [editingUser, setEditingUser]   = useState<User | null>(null);
    const [editingDegreeFile, setEditingDegreeFile] = useState<File | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newUser, setNewUser] = useState<NewUser>({
        username: '', email: '', role: 'Officer', status: 'Active',
        employee_id: '', telephone: '', location: '', bachelor_degree: null,
    });

    const normalizeUserData = (userData: unknown[]): User[] => {
        if (!userData || !Array.isArray(userData)) return [];
        return userData.map((userRaw) => {
            const user = userRaw as Record<string, unknown>;
            let status = 'Inactive';
            if (typeof user.status === 'string') status = user.status;
            else if (typeof user.isActive === 'boolean') status = user.isActive ? 'Active' : 'Inactive';
            else if (typeof user.active === 'boolean')   status = user.active   ? 'Active' : 'Inactive';
            else if (typeof user.is_active === 'boolean') status = user.is_active ? 'Active' : 'Inactive';
            return { id: user.id as number, username: String(user.username || user.name || user.full_name || ''), email: String(user.email || ''), role: String(user.role || ''), status, ...user };
        });
    };

    useEffect(() => {
        if (usersData) {
            const normalized = normalizeUserData(usersData);
            setUsers(normalized);
            setFilteredUsers(normalized);
        }
    }, [usersData]);

    useEffect(() => {
        if (!users.length) return;
        let filtered = [...users];
        if (searchQuery) filtered = filtered.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));
        if (selectedRole !== 'All Roles') filtered = filtered.filter(u => u.role === selectedRole);
        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchQuery, selectedRole, users]);

    const totalPages   = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
    const startIndex   = (currentPage - 1) * usersPerPage;
    const endIndex     = startIndex + usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);
    const safeStart    = filteredUsers.length === 0 ? 0 : startIndex + 1;
    const safeEnd      = filteredUsers.length === 0 ? 0 : Math.min(endIndex, filteredUsers.length);
    const hasFilters   = Boolean(searchQuery) || selectedRole !== 'All Roles';

    useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.email) { toast.error('Please fill all required fields'); return; }
        try {
            const formData = new FormData();
            formData.append('username', newUser.username);
            formData.append('email', newUser.email);
            formData.append('role', newUser.role);
            formData.append('status', newUser.status);
            if (newUser.employee_id)   formData.append('employee_id', newUser.employee_id);
            if (newUser.telephone)     formData.append('telephone', newUser.telephone);
            if (newUser.location)      formData.append('location', newUser.location);
            if (newUser.bachelor_degree) formData.append('bachelor_degree', newUser.bachelor_degree);
            await createUser(formData).unwrap();
            toast.success('User created successfully! Login details sent via email.');
            setShowAddUserModal(false);
            setNewUser({ username: '', email: '', role: 'Officer', status: 'Active', employee_id: '', telephone: '', location: '', bachelor_degree: null });
            refetch();
        } catch { toast.error('Failed to create user. Please try again.'); }
    };

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try { await deleteUser(userId).unwrap(); toast.success('User deleted successfully'); refetch(); }
            catch { toast.error('Failed to delete user. Please try again.'); }
        }
    };

    const handleEditUser = (user: User) => { setEditingUser(user); setEditingDegreeFile(null); setShowEditModal(true); };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const formData = new FormData();
            formData.append('username', editingUser.username);
            formData.append('email', editingUser.email);
            formData.append('role', editingUser.role);
            if (editingUser.employee_id) formData.append('employee_id', editingUser.employee_id);
            if (editingUser.telephone)   formData.append('telephone', editingUser.telephone);
            if (editingUser.location)    formData.append('location', editingUser.location);
            if (editingDegreeFile)       formData.append('bachelor_degree', editingDegreeFile);
            await updateUser({ id: editingUser.id, data: formData }).unwrap();
            toast.success('User updated successfully');
            setShowEditModal(false); setEditingUser(null); setEditingDegreeFile(null);
            refetch();
        } catch { toast.error('Failed to update user. Please try again.'); }
    };

    const handleToggleUserStatus = async (userId: number) => {
        try {
            await toggleUserActive(userId).unwrap();
            await refetch();
            toast.success('User status updated successfully');
        } catch (error) {
            const err = error as { status?: number; data?: unknown };
            if (err?.status === 400)      toast.error('Bad Request: Invalid parameters');
            else if (err?.status === 404) toast.error('User not found');
            else if (err?.status === 500) toast.error('Server error. Please try again later.');
            else                          toast.error('Failed to update user status.');
        }
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("User Management Report", 14, 18);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
        autoTable(doc, {
            startY: 32,
            head: [["Name", "Email", "Role", "Employee ID", "Telephone", "Location", "Status"]],
            body: filteredUsers.map(u => [u.username || "", u.email || "", u.role || "", u.employee_id || "-", u.telephone || "-", u.location || "-", u.status || "-"]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        doc.save(`user-management-${new Date().toISOString().split("T")[0]}.pdf`);
    };

    const handlePageChange = (page: number) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
    const handleUsersPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setUsersPerPage(Number(e.target.value)); setCurrentPage(1); };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else if (currentPage <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
        else if (currentPage >= totalPages - 2) { pages.push(1); pages.push('...'); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i); }
        else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
        return pages;
    };

    const statsCards = [
        { label: 'Total Users',   value: users.length,                                             icon: Users,     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
        { label: 'Active',        value: users.filter(u => u.status === 'Active').length,           icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
        { label: 'Inactive',      value: users.filter(u => u.status === 'Inactive').length,         icon: UserX,     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
        { label: 'Suspended',     value: users.filter(u => u.status === 'Suspended').length,        icon: Shield,    color: '#e11d48', bg: 'rgba(225,29,72,0.1)'   },
    ];

    const ModalInput = ({ label, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: React.ElementType }) => (
        <div>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: 'relative' }}>
                {Icon && <Icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />}
                <input {...props} style={{ ...inputStyle, paddingLeft: Icon ? 36 : 12 }} />
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
            <div className="text-center">
                <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "var(--card-border)", borderTopColor: "#3b82f6" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading users…</p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
            <p className="text-sm" style={{ color: "#e11d48" }}>Error loading users. Please refresh.</p>
        </div>
    );

    return (
        <div className="min-h-screen p-4 md:p-6 space-y-5" style={{ background: "var(--bg-base)" }}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                        User Management
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        Manage system users, roles, and permissions
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleExportPdf}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                    >
                        <Download size={15} /> Export PDF
                    </button>
                    <button
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: "#2563eb", color: "#fff" }}
                    >
                        <Plus size={15} /> Add New User
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statsCards.map((card) => (
                    <div key={card.label} className="rounded-2xl p-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ background: card.bg }}>
                                <card.icon size={16} style={{ color: card.color }} />
                            </div>
                            <div>
                                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{card.label}</p>
                                <p className="text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center" style={{ borderBottom: "1px solid var(--card-border)" }}>
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 sm:max-w-xs">
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                            style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)", minWidth: 160 }}
                        >
                            <span className="flex-1 text-left">{selectedRole}</span>
                            <ChevronDown size={14} style={{ color: "var(--text-secondary)" }} />
                        </button>
                        {showRoleDropdown && (
                            <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden shadow-xl z-20" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", minWidth: 160 }}>
                                {roles.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm transition-all"
                                        style={{ color: selectedRole === role ? "#2563eb" : "var(--text-primary)", background: selectedRole === role ? "rgba(37,99,235,0.08)" : "transparent" }}
                                        onMouseEnter={e => { if (selectedRole !== role) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface)"; }}
                                        onMouseLeave={e => { if (selectedRole !== role) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Results info */}
                    <div className="ml-auto flex items-center gap-3 text-sm flex-wrap">
                        <span style={{ color: "var(--text-secondary)" }}>
                            Showing <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{safeStart}–{safeEnd}</span> of <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filteredUsers.length}</span>
                            {hasFilters && <span style={{ color: "var(--text-secondary)" }}> (filtered)</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Rows:</label>
                            <select
                                value={usersPerPage}
                                onChange={handleUsersPerPageChange}
                                className="rounded-lg px-2 py-1 text-sm outline-none"
                                style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                            >
                                {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {/* Table Header */}
                    <div className="min-w-[1000px] px-5 py-3 grid grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide" style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}>
                        <div className="col-span-2">Name</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-1">Role</div>
                        <div className="col-span-2">Employee ID</div>
                        <div className="col-span-1">Phone</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="min-w-[1000px] divide-y" style={{ borderColor: "var(--card-border)" }}>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => {
                                const st = statusConfig[user.status] || statusConfig.Inactive;
                                const rl = roleConfig[user.role] || { color: "#64748b", bg: "rgba(100,116,139,0.1)" };
                                return (
                                    <div
                                        key={user.id}
                                        className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center transition-all"
                                        style={{ borderColor: "var(--card-border)" }}
                                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface)"}
                                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                                    >
                                        {/* Name */}
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: rl.color }}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.username}</span>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-3">
                                            <a href={`mailto:${user.email}`} className="text-sm truncate block transition-colors" style={{ color: "#3b82f6" }}>
                                                {user.email}
                                            </a>
                                        </div>

                                        {/* Role */}
                                        <div className="col-span-1">
                                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: rl.bg, color: rl.color }}>
                                                {user.role}
                                            </span>
                                        </div>

                                        {/* Employee ID */}
                                        <div className="col-span-2">
                                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.employee_id || '—'}</span>
                                        </div>

                                        {/* Phone */}
                                        <div className="col-span-1">
                                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.telephone || '—'}</span>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1">
                                            <button
                                                onClick={() => handleToggleUserStatus(user.id)}
                                                disabled={isToggling}
                                                title="Click to toggle status"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all disabled:opacity-50 cursor-pointer"
                                                style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                                            >
                                                <st.icon size={11} />
                                                {st.label}
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-1">
                                            {user.bachelor_degree && (
                                                <a
                                                    href={user.bachelor_degree}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="View degree"
                                                    className="p-1.5 rounded-lg transition-all"
                                                    style={{ color: "var(--text-secondary)" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(59,130,246,0.1)"; (e.currentTarget as HTMLAnchorElement).style.color = "#3b82f6"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
                                                >
                                                    <FileText size={15} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                disabled={isUpdating}
                                                title="Edit user"
                                                className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                                                style={{ color: "var(--text-secondary)" }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={isDeleting}
                                                title="Delete user"
                                                className="p-1.5 rounded-lg transition-all disabled:opacity-50"
                                                style={{ color: "var(--text-secondary)" }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(225,29,72,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#e11d48"; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bg-surface)" }}>
                                    <Search size={20} style={{ color: "var(--text-secondary)" }} />
                                </div>
                                <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No users found</h3>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Try adjusting your search or filter criteria.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderTop: "1px solid var(--card-border)" }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                            <span className="px-3 py-1.5 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)" }}>
                                Page <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{currentPage}</span> of <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalPages}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { label: 'First', disabled: currentPage === 1,        onClick: () => handlePageChange(1) },
                                { label: 'Prev',  disabled: currentPage === 1,        onClick: () => handlePageChange(currentPage - 1), icon: ChevronLeft },
                            ].map(btn => (
                                <button
                                    key={btn.label}
                                    disabled={btn.disabled}
                                    onClick={btn.onClick}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                                >
                                    {btn.icon && <btn.icon size={14} />} {btn.label}
                                </button>
                            ))}

                            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)" }}>
                                {getPageNumbers().map((pageNum, index) => (
                                    <React.Fragment key={index}>
                                        {pageNum === '...' ? (
                                            <span className="px-2 text-sm" style={{ color: "var(--text-secondary)" }}>…</span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(pageNum as number)}
                                                className="min-w-8 h-8 rounded-lg text-sm font-medium transition-all"
                                                style={{
                                                    background: currentPage === pageNum ? "#2563eb" : "transparent",
                                                    color: currentPage === pageNum ? "#fff" : "var(--text-primary)",
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {[
                                { label: 'Next',  disabled: currentPage === totalPages, onClick: () => handlePageChange(currentPage + 1), icon: ChevronRight },
                                { label: 'Last',  disabled: currentPage === totalPages, onClick: () => handlePageChange(totalPages) },
                            ].map(btn => (
                                <button
                                    key={btn.label}
                                    disabled={btn.disabled}
                                    onClick={btn.onClick}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                                >
                                    {btn.label} {btn.icon && <btn.icon size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Add User Modal ===== */}
            {showAddUserModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl" style={{ background: "rgba(37,99,235,0.1)" }}>
                                    <Plus size={16} style={{ color: "#2563eb" }} />
                                </div>
                                <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Add New User</h2>
                            </div>
                            <button onClick={() => setShowAddUserModal(false)} className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-secondary)" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                            <ModalInput label="Full Name *" icon={Users} type="text" placeholder="Enter full name" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                            <ModalInput label="Email Address *" icon={Mail} type="email" placeholder="Enter email address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            <ModalInput label="Employee ID" icon={Briefcase} type="text" placeholder="Enter employee ID" value={newUser.employee_id} onChange={e => setNewUser({ ...newUser, employee_id: e.target.value })} />
                            <ModalInput label="Telephone" icon={Phone} type="tel" placeholder="Enter phone number" value={newUser.telephone} onChange={e => setNewUser({ ...newUser, telephone: e.target.value })} />
                            <ModalInput label="Location" icon={MapPin} type="text" placeholder="Enter location" value={newUser.location} onChange={e => setNewUser({ ...newUser, location: e.target.value })} />

                            <div>
                                <label style={labelStyle}>Role *</label>
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
                                    <option value="Officer">Officer</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Stakeholder">Stakeholder</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={newUser.status} onChange={e => setNewUser({ ...newUser, status: e.target.value })} style={inputStyle}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Bachelor Degree (optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setNewUser({ ...newUser, bachelor_degree: e.target.files?.[0] || null })}
                                    className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold"
                                    style={{ color: "var(--text-secondary)" }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-5" style={{ borderTop: "1px solid var(--card-border)" }}>
                            <button onClick={() => setShowAddUserModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}>
                                Cancel
                            </button>
                            <button onClick={handleAddUser} disabled={isCreating} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50" style={{ background: "#2563eb", color: "#fff" }}>
                                {isCreating ? 'Creating…' : 'Add User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Edit User Modal ===== */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl" style={{ background: "rgba(59,130,246,0.1)" }}>
                                    <Edit size={16} style={{ color: "#3b82f6" }} />
                                </div>
                                <h2 className="font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>Edit User</h2>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg transition-all" style={{ color: "var(--text-secondary)" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                            <ModalInput label="Full Name *" icon={Users} type="text" placeholder="Enter full name" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} />
                            <ModalInput label="Email Address *" icon={Mail} type="email" placeholder="Enter email address" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                            <ModalInput label="Employee ID" icon={Briefcase} type="text" placeholder="Enter employee ID" value={editingUser.employee_id || ''} onChange={e => setEditingUser({ ...editingUser, employee_id: e.target.value })} />
                            <ModalInput label="Telephone" icon={Phone} type="tel" placeholder="Enter phone number" value={editingUser.telephone || ''} onChange={e => setEditingUser({ ...editingUser, telephone: e.target.value })} />
                            <ModalInput label="Location" icon={MapPin} type="text" placeholder="Enter location" value={editingUser.location || ''} onChange={e => setEditingUser({ ...editingUser, location: e.target.value })} />

                            <div>
                                <label style={labelStyle}>Role *</label>
                                <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} style={inputStyle}>
                                    <option value="Officer">Officer</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Stakeholder">Stakeholder</option>
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Bachelor Degree (optional)</label>
                                {editingUser.bachelor_degree && (
                                    <a href={editingUser.bachelor_degree} target="_blank" rel="noreferrer" className="block text-xs mb-2 underline" style={{ color: "#3b82f6" }}>
                                        View current document
                                    </a>
                                )}
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => setEditingDegreeFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold"
                                    style={{ color: "var(--text-secondary)" }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 p-5" style={{ borderTop: "1px solid var(--card-border)" }}>
                            <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: "var(--bg-surface)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}>
                                Cancel
                            </button>
                            <button onClick={handleUpdateUser} disabled={isUpdating} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50" style={{ background: "#2563eb", color: "#fff" }}>
                                {isUpdating ? 'Updating…' : 'Update User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click-outside overlay for role dropdown */}
            {showRoleDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleDropdown(false)} />
            )}
        </div>
    );
};

export default UserManagementDashboard;
