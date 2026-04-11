import DashboardLayout from "@/components/DashboardLayout";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { RevenueChart } from "@/components/RevenueChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, DollarSign, Clock, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

function generateRevenueData(appointments: any[] | undefined) {
  if (!appointments) return [];
  
  const revenueByDate: Record<string, number> = {};
  const today = new Date();
  
  // Inicializar ultimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date, "dd/MM", { locale: ptBR });
    revenueByDate[dateStr] = 0;
  }
  
  // Somar receita por data
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

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = trpc.dashboard.upcomingAppointments.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo! Aqui está uma visão geral do seu negócio.
            </p>
          </div>
          <Button asChild>
            <Link to="/appointments">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Clientes"
            value={metrics?.totalClients ?? 0}
            icon={<Users className="w-5 h-5" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Agendamentos"
            value={metrics?.totalAppointments ?? 0}
            icon={<Calendar className="w-5 h-5" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Hoje"
            value={metrics?.todayAppointments ?? 0}
            icon={<Clock className="w-5 h-5" />}
            loading={metricsLoading}
          />
          <MetricCard
            title="Faturamento"
            value={`R$ ${(metrics?.totalRevenue ?? 0).toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
            loading={metricsLoading}
          />
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Agendamentos Confirmados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {metrics?.pendingAppointments ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Aguardando execução
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Agendamentos Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {metrics?.completedAppointments ?? 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Neste período
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendario */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Calendario de Agendamentos</CardTitle>
            <CardDescription>
              Visualize todos os agendamentos do mes
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
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Seus agendamentos programados para os próximos dias
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/appointments">
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <AppointmentRow key={apt.id} appointment={apt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum agendamento programado</p>
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link to="/appointments">Criar Agendamento</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Novo Cliente"
            description="Adicione um cliente ao seu CRM"
            href="/clients"
            icon={<Users className="w-5 h-5" />}
          />
          <QuickActionCard
            title="Novo Serviço"
            description="Cadastre um novo serviço"
            href="/services"
            icon={<Plus className="w-5 h-5" />}
          />
          <QuickActionCard
            title="Ver Relatórios"
            description="Analise faturamento e métricas"
            href="/reports"
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, loading }: { title: string; value: string | number; icon: React.ReactNode; loading: boolean }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 bg-muted rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function AppointmentRow({ appointment }: { appointment: any }) {
  return (
    <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/50 transition">
      <div className="flex-1">
        <p className="font-medium text-sm">Cliente #{appointment.clientId}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(appointment.startTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">
          {appointment.price ? `R$ ${parseFloat(appointment.price).toFixed(2)}` : "-"}
        </p>
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary mt-1">
          {appointment.status === "scheduled" ? "Agendado" : appointment.status}
        </span>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: React.ReactNode }) {
  return (
    <Link to={href}>
      <Card className="border-border/40 hover:border-primary/40 cursor-pointer transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
