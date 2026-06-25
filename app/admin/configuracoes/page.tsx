import { getAllSettings } from "@/lib/settings";
import { getConfiguredAdapters } from "@/lib/marketplaces";
import { requireSession } from "../guard";
import { saveSettingsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSession();
  const s = await getAllSettings();

  const integrations = [
    {
      label: "Mercado Livre",
      on: Boolean(process.env.ML_ACCESS_TOKEN || (process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET)),
      note: "exige token/OAuth",
    },
    { label: "Amazon PA-API", on: Boolean(process.env.AMAZON_ACCESS_KEY) },
    { label: "WhatsApp API", on: Boolean(process.env.WHATSAPP_API_URL) },
    { label: "Instagram", on: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN) },
    { label: "Telegram", on: Boolean(process.env.TELEGRAM_BOT_TOKEN) },
    { label: "Redis (filas)", on: Boolean(process.env.REDIS_URL) },
    { label: "Resend (e-mail)", on: Boolean(process.env.RESEND_API_KEY) },
  ];

  const configured = getConfiguredAdapters().map((a) => a.marketplace);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">🔌 Integrações</h2>
        <p className="mb-4 text-sm text-gray-400">
          Chaves de API são lidas das variáveis de ambiente (<code>.env.local</code>) por segurança.
          Adapters prontos para sincronizar agora: <strong>{configured.join(", ") || "nenhum"}</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          {integrations.map((i) => (
            <span
              key={i.label}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                i.on ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-400"
              }`}
            >
              {i.on ? "●" : "○"} {i.label}
              {i.note ? ` (${i.note})` : ""}
            </span>
          ))}
        </div>
      </section>

      <form action={saveSettingsAction} className="space-y-8">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">⚙️ Regras de automação</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Desconto mínimo para publicar (%)" name="minDiscount" value={s.minDiscount} type="number" />
            <Field label="Score mínimo p/ auto-publicar" name="autoScoreThreshold" value={s.autoScoreThreshold} type="number" />
            <Field label="Janela de deduplicação (dias)" name="dedupWindowDays" value={s.dedupWindowDays} type="number" />
            <Field label="Verificações até expirar" name="notFoundThreshold" value={s.notFoundThreshold} type="number" />
            <Field label="Máx. posts/dia Instagram" name="maxInstagramPerDay" value={s.maxInstagramPerDay} type="number" />
            <Field label="Máx. posts/dia TikTok" name="maxTiktokPerDay" value={s.maxTiktokPerDay} type="number" />
            <Field label="Horários de publicação" name="publishTimes" value={s.publishTimes} />
            <Field label="Termos de busca (sync ML)" name="searchQueries" value={s.searchQueries} />
          </div>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">📝 Templates de legenda</h2>
          <p className="text-xs text-gray-500">
            Variáveis: {"{titulo} {marketplace} {precoOriginal} {preco} {desconto} {link} {perfil}"}
          </p>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">WhatsApp / Telegram</span>
            <textarea name="whatsappTemplate" defaultValue={s.whatsappTemplate} rows={12} className="input font-mono text-xs" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Instagram / TikTok</span>
            <textarea name="instagramTemplate" defaultValue={s.instagramTemplate} rows={3} className="input font-mono text-xs" />
          </label>
        </section>

        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">💬 Grupos de WhatsApp & canais</h2>
          <p className="text-xs text-gray-500">
            Cole os links de convite. Os clientes veem os grupos do nicho que escolheram na área “Minha conta”.
          </p>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Grupo geral (chat.whatsapp.com/...)</span>
            <input name="whatsappGroupDefault" defaultValue={s.whatsappGroupDefault} className="input" placeholder="https://chat.whatsapp.com/..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">
              Grupos por categoria (JSON) — ex: {`{"ELETRONICOS":"https://chat.whatsapp.com/abc","GAMES":"https://chat.whatsapp.com/xyz"}`}
            </span>
            <textarea name="whatsappGroups" defaultValue={s.whatsappGroups} rows={5} className="input font-mono text-xs" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-400">Canal do Telegram (t.me/...)</span>
            <input name="telegramChannel" defaultValue={s.telegramChannel} className="input" placeholder="https://t.me/..." />
          </label>
        </section>

        <button className="btn-brand">Salvar configurações</button>
      </form>

      <style>{`.input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:0.6rem;padding:0.55rem 0.75rem;font-size:0.9rem;color:#e8eaed}`}</style>
    </div>
  );
}

function Field({ label, name, value, type = "text" }: { label: string; name: string; value: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      <input name={name} defaultValue={value} type={type} className="input" />
    </label>
  );
}
