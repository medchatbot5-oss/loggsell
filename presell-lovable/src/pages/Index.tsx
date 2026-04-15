import { useState } from "react";
import { Shield, Check, Loader2 } from "lucide-react";

interface PresellModalProps {
  onComplete: () => void;
}

const PresellModal = ({ onComplete }: PresellModalProps) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const handleCheck = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-y-auto">
      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl text-card-foreground">
          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-center text-xl font-bold text-card-foreground mb-2">
            Verificação Requerida
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Confirme que você é um usuário humano para continuar para a nossa vitrine oficial.
          </p>

          {/* Fake reCAPTCHA */}
          <div className="rounded-md border border-border bg-[hsl(210,20%,97%)] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleCheck}>
              {state === "idle" && (
                <div className="h-6 w-6 rounded border-2 border-muted-foreground/40" />
              )}
              {state === "loading" && (
                <Loader2 className="h-6 w-6 text-primary animate-spin-slow" />
              )}
              {state === "done" && (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
                  <Check className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
              <span className="text-sm text-card-foreground select-none">Não sou um robô</span>
            </div>

            {/* reCAPTCHA branding */}
            <div className="flex flex-col items-center gap-0.5 opacity-60">
              <img
                src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                alt="reCAPTCHA"
                className="h-8 w-8"
              />
              <span className="text-[8px] text-muted-foreground leading-none">reCAPTCHA</span>
              <span className="text-[7px] text-muted-foreground leading-none">
                Privacy - Terms
              </span>
            </div>
          </div>

          {/* CTA Button */}
          {state === "done" && (
            <button
              onClick={onComplete}
              className="mt-6 block w-full rounded-lg bg-primary py-3.5 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 animate-fade-in"
            >
              Continuar para o site
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-footer py-8 px-4 text-center text-footer-foreground text-xs">
        <div className="flex items-center justify-center gap-4 mb-4">
          <a href="#" className="hover:underline">Privacidade</a>
          <span>·</span>
          <a href="#" className="hover:underline">Termos de Uso</a>
          <span>·</span>
          <a href="#" className="hover:underline">Contato</a>
        </div>
        <p className="font-semibold mb-1">Santo Andre Construtora e Incorporadora LTDA</p>
        <p>CNPJ: 07.828.839/0001-61</p>
        <p className="mb-4">Avenida Antonio Artioli 570, 570 - Campinas - SP</p>
        <p className="text-[10px] text-muted-foreground">
          © 2026. Todos os direitos reservados. Esta página não possui vínculo com Google ou Meta.
        </p>
      </footer>
    </div>
  );
};

export default PresellModal;
