import DashboardLayout from "@/components/DashboardLayout";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { RevenueChart } from "@/components/RevenueChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, DollarSign, Clock, Plus, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

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
  
  payments
    .filter((p) => p.status === "completed")
    .forEach((payment) => {
      const paymentDate = new Date(payment.createdAt);
      const dateStr = format(paymentDate, "dd/MM", { locale: ptBR });
      if (dateStr in revenueByDate) {
        revenueByDate[dateStr] += parseFloat(payment.amount.toString());
      }
    });
  
  return Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function MetricCard({ title, value, icon, loading, subtext }: any) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card hover:shadow-md hover:border-primary/20 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {loading ? "..." : value}
              </p>
              {subtext && (
                <p className="text-xs text-muted-foreground mt-1">
                  {subtext}
                </p>
              )}
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = trpc.dashboard.upcomingAppointments.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-primary tracking-wider uppercase">Visão Geral</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo de volta. Aqui está o resumo do seu negócio hoje.
            </p>
          </div>
          <Button asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-6">
            <Link to="/appointments">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Clientes"
            value={metrics?.totalClients ?? 0}
            icon={<Users className="w-5 h-5" />}
            loading={metricsLoading}
            subtext="Cadastrados no sistema"
          />
          <MetricCard
            title="Agendamentos Ativos"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar className="w-5 h-5" />}
            loading={metricsLoading}
            subtext="Na agenda"
          />
          <MetricCard
            title="Hoje"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock className="w-5 h-5" />}
            loading={metricsLoading}
            subtext="Atendimentos para hoje"
          />
          <MetricCard
            title="Faturamento (7 dias)"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
            loading={metricsLoading}
            subtext="Receita confirmada"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Main Chart Area */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <Card className="glass-card border-border/50 overflow-hidden">
              <CardHeader className="pb-2 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Evolução do Faturamento
                </CardTitle>
                <CardDescription>
                  Pagamentos confirmados nos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <RevenueChart 
                  data={generateRevenueDataFromPayments(payments)} 
                />
              </CardContent>
            </Card>

            {/* Status Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="glass-card overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 ring-1 ring-amber-500/20">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Aguardando Execução</p>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{metrics?.pendingAppointments ?? 0}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 ring-1 ring-emerald-500/20">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Concluídos com Sucesso</p>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{metrics?.completedAppointments ?? 0}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Sidebar Area */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
            <Card className="glass-card border-border/50 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/40 bg-muted/20">
                <div>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Próximos
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs hover:text-primary">
                  <Link to="/appointments">
                    Ver todos
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 5).map((appointment, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={appointment.id}
                        className="group flex items-center justify-between p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm ring-1 ring-primary/20">
                            {format(new Date(appointment.startTime), "dd")}
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              #{appointment.id}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {format(new Date(appointment.startTime), "HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            R$ {appointment.price}
                          </p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1
                            ${appointment.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20' : 
                              appointment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/20' : 
                              'bg-muted text-muted-foreground ring-1 ring-inset ring-border'}`}>
                            {appointment.status === "scheduled" ? "Confirmado" : appointment.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                    <Calendar className="w-8 h-8 mb-2 opacity-20" />
                    Nenhum agendamento próximo
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Full Calendar View */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-border/50">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Calendário Completo
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todos os agendamentos do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AppointmentCalendar appointments={upcomingAppointments} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}