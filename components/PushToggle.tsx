"use client";

import { useEffect, useState } from "react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "loading" | "unsupported" | "off" | "on" | "denied" | "busy";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!VAPID || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID!) as unknown as BufferSource,
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      setState("on");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  if (state === "loading") return null;

  return (
    <div className="card p-5">
      <h2 className="font-bold">Notificações no navegador 🔔</h2>
      {state === "unsupported" ? (
        <p className="mt-1 text-sm text-gray-500">Seu navegador não suporta notificações push.</p>
      ) : state === "denied" ? (
        <p className="mt-1 text-sm text-amber-400">
          Notificações bloqueadas. Libere nas configurações do navegador para este site.
        </p>
      ) : (
        <>
          <p className="mb-3 mt-1 text-sm text-gray-400">
            Receba um alerta na hora em que surgir uma oferta quente do seu interesse.
          </p>
          {state === "on" ? (
            <button onClick={disable} className="btn-ghost w-full text-sm">
              ✓ Ativadas — desativar
            </button>
          ) : (
            <button onClick={enable} disabled={state === "busy"} className="btn-brand w-full text-sm disabled:opacity-60">
              {state === "busy" ? "Aguarde…" : "Ativar notificações"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
