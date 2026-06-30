"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Tab = "staff" | "patients";

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
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (auth.role !== "Admin") {
      router.replace("/dashboard");
      return;
    }
    setCheckedAuth(true);
  }, [router]);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [clinicRows, staffRows, motherRows] = await Promise.all([getClinics(), getStaff(), getMotherRecords()]);
      setClinics(clinicRows);
      setStaff(staffRows);
      setMothers(motherRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (checkedAuth) loadAll();
  }, [checkedAuth]);

  if (!checkedAuth) {
    return null;
  }

  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage doctors, nurses, and patients for this clinic.</p>
          </div>

          {error && (
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: "#FCE8EE", borderColor: "#F0ABBE" }}>
              <p className="text-sm font-semibold" style={{ color: "#C94F6D" }}>Couldn&apos;t load admin data</p>
              <p className="text-xs mt-1" style={{ color: "#2D2D2D" }}>{error}</p>
            </div>
          )}

          <div className="flex gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => setTab("staff")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "staff" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Doctors &amp; Nurses
            </button>
            <button
              type="button"
              onClick={() => setTab("patients")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === "patients" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Patients
            </button>
          </div>

          {tab === "staff" ? (
            <StaffPanel clinics={clinics} staff={staff} loading={loading} onChanged={loadAll} />
          ) : (
            <PatientsPanel clinics={clinics} mothers={mothers} loading={loading} onChanged={loadAll} />
          )}
        </div>
      </main>
    </ClinicShell>
  );
}

function StaffPanel({
  clinics,
  staff,
  loading,
  onChanged,
}: {
  clinics: ApiClinic[];
  staff: ApiStaff[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"doctor" | "nurse">("doctor");
  const [clinicId, setClinicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createStaff({ name: name.trim(), role, clinic_id: clinicId || null });
      setName("");
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add staff member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteStaff(id);
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to remove staff member.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Doctor or Nurse</CardTitle>
          <CardDescription>Create a new staff account for this clinic.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rahim Uddin"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "doctor" | "nurse")}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Clinic</label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              >
                <option value="">Unassigned</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {submitting ? "Adding…" : "Add"}
            </Button>
          </form>
          {formError && <p className="mt-2 text-xs text-[#C94F6D]">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${staff.length} staff member(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
              <div>
                <p className="text-sm font-medium text-[#2D2D2D]">{s.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {s.role ?? "staff"} {s.clinic_name ? `· ${s.clinic_name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-[#C94F6D]"
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!loading && staff.length === 0 && <p className="text-sm text-muted-foreground">No staff added yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function PatientsPanel({
  clinics,
  mothers,
  loading,
  onChanged,
}: {
  clinics: ApiClinic[];
  mothers: ApiMotherRecord[];
  loading: boolean;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age) {
      setFormError("Name and age are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createMotherRecord({
        name: name.trim(),
        age: Number(age),
        gestational_age: gestationalAge ? Number(gestationalAge) : null,
        due_date: dueDate || null,
        clinic_id: clinicId || null,
      });
      setName("");
      setAge("");
      setGestationalAge("");
      setDueDate("");
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add patient.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMotherRecord(id);
      onChanged();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to remove patient.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Patient</CardTitle>
          <CardDescription>Register a new mother under this clinic.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fatima Rahman"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputMode="numeric"
                placeholder="27"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Gestational age (weeks)</label>
              <input
                value={gestationalAge}
                onChange={(e) => setGestationalAge(e.target.value)}
                inputMode="numeric"
                placeholder="32"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#2D2D2D]">Clinic</label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none"
              >
                <option value="">Unassigned</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={submitting} className="gap-2 sm:col-span-2 sm:w-fit">
              <UserPlus className="h-4 w-4" />
              {submitting ? "Adding…" : "Add Patient"}
            </Button>
          </form>
          {formError && <p className="mt-2 text-xs text-[#C94F6D]">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>{loading ? "Loading…" : `${mothers.length} patient(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {mothers.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
              <div>
                <p className="text-sm font-medium text-[#2D2D2D]">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  Age {m.age}
                  {m.gestational_age != null ? ` · Week ${m.gestational_age}` : ""}
                  {m.clinic_name ? ` · ${m.clinic_name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-[#C94F6D]"
                aria-label={`Remove ${m.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!loading && mothers.length === 0 && <p className="text-sm text-muted-foreground">No patients added yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
