import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Laptop, Sparkles, Copy, Instagram, Share2, CheckCircle2 } from "lucide-react";

export default function MarketingKit() {
  return (
    <div className="min-h-screen bg-[#F8F7E5] text-black overflow-x-hidden p-6 md:p-20 relative">
      <div className="noise-bg opacity-20" />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] overflow-hidden -z-0">
        {[...Array(20)].map((_, i) => (
          <img 
            key={i} 
            src="/logo.png" 
            className="absolute animate-float" 
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${100 + Math.random() * 200}px`,
              animationDelay: `${Math.random() * 5}s`,
            }}
            alt="" 
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
          <div className="space-y-4 text-center md:text-left">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2 font-black border-2 border-black rounded-xl">
                <ArrowLeft size={16} /> VOLTAR AO APP
              </Button>
            </Link>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              Marketing <span className="text-primary italic">Studio</span>
            </h1>
            <p className="text-xl font-bold opacity-60">Gere fotos incríveis para seus posts e anúncios.</p>
          </div>
          <div className="bg-black text-white p-6 rounded-[2rem] border-4 border-primary shadow-[10px_10px_0px_0px_rgba(120,190,32,1)]">
            <p className="font-black text-xs uppercase tracking-widest mb-2">Instrução</p>
            <p className="text-sm font-bold opacity-80">Use o atalho <kbd className="bg-white/20 px-2 rounded">Win + Shift + S</kbd> para tirar print da área desejada.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
          {/* Mockup iPhone */}
          <div className="flex flex-col items-center gap-10">
            <div className="relative group">
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all duration-700" />
              {/* iPhone Frame CSS */}
              <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-[8px] border-black shadow-[30px_30px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ring-4 ring-black/20 scale-110 md:scale-125">
                <div className="absolute top-0 w-full h-8 bg-black z-20 flex justify-center">
                  <div className="w-20 h-4 bg-black rounded-b-xl" />
                </div>
                {/* App Content Simulation */}
                <div className="w-full h-full bg-[#F8F7E5] p-4 pt-12 space-y-6">
                  <div className="flex justify-between items-center border-b-2 border-black pb-4">
                    <img src="/logo.png" className="w-8 h-8" alt="" />
                    <div className="w-8 h-8 rounded-full bg-primary border-2 border-black" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 bg-white border-4 border-black rounded-2xl p-3 shadow-md flex justify-between items-center">
                      <div className="space-y-1"><div className="w-12 h-2 bg-black/10 rounded" /><div className="w-20 h-4 bg-black rounded" /></div>
                      <div className="w-10 h-10 bg-primary rounded-lg border-2 border-black" />
                    </div>
                    <div className="h-40 bg-white border-4 border-black rounded-3xl p-4 shadow-md flex flex-col justify-center gap-3">
                      <div className="w-full h-4 bg-black/5 rounded" />
                      <div className="w-full h-4 bg-black/5 rounded" />
                      <div className="w-2/3 h-4 bg-black/5 rounded" />
                    </div>
                  </div>
                  <div className="h-32 bg-black rounded-2xl flex items-center justify-center p-4">
                    <p className="text-white font-black text-center text-xs uppercase leading-none">Pêra: A sua agenda no automático 🍐</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                <Smartphone size={14} className="text-primary" /> Celular Primeiro
              </span>
              <p className="font-bold opacity-40 uppercase text-xs tracking-tighter">Ideal para Stories e Reels</p>
            </div>
          </div>

          {/* Text/CTA */}
          <div className="space-y-12">
            <div className="p-10 bg-white border-4 border-black rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="text-primary mb-6" size={40} />
              <h2 className="text-4xl font-black tracking-tight uppercase mb-6 leading-none">
                Design que <br /><span className="text-primary">vende sozinho.</span>
              </h2>
              <p className="text-lg font-bold opacity-70 leading-tight mb-8">
                Mostre para suas clientes que você usa a tecnologia mais moderna do mercado. A confiança começa pelo visual.
              </p>
              <div className="space-y-4">
                <SocialFeature label="Dashboard Intuitivo" />
                <SocialFeature label="Agenda Neo-Brutalista" />
                <SocialFeature label="Financeiro Profissional" />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button className="h-20 flex-1 rounded-2xl bg-primary text-black border-4 border-black font-black text-xl shadow-xl hover:scale-105 transition-all gap-3">
                <Instagram size={28} /> POSTAR NO INSTA
              </Button>
              <Button variant="outline" className="h-20 px-8 rounded-2xl border-4 border-black shadow-xl hover:bg-black/5">
                <Share2 size={28} />
              </Button>
            </div>
          </div>
        </div>

        {/* Laptop View */}
        <section className="mt-40 text-center space-y-20">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Versão <span className="text-primary italic underline decoration-black underline-offset-8">Desktop</span></h2>
            <p className="text-xl font-bold opacity-40 uppercase tracking-[0.2em]">O controle total no seu monitor</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-20 bg-primary/10 blur-[150px] rounded-full animate-pulse" />
            {/* Laptop Frame */}
            <div className="max-w-5xl mx-auto border-[12px] border-black rounded-t-[2rem] bg-[#F8F7E5] h-[500px] shadow-[40px_40px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden z-10">
              <div className="w-full h-12 bg-white border-b-4 border-black flex items-center px-6 gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                <div className="ml-4 flex-1 h-6 bg-muted/50 rounded-full border-2 border-black/5 flex items-center px-3 text-[8px] font-bold opacity-30">pera-saas.com.br/dashboard</div>
              </div>
              <div className="p-8 grid grid-cols-12 gap-6 h-full">
                <div className="col-span-3 border-4 border-black rounded-2xl bg-white h-[350px] p-4 space-y-4">
                  <div className="w-12 h-12 bg-primary rounded-xl border-2 border-black" />
                  <div className="space-y-2 opacity-10"><div className="h-4 bg-black rounded" /><div className="h-4 bg-black rounded" /><div className="h-4 bg-black rounded" /></div>
                </div>
                <div className="col-span-9 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white border-4 border-black rounded-2xl shadow-md" />
                    <div className="h-24 bg-white border-4 border-black rounded-2xl shadow-md" />
                    <div className="h-24 bg-black border-4 border-black rounded-2xl shadow-md" />
                  </div>
                  <div className="h-[230px] bg-white border-4 border-black rounded-[2rem] shadow-xl relative overflow-hidden flex items-center justify-center">
                    <img src="/logo.png" className="w-40 opacity-10" alt="" />
                    <p className="absolute font-black text-2xl uppercase tracking-tighter">SUA DASHBOARD AQUI 🍐</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop Base */}
            <div className="max-w-6xl mx-auto h-6 bg-black rounded-b-xl shadow-2xl relative z-20" />
            <div className="max-w-[200px] mx-auto h-2 bg-black/20 rounded-b-full blur-sm" />
          </div>

          <div className="py-40">
            <Button onClick={() => window.print()} className="h-24 px-20 rounded-[2.5rem] bg-black text-primary border-[6px] border-primary font-black text-3xl shadow-[20px_20px_0px_0px_rgba(120,190,32,1)] btn-hover-effect">
              IMPRIMIR KIT COMPLETO 🍐
            </Button>
          </div>
        </section>
      </div>

      {/* CSS Noise Overlay */}
      <div className="noise-bg opacity-[0.03] fixed inset-0 pointer-events-none" />
    </div>
  );
}

function SocialFeature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-black">
        <CheckCircle2 size={12} strokeWidth={4} />
      </div>
      <span className="font-black text-sm uppercase tracking-widest">{label}</span>
    </div>
  );
}
