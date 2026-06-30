import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Screen } from "@/components/screen";
import { clearAuth, getAuth, setAuth, type MotherAuth } from "@/lib/auth";
import { fetchMother, updateMother, type ApiMother } from "@/lib/matriwatch-api";

const INPUT_BASE =
  "rounded-xl border border-[#EDE8E3] bg-white px-4 py-3 text-sm text-[#2D2D2D]";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-[#EDE8E3] pb-3">
      <Text className="text-sm text-mutedText">{label}</Text>
      <Text className="text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [auth, setAuthState] = useState<MotherAuth | null>(null);
  const [mother, setMother] = useState<ApiMother | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWeeks, setEditWeeks] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadProfile = useCallback(async () => {
    const a = await getAuth();
    setAuthState(a);
    if (a?.motherId) {
      const m = await fetchMother(a.motherId);
      setMother(m);
    }
    setLoadingProfile(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function openEdit() {
    setSaveError("");
    setEditName(mother?.name ?? auth?.name ?? "");
    setEditAge(mother?.age != null ? String(mother.age) : "");
    setEditWeeks(mother?.gestational_age != null ? String(mother.gestational_age) : "");
    setEditDueDate(mother?.due_date ?? "");
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editName.trim()) { setSaveError("Name is required."); return; }
    if (!editAge || isNaN(Number(editAge))) { setSaveError("Valid age is required."); return; }

    const motherId = auth?.motherId;
    if (!motherId) { setSaveError("No account linked — log out and sign in again."); return; }

    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateMother(motherId, {
        name: editName.trim(),
        age: Number(editAge),
        gestational_age: editWeeks ? Number(editWeeks) : null,
        due_date: editDueDate.trim() || null,
      });

      if (!updated) {
        setSaveError("Could not save. Check your connection and try again.");
        return;
      }

      setMother(updated);

      // Keep auth name in sync
      if (auth && updated.name !== auth.name) {
        const newAuth: MotherAuth = { ...auth, name: updated.name };
        await setAuth(newAuth);
        setAuthState(newAuth);
      }

      setEditOpen(false);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await clearAuth();
    router.replace("/login");
  }

  const displayName = auth?.name ?? "Guest";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Screen>
      {/* ── Profile card ── */}
      <View className="rounded-2xl border border-[#EDE8E3] bg-white p-5 shadow-sm">
        <View className="flex-row items-center gap-4 mb-5">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">{initials || "?"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-ink">{displayName}</Text>
            {loadingProfile ? (
              <ActivityIndicator size="small" color="#C97C8A" style={{ marginTop: 4 }} />
            ) : (
              <Text className="mt-1 text-sm text-mutedText">
                {mother?.age != null ? `${mother.age} years old` : "—"}
                {mother?.gestational_age != null ? `, ${mother.gestational_age} weeks pregnant` : ""}
              </Text>
            )}
          </View>
        </View>

        <View className="gap-3">
          <InfoRow
            label="Due date"
            value={mother?.due_date ?? "Not set"}
          />
          <InfoRow
            label="Gestational age"
            value={mother?.gestational_age != null ? `Week ${mother.gestational_age}` : "Not set"}
          />
          <View className="flex-row justify-between">
            <Text className="text-sm text-mutedText">Age</Text>
            <Text className="text-sm font-semibold text-ink">
              {mother?.age != null ? `${mother.age} years` : "Not set"}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Edit button ── */}
      <TouchableOpacity
        onPress={openEdit}
        className="min-h-12 items-center justify-center rounded-xl border border-primary bg-white p-4"
      >
        <Text className="font-semibold text-primary">Edit Details</Text>
      </TouchableOpacity>

      {/* ── Sign out ── */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="min-h-12 items-center justify-center p-4"
      >
        <Text className="font-semibold text-mutedText">Sign Out</Text>
      </TouchableOpacity>

      {/* ── Edit modal ── */}
      <Modal visible={editOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <View className="rounded-t-3xl bg-white px-6 pt-6 pb-10">
              {/* Handle bar */}
              <View className="mb-5 items-center">
                <View className="h-1 w-12 rounded-full bg-[#EDE8E3]" />
              </View>

              <Text className="mb-1 text-xl font-bold text-[#2D2D2D]">Edit Details</Text>
              <Text className="mb-6 text-sm text-[#7A7A8A]">
                Update your personal and pregnancy information.
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="gap-4">
                  {/* Name */}
                  <View>
                    <Text className="mb-1.5 text-xs font-medium text-[#2D2D2D]">Full name</Text>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Your name"
                      placeholderTextColor="#AEAEB8"
                      className={INPUT_BASE}
                    />
                  </View>

                  {/* Age */}
                  <View>
                    <Text className="mb-1.5 text-xs font-medium text-[#2D2D2D]">Age</Text>
                    <TextInput
                      value={editAge}
                      onChangeText={setEditAge}
                      placeholder="e.g. 27"
                      placeholderTextColor="#AEAEB8"
                      keyboardType="numeric"
                      className={INPUT_BASE}
                    />
                  </View>

                  {/* Weeks pregnant */}
                  <View>
                    <Text className="mb-1.5 text-xs font-medium text-[#2D2D2D]">
                      Weeks pregnant{" "}
                      <Text className="text-[#AEAEB8] font-normal">(optional)</Text>
                    </Text>
                    <TextInput
                      value={editWeeks}
                      onChangeText={setEditWeeks}
                      placeholder="e.g. 32"
                      placeholderTextColor="#AEAEB8"
                      keyboardType="numeric"
                      className={INPUT_BASE}
                    />
                  </View>

                  {/* Due date */}
                  <View>
                    <Text className="mb-1.5 text-xs font-medium text-[#2D2D2D]">
                      Due date{" "}
                      <Text className="text-[#AEAEB8] font-normal">(YYYY-MM-DD, optional)</Text>
                    </Text>
                    <TextInput
                      value={editDueDate}
                      onChangeText={setEditDueDate}
                      placeholder="e.g. 2026-09-15"
                      placeholderTextColor="#AEAEB8"
                      className={INPUT_BASE}
                    />
                  </View>

                  {/* Error */}
                  {saveError ? (
                    <View className="rounded-xl border border-[#F9B8C4] bg-[#FFF3F6] px-4 py-3">
                      <Text className="text-xs text-[#C94F6D]">{saveError}</Text>
                    </View>
                  ) : null}

                  {/* Actions */}
                  <View className="flex-row gap-3 pt-2">
                    <TouchableOpacity
                      onPress={() => setEditOpen(false)}
                      className="flex-1 items-center justify-center rounded-xl border border-[#EDE8E3] bg-white py-3"
                    >
                      <Text className="font-semibold text-[#7A7A8A]">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={saving}
                      className="flex-1 items-center justify-center rounded-xl bg-primary py-3"
                      style={{ opacity: saving ? 0.65 : 1 }}
                    >
                      {saving ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="font-semibold text-white">Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}
