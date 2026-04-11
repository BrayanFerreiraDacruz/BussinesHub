import DashboardLayout from "@/components/DashboardLayout";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { RevenueChart } from "@/components/RevenueChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, DollarSign, Clock, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

function generateRevenueData(appointments: any[] | undefined) {
  if (!appointments) return [];
  
  const revenueByDate: Record<string, number> = {};
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "dd/MM", { locale: ptBR });
    revenueByDate[dateStr] = 0;
  }
  
  appointments.forEach((apt) => {
    const aptDate = new Date(apt.startTime);
    const dateStr = format(aptDate, "dd/MM", { locale: ptBR });
    if (dateStr in revenueByDate && apt.price) {
      revenueByDate[dateStr] += parseFloat(apt.price);
    }
  });
  
  return Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

function MetricCard({ title, value, icon, loading, gradient }: any) {
  const gradients = {
    1: "from-purple-600/20 to-purple-900/20 border-purple-500/30",
    2: "from-cyan-600/20 to-cyan-900/20 border-cyan-500/30",
    3: "from-green-600/20 to-green-900/20 border-green-500/30",
    4: "from-pink-600/20 to-pink-900/20 border-pink-500/30",
  };

  const iconColors = {
    1: "text-purple-400",
    2: "text-cyan-400",
    3: "text-green-400",
    4: "text-pink-400",
  };

  return (
    <Card className={`bg-gradient-to-br ${gradients[gradient as keyof typeof gradients] || gradients[1]} border`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2 text-foreground">
              {loading ? "..." : value}
            </p>
          </div>
          <div className={`${iconColors[gradient as keyof typeof iconColors] || iconColors[1]} opacity-80`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = trpc.dashboard.upcomingAppointments.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo! Aqui está uma visão geral do seu negócio.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
            <Link to="/appointments">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        {/* Metrics Grid - Gradientes Neon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Clientes"
            value={metrics?.totalClients ?? 0}
            icon={<Users className="w-6 h-6" />}
            loading={metricsLoading}
            gradient={1}
          />
          <MetricCard
            title="Agendamentos"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar className="w-6 h-6" />}
            loading={metricsLoading}
            gradient={2}
          />
          <MetricCard
            title="Hoje"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock className="w-6 h-6" />}
            loading={metricsLoading}
            gradient={3}
          />
          <MetricCard
            title="Faturamento"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6" />}
            loading={metricsLoading}
            gradient={4}
          />
        </div>

        {/* Status Overview - Cards com Gradientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 hover:border-purple-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                Agendamentos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400">
                {metrics?.pendingAppointments ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Aguardando execução
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                Agendamentos Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">
                {metrics?.completedAppointments ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Neste período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card className="bg-card/50 border border-border/50 hover:border-border transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Calendário de Agendamentos
            </CardTitle>
            <CardDescription>
              Visualize todos os agendamentos do mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar appointments={upcomingAppointments} />
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <RevenueChart 
          data={generateRevenueData(upcomingAppointments)} 
          title="Faturamento"
          description="Faturamento dos últimos 7 dias"
        />

        {/* Upcoming Appointments */}
        <Card className="bg-card/50 border border-border/50 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-400" />
                Próximos Agendamentos
              </CardTitle>
              <CardDescription>
                Seus agendamentos programados para os próximos dias
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/appointments">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{apt.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.serviceName} • {format(new Date(apt.startTime), "dd MMM HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-cyan-400">R$ {parseFloat(apt.price || 0).toFixed(2)}</p>
                      <p className={`text-xs font-medium ${
                        apt.status === "completed" ? "text-green-400" :
                        apt.status === "cancelled" ? "text-red-400" :
                        "text-yellow-400"
                      }`}>
                        {apt.status === "completed" ? "Concluído" :
                         apt.status === "cancelled" ? "Cancelado" :
                         "Agendado"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum agendamento próximo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
