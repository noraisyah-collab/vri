"use client";

import { useCallback, useRef, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Sekatan ringkas sebelum tindakan padam — minta kata laluan admin yang
 * disahkan di server (bukan disimpan dalam kod client) supaya orang lain
 * yang ada link tak boleh padam entri sesuka hati.
 */
export function useAdminGate() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const requireAdmin = useCallback(() => {
    setPassword("");
    setError(null);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  async function handleSubmit() {
    if (!password) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setOpen(false);
        resolverRef.current?.(true);
      } else {
        setError("Kata laluan salah.");
      }
    } catch {
      setError("Gagal sahkan. Sila cuba lagi.");
    }
    setChecking(false);
  }

  function handleCancel() {
    setOpen(false);
    resolverRef.current?.(false);
  }

  const gateElement = (
    <Modal open={open} onClose={handleCancel} title="Sahkan Kata Laluan Admin">
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Tindakan padam memerlukan kata laluan admin supaya entri tak terpadam
          tanpa sengaja.
        </p>
        <input
          type="password"
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleCancel} disabled={checking}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={checking || !password}>
            {checking ? "Menyemak..." : "Sahkan"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { requireAdmin, gateElement };
}
