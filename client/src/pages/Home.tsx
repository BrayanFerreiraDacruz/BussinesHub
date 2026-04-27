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

  // Chuva de pêras e pêras paradas
  const fallingPears = Array.from({ length: 15 });
  const staticPears = Array.from({ length: 40 });

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative bg-background text-foreground font-sans antialiased w-full">
      <div className="noise-bg opacity-30" />
      
      {/* PÊRAS ESTÁTICAS E COLORIDAS NO FUNDO */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {staticPears.map((_, i) => (
          <img
            key={`static-${i}`}
            src="/logo.png"
            alt=""
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 60}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.8
            }}
          />
        ))}
      </div>

      {/* Pêras Caindo (Subtis) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fallingPears.map((_, i) => (
          <motion.img
            key={`falling-${i}`}
            src="/logo.png"
            alt=""
            className="absolute opacity-30"
            style={{ 
              width: i % 3 === 0 ? "100px" : "60px", 
              height: "auto",
              filter: "blur(1px)" 
            }}
            initial={{ top: -200, left: `${Math.random() * 100}%`, rotate: Math.random() * 360 }}
            animate={{ top: "120%", rotate: 720, left: `${(Math.random() * 100)}%` }}
            transition={{ duration: 20 + Math.random() * 20, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
          />
        ))}
      </div>
      
      {/* Navigation - Compacta */}
      <nav className="fixed top-0 w-full z-50 border-b-2 border-black bg-white/95 backdrop-blur-xl">
        <div className="w-full flex items-center justify-between h-14 md:h-20 px-6 md:px-12">
          <div className="flex items-center">
            <img src="/logo.png" alt="Pêra Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain animate-float" />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-black text-[10px] md:text-xs uppercase tracking-tighter hover:bg-primary/10 text-foreground border-none px-2 md:px-4 h-8 md:h-10">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-black rounded-lg px-4 md:px-6 bg-black text-white h-8 md:h-11 text-[9px] md:text-[10px] border-none shadow-[3px_3px_0px_0px_rgba(120,190,32,1)] uppercase">
                TESTAR GRÁTIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - MENOS ZOOM */}
      <section className="relative pt-24 md:pt-40 pb-16 md:pb-24 flex flex-col items-center justify-center text-center w-full">
        <div className="w-full relative z-10 px-6 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground text-background font-black mb-6 md:mb-8 uppercase tracking-[0.3em] text-[7px] md:text-[9px] shadow-[4px_4px_0px_0px_rgba(120,190,32,1)]">
              <Sparkles className="w-3 h-3 text-primary fill-primary" />
              <span>O futuro da sua agenda</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-[7rem] font-black tracking-tighter text-foreground mb-6 md:mb-8 leading-[0.8] drop-shadow-[0_5px_5px_rgba(0,0,0,0.1)] uppercase">
              Papel e caneta?<br />
              <span className="text-primary italic drop-shadow-xl">Pera aí né...</span>
            </h1>
            
            <p className="text-sm md:text-xl lg:text-2xl text-foreground font-black max-w-2xl mx-auto mb-8 md:mb-12 leading-tight uppercase tracking-tight">
              O SaaS que transforma sua correria em <span className="underline decoration-primary decoration-2 md:decoration-4 underline-offset-4">lucro real.</span> <br />
              <span className="opacity-60 font-bold mt-1 block normal-case">Simples como colher uma fruta madura.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 md:mb-32 w-full max-w-2xl px-6">
              <Button size="lg" asChild className="w-full sm:w-auto h-12 md:h-18 px-8 md:px-12 text-base md:text-xl font-black rounded-xl btn-hover-effect shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-primary text-foreground border-2 border-foreground">
                <a href="/register">COMEÇAR AGORA</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-4xl mx-auto border-t-2 border-foreground/10 pt-10 md:pt-16">
              <FeatureMini icon={<ShieldCheck size={24} />} label="100% SEGURO" />
              <FeatureMini icon={<Zap size={24} />} label="INSTANTÂNEO" />
              <FeatureMini icon={<Clock size={24} />} label="SUPORTE VIP" />
              <FeatureMini icon={<Star size={24} />} label="PREMIUM" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - MENOS ZOOM E MAIS PÊRAS */}
      <section id="pricing" className="py-20 md:py-32 bg-black rounded-[2rem] md:rounded-[5rem] mx-4 md:mx-12 shadow-2xl relative overflow-hidden text-background text-center flex flex-col items-center w-[calc(100%-2rem)] md:w-[calc(100%-6rem)]">
        <div className="w-full relative z-10 px-4 md:px-12 text-center flex flex-col items-center">
          <div className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-6xl lg:text-[6rem] font-black tracking-tighter mb-4 md:mb-6 leading-none drop-shadow-2xl">
              <span className="text-primary uppercase">Preço que</span> <br />
              <span className="text-primary italic">não amarga.</span>
            </h2>
            <p className="text-white/40 text-xs md:text-lg font-black uppercase tracking-[0.3em]">Sem taxas escondidas, lucro 100% seu.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 w-full max-w-[1200px] mx-auto items-stretch">
            <PricingCard 
              title="ESSENCIAL"
              price="39,99"
              description="Para iniciantes."
              features={[
                "Agendamentos Ilimitados",
                "Gestão de até 50 Clientes",
                "Link de Agendamento Profissional",
                "Financeiro Integrado"
              ]}
              icon={<Rocket size={20} />}
            />
            
            <PricingCard 
              title="PROFISSIONAL"
              price="59,99"
              description="O favorito."
              features={[
                "Clientes Ilimitados",
                "WhatsApp Automático VIP",
                "Relatórios de Ganhos Reais",
                "Lembretes Inteligentes",
                "Fila de Espera Digital"
              ]}
              highlighted={true}
              icon={<Zap size={20} />}
            />
            
            <PricingCard 
              title="IMPÉRIO"
              price="99,99"
              description="Para dominar."
              features={[
                "Múltiplos Profissionais",
                "API de Integração Aberta",
                "Suporte Prioritário 24/7",
                "Domínio Próprio (.com.br)",
                "Personalização da Marca"
              ]}
              icon={<Globe size={20} />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 md:py-32 bg-background w-full">
        <div className="w-full text-center px-8 flex flex-col items-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 md:mb-10 drop-shadow-xl hover:scale-110 transition-transform cursor-pointer grayscale opacity-50 hover:grayscale-0 hover:opacity-100" />
          <p className="text-foreground font-black text-xs md:text-lg uppercase tracking-[0.6em] opacity-80">
            PÊRA SAAS &copy; 2026
          </p>
          <p className="text-foreground/40 font-black mt-2 md:mt-4 uppercase tracking-widest text-[7px] md:text-[10px] tracking-[0.4em]">GESTÃO SEM SEMENTES, LUCRO MADURO.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureMini({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 md:gap-4 text-center">
      <div className="text-primary drop-shadow-lg scale-75 md:scale-100">
        {React.cloneElement(icon as React.ReactElement, { strokeWidth: 4 })}
      </div>
      <span className="font-black text-[7px] md:text-[10px] uppercase tracking-[0.3em] text-foreground leading-tight">{label}</span>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false, icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.01 }}
      className={`p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-4 transition-all flex flex-col items-center text-center relative ${
        highlighted 
          ? "bg-primary text-foreground border-foreground shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:scale-105 z-20" 
          : "bg-background text-foreground border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 bg-foreground text-background px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[8px] md:text-[10px] tracking-[0.3em] shadow-2xl border-2 border-primary">
          O FAVORITO
        </div>
      )}
      
      <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 md:border-4 border-foreground ${highlighted ? "bg-foreground text-background" : "bg-primary text-foreground"}`}>
        {icon}
      </div>
      
      <h3 className="text-xl md:text-3xl font-black tracking-tight mb-1 md:mb-3 uppercase">{title}</h3>
      <p className={`text-[8px] md:text-[10px] mb-6 md:mb-10 font-black uppercase tracking-widest opacity-60`}>{description}</p>
      
      <div className="flex items-start justify-center gap-1 mb-8 md:mb-12 scale-90 md:scale-110">
        <span className="text-lg md:text-xl font-black italic mt-1 md:mt-2">R$</span>
        <span className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{price.split(',')[0]}</span>
        <div className="flex flex-col items-start mt-1 md:mt-2">
          <span className="text-lg md:text-xl font-black leading-none">,{price.split(',')[1]}</span>
          <span className="text-[7px] md:text-[9px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">/mês</span>
        </div>
      </div>
      
      <ul className="space-y-3 md:space-y-4 mb-8 md:mb-16 text-left w-full px-2">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-[10px] md:text-xs font-black tracking-tight uppercase">
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 border-2 border-foreground ${highlighted ? "bg-foreground text-background" : "bg-primary text-foreground"}`}>
              <CheckCircle2 size={10} className="md:w-3 md:h-3" />
            </div>
            <span className="leading-tight">{f}</span>
          </li>
        ))}
      </ul>
      
      <Button className={`w-full h-12 md:h-16 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-xl transition-all border-2 md:border-4 border-foreground ${
        highlighted 
          ? "bg-foreground text-background hover:bg-foreground/90" 
          : "bg-primary text-foreground hover:bg-primary/90"
      }`}>
        VAMOS LÁ!
      </Button>
    </motion.div>
  );
}
