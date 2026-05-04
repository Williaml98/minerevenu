"use client";

import { useState } from "react";
import { Database, MapPin, ShieldCheck, TrendingUp, Plus, X, Edit, Trash2 } from "lucide-react";
import {
    useGetMineCompaniesQuery,
    useCreateMineCompanyMutation,
    useUpdateMineCompanyMutation,
    useDeleteMineCompanyMutation,
    MineCompany
} from "@/lib/redux/slices/MiningSlice";
import { toast } from "sonner";

type MineFormState = {
    name: string;
    location: string;
    license_number: string;
    mineral_type: string;
    status: string;
};

const defaultForm: MineFormState = {
    name: "",
    location: "",
    license_number: "",
    mineral_type: "",
    status: "Active",
};

export default function OfficerMinesPage() {
    const { data: mines = [], isLoading, isError, refetch } = useGetMineCompaniesQuery({});
    const [createMine, { isLoading: isCreating }] = useCreateMineCompanyMutation();
    const [updateMine, { isLoading: isUpdating }] = useUpdateMineCompanyMutation();
    const [deleteMine, { isLoading: isDeleting }] = useDeleteMineCompanyMutation();

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingMine, setEditingMine] = useState<MineCompany | null>(null);
    const [form, setForm] = useState<MineFormState>(defaultForm);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const activeCount = mines.filter((m) => m.status === "Active").length;
    const inactiveCount = mines.length - activeCount;

    const totalPages = Math.max(1, Math.ceil(mines.length / rowsPerPage));
    const pagedMines = mines.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const getPageNums = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: (number | '...')[] = [1];
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    };

    const openCreate = () => {
        setEditingMine(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const openEdit = (mine: MineCompany) => {
        setEditingMine(mine);
        setForm({
            name: mine.name,
            location: mine.location,
            license_number: mine.license_number,
            mineral_type: mine.mineral_type,
            status: mine.status,
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.location.trim() || !form.mineral_type.trim()) {
            toast.error("Name, location, and mineral type are required.");
            return;
        }
        try {
            if (editingMine) {
                await updateMine({
                    id: editingMine.id,
                    name: form.name.trim(),
                    location: form.location.trim(),
                    license_number: form.license_number.trim(),
                    mineral_type: form.mineral_type.trim(),
                    status: form.status,
                }).unwrap();
                toast.success("Mine updated successfully.");
            } else {
                await createMine({
                    name: form.name.trim(),
                    location: form.location.trim(),
                    license_number: form.license_number.trim(),
                    mineral_type: form.mineral_type.trim(),
                    status: form.status,
                }).unwrap();
                toast.success("Mine created successfully.");
            }
            setShowModal(false);
            setEditingMine(null);
            setForm(defaultForm);
            refetch();
        } catch {
            toast.error("Failed to save mine. Please try again.");
        }
    };

    const handleDelete = async () => {
        if (!editingMine) return;
        try {
            await deleteMine(editingMine.id).unwrap();
            toast.success("Mine deleted successfully.");
            setShowDeleteModal(false);
            setEditingMine(null);
            refetch();
        } catch {
            toast.error("Failed to delete mine.");
        }
    };

    return (
        <div className="min-h-screen p-6 space-y-6" style={{ background: "var(--bg-base)" }}>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Mines & Companies</h1>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Registry of licensed mining sites under your supervision.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={openCreate} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={16} /> Add Mine
                    </button>
                    <div className="px-3 py-2 rounded-lg text-sm flex items-center gap-2" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                        <ShieldCheck size={16} style={{ color: "var(--status-success)" }} /><span>{activeCount} Active</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-sm flex items-center gap-2" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--text-secondary)" }}>
                        <TrendingUp size={16} style={{ color: "var(--status-warning)" }} /><span>{inactiveCount} Inactive</span>
                    </div>
                </div>
            </header>

            <section className="rounded-xl shadow-sm" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2">
                        <Database size={18} style={{ color: "var(--accent)" }} />
                        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Mine Registry</h2>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Total: {mines.length}</span>
                </div>
                {isLoading ? (
                    <div className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>Loading mines...</div>
                ) : isError ? (
                    <div className="p-6 text-sm" style={{ color: "var(--status-danger)" }}>Failed to load mines. Please retry.</div>
                ) : mines.length === 0 ? (
                    <div className="p-6 text-sm" style={{ color: "var(--text-secondary)" }}>No mines registered yet.</div>
                ) : (
                    <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Name</th>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Location</th>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>License</th>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Mineral</th>
                                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
                                    <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-secondary)" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedMines.map((mine) => (
                                    <tr key={mine.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                        onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "var(--bg-elevated)"}
                                        onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"}
                                    >
                                        <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{mine.name}</td>
                                        <td className="px-4 py-3 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                            <MapPin size={14} style={{ color: "var(--text-tertiary)" }} />{mine.location}
                                        </td>
                                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{mine.license_number || "-"}</td>
                                        <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{mine.mineral_type}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold"
                                                style={mine.status === "Active"
                                                    ? { background: "var(--status-success-bg)", color: "var(--status-success-text)", border: "1px solid var(--status-success)" }
                                                    : { background: "var(--status-warning-bg)", color: "var(--status-warning-text)", border: "1px solid var(--status-warning)" }}
                                            >{mine.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-3">
                                            <button onClick={() => openEdit(mine)} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--accent)" }}>
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button onClick={() => { setEditingMine(mine); setShowDeleteModal(true); }} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--status-danger)" }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            {`${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, mines.length)} of ${mines.length}`}
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg text-xs transition disabled:opacity-40" style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => { if (currentPage > 1) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                            >Prev</button>
                            {getPageNums(currentPage, totalPages).map((p, i) =>
                                p === '...' ? <span key={i} className="px-1 text-xs" style={{ color: "var(--text-tertiary)" }}>…</span> : (
                                    <button key={p} onClick={() => setCurrentPage(p as number)}
                                        className="w-7 h-7 rounded-lg text-xs font-medium transition"
                                        style={currentPage === p ? { background: "var(--accent)", color: "#fff" } : { background: "transparent", color: "var(--text-secondary)" }}
                                        onMouseEnter={(e) => { if (currentPage !== p) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)"; }}
                                        onMouseLeave={(e) => { if (currentPage !== p) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                                    >{p}</button>
                                )
                            )}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg text-xs transition disabled:opacity-40" style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => { if (currentPage < totalPages) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                            >Next</button>
                        </div>
                    </div>
                    </>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="rounded-xl shadow-xl max-w-lg w-full p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                    {editingMine ? "Edit Mine / Company" : "Add Mine / Company"}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create or update mine registry details.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg" aria-label="Close"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-elevated)"}
                                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
                            ><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: "Name", field: "name" as const, placeholder: "e.g., Nyungwe Gold Mine" },
                                { label: "Location", field: "location" as const, placeholder: "District, Country" },
                            ].map(({ label, field, placeholder }) => (
                                <div key={field}>
                                    <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
                                    <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        style={{ border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--input-text)" }}
                                        placeholder={placeholder} />
                                </div>
                            ))}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { label: "License Number", field: "license_number" as const, placeholder: "e.g., LIC-2026-001" },
                                    { label: "Mineral Type", field: "mineral_type" as const, placeholder: "Gold, Tin, Lithium..." },
                                ].map(({ label, field, placeholder }) => (
                                    <div key={field}>
                                        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
                                        <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            style={{ border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--input-text)" }}
                                            placeholder={placeholder} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    style={{ border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--input-text)" }}
                                >
                                    <option>Active</option><option>Inactive</option><option>Suspended</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-lg text-sm font-medium"
                                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={isCreating || isUpdating}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                                {isCreating || isUpdating ? "Saving..." : "Save Mine"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && editingMine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="rounded-xl shadow-xl max-w-md w-full p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--status-danger-bg)" }}>
                                <Trash2 size={30} style={{ color: "var(--status-danger)" }} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Delete Mine</h2>
                            <p style={{ color: "var(--text-secondary)" }}>
                                Are you sure you want to delete {editingMine.name}? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-lg text-sm font-medium"
                                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium disabled:opacity-60">
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
