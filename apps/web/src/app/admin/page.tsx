"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  UserPlus,
  Users,
  Heart,
  Stethoscope,
  Building2,
  RefreshCw,
  AlertCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { getAuth } from "@/lib/auth";
import {
  createMotherRecord,
  createStaff,
  deleteMotherRecord,
  deleteStaff,
  getClinics,
  getMotherRecords,
  getStaff,
  type ApiClinic,
  type ApiMotherRecord,
  type ApiStaff,
} from "@/lib/admin-api";

type Tab = "staff" | "patients" | "clinics";

const INPUT =
  "w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[#F9B8C4]";
const INPUT_STYLE = { borderColor: "#EDE8E3", color: "#2D2D2D", backgroundColor: "#FFFFFF" };

export default function AdminPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [tab, setTab] = useState<Tab>("staff");

  const [clinics, setClinics] = useState<ApiClinic[]>([]);
  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [mothers, setMothers] = useState<ApiMotherRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.replace("/login"); return; }
    if (auth.role !== "Admin") { router.replace("/dashboard"); return; }
    setCheckedAuth(true);
  }, [router]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [clinicRows, staffRows, motherRows] = await Promise.all([
        getClinics(), getStaff(), getMotherRecords(),
      ]);
      setClinics(clinicRows);
      setStaff(staffRows);
      setMothers(motherRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (checkedAuth) loadAll(); }, [checkedAuth]);

  if (!checkedAuth) return null;

  const doctors = staff.filter((s) => s.role === "doctor");
  const nurses  = staff.filter((s) => s.role === "nurse");

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number; color: string }[] = [
    { id: "staff",    label: "Staff",    icon: Users,     count: staff.length,   color: "#7A5A92" },
    { id: "patients", label: "Patients", icon: Heart,     count: mothers.length, color: "#C94F6D" },
    { id: "clinics",  label: "Clinics",  icon: Building2, count: clinics.length, color: "#87A878" },
  ];

  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={{ backgroundColor: "#FFF8F0" }}>
        <div className="mx-auto max-w-5xl space-y-8">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FCE8EE" }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: "#C97C8A" }} />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: "#2D2D2D" }}>Account Management</h1>
              </div>
              <p className="text-sm ml-13" style={{ color: "#7A7A8A" }}>
                Manage clinic staff, patients, and facilities from one place.
              </p>
            </div>
            <button
              onClick={loadAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: "#EDE8E3", color: "#7A7A8A", backgroundColor: "white" }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Staff",  value: staff.length,   color: "#7A5A92", bg: "#F3ECF9", icon: Users },
              { label: "Doctors",      value: doctors.length, color: "#C97C8A", bg: "#FCE8EE", icon: Stethoscope },
              { label: "Nurses",       value: nurses.length,  color: "#87A878", bg: "#F0F7ED", icon: Users },
              { label: "Patients",     value: mothers.length, color: "#C94F6D", bg: "#FCE8EE", icon: Heart },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#EDE8E3", boxShadow: "0 2px 8px rgba(201,124,138,0.06)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: card.color }}>
                    {loading ? "—" : card.value}
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: "#7A7A8A" }}>{card.label}</div>
                </div>
              );
            })}
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl p-4 border" style={{ backgroundColor: "#FFF3F6", borderColor: "#F9B8C4" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C94F6D" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#C94F6D" }}>Couldn&apos;t load data</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>{error}</p>
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#EDE8E3", boxShadow: "0 2px 8px rgba(201,124,138,0.06)" }}>
            {/* Tab bar */}
            <div className="flex border-b" style={{ borderColor: "#EDE8E3" }}>
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2"
                    style={{
                      borderColor: active ? t.color : "transparent",
                      color: active ? t.color : "#7A7A8A",
                      backgroundColor: active ? t.color + "08" : "transparent",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: active ? t.color + "18" : "#F3F3F3", color: active ? t.color : "#AEAEB8" }}
                    >
                      {loading ? "…" : t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {tab === "staff"    && <StaffPanel    clinics={clinics} staff={staff}     loading={loading} onChanged={loadAll} />}
              {tab === "patients" && <PatientsPanel clinics={clinics} mothers={mothers} loading={loading} onChanged={loadAll} />}
              {tab === "clinics"  && <ClinicsPanel  clinics={clinics} loading={loading} />}
            </div>
          </div>

        </div>
      </main>
    </ClinicShell>
  );
}

