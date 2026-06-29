"use client";

import { useEffect, useState } from "react";
import { ClinicShell } from "@/components/layout/clinic-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ALERT_RULES = ["High BP alert", "High blood sugar alert", "Fever alert", "EPDS score 10+ alert"] as const;

const STORAGE_KEY = "matriwatch_alert_settings";

type AlertSettings = Record<string, boolean>;

function defaultSettings(): AlertSettings {
  return Object.fromEntries(ALERT_RULES.map((rule) => [rule, true]));
}

function loadSettings(): AlertSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function toggleRule(rule: string) {
    setSettings((prev) => ({ ...prev, [rule]: !prev[rule] }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  }

  return (
    <ClinicShell>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Clinic profile and alert preferences.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Clinic Alert Rules</CardTitle>
              <CardDescription>High-risk vitals and EPDS flags are sent to the clinic dashboard automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ALERT_RULES.map((rule) => {
                const enabled = settings[rule];
                return (
                  <div key={rule} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
                    <span className="text-sm font-medium text-[#2D2D2D]">{rule}</span>
                    <button
                      type="button"
                      onClick={() => toggleRule(rule)}
                      className="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                      style={
                        enabled
                          ? { backgroundColor: "#F0F7ED", color: "#87A878" }
                          : { backgroundColor: "#F3EFEC", color: "#9A9A9A" }
                      }
                    >
                      {enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                );
              })}
              <Button className="w-full" onClick={handleSave}>
                {saved ? "Saved!" : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </ClinicShell>
  );
}
