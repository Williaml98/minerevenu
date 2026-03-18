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

export default function AdminMinesPage() {
    const { data: mines = [], isLoading, isError, refetch } = useGetMineCompaniesQuery({});
    const [createMine, { isLoading: isCreating }] = useCreateMineCompanyMutation();
    const [updateMine, { isLoading: isUpdating }] = useUpdateMineCompanyMutation();
    const [deleteMine, { isLoading: isDeleting }] = useDeleteMineCompanyMutation();

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingMine, setEditingMine] = useState<MineCompany | null>(null);
    const [form, setForm] = useState<MineFormState>(defaultForm);

    const activeCount = mines.filter((m) => m.status === "Active").length;
    const inactiveCount = mines.length - activeCount;

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
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mines & Companies</h1>
                    <p className="text-sm text-slate-500">Manage the official registry of mining sites.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={openCreate}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Mine
                    </button>
                    <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>{activeCount} Active</span>
                    </div>
                    <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-600" />
                        <span>{inactiveCount} Inactive</span>
                    </div>
                </div>
            </header>

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-blue-600" />
                        <h2 className="text-sm font-semibold text-slate-900">Mine Registry</h2>
                    </div>
                    <span className="text-xs text-slate-500">Total: {mines.length}</span>
                </div>

                {isLoading ? (
                    <div className="p-6 text-sm text-slate-500">Loading mines...</div>
                ) : isError ? (
                    <div className="p-6 text-sm text-rose-600">Failed to load mines. Please retry.</div>
                ) : mines.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No mines registered yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Location</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">License</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Mineral</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {mines.map((mine) => (
                                    <tr key={mine.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{mine.name}</td>
                                        <td className="px-4 py-3 text-slate-700 flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            {mine.location}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{mine.license_number || "-"}</td>
                                        <td className="px-4 py-3 text-slate-700">{mine.mineral_type}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    mine.status === "Active"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                                }`}
                                            >
                                                {mine.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => openEdit(mine)}
                                                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingMine(mine);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingMine ? "Edit Mine / Company" : "Add Mine / Company"}
                                </h3>
                                <p className="text-sm text-slate-500">Maintain accurate mine registry details.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-100"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600">Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g., Nyungwe Gold Mine"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Location</label>
                                <input
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="District, Country"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600">License Number</label>
                                    <input
                                        value={form.license_number}
                                        onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., LIC-2026-001"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Mineral Type</label>
                                    <input
                                        value={form.mineral_type}
                                        onChange={(e) => setForm({ ...form, mineral_type: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Gold, Tin, Lithium..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                    <option>Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isCreating || isUpdating ? "Saving..." : "Save Mine"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && editingMine && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={30} className="text-rose-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Mine</h2>
                            <p className="text-slate-600">
                                Are you sure you want to delete {editingMine.name}? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
