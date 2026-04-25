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

  // Partículas de Pêras caindo
  const pears = Array.from({ length: 15 });

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative bg-[#FDFCF0]">
      <div className="noise-bg" />
      
      {/* Pears Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pears.map((_, i) => (
          <motion.img
            key={i}
            src="/logo.png"
            alt="Pêra particle"
            className="absolute w-8 h-8 opacity-10"
            initial={{ 
              top: -50, 
              left: `${Math.random() * 100}%`, 
              rotate: 0 
            }}
            animate={{ 
              top: "110%", 
              rotate: 360,
              left: `${(Math.random() * 100)}%`
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pêra Logo" className="w-14 h-14 object-contain animate-float" />
            {/* Nome Pêra removido como solicitado */}
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-foreground/70 uppercase tracking-widest">
            <a href="#features" className="hover:text-primary transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-black uppercase tracking-tighter hover:bg-primary/10">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-black rounded-full px-8 bg-primary text-primary-foreground h-12">
                TESTAR GRÁTIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black mb-8 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>A revolução do agendamento</span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground mb-6 leading-[0.85]">
              Papel e caneta?<br />
              <span className="text-primary italic">Pera aí né...</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-tight px-4">
              O SaaS que transforma sua correria em lucro no automático. Simples como colher uma fruta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" asChild className="h-20 px-12 text-xl font-black rounded-full btn-hover-effect shadow-2xl">
                <a href="/register">QUERO COMEÇAR AGORA</a>
              </Button>
            </div>
            
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50">
              <div className="flex flex-col items-center gap-2 font-black text-xs uppercase tracking-widest">
                <ShieldCheck className="w-6 h-6" /> 100% Seguro
              </div>
              <div className="flex flex-col items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Zap className="w-6 h-6" /> Setup Instantâneo
              </div>
              <div className="flex flex-col items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Clock className="w-6 h-6" /> Suporte 24/7
              </div>
              <div className="flex flex-col items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Star className="w-6 h-6" /> Premium Quality
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white rounded-[4rem] mx-4 shadow-sm border border-black/5 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Planos para o seu <span className="text-primary">tamanho.</span></h2>
            <p className="text-muted-foreground text-xl font-medium">Sem taxas escondidas, sem surpresas amargas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <PricingCard 
              title="Essencial"
              price="39,99"
              description="Para quem está começando a crescer."
              features={[
                "Agendamentos Ilimitados",
                "Gestão de até 50 Clientes",
                "Link de Agendamento Público",
                "Financeiro Básico"
              ]}
              icon={<Rocket className="w-6 h-6" />}
            />
            
            {/* Plano Profissional */}
            <PricingCard 
              title="Profissional"
              price="59,99"
              description="O plano mais colhido pelos experts."
              features={[
                "Tudo do Essencial",
                "Clientes Ilimitados",
                "Notificações WhatsApp",
                "Relatórios de Faturamento",
                "Lembretes Automáticos"
              ]}
              highlighted
              icon={<Zap className="w-6 h-6" />}
            />
            
            {/* Plano Enterprise */}
            <PricingCard 
              title="Império"
              price="99,99"
              description="Para quem domina o mercado."
              features={[
                "Tudo do Profissional",
                "Multi-profissionais",
                "API de Integração",
                "Suporte Prioritário VIP",
                "Domínio Personalizado"
              ]}
              icon={<Globe className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20">
        <div className="container text-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-20 h-20 mx-auto mb-8 grayscale hover:grayscale-0 transition-all cursor-pointer" />
          <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.4em]">
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
      whileHover={{ y: -10 }}
      className={`p-10 rounded-[3rem] border-2 transition-all ${
        highlighted 
          ? "bg-foreground text-background border-primary shadow-[0_30px_60px_-10px_rgba(120,190,32,0.3)] scale-105 z-10" 
          : "bg-muted/30 border-black/5 text-foreground"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${highlighted ? "bg-primary text-foreground" : "bg-primary/10 text-primary"}`}>
        {icon}
      </div>
      <h3 className="text-3xl font-black tracking-tighter mb-2">{title}</h3>
      <p className={`text-sm mb-8 font-medium ${highlighted ? "text-background/60" : "text-muted-foreground"}`}>{description}</p>
      
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-lg font-black italic">R$</span>
        <span className="text-6xl font-black tracking-tighter">{price}</span>
        <span className="text-sm font-bold opacity-60">/mês</span>
      </div>
      
      <ul className="space-y-4 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 className={`w-5 h-5 ${highlighted ? "text-primary" : "text-primary"}`} />
            {f}
          </li>
        ))}
      </ul>
      
      <Button className={`w-full h-14 rounded-2xl font-black text-lg ${
        highlighted 
          ? "bg-primary text-foreground hover:bg-primary/90" 
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}>
        Escolher Plano
      </Button>
    </motion.div>
  );
}
