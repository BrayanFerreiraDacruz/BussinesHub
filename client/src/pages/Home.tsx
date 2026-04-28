import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Redirect, Link } from "wouter";
import { ShieldCheck, Zap, Clock, Star, Rocket, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (isAuthenticated && !loading) {
    return <Redirect to="/dashboard" />;
  }

  // Aumentado para 30 pêras caindo
  const pears = Array.from({ length: 30 });

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative bg-background text-foreground font-sans antialiased">
      <div className="noise-bg opacity-30" />
      
      {/* Pears Particles - Muitas Pêras Caindo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pears.map((_, i) => (
          <motion.img
            key={i}
            src="/logo.png"
            alt=""
            className="absolute opacity-20"
            style={{ 
              width: i % 3 === 0 ? "100px" : i % 3 === 1 ? "150px" : "60px", 
              height: "auto",
              filter: "blur(0.5px)" 
            }}
            initial={{ 
              top: -300, 
              left: `${Math.random() * 100}%`, 
              rotate: Math.random() * 360
            }}
            animate={{ 
              top: "120%", 
              rotate: 720,
              left: `${(Math.random() * 100)}%`
            }}
            transition={{ 
              duration: 15 + Math.random() * 25, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 20
            }}
          />
        ))}
      </div>
      
      {/* Navigation - Apenas botões e Logo (Mobile Friendly) */}
      <nav className="fixed top-0 w-full z-50 border-b-2 md:border-b-4 border-black bg-white/90 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 md:h-24 px-4 md:px-8">
          <div className="flex items-center">
            <img src="/logo.png" alt="Pêra Logo" className="w-10 h-10 md:w-16 md:h-16 object-contain animate-float" />
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <Link href="/login">
              <Button variant="ghost" className="font-black text-xs md:text-sm uppercase tracking-tighter hover:bg-primary/10 text-foreground border-none px-2 md:px-4">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-black rounded-lg md:rounded-xl px-4 md:px-8 bg-black text-white h-10 md:h-14 text-[10px] md:text-sm border-none shadow-[4px_4px_0px_0px_rgba(120,190,32,1)] uppercase">
                TESTAR GRÁTIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Responsive Font Sizes */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 flex flex-col items-center justify-center text-center">
        <div className="container max-w-5xl mx-auto relative z-10 px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 rounded-full bg-foreground text-background font-black mb-6 md:mb-10 uppercase tracking-[0.3em] text-[8px] md:text-[9px] shadow-[6px_6px_0px_0px_rgba(120,190,32,1)]">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary fill-primary" />
              <span>O futuro da sua agenda</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-foreground mb-6 md:mb-10 leading-[0.8] drop-shadow-[0_5px_5px_rgba(0,0,0,0.1)]">
              Papel e caneta?<br />
              <span className="text-primary italic drop-shadow-xl">Pera aí né...</span>
            </h1>
            
            <p className="text-base md:text-2xl text-foreground font-black max-w-3xl mx-auto mb-10 md:mb-16 leading-tight uppercase tracking-tight px-4">
              O SaaS que transforma sua correria em <span className="underline decoration-primary decoration-2 md:decoration-4 underline-offset-4">lucro real.</span> <br />
              <span className="opacity-60 font-bold mt-2 block normal-case">Simples como colher uma fruta madura.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24 md:mb-40 w-full px-6">
              <Button size="lg" asChild className="w-full sm:w-auto h-16 md:h-24 px-10 md:px-16 text-lg md:text-2xl font-black rounded-xl md:rounded-2xl btn-hover-effect shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-primary text-foreground border-2 md:border-4 border-foreground">
                <a href="/register">COMEÇAR AGORA</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full max-w-4xl mx-auto border-t-2 md:border-t-4 border-foreground/10 pt-12 md:pt-20">
              <FeatureMini icon={<ShieldCheck />} label="100% SEGURO" />
              <FeatureMini icon={<Zap />} label="INSTANTÂNEO" />
              <FeatureMini icon={<Clock />} label="SUPORTE VIP" />
              <FeatureMini icon={<Star />} label="PREMIUM" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - Black Background with Green Accents */}
      <section id="pricing" className="py-24 md:py-48 bg-black rounded-[3rem] md:rounded-[6rem] mx-4 md:mx-8 shadow-2xl relative overflow-hidden text-background text-center flex flex-col items-center">
        <div className="container max-w-6xl mx-auto relative z-10 px-4 md:px-8 text-center flex flex-col items-center">
          <div className="mb-20 md:mb-32">
            <h2 className="text-4xl md:text-7xl lg:text-[9rem] font-black tracking-tighter mb-6 md:mb-8 leading-none drop-shadow-2xl">
              <span className="text-primary">Preço que</span> <br />
              <span className="text-primary italic">não amarga.</span>
            </h2>
            <p className="text-white/40 text-sm md:text-xl font-black uppercase tracking-[0.3em]">Sem taxas escondidas, lucro 100% seu.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto items-stretch">
            {/* Plano Básico */}
            <PricingCard 
              title="ESSENCIAL"
              price="39,99"
              description="Para quem está começando."
              features={[
                "Agendamentos Ilimitados",
                "Gestão de até 50 Clientes",
                "Link de Agendamento Profissional",
                "Financeiro Integrado"
              ]}
              icon={<Rocket className="w-8 h-8 md:w-10 md:h-10" />}
            />
            
            {/* Plano Profissional */}
            <PricingCard 
              title="PROFISSIONAL"
              price="59,99"
              description="O plano mais colhido."
              features={[
                "Clientes Ilimitados",
                "WhatsApp Automático VIP",
                "Relatórios de Ganhos Reais",
                "Lembretes Inteligentes",
                "Fila de Espera Digital"
              ]}
              highlighted={true}
              icon={<Zap className="w-8 h-8 md:w-10 md:h-10" />}
            />
            
            {/* Plano Enterprise */}
            <PricingCard 
              title="IMPÉRIO"
              price="99,99"
              description="Para dominar o pomar."
              features={[
                "Múltiplos Profissionais",
                "API de Integração Aberta",
                "Suporte Prioritário 24/7",
                "Domínio Próprio (.com.br)",
                "Personalização da Marca"
              ]}
              icon={<Globe className="w-8 h-8 md:w-10 md:h-10" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-32 bg-background">
        <div className="container max-w-6xl mx-auto text-center px-8 flex flex-col items-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-8 md:mb-12 drop-shadow-xl hover:scale-110 transition-transform cursor-pointer grayscale opacity-50 hover:grayscale-0 hover:opacity-100" />
          <p className="text-foreground font-black text-xs md:text-lg uppercase tracking-[0.5em] opacity-80">
            PÊRA SAAS &copy; 2026
          </p>
          <p className="text-foreground/40 font-black mt-2 md:mt-4 uppercase tracking-widest text-[8px] md:text-xs tracking-[0.4em]">GESTÃO SEM SEMENTES, LUCRO MADURO.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureMini({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 text-center">
      <div className="text-primary drop-shadow-lg scale-75 md:scale-100">
        {React.cloneElement(icon as React.ReactElement, { size: 32, strokeWidth: 3 } as any)}
      </div>
      <span className="font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-foreground leading-tight">{label}</span>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false, icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-4 transition-all flex flex-col items-center text-center relative ${
        highlighted 
          ? "bg-primary text-foreground border-foreground shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] md:scale-105 z-20" 
          : "bg-background text-foreground border-foreground shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-5 bg-foreground text-background px-6 py-2 rounded-full font-black text-[10px] tracking-[0.3em] shadow-2xl border-2 border-primary">
          O FAVORITO
        </div>
      )}
      
      <div className={`mb-8 p-4 rounded-2xl border-2 border-foreground ${highlighted ? "bg-foreground text-background shadow-lg" : "bg-primary text-foreground shadow-lg"}`}>
        {icon}
      </div>
      
      <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-3 uppercase">{title}</h3>
      <p className={`text-[9px] md:text-[10px] mb-8 md:mb-12 font-black uppercase tracking-widest leading-relaxed opacity-60`}>{description}</p>
      
      <div className="flex items-start justify-center gap-1 mb-10 md:mb-16 scale-90 md:scale-110">
        <span className="text-xl md:text-2xl font-black italic mt-1 md:mt-2">R$</span>
        <span className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{price.split(',')[0]}</span>
        <div className="flex flex-col items-start mt-1 md:mt-2">
          <span className="text-xl md:text-2xl font-black leading-none">,{price.split(',')[1]}</span>
          <span className="text-[8px] md:text-[10px] font-black opacity-40 uppercase tracking-[0.1em] mt-1">/mês</span>
        </div>
      </div>
      
      <ul className="space-y-4 md:space-y-6 mb-12 md:mb-20 text-left w-full px-2">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-black tracking-tight">
            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0 border-2 border-foreground ${highlighted ? "bg-foreground text-background" : "bg-primary text-foreground"}`}>
              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <span className="leading-tight uppercase text-[10px] md:text-xs">{f}</span>
          </li>
        ))}
      </ul>
      
      <Button className={`w-full h-14 md:h-20 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl shadow-2xl transition-all border-2 md:border-4 border-foreground bg-primary text-foreground hover:scale-105`}>
        QUERO ESTE!
      </Button>
    </motion.div>
  );
}
