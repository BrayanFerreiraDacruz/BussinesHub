import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      toast.success("Bem-vindo de volta!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Pêra Logo" className="w-24 h-24 object-contain animate-float mb-4" />
          <h1 className="text-3xl font-black tracking-tighter">Entrar na sua Pêra</h1>
          <p className="text-muted-foreground font-medium">Bom te ver de novo!</p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@gmail.com"
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all text-lg font-medium px-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest">Senha</Label>
                  <a href="#" className="text-xs font-bold text-primary hover:underline">Esqueceu?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-14 rounded-2xl bg-muted/50 border-transparent focus:bg-background transition-all text-lg font-medium px-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold btn-hover-effect shadow-primary/20" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Autenticando..." : "Entrar no Painel"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-muted-foreground font-medium">
          Ainda não colhe nossos frutos?{" "}
          <Link href="/register" className="text-primary font-black hover:underline">
            Crie sua conta grátis
          </Link>
        </p>
      </motion.div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full -z-0" />
    </div>
  );
}
