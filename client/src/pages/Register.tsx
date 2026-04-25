import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada! Bem-vinda! 🍐");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden text-foreground">
      <div className="noise-bg opacity-20" />
      <div className="absolute top-10 left-10 z-20">
        <Link href="/">
          <Button variant="ghost" className="gap-2 font-black text-foreground/60 hover:text-foreground">
            <ArrowLeft size={16} /> VOLTAR AO INÍCIO
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-24 h-24 object-contain animate-float mb-6 drop-shadow-xl" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">Colha o seu Sucesso</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Cadastre-se e comece hoje.</p>
        </div>

        <Card className="border-4 border-black shadow-[15px_15px_0px_0px_rgba(120,190,32,1)] rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-10 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-foreground ml-1">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome ou negócio"
                  className="h-14 rounded-xl border-2 border-black/10 focus:border-primary transition-all text-lg font-black px-6 shadow-sm bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-foreground ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  className="h-14 rounded-xl border-2 border-black/10 focus:border-primary transition-all text-lg font-black px-6 shadow-sm bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-foreground ml-1">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 rounded-xl border-2 border-black/10 focus:border-primary transition-all text-lg font-black px-6 shadow-sm bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-18 rounded-2xl text-xl font-black btn-hover-effect bg-primary text-foreground border-4 border-foreground shadow-xl mt-4" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "PLANTANDO..." : "CRIAR MINHA PÊRA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-10 text-foreground/60 font-bold">
          Já faz parte?{" "}
          <Link href="/login" className="text-primary font-black hover:underline uppercase tracking-widest text-sm">
            Entrar agora
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
