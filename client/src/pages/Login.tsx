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

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Bem-vinda de volta ao pomar! 🍐");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Credenciais incorretas. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[460px] z-10"
      >
        <div className="flex flex-col items-center mb-12 text-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-32 h-32 object-contain animate-float mb-6 drop-shadow-2xl" />
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Acessar minha Pêra</h1>
          <p className="text-foreground/60 font-bold uppercase tracking-widest text-xs mt-2">Pronta para colher resultados?</p>
        </div>

        <Card className="border-4 border-foreground shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] overflow-hidden bg-background">
          <CardContent className="p-10 md:p-14">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="font-black text-sm uppercase tracking-widest text-foreground ml-1">Seu Email</Label>
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
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="font-black text-sm uppercase tracking-widest text-foreground">Sua Senha</Label>
                  <a href="#" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Esqueceu?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-16 rounded-2xl border-4 border-foreground bg-white focus:ring-primary focus:border-primary transition-all text-xl font-black px-6 text-foreground placeholder:text-foreground/20 shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-20 rounded-[2rem] text-2xl font-black btn-hover-effect bg-primary text-foreground border-4 border-foreground shadow-2xl" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "ACESSANDO..." : "ENTRAR AGORA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-12 text-foreground font-bold">
          Ainda não é do time?{" "}
          <Link href="/register" className="text-primary font-black hover:underline uppercase tracking-widest text-sm">
            Criar conta grátis
          </Link>
        </p>
      </motion.div>

      {/* Background Decor */}
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-0" />
    </div>
  );
}
