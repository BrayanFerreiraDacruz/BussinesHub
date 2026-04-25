import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada! Bem-vinda ao Pêra 🍐");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, name });
  };

  return (
    <div className="min-h-screen bg-[#F8F7E5] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="noise-bg opacity-20" />
      <div className="absolute top-10 left-10 z-20">
        <Link href="/">
          <Button variant="ghost" className="gap-2 font-black text-foreground hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" /> VOLTAR AO INÍCIO
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[520px] z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-32 h-32 object-contain animate-float mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Colha o seu Sucesso</h1>
          <p className="text-foreground/60 font-bold uppercase tracking-widest text-xs mt-2">Cadastre-se e comece a gerenciar hoje.</p>
        </div>

        <Card className="border-4 border-foreground shadow-[20px_20px_0px_0px_rgba(120,190,32,1)] rounded-[3rem] overflow-hidden bg-background">
          <CardContent className="p-10 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-black text-sm uppercase tracking-widest text-foreground ml-1">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome ou do negócio"
                  className="h-16 rounded-2xl border-4 border-foreground bg-white focus:ring-primary focus:border-primary transition-all text-xl font-black px-6 text-foreground placeholder:text-foreground/20 shadow-inner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-sm uppercase tracking-widest text-foreground ml-1">Email Profissional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  className="h-16 rounded-2xl border-4 border-foreground bg-white focus:ring-primary focus:border-primary transition-all text-xl font-black px-6 text-foreground placeholder:text-foreground/20 shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-black text-sm uppercase tracking-widest text-foreground ml-1">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="h-16 rounded-2xl border-4 border-foreground bg-white focus:ring-primary focus:border-primary transition-all text-xl font-black px-6 text-foreground placeholder:text-foreground/20 shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-20 rounded-[2rem] text-2xl font-black btn-hover-effect bg-primary text-foreground border-4 border-foreground shadow-2xl mt-4" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "PLANTANDO..." : "CRIAR MINHA PÊRA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-12 text-foreground font-bold">
          Já faz parte do pomar?{" "}
          <Link href="/login" className="text-primary font-black hover:underline uppercase tracking-widest text-sm">
            Entrar agora
          </Link>
        </p>
      </motion.div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-0" />
    </div>
  );
}
