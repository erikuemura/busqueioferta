import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar no painel" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white">🔥</span>
          busque<span className="text-brand">ioferta</span>
        </div>
        <h1 className="mb-1 text-lg font-bold">Painel administrativo</h1>
        <p className="mb-6 text-sm text-gray-400">Entre para gerenciar ofertas e publicações.</p>
        <LoginForm />
      </div>
    </div>
  );
}
