import { Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12" style={{ background: "#152238", borderTop: "3px solid #2c3e6b" }}>
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: "#0055FF" }}>
                <Package className="h-4 w-4" style={{ color: "#ffffff" }} />
              </div>
              <span className="text-base font-bold font-['Plus_Jakarta_Sans']" style={{ color: "#ffffff" }}>Sistema Integrado</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Central de atendimento para acompanhamento e suporte de entregas postais em todo o Brasil.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#0055FF" }}>Institucional</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Sobre nós</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Termos de uso</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Política de privacidade</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#0055FF" }}>Suporte</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#consultar" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Consultar pedido</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Central de ajuda</a></li>
              <li><a href="#" className="transition-colors hover:underline" style={{ color: "rgba(255,255,255,0.5)" }}>Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
          <p className="font-bold mb-1">Santo Andre Construtora e Incorporadora LTDA</p>
          <p>CNPJ: 07.828.839/0001-61</p>
          <p className="mt-1">Endereço: Avenida Antonio Artioli 570, 570 - Campinas - SP</p>
          <p className="mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
