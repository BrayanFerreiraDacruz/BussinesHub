import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Redirect, Link } from "wouter";
import { Calendar, Users, BarChart3, Clock, CheckCircle2, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (isAuthenticated && !loading) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen selection:bg-primary/30 overflow-hidden relative">
      <div className="noise-bg" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="container flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pêra Logo" className="w-10 h-10 object-contain animate-float" />
            <span className="font-bold text-2xl tracking-tighter text-foreground">Pêra</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
            <a href="#about" className="hover:text-primary transition-colors">Sobre</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold hover:bg-primary/10">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-hover-effect font-bold rounded-full px-6 bg-primary text-primary-foreground">
                Começar agora
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 pera-glow">
              <Sparkles className="w-4 h-4" />
              <span>O novo jeito de agendar chegou</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[0.9]">
              Papel e caneta?<br />
              <span className="text-primary italic">Pera aí né...</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-tight">
              Sua agenda no automático, sua mente no descanso. O SaaS de gestão mais doce e eficiente para o seu negócio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="h-16 px-10 text-lg font-bold rounded-full btn-hover-effect">
                <a href="/register">Criar minha conta grátis</a>
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-full border-2">
                Ver demonstração
              </Button>
            </div>
            
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full scale-75 -z-10" />
              <img 
                src="/paleta.jpeg" 
                alt="Pêra Dashboard Preview" 
                className="w-full max-w-5xl mx-auto rounded-[2rem] shadow-2xl border border-white/20 animate-float"
                style={{ opacity: 0.9 }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-foreground text-background rounded-[3rem] mx-4">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Gestão completa, sem sementes.</h2>
            <p className="text-muted-foreground/80 text-lg font-medium">Tudo o que você precisa em um único lugar.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Agendamento Veloz"
              description="Sua cliente escolhe o horário em segundos, sem precisar te mandar mensagem."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Clientes Féis"
              description="Histórico completo e lembretes automáticos via WhatsApp que evitam furos."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Pagamentos Seguros"
              description="Receba via PIX e cartão direto pelo app com a integração Abacatepay."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-32 overflow-hidden">
        <div className="container text-center">
          <div className="glass-premium p-12 md:p-20 rounded-[3rem] relative">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto mb-8 opacity-20 absolute top-10 right-10 rotate-12" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
              Pronta para colher<br />os <span className="text-primary">melhores frutos?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
              Junte-se a centenas de profissionais que já abandonaram o caderno e digitalizaram o sucesso.
            </p>
            <Button size="lg" asChild className="h-16 px-12 text-xl font-black rounded-full btn-hover-effect">
              <a href="/register">Começar agora <ArrowRight className="ml-2 w-6 h-6" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pêra Logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl tracking-tighter">Pêra</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Ajuda</a>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              &copy; 2026 Pêra SaaS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mb-6 shadow-xl shadow-primary/20">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground/70 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
