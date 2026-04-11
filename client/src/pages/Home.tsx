import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Redirect } from "wouter";
import { Calendar, Users, BarChart3, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  // Se o usuário está autenticado, redireciona para o dashboard
  if (isAuthenticated && !loading) {
    return <Redirect to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="inline-flex animate-spin">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">BusinessHub</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Gerencie seu Negócio com Facilidade
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Sistema completo de agendamentos, gestão de clientes e relatórios para salões, clínicas e consultórios. Profissional, intuitivo e pronto para usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base h-12">
              <a href={getLoginUrl()}>Começar Agora</a>
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12">
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Agendamentos Online"
            description="Seus clientes marcam consultas 24/7. Você gerencia tudo em um calendário intuitivo."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="CRM de Clientes"
            description="Histórico completo de atendimentos, telefone, email e notas personalizadas."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Relatórios Detalhados"
            description="Faturamento, agendamentos e métricas de clientes com filtros por período."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Lembretes Automáticos"
            description="Notificações por email para confirmação e lembretes de agendamentos."
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Catálogo de Serviços"
            description="Organize seus serviços com preços, duração e descrição detalhada."
          />
          <FeatureCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Painel Administrativo"
            description="Acesso seguro exclusivo para o dono do negócio com autenticação."
          />
        </div>

        {/* Benefits Section */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Por que escolher BusinessHub?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitItem
              title="Economia de Tempo"
              description="Automatize agendamentos e lembretes. Menos ligações, mais produtividade."
            />
            <BenefitItem
              title="Aumento de Receita"
              description="Reduza cancelamentos com lembretes. Venda mais com relatórios de dados."
            />
            <BenefitItem
              title="Melhor Experiência"
              description="Seus clientes marcam online. Você oferece um serviço moderno e profissional."
            />
            <BenefitItem
              title="Fácil de Usar"
              description="Interface intuitiva. Nenhuma experiência técnica necessária. Comece em minutos."
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-center">Planos Simples e Transparentes</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Escolha o plano ideal para seu negócio
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Básico"
              price="R$ 99"
              description="Para pequenos negócios"
              features={[
                "Até 100 clientes",
                "Agendamentos ilimitados",
                "Relatórios básicos",
                "Suporte por email",
              ]}
            />
            <PricingCard
              name="Profissional"
              price="R$ 199"
              description="Para negócios em crescimento"
              features={[
                "Clientes ilimitados",
                "Agendamentos ilimitados",
                "Relatórios avançados",
                "Lembretes por email",
                "Suporte prioritário",
              ]}
              highlighted
            />
            <PricingCard
              name="Empresarial"
              price="Customizado"
              description="Para grandes operações"
              features={[
                "Tudo do Profissional",
                "Integração com Google Calendar",
                "API customizada",
                "Suporte 24/7",
                "Treinamento dedicado",
              ]}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar seu negócio?</h2>
          <p className="text-lg mb-8 opacity-90">
            Comece agora gratuitamente. Sem cartão de crédito necessário.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base h-12">
            <a href={getLoginUrl()}>Criar Conta Grátis</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-20">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-foreground">BusinessHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestão completa para seu negócio
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Recursos</a></li>
                <li><a href="#" className="hover:text-primary transition">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition">Termos</a></li>
                <li><a href="#" className="hover:text-primary transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 BusinessHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-border/40 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function BenefitItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
        <CheckCircle2 className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({ name, price, description, features, highlighted }: { name: string; price: string; description: string; features: string[]; highlighted?: boolean }) {
  return (
    <Card className={`border-2 transition-all ${highlighted ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-border/40"}`}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Customizado" && <span className="text-muted-foreground text-sm">/mês</span>}
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={highlighted ? "default" : "outline"}>
          Começar
        </Button>
      </CardContent>
    </Card>
  );
}