/* ─────────────────────────── Staff Panel ─────────────────────────── */
function StaffPanel({ clinics, staff, loading, onChanged }: {
  clinics: ApiClinic[]; staff: ApiStaff[]; loading: boolean; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"doctor" | "nurse">("doctor");
  const [clinicId, setClinicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setFormError("Name is required."); return; }
    setSubmitting(true); setFormError(null);
    try {
      await createStaff({ name: name.trim(), role, clinic_id: clinicId || null });
      setName("");
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add staff.");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteStaff(id); onChanged(); }
    catch (err) { setFormError(err instanceof Error ? err.message : "Failed to remove."); }
  }

  const filtered = staff.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.role ?? "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border p-5" style={{ borderColor: "#EDE8E3", backgroundColor: "#FFF8F0" }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#2D2D2D" }}>
          <UserPlus className="w-4 h-4" style={{ color: "#7A5A92" }} />
          Add Staff Member
        </h3>
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Rahim Uddin" className={INPUT} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as "doctor" | "nurse")} className={INPUT} style={INPUT_STYLE}>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse / CHW</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Clinic</label>
            <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} className={INPUT} style={INPUT_STYLE}>
              <option value="">Unassigned</option>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3 flex items-center justify-between">
            {formError && <p className="text-xs" style={{ color: "#C94F6D" }}>{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#7A5A92" }}
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Adding…" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#AEAEB8" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff…"
          className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none"
          style={INPUT_STYLE}
        />
      </div>

      {/* Staff list */}
      <div className="space-y-2">
        {loading && <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>No staff found.</p>
        )}
        {filtered.map((s) => {
          const isDoctor = s.role === "doctor";
          return (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow" style={{ borderColor: "#EDE8E3" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: isDoctor ? "#FCE8EE" : "#F0F7ED", color: isDoctor ? "#C97C8A" : "#87A878" }}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>{s.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>
                    <span className="capitalize">{s.role ?? "Staff"}</span>
                    {s.clinic_name ? ` · ${s.clinic_name}` : " · Unassigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                  style={{ backgroundColor: isDoctor ? "#FCE8EE" : "#F0F7ED", color: isDoctor ? "#C97C8A" : "#87A878" }}
                >
                  {s.role ?? "staff"}
                </span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                  style={{ color: "#AEAEB8" }}
                  aria-label={`Remove ${s.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── Patients Panel ─────────────────────────── */
function PatientsPanel({ clinics, mothers, loading, onChanged }: {
  clinics: ApiClinic[]; mothers: ApiMotherRecord[]; loading: boolean; onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age) { setFormError("Name and age are required."); return; }
    setSubmitting(true); setFormError(null);
    try {
      await createMotherRecord({
        name: name.trim(), age: Number(age),
        gestational_age: gestationalAge ? Number(gestationalAge) : null,
        due_date: dueDate || null, clinic_id: clinicId || null,
      });
      setName(""); setAge(""); setGestationalAge(""); setDueDate("");
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add patient.");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try { await deleteMotherRecord(id); onChanged(); }
    catch (err) { setFormError(err instanceof Error ? err.message : "Failed to remove."); }
  }

  const filtered = mothers.filter((m) =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || (m.clinic_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border p-5" style={{ borderColor: "#EDE8E3", backgroundColor: "#FFF8F0" }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "#2D2D2D" }}>
          <UserPlus className="w-4 h-4" style={{ color: "#C94F6D" }} />
          Add Patient
        </h3>
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fatima Rahman" className={INPUT} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Age</label>
            <input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder="27" className={INPUT} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Gestational age (weeks)</label>
            <input value={gestationalAge} onChange={(e) => setGestationalAge(e.target.value)} inputMode="numeric" placeholder="32" className={INPUT} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Due date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT} style={INPUT_STYLE} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#2D2D2D" }}>Clinic</label>
            <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} className={INPUT} style={INPUT_STYLE}>
              <option value="">Unassigned</option>
              {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            {formError && <p className="text-xs" style={{ color: "#C94F6D" }}>{formError}</p>}
            <button
              type="submit" disabled={submitting}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#C94F6D" }}
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Adding…" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#AEAEB8" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients…" className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none" style={INPUT_STYLE} />
      </div>

      {/* Patient list */}
      <div className="space-y-2">
        {loading && <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>No patients found.</p>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-2xl border bg-white p-4 hover:shadow-sm transition-shadow" style={{ borderColor: "#EDE8E3" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#FCE8EE", color: "#C94F6D" }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2D2D2D" }}>{m.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>
                  Age {m.age}
                  {m.gestational_age != null ? ` · Week ${m.gestational_age}` : ""}
                  {m.due_date ? ` · Due ${m.due_date}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {m.clinic_name && (
                <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F0F7ED", color: "#87A878" }}>
                  {m.clinic_name}
                </span>
              )}
              <button
                onClick={() => handleDelete(m.id)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                style={{ color: "#AEAEB8" }}
                aria-label={`Remove ${m.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Clinics Panel ─────────────────────────── */
function ClinicsPanel({ clinics, loading }: { clinics: ApiClinic[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-5" style={{ borderColor: "#EDE8E3", backgroundColor: "#FFF8F0" }}>
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: "#2D2D2D" }}>
          <Building2 className="w-4 h-4" style={{ color: "#87A878" }} />
          Registered Clinics
        </h3>
        <p className="text-xs mb-0" style={{ color: "#7A7A8A" }}>Clinic records are managed via the local database seed.</p>
      </div>

      {loading && <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>Loading…</p>}
      {!loading && clinics.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: "#7A7A8A" }}>No clinics found.</p>
      )}
      {clinics.map((c) => (
        <div key={c.id} className="flex items-start gap-4 rounded-2xl border bg-white p-5" style={{ borderColor: "#EDE8E3" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F0F7ED" }}>
            <Building2 className="w-5 h-5" style={{ color: "#87A878" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: "#2D2D2D" }}>{c.name}</p>
            {c.location && <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>{c.location}</p>}
            {c.contact  && <p className="text-xs mt-0.5" style={{ color: "#7A7A8A" }}>{c.contact}</p>}
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: "#F0F7ED", color: "#87A878" }}>
            Active
          </span>
        </div>
      ))}
    </div>
  );
}
