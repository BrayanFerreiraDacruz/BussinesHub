import React from "react";
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

  // Partículas de Pêras - SUPER GIGANTES E MAIS VISÍVEIS
  const pears = Array.from({ length: 12 });

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative bg-[#F5F4D7] text-black font-sans antialiased">
      <div className="noise-bg opacity-30" />
      
      {/* Pears Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {pears.map((_, i) => (
          <motion.img
            key={i}
            src="/logo.png"
            alt=""
            className="absolute opacity-20"
            style={{ 
              width: i % 2 === 0 ? "250px" : "350px", 
              height: "auto",
              filter: "blur(2px)" 
            }}
            initial={{ 
              top: -500, 
              left: `${Math.random() * 100}%`, 
              rotate: Math.random() * 360
            }}
            animate={{ 
              top: "120%", 
              rotate: 1080,
              left: `${(Math.random() * 120) - 10}%`
            }}
            transition={{ 
              duration: 30 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 25
            }}
          />
        ))}
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b-[6px] border-black bg-white/95 backdrop-blur-xl">
        <div className="container max-w-[1400px] mx-auto flex items-center justify-between h-32 px-12">
          <div className="flex items-center">
            <img src="/logo.png" alt="Pêra Logo" className="w-24 h-24 object-contain animate-float drop-shadow-2xl" />
          </div>
          <div className="hidden md:flex items-center gap-16">
            <a href="#features" className="text-xl font-black text-black uppercase tracking-[0.3em] hover:text-primary transition-all">Recursos</a>
            <a href="#pricing" className="text-xl font-black text-black uppercase tracking-[0.3em] hover:text-primary transition-all">Preços</a>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/login">
              <Button variant="ghost" className="font-black text-xl uppercase tracking-tighter hover:bg-black/5 text-black border-none">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-black rounded-[2rem] px-14 bg-black text-white h-20 text-xl border-none shadow-[15px_15px_0px_0px_rgba(120,190,32,1)]">
                TESTAR GRÁTIS
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-80 pb-64 flex flex-col items-center justify-center text-center w-full">
        <div className="container max-w-7xl mx-auto relative z-10 px-12 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-6 px-12 py-5 rounded-full bg-black text-white font-black mb-20 uppercase tracking-[0.5em] text-sm shadow-[20px_20px_0px_0px_rgba(120,190,32,1)]">
              <Sparkles className="w-8 h-8 text-primary fill-primary" />
              <span>A REVOLUÇÃO DO AGENDAMENTO</span>
            </div>
            
            <h1 className="text-8xl md:text-[14rem] font-black tracking-[calc(-0.05em)] text-black mb-16 leading-[0.7] drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]">
              Papel e caneta?<br />
              <span className="text-primary italic drop-shadow-2xl">Pera aí né...</span>
            </h1>
            
            <p className="text-3xl md:text-6xl text-black font-black max-w-6xl mx-auto mb-24 leading-[1] tracking-tight">
              O SaaS que transforma sua correria em <span className="underline decoration-primary decoration-[12px] underline-offset-[16px]">lucro real.</span> <br />
              <span className="opacity-60 font-bold mt-8 block">Simples como colher uma fruta madura.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-12 justify-center items-center mb-64">
              <Button size="lg" asChild className="h-40 px-32 text-4xl font-black rounded-[3rem] btn-hover-effect shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] bg-primary text-black border-[6px] border-black">
                <a href="/register">QUERO COMEÇAR AGORA</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-24 w-full max-w-7xl mx-auto border-t-[12px] border-black/10 pt-32 pb-12">
              <FeatureMini icon={<ShieldCheck />} label="100% SEGURO" />
              <FeatureMini icon={<Zap />} label="SETUP INSTANTÂNEO" />
              <FeatureMini icon={<Clock />} label="SUPORTE VIP" />
              <FeatureMini icon={<Star />} label="QUALIDADE PREMIUM" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-72 bg-black rounded-[10rem] mx-12 shadow-[0_-100px_200px_rgba(0,0,0,0.3)] relative overflow-hidden text-white text-center flex flex-col items-center w-[calc(100%-6rem)]">
        <div className="container max-w-full mx-auto relative z-10 px-12 text-center flex flex-col items-center">
          <div className="mb-64">
            <h2 className="text-8xl md:text-[13rem] font-black tracking-tighter mb-12 leading-none drop-shadow-2xl">Preço que <br /><span className="text-primary italic">não amarga.</span></h2>
            <p className="text-white/40 text-4xl font-black uppercase tracking-[0.4em]">Foco total no seu crescimento profissional.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-20 max-w-[1600px] mx-auto items-stretch">
            <PricingCard 
              title="ESSENCIAL"
              price="39,99"
              description="Para quem está começando a colher resultados agora."
              features={[
                "Agendamentos Ilimitados",
                "Gestão de até 50 Clientes",
                "Link de Agendamento Profissional",
                "Financeiro Integrado"
              ]}
              icon={<Rocket className="w-16 h-16" />}
              highlighted={false}
            />
            
            <PricingCard 
              title="PROFISSIONAL"
              price="59,99"
              description="O plano mais colhido pelos maiores do mercado nacional."
              features={[
                "Clientes Ilimitados",
                "WhatsApp Automático VIP",
                "Relatórios de Ganhos Reais",
                "Lembretes Inteligentes",
                "Fila de Espera Digital"
              ]}
              highlighted={true}
              icon={<Zap className="w-16 h-16" />}
            />
            
            <PricingCard 
              title="IMPÉRIO"
              price="99,99"
              description="Para quem já domina todo o pomar e quer escala total."
              features={[
                "Múltiplos Profissionais",
                "API de Integração Aberta",
                "Suporte Prioritário 24/7",
                "Domínio Próprio (.com.br)",
                "Personalização da Marca"
              ]}
              icon={<Globe className="w-16 h-16" />}
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-64 bg-[#F5F4D7] w-full">
        <div className="container max-w-7xl mx-auto text-center px-12 flex flex-col items-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-56 h-56 mx-auto mb-20 drop-shadow-3xl hover:scale-110 transition-transform cursor-pointer" />
          <p className="text-black font-black text-3xl uppercase tracking-[1em] opacity-90">
            PÊRA SAAS &copy; 2026
          </p>
          <p className="text-black/50 font-black mt-8 uppercase tracking-[0.5em] text-lg">GESTÃO SEM SEMENTES, LUCRO MADURO.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureMini({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-primary drop-shadow-[0_10px_30px_rgba(120,190,32,0.6)]">
        {React.cloneElement(icon as React.ReactElement, { size: 80, strokeWidth: 4 })}
      </div>
      <span className="font-black text-lg uppercase tracking-[0.4em] text-black text-center">{label}</span>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false, icon }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -30 }}
      className={`p-20 rounded-[8rem] border-[8px] transition-all flex flex-col items-center text-center relative ${
        highlighted 
          ? "bg-primary text-black border-black shadow-[50px_50px_0px_0px_rgba(0,0,0,1)] scale-110 z-20" 
          : "bg-white text-black border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,0.5)]"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-14 bg-black text-white px-16 py-5 rounded-full font-black text-2xl tracking-[0.5em] shadow-3xl border-4 border-primary">
          O FAVORITO
        </div>
      )}
      
      <div className={`mb-16 p-8 rounded-[3rem] border-4 border-black ${highlighted ? "bg-black text-white shadow-2xl" : "bg-primary text-black shadow-2xl"}`}>
        {icon}
      </div>
      
      <h3 className="text-6xl font-black tracking-tight mb-8 uppercase">{title}</h3>
      <p className={`text-lg mb-20 font-black uppercase tracking-widest leading-relaxed ${highlighted ? "text-black/70" : "text-black/50"}`}>{description}</p>
      
      <div className="flex items-start justify-center gap-3 mb-24 scale-150">
        <span className="text-5xl font-black italic mt-4">R$</span>
        <span className="text-[14rem] font-black tracking-tighter leading-none">{price.split(',')[0]}</span>
        <div className="flex flex-col items-start mt-4">
          <span className="text-5xl font-black leading-none">,{price.split(',')[1]}</span>
          <span className="text-xs font-black opacity-60 uppercase tracking-[0.5em] mt-3">/mês</span>
        </div>
      </div>
      
      <ul className="space-y-10 mb-32 text-left w-full px-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-8 text-2xl font-black tracking-tight">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-[6px] border-black ${highlighted ? "bg-black text-white" : "bg-primary text-black"}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="leading-tight">{f}</span>
          </li>
        ))}
      </ul>
      
      <Button className={`w-full h-40 rounded-[4rem] font-black text-5xl shadow-3xl transition-all border-[8px] border-black ${
        highlighted 
          ? "bg-black text-white hover:bg-black/90" 
          : "bg-primary text-black hover:bg-primary/90"
      }`}>
        QUERO ESTE!
      </Button>
    </motion.div>
  );
}
