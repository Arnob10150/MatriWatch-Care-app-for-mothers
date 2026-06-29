"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center" style={{ boxShadow: "0 4px 24px rgba(201,124,138,0.12)" }}>
        <h1 className="text-xl font-bold" style={{ color: "#C97C8A" }}>
          Something went wrong
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#7A7A8A" }}>
          An unexpected error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white"
          style={{ backgroundColor: "#C97C8A" }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
