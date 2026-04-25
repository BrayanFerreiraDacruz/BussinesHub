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
    toast.success("Link de agendamento copiado! Mande para suas clientes.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b-4 border-black pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-[0.3em]">
              <Zap className="w-4 h-4 text-primary fill-primary" /> PAINEL PROFISSIONAL
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-black">
              Papel e caneta? <span className="text-primary italic">Pera aí né...</span>
            </h1>
            <p className="text-black font-bold text-2xl opacity-80">
              Olá, {user?.name.split(' ')[0]}! Seu negócio está florescendo hoje.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button 
              variant="outline" 
              onClick={copyBookingLink}
              className="h-20 rounded-[1.5rem] px-10 border-4 border-black font-black text-xl hover:bg-black/5 transition-all gap-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
            >
              {copied ? <Check className="w-6 h-6 text-primary" /> : <Copy className="w-6 h-6" />}
              {copied ? "COPIADO!" : "MEU LINK DE AGENDAMENTO"}
            </Button>
            <Link href="/appointments">
              <Button className="h-20 rounded-[1.5rem] px-12 font-black text-2xl btn-hover-effect bg-primary text-black border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] gap-3">
                <Plus className="w-8 h-8" /> NOVO HORÁRIO
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard
            title="MINHAS CLIENTES"
            value={metrics?.totalClients ?? 0}
            icon={<Users className="w-8 h-8" />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="AGENDAMENTOS"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar className="w-8 h-8" />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="ATENDIMENTOS HOJE"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock className="w-8 h-8" />}
            color="black"
            loading={metricsLoading}
          />
          <MetricCard
            title="FATURAMENTO"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="w-8 h-8" />}
            color="primary"
            loading={metricsLoading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Chart Area */}
          <Card className="lg:col-span-8 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="p-10 border-b-4 border-black bg-black text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-black tracking-tighter uppercase">Fluxo de Caixa</CardTitle>
                  <CardDescription className="font-bold text-white/50 uppercase tracking-widest text-xs mt-2">Ganhos reais nos últimos 7 dias</CardDescription>
                </div>
                <div className="p-4 rounded-2xl bg-primary text-black">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <RevenueChart data={generateRevenueDataFromPayments(payments)} />
            </CardContent>
          </Card>

          {/* Upcoming Area */}
          <Card className="lg:col-span-4 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="p-10 border-b-4 border-black">
              <CardTitle className="text-3xl font-black tracking-tighter uppercase text-black">Próximos</CardTitle>
              <CardDescription className="font-bold text-black/40 uppercase tracking-widest text-xs mt-2">Sua colheita de hoje</CardDescription>
            </Header>
            <CardContent className="p-8">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center h-80"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div></div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-6">
                  {upcomingAppointments.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-[#F8F7E5] border-4 border-black hover:bg-primary/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-black text-primary flex items-center justify-center text-xl font-black">
                          {format(new Date(appointment.startTime), "HH")}
                        </div>
                        <div>
                          <p className="font-black text-black text-lg">Cliente #{appointment.id}</p>
                          <p className="text-sm font-black text-black/40 uppercase tracking-widest">{format(new Date(appointment.startTime), "HH:mm")}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-black/20 italic font-black text-xl uppercase tracking-tighter">Agenda Livre</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Card */}
        <Card className="border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] rounded-[4rem] overflow-hidden bg-white">
          <CardHeader className="p-12 border-b-4 border-black">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-3xl bg-primary text-black border-4 border-black shadow-xl">
                <Calendar className="w-10 h-10" />
              </div>
              <div>
                <CardTitle className="text-4xl font-black tracking-tighter uppercase text-black">Calendário Geral</CardTitle>
                <CardDescription className="font-black text-black/40 uppercase tracking-widest text-sm mt-2">Visão total do seu pomar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12">
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
      <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] overflow-hidden bg-white relative z-10">
        <CardContent className="p-10">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <p className="text-xs font-black text-black/40 uppercase tracking-[0.3em]">{title}</p>
              <h3 className="text-5xl font-black tracking-tighter text-black">
                {loading ? "..." : value}
              </h3>
            </div>
            <div className={`p-5 rounded-2xl ${color === 'primary' ? 'bg-primary text-black' : 'bg-black text-white'} border-4 border-black shadow-xl`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
