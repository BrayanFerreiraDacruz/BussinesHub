import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");

  const { data: appointments } = trpc.appointments.list.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const filteredAppointments = appointments?.filter(
      (apt) => new Date(apt.startTime) >= startDate
    ) || [];

    const filteredPayments = payments?.filter(
      (p) => new Date(p.createdAt) >= startDate && p.status === "completed"
    ) || [];

    return { filteredAppointments, filteredPayments };
  };

  const { filteredAppointments, filteredPayments } = getFilteredData();

  const totalRevenue = filteredPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const completedAppointments = filteredAppointments.filter(
    (a) => a.status === "completed"
  ).length;

  const cancelledAppointments = filteredAppointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  const noShowAppointments = filteredAppointments.filter(
    (a) => a.status === "no-show"
  ).length;

  const averageTicket = filteredPayments.length > 0
    ? totalRevenue / filteredPayments.length
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relatorios</h1>
            <p className="text-muted-foreground mt-1">
              Analise o desempenho do seu negocio
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatorio
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "week", label: "Ultima Semana" },
                { value: "month", label: "Ultimo Mes" },
                { value: "quarter", label: "Ultimo Trimestre" },
                { value: "year", label: "Ultimo Ano" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportCard
            title="Faturamento Total"
            value={`R$ ${totalRevenue.toFixed(2)}`}
            subtitle={`${filteredPayments.length} pagamentos`}
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <ReportCard
            title="Ticket Medio"
            value={`R$ ${averageTicket.toFixed(2)}`}
            subtitle="Por transacao"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <ReportCard
            title="Agendamentos"
            value={filteredAppointments.length}
            subtitle={`${completedAppointments} concluidos`}
            icon={<Calendar className="w-5 h-5" />}
          />
          <ReportCard
            title="Taxa de Conclusao"
            value={filteredAppointments.length > 0
              ? `${((completedAppointments / filteredAppointments.length) * 100).toFixed(1)}%`
              : "0%"
            }
            subtitle="Agendamentos concluidos"
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Appointments Report */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Relatorio de Agendamentos</CardTitle>
              <CardDescription>
                Status dos agendamentos no periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ReportRow
                  label="Agendados"
                  value={filteredAppointments.filter((a) => a.status === "scheduled").length}
                  color="bg-blue-100 text-blue-800"
                />
                <ReportRow
                  label="Concluidos"
                  value={completedAppointments}
                  color="bg-green-100 text-green-800"
                />
                <ReportRow
                  label="Cancelados"
                  value={cancelledAppointments}
                  color="bg-red-100 text-red-800"
                />
                <ReportRow
                  label="Nao Compareceu"
                  value={noShowAppointments}
                  color="bg-yellow-100 text-yellow-800"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Report */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Relatorio de Pagamentos</CardTitle>
              <CardDescription>
                Metodos de pagamento utilizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["cash", "card", "pix", "transfer"].map((method) => {
                  const count = filteredPayments.filter(
                    (p) => p.paymentMethod === method
                  ).length;
                  const amount = filteredPayments
                    .filter((p) => p.paymentMethod === method)
                    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

                  return (
                    <div key={method} className="flex justify-between items-center p-2 border border-border/40 rounded">
                      <span className="capitalize text-sm">{method}</span>
                      <div className="text-right">
                        <p className="font-semibold text-sm">R$ {amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{count} transacoes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Report */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Relatorio de Clientes</CardTitle>
            <CardDescription>
              Metricas gerais de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border/40 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients?.length ?? 0}</p>
              </div>
              <div className="border border-border/40 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Clientes Ativos</p>
                <p className="text-2xl font-bold">
                  {clients?.filter((c) => c.lastVisit).length ?? 0}
                </p>
              </div>
              <div className="border border-border/40 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Gasto Medio</p>
                <p className="text-2xl font-bold">
                  R$ {clients && clients.length > 0
                    ? (clients.reduce((sum, c) => sum + parseFloat(c.totalSpent?.toString() || "0"), 0) / clients.length).toFixed(2)
                    : "0.00"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function ReportCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ReportRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center p-2 border border-border/40 rounded">
      <span className="text-sm">{label}</span>
      <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${color}`}>
        {value}
      </span>
    </div>
  );
}
