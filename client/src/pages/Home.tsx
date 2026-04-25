import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Redirect, Link } from "wouter";
import { Users, BarChart3, Clock, CheckCircle2, ArrowRight, Sparkles, Zap, ShieldCheck, Star, Rocket, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (isAuthenticated && !loading) {
    return <Redirect to="/dashboard" />;
  }

  // Partículas de Pêras caindo - Aumentadas e mais visíveis
  const pears = Array.from({ length: 12 });

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative bg-[#F8F7E5]">
      <div className="noise-bg opacity-10" />
      
      {/* Pears Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pears.map((_, i) => (
          <motion.img
            key={i}
            src="/logo.png"
            alt="Pêra particle"
            className="absolute w-16 h-16 opacity-15"
            initial={{ 
              top: -100, 
              left: `${Math.random() * 100}%`, 
              rotate: Math.random() * 360
            }}
            animate={{ 
              top: "110%", 
              rotate: 360,
              left: `${(Math.random() * 100)}%`
            }}
            transition={{ 
              duration: 15 + Math.random() * 15, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/10 bg-white/60 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto flex items-center justify-between h-24 px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pêra Logo" className="w-16 h-16 object-contain animate-float drop-shadow-sm" />
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-black text-foreground uppercase tracking-widest">
            <a href="#features" className="hover:text-primary transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login">
              <Button variant="ghost" className="font-black text-base uppercase tracking-tighter hover:bg-primary/10 text-foreground">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-black rounded-full px-10 bg-foreground text-background h-14 text-base border-none">
                TESTAR GRÁTIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 md:pt-64 md:pb-48">
        <div className="container max-w-6xl mx-auto relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground font-black mb-10 uppercase tracking-[0.2em] text-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-foreground">A revolução do agendamento</span>
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-foreground mb-8 leading-[0.8] drop-shadow-sm">
              Papel e caneta?<br />
              <span className="text-primary italic">Pera aí né...</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-foreground/80 max-w-3xl mx-auto mb-16 font-bold leading-tight drop-shadow-sm">
              O SaaS que transforma sua correria em lucro no automático. Simples como colher uma fruta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-32">
              <Button size="lg" asChild className="h-24 px-16 text-2xl font-black rounded-full btn-hover-effect shadow-2xl bg-primary text-primary-foreground border-none">
                <a href="/register">QUERO COMEÇAR AGORA</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto border-t border-black/10 pt-16">
              <div className="flex flex-col items-center gap-3 font-black text-sm uppercase tracking-widest text-foreground">
                <ShieldCheck className="w-8 h-8 text-primary" /> 100% Seguro
              </div>
              <div className="flex flex-col items-center gap-3 font-black text-sm uppercase tracking-widest text-foreground">
                <Zap className="w-8 h-8 text-primary" /> Setup Instantâneo
              </div>
              <div className="flex flex-col items-center gap-3 font-black text-sm uppercase tracking-widest text-foreground">
                <Clock className="w-8 h-8 text-primary" /> Suporte 24/7
              </div>
              <div className="flex flex-col items-center gap-3 font-black text-sm uppercase tracking-widest text-foreground">
                <Star className="w-8 h-8 text-primary" /> Premium Quality
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 bg-white rounded-[5rem] mx-6 shadow-xl border border-black/5 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto relative z-10 px-6 text-center">
          <div className="mb-24">
            <h2 className="text-6xl md:text-[6rem] font-black tracking-tighter mb-6 text-foreground leading-none">Planos para o seu <span className="text-primary italic text-8xl md:text-[8rem]">tamanho.</span></h2>
            <p className="text-foreground/60 text-2xl font-bold">Sem taxas escondidas, sem surpresas amargas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto items-center">
            {/* Plano Básico */}
            <PricingCard 
              title="Essencial"
              price="39,99"
              description="Para quem está começando a crescer."
              features={[
                "Agendamentos Ilimitados",
                "Até 50 Clientes",
                "Link de Agendamento",
                "Financeiro Básico"
              ]}
              icon={<Rocket className="w-8 h-8" />}
            />
            
            {/* Plano Profissional */}
            <PricingCard 
              title="Profissional"
              price="59,99"
              description="O plano mais colhido pelos experts."
              features={[
                "Clientes Ilimitados",
                "WhatsApp Automático",
                "Relatórios de Ganhos",
                "Lembretes Automáticos",
                "Fila de Espera"
              ]}
              highlighted
              icon={<Zap className="w-8 h-8" />}
            />
            
            {/* Plano Enterprise */}
            <PricingCard 
              title="Império"
              price="99,99"
              description="Para quem domina o mercado."
              features={[
                "Múltiplos Profissionais",
                "API de Integração",
                "Suporte Prioritário VIP",
                "Domínio Próprio",
                "Personalização Total"
              ]}
              icon={<Globe className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-[#F8F7E5]">
        <div className="container max-w-7xl mx-auto text-center px-6">
          <img src="/logo.png" alt="Pêra Logo" className="w-24 h-24 mx-auto mb-10 animate-pulse" />
          <p className="text-foreground/40 font-black text-sm uppercase tracking-[0.6em]">
            Digitalizando o futuro dos serviços &copy; 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false, icon }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-12 rounded-[4rem] border-2 transition-all flex flex-col items-center text-center ${
        highlighted 
          ? "bg-foreground text-background border-primary shadow-[0_40px_80px_-15px_rgba(120,190,32,0.4)] py-20 relative z-10" 
          : "bg-[#F3F2D7] border-black/5 text-foreground"
      }`}
    >
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${highlighted ? "bg-primary text-foreground shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <h3 className="text-4xl font-black tracking-tighter mb-3">{title}</h3>
      <p className={`text-base mb-10 font-bold ${highlighted ? "text-background/50" : "text-foreground/50"}`}>{description}</p>
      
      <div className="flex items-start justify-center gap-1 mb-12">
        <span className="text-2xl font-black italic mt-2">R$</span>
        <span className="text-8xl font-black tracking-tighter leading-none">{price.split(',')[0]}</span>
        <div className="flex flex-col items-start mt-2">
          <span className="text-2xl font-black leading-none">,{price.split(',')[1]}</span>
          <span className="text-sm font-black opacity-50 uppercase tracking-widest">/mês</span>
        </div>
      </div>
      
      <ul className="space-y-5 mb-12 text-left w-full">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-4 text-base font-black tracking-tight">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${highlighted ? "bg-primary text-foreground" : "bg-primary text-background"}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      
      <Button className={`w-full h-20 rounded-3xl font-black text-xl shadow-xl transition-all ${
        highlighted 
          ? "bg-primary text-foreground hover:bg-primary/90" 
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}>
        Escolher Plano
      </Button>
    </motion.div>
  );
}
