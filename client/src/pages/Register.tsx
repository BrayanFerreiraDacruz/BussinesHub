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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="noise-bg" />
      <div className="absolute top-10 left-10 z-20">
        <Link href="/">
          <Button variant="ghost" className="gap-2 font-bold hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Pêra Logo" className="w-20 h-20 object-contain animate-float mb-4" />
          <h1 className="text-3xl font-black tracking-tighter">Colha o seu Sucesso</h1>
          <p className="text-muted-foreground font-medium">Cadastre-se e comece a gerenciar hoje.</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest ml-1">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome ou do seu negócio"
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all text-lg font-medium px-6"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest ml-1">Email Profissional</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all text-lg font-medium px-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest ml-1">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all text-lg font-medium px-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold btn-hover-effect mt-4 shadow-primary/20" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Plantando dados..." : "Criar minha Pêra"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-muted-foreground font-medium">
          Já faz parte do pomar?{" "}
          <Link href="/login" className="text-primary font-black hover:underline">
            Entrar agora
          </Link>
        </p>
      </motion.div>

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-0" />
    </div>
  );
}
