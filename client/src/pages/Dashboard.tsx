import DashboardLayout from "@/components/DashboardLayout";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { RevenueChart } from "@/components/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <img src="/logo.png" className="absolute top-0 right-0 w-64 h-64 rotate-45" alt="" />
          <img src="/logo.png" className="absolute bottom-0 left-0 w-48 h-48 -rotate-12" alt="" />
        </div>

        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b-4 border-black pb-12 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] mx-auto lg:mx-0 shadow-[4px_4px_0px_0px_rgba(120,190,32,1)]">
              <Zap size={14} className="text-primary fill-primary" /> Painel Geral
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-black uppercase leading-[0.85]">
              Papel e caneta?<br /><span className="text-primary italic drop-shadow-sm">Pera aí né...</span>
            </h1>
            <p className="text-black/60 font-bold text-xl md:text-2xl">
              Olá, {user?.name.split(' ')[0]}! Veja seu pomar florescer hoje.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto"
          >
            <Button 
              variant="outline" 
              onClick={copyBookingLink}
              className="w-full sm:w-auto h-20 rounded-[1.5rem] px-10 border-4 border-black font-black text-sm md:text-lg hover:bg-black/5 transition-all gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
            >
              {copied ? <Check size={20} className="text-primary" /> : <Copy size={20} />}
              {copied ? "COPIADO!" : "LINK DE AGENDAMENTO"}
            </Button>
            <Link href="/appointments" className="w-full sm:w-auto">
              <Button className="w-full h-20 rounded-[1.5rem] px-12 font-black text-xl md:text-2xl btn-hover-effect bg-primary text-black border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] gap-3">
                <Plus size={32} /> NOVO HORÁRIO
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard
            title="Minhas Clientes"
            value={metrics?.totalClients ?? 0}
            icon={<Users size={32} />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="Agendamentos"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar size={32} />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="Atendimentos Hoje"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock size={32} />}
            color="black"
            loading={metricsLoading}
          />
          <MetricCard
            title="Faturamento (7d)"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign size={32} />}
            color="primary"
            loading={metricsLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Chart Area */}
          <Card className="lg:col-span-8 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="p-8 md:p-10 border-b-4 border-black bg-black text-white text-center md:text-left">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-black tracking-tighter uppercase">Fluxo de Caixa</CardTitle>
                  <CardDescription className="font-bold text-white/50 uppercase tracking-widest text-xs mt-2">Ganhos reais nos últimos 7 dias</CardDescription>
                </div>
                <div className="p-4 rounded-2xl bg-primary text-black border-2 border-black shadow-lg">
                  <TrendingUp size={32} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              <RevenueChart data={generateRevenueDataFromPayments(payments)} />
            </CardContent>
          </Card>

          {/* Upcoming Area */}
          <Card className="lg:col-span-4 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white text-center md:text-left">
            <CardHeader className="p-8 border-b-4 border-black bg-muted/20">
              <CardTitle className="text-3xl font-black tracking-tighter uppercase text-black">Próximos</CardTitle>
              <CardDescription className="font-bold text-black/40 uppercase tracking-widest text-xs mt-2">Sua colheita de hoje</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center h-80"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div></div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-6">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-background border-4 border-black hover:bg-primary/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-black text-primary border-2 border-black flex items-center justify-center text-2xl font-black shadow-lg">
                          {format(new Date(appointment.startTime), "HH")}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-black text-lg">Cliente #{appointment.id}</p>
                          <p className="text-xs font-black text-black/40 uppercase tracking-widest">{format(new Date(appointment.startTime), "HH:mm")}</p>
                        </div>
                      </div>
                      <ArrowRight size={24} className="text-black group-hover:translate-x-2 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-black/10 italic font-black text-2xl uppercase tracking-tighter">Agenda Livre</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Card */}
        <Card className="border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] rounded-[4rem] overflow-hidden bg-white">
          <CardHeader className="p-10 md:p-12 border-b-4 border-black text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 rounded-[2.5rem] bg-primary text-black border-4 border-black shadow-xl scale-110">
                <Calendar size={48} />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-5xl font-black tracking-tighter uppercase text-black leading-none">Calendário Geral</CardTitle>
                <CardDescription className="font-black text-black/40 uppercase tracking-widest text-sm">Visão total de todos os atendimentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
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
      whileHover={{ scale: 1.02, y: -10 }}
      className="relative group"
    >
      <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] overflow-hidden bg-white relative z-10">
        <CardContent className="p-10">
          <div className="flex items-start justify-between">
            <div className="space-y-4 text-left">
              <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">{title}</p>
              <h3 className="text-5xl font-black tracking-tighter text-black">
                {loading ? "..." : value}
              </h3>
            </div>
            <div className={`p-6 rounded-[1.5rem] ${color === 'primary' ? 'bg-primary text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]' : 'bg-black text-white shadow-[5px_5px_0px_0px_rgba(120,190,32,1)]'} border-4 border-black`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
