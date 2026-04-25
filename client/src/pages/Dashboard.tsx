import DashboardLayout from "@/components/DashboardLayout";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { RevenueChart } from "@/components/RevenueChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, DollarSign, Clock, Plus, ArrowRight, TrendingUp, Sparkles, Copy, Check, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

function generateRevenueDataFromPayments(payments: any[] | undefined) {
  if (!payments) return [];
  const revenueByDate: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "dd/MM", { locale: ptBR });
    revenueByDate[dateStr] = 0;
  }
  payments.filter((p) => p.status === "completed").forEach((payment) => {
    const paymentDate = new Date(payment.createdAt);
    const dateStr = format(paymentDate, "dd/MM", { locale: ptBR });
    if (dateStr in revenueByDate) {
      revenueByDate[dateStr] += parseFloat(payment.amount.toString());
    }
  });
  return Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue }));
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = trpc.dashboard.upcomingAppointments.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  const [copied, setCopied] = useState(false);

  const copyBookingLink = () => {
    if (!user) return;
    const link = `${window.location.origin}/book/${user.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link de agendamento copiado! Mande para suas clientes.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3" /> Dashboard Profissional
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
              Papel e caneta? <span className="text-primary italic">Pera aí né...</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              Olá, {user?.name.split(' ')[0]}! Veja como seu negócio está crescendo hoje.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button 
              variant="outline" 
              onClick={copyBookingLink}
              className="h-14 rounded-2xl px-6 border-2 font-bold hover:bg-primary/5 transition-all gap-3"
            >
              {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
              {copied ? "Copiado com Sucesso!" : "Copiar meu Link de Agendamento"}
            </Button>
            <Link href="/appointments">
              <Button className="h-14 rounded-2xl px-8 font-black text-lg btn-hover-effect shadow-primary/20 gap-2">
                <Plus className="w-6 h-6" /> Novo Horário
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Minhas Clientes"
            value={metrics?.totalClients ?? 0}
            icon={<Users className="w-6 h-6" />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="Agendamentos"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="Hoje"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock className="w-6 h-6" />}
            color="accent"
            loading={metricsLoading}
          />
          <MetricCard
            title="Faturamento"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="w-6 h-6" />}
            color="primary"
            loading={metricsLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Area */}
          <Card className="lg:col-span-8 border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black tracking-tighter">Fluxo de Caixa</CardTitle>
                  <CardDescription className="font-medium">Seus ganhos nos últimos 7 dias</CardDescription>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <RevenueChart data={generateRevenueDataFromPayments(payments)} />
            </CardContent>
          </Card>

          {/* Upcoming Area */}
          <Card className="lg:col-span-4 border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8 border-b border-border/50">
              <CardTitle className="text-2xl font-black tracking-tighter">Próximos Clientes</CardTitle>
              <CardDescription className="font-medium">O que vem por aí</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-background border border-border/50 hover:border-primary/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black animate-pulse">
                          {format(new Date(appointment.startTime), "HH")}
                        </div>
                        <div>
                          <p className="font-black text-foreground group-hover:text-primary transition-colors">Cliente #{appointment.id}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{format(new Date(appointment.startTime), "HH:mm")}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic font-medium">Agenda livre no momento</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Card */}
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="p-8 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary pera-glow">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tighter">Calendário Completo</CardTitle>
                <CardDescription className="font-medium">Visão mensal da sua Pêra</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <AppointmentCalendar appointments={upcomingAppointments} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, loading, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-primary/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.02)] rounded-[2rem] overflow-hidden bg-white relative z-10">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
              <h3 className="text-4xl font-black tracking-tighter text-foreground">
                {loading ? "..." : value}
              </h3>
            </div>
            <div className={`p-4 rounded-[1.25rem] ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'} ring-1 ring-inset ring-white/20 shadow-inner`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
