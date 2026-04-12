import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Fingerprint, CheckCircle2, Package, Stamp, FileCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import loggiLogo from "@/assets/loggi-logo.png";
import receitaLogo from "@/assets/receita-logo.png";
import packageSignatureImg from "@/assets/package-signature.jpg";

interface BiometricProps {
  userName: string;
  maskedCpf: string;
  onConfirm: () => void;
  onBack: () => void;
}

const BiometricVerification = ({ userName, maskedCpf, onConfirm, onBack }: BiometricProps) => {
  const [verifyStep, setVerifyStep] = useState<"finger" | "finger-scanning" | "finger-done" | "complete">("finger");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [packageWithSignature, setPackageWithSignature] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "hsl(215, 100%, 21%)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, [verifyStep]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const compositeSignatureOnPackage = (sigDataUrl: string) => {
    const pkgImg = new Image();
    pkgImg.crossOrigin = "anonymous";
    pkgImg.onload = () => {
      const offscreen = document.createElement("canvas");
      offscreen.width = pkgImg.width;
      offscreen.height = pkgImg.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(pkgImg, 0, 0);

      const sigImg = new Image();
      sigImg.onload = () => {
        const sigW = pkgImg.width * 0.45;
        const sigH = sigW * (sigImg.height / sigImg.width);
        const sigX = pkgImg.width * 0.3;
        const sigY = pkgImg.height * 0.35;
        ctx.globalAlpha = 0.85;
        ctx.drawImage(sigImg, sigX, sigY, sigW, sigH);
        ctx.globalAlpha = 1;
        setPackageWithSignature(offscreen.toDataURL("image/jpeg", 0.9));
      };
      sigImg.src = sigDataUrl;
    };
    pkgImg.src = packageSignatureImg;
  };

  const handleFingerConfirm = () => {
    if (canvasRef.current) {
      const sigUrl = canvasRef.current.toDataURL("image/png");
      setSignatureDataUrl(sigUrl);
      compositeSignatureOnPackage(sigUrl);
    }
    setVerifyStep("finger-scanning");
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setVerifyStep("finger-done"), 300);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
  };

  return (
    <section>
      {/* Loggi bar */}
      <div className="w-full py-3.5 px-4 flex items-center justify-center" style={{ background: "#0055FF", borderBottom: "1px solid #0044CC" }}>
        <img src={loggiLogo} alt="Loggi" className="h-14 w-auto" />
      </div>
      <div className="w-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide" style={{ background: "#0044CC", color: "#ffffff" }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Conexão Segura SSL • Verificação Biométrica ✓</span>
      </div>
      <div className="w-full" style={{ background: "hsl(var(--navy))" }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src={receitaLogo} alt="Receita Federal" className="h-12 w-auto rounded-md" />
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold tracking-wide text-primary-foreground">Verificação de Identidade</div>
            <div className="flex items-center justify-end gap-1.5 text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="dot-online" />
              <span>Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#f0f0ee" }} className="pb-16 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-lg px-4">

          <h1 className="text-xl font-bold text-foreground mb-1">Confirmação Biométrica</h1>
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{userName}</span> • CPF: {maskedCpf}
          </p>
          <p className="text-xs text-muted-foreground mb-6">Para segurança, confirme sua identidade com assinatura digital.</p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold" style={{
                background: "hsl(var(--navy))",
                color: "#fff",
              }}>
                {verifyStep === "finger-done" || verifyStep === "complete" ? <CheckCircle2 className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-[11px] font-semibold text-foreground">Assinatura Digital</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {verifyStep === "finger" && (
              <motion.div key="finger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div className="rounded-xl overflow-hidden bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <div className="px-5 py-4" style={{ background: "hsl(var(--navy))" }}>
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-primary-foreground" />
                      <span className="text-sm font-bold text-primary-foreground">Assinatura Digital</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground mb-4">Use o dedo ou mouse para assinar no campo abaixo. Esta assinatura será vinculada à confirmação do seu CPF.</p>
                    <div className="rounded-lg overflow-hidden mb-4" style={{ border: "2px dashed hsl(var(--border))" }}>
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="w-full cursor-crosshair touch-none"
                        style={{ height: "160px" }}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                      />
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mb-4">Assine com o dedo ou mouse no campo acima</p>
                    <button
                      className="btn-consultar"
                      disabled={!hasDrawn}
                      style={{ opacity: hasDrawn ? 1 : 0.5 }}
                      onClick={handleFingerConfirm}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Confirmar Assinatura
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {verifyStep === "finger-scanning" && (
              <motion.div key="finger-scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="rounded-xl overflow-hidden bg-card p-8 text-center" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <div className="relative mx-auto w-24 h-24 mb-5">
                    <div className="absolute inset-0 rounded-full" style={{ border: "3px solid hsl(var(--border))" }} />
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--navy))" strokeWidth="3" strokeDasharray={`${scanProgress * 2.89} 289`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Fingerprint className="h-10 w-10 animate-pulse" style={{ color: "hsl(var(--navy))" }} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">Verificando assinatura...</p>
                  <p className="text-xs text-muted-foreground">{scanProgress}% concluído</p>
                </div>
              </motion.div>
            )}

            {verifyStep === "finger-done" && (
              <motion.div key="finger-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="rounded-xl overflow-hidden bg-card" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <div className="px-5 py-4" style={{ background: "hsl(var(--navy))" }}>
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-primary-foreground" />
                      <span className="text-sm font-bold text-primary-foreground">Comprovante de Assinatura Digital</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="rounded-lg p-5 relative" style={{ background: "#fffef7", border: "1px solid hsl(210, 20%, 85%)", boxShadow: "inset 0 0 30px rgba(0,0,0,0.03)" }}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                        <span className="text-6xl font-bold rotate-[-25deg]" style={{ color: "#0055FF" }}>LOGGI</span>
                      </div>

                      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "2px solid #0055FF" }}>
                        <div className="flex items-center gap-2">
                          <img src={loggiLogo} alt="Loggi" className="h-8 w-auto" />
                          <div>
                            <p className="text-[9px] font-bold" style={{ color: "#1a1a1a" }}>LOGGI</p>
                            <p className="text-[9px] font-bold" style={{ color: "#1a1a1a" }}>TECNOLOGIA S.A.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-muted-foreground">PROTOCOLO Nº</p>
                          <p className="text-[10px] font-mono font-bold text-foreground">{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                        </div>
                      </div>

                      <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#0044CC" }}>
                        Declaração de Confirmação de Identidade
                      </p>

                      <div className="space-y-2 mb-4 text-[11px]">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground font-medium w-24 shrink-0">Titular:</span>
                          <span className="font-semibold text-foreground">{userName}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground font-medium w-24 shrink-0">CPF:</span>
                          <span className="font-semibold text-foreground">{maskedCpf}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground font-medium w-24 shrink-0">Data:</span>
                          <span className="font-semibold text-foreground">{new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground font-medium w-24 shrink-0">Status:</span>
                          <span className="font-bold flex items-center gap-1" style={{ color: "hsl(145, 60%, 35%)" }}>
                            <CheckCircle2 className="h-3 w-3" />
                            Identidade Verificada
                          </span>
                        </div>
                      </div>

                      <div className="h-px mb-3" style={{ background: "hsl(210, 20%, 88%)" }} />

                      <p className="text-[9px] text-muted-foreground mb-2">Assinatura do Titular:</p>

                      <div className="rounded-md mb-3 mx-auto" style={{ border: "1px solid hsl(210, 20%, 88%)", background: "#fff", maxWidth: "280px" }}>
                        {signatureDataUrl && (
                          <img src={signatureDataUrl} alt="Assinatura" className="w-full h-auto" style={{ maxHeight: "80px", objectFit: "contain" }} />
                        )}
                      </div>

                      <p className="text-[9px] text-muted-foreground mb-2 mt-3">Registro fotográfico do pacote assinado:</p>
                      <div className="rounded-md overflow-hidden mb-3 mx-auto" style={{ border: "1px solid hsl(210, 20%, 88%)", maxWidth: "280px" }}>
                        <img src={packageWithSignature || packageSignatureImg} alt="Pacote com assinatura" className="w-full h-auto" loading="lazy" style={{ maxHeight: "180px", objectFit: "cover" }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "2px solid hsl(145, 60%, 42%)", background: "hsl(145, 60%, 95%)" }}>
                            <Stamp className="h-5 w-5" style={{ color: "hsl(145, 60%, 35%)" }} />
                          </div>
                          <div>
                            <p className="text-[8px] font-bold" style={{ color: "hsl(145, 60%, 35%)" }}>AUTENTICADO</p>
                            <p className="text-[7px] text-muted-foreground">Documento válido</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-muted-foreground">Verificação digital</p>
                          <p className="text-[8px] font-mono font-bold" style={{ color: "#0044CC" }}>
                            {Array.from({length: 4}, () => Math.random().toString(16).substring(2, 6).toUpperCase()).join("-")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="btn-consultar mt-5" onClick={() => setVerifyStep("complete")}>
                      <ArrowRight className="h-4 w-4" />
                      Prosseguir para Pagamento
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {verifyStep === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="rounded-xl overflow-hidden bg-card p-8 text-center" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "hsl(145, 60%, 95%)" }}>
                    <ShieldCheck className="h-10 w-10" style={{ color: "hsl(145, 60%, 42%)" }} />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">Verificação Completa!</p>
                  <p className="text-xs text-muted-foreground mb-5">Assinatura digital confirmada. Você pode prosseguir para o pagamento.</p>
                  <button className="btn-consultar" onClick={onConfirm}>
                    <ArrowRight className="h-4 w-4" />
                    Prosseguir para Pagamento
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-1.5 rounded-full mt-6 mb-5" style={{ background: "linear-gradient(90deg, hsl(var(--navy-dark)), hsl(var(--navy)), hsl(var(--navy-dark)))" }} />

          <button className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground w-full hover:text-foreground transition-colors" onClick={onBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </motion.div>
      </div>

      {/* Rodapé */}
      <div className="w-full py-6 px-4" style={{ background: "#0055FF", borderTop: "3px solid #0044CC" }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={loggiLogo} alt="Loggi" className="h-10 w-auto" />
          </div>
          <div className="text-center text-xs leading-relaxed" style={{ color: "#ffffff" }}>
            <p className="font-bold mb-1">Academia Ibarra LTDA</p>
            <p>CNPJ: 61.320.366/0001-32</p>
            <p className="mt-1">Endereço: Avenida Dos Imigrantes, 475 - Rio Branco - MT - 78275-000</p>
            <p className="mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BiometricVerification;
