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
      <div className="space-y-8">
        {/* Header - More Compact */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-2 border-black/5 pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-widest">
              <Zap size={12} className="text-primary fill-primary" /> PAINEL
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black">
              Papel e caneta? <span className="text-primary italic">Pera aí...</span>
            </h1>
            <p className="text-black/60 font-bold text-lg">
              Olá, {user?.name.split(' ')[0]}! Veja seu resumo de hoje.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button 
              variant="outline" 
              onClick={copyBookingLink}
              size="sm"
              className="h-11 rounded-xl px-6 border-2 border-black font-bold text-xs hover:bg-black/5 transition-all gap-2"
            >
              {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              {copied ? "COPIADO" : "LINK DE AGENDAMENTO"}
            </Button>
            <Link href="/appointments">
              <Button size="sm" className="h-11 rounded-xl px-8 font-black text-sm btn-hover-effect bg-primary text-black border-2 border-black gap-2">
                <Plus size={16} /> NOVO HORÁRIO
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Metrics - Smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="CLIENTES"
            value={metrics?.totalClients ?? 0}
            icon={<Users size={20} />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="AGENDA"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar size={20} />}
            color="primary"
            loading={metricsLoading}
          />
          <MetricCard
            title="HOJE"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock size={20} />}
            color="black"
            loading={metricsLoading}
          />
          <MetricCard
            title="RECEITA"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign size={20} />}
            color="primary"
            loading={metricsLoading}
          />
        </div>

        {/* Content - Compact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-2 border-black shadow-lg rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-6 border-b-2 border-black bg-black text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Fluxo de Caixa</CardTitle>
                  <CardDescription className="font-bold text-white/40 uppercase tracking-widest text-[9px]">Últimos 7 dias</CardDescription>
                </div>
                <TrendingUp size={20} className="text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px]">
                <RevenueChart data={generateRevenueDataFromPayments(payments)} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-2 border-black shadow-lg rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-6 border-b-2 border-black">
              <CardTitle className="text-xl font-black uppercase tracking-tight text-black">Próximos</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {appointmentsLoading ? (
                <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div></div>
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-black/5 hover:bg-primary/5 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black text-primary flex items-center justify-center text-sm font-black">
                          {format(new Date(appointment.startTime), "HH")}
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-black text-sm">#{appointment.id}</p>
                          <p className="text-[10px] font-black text-black/40 uppercase">{format(new Date(appointment.startTime), "HH:mm")}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-black/20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-black/20 font-black text-sm uppercase">Vazio</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar - Less padding */}
        <Card className="border-2 border-black shadow-lg rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 border-b-2 border-black flex flex-row items-center gap-4">
            <div className="p-3 rounded-xl bg-primary text-black border-2 border-black">
              <Calendar size={20} />
            </div>
            <CardTitle className="text-2xl font-black uppercase text-black tracking-tight">Agenda Completa</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AppointmentCalendar appointments={upcomingAppointments} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, loading, color }: any) {
  return (
    <Card className="border-2 border-black shadow-md rounded-[1.5rem] overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black tracking-tight text-black">
              {loading ? "..." : value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${color === 'primary' ? 'bg-primary text-black' : 'bg-black text-white'} border-2 border-black shadow-sm`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
