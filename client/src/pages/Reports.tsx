import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, Download, Calendar, ArrowLeft, TrendingUp, Users, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows = [];
      rows.push(["RELATORIO DE FATURAMENTO", format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })]);
      rows.push([]);
      rows.push(["Periodo", dateRange]);
      rows.push(["Faturamento Total", `R$ ${totalRevenue.toFixed(2)}`]);
      rows.push(["Ticket Medio", `R$ ${averageTicket.toFixed(2)}`]);
      rows.push(["Total de Pagamentos", filteredPayments.length]);
      rows.push([]);
      rows.push(["DETALHES DE PAGAMENTOS"]);
      rows.push(["Data", "Cliente", "Valor", "Metodo", "Status"]);
      
      filteredPayments.forEach((p) => {
        rows.push([
          format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR }),
          `Cliente #${p.clientId}`,
          `R$ ${parseFloat(p.amount.toString()).toFixed(2)}`,
          p.paymentMethod,
          p.status,
        ]);
      });

      const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_${dateRange}_${format(new Date(), "ddMMyyyy")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatorio exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatorio");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <img src="/logo.png" className="absolute top-10 left-1/4 w-32 h-32 rotate-12" alt="" />
          <img src="/logo.png" className="absolute bottom-20 right-1/4 w-48 h-48 -rotate-12" alt="" />
          <img src="/logo.png" className="absolute top-1/2 right-10 w-24 h-24 rotate-45" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Sparkles size={12} className="text-primary" /> Metricas Reais
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              Relatórios
            </h1>
            <p className="text-black/60 font-bold text-xl">
              Acompanhe o crescimento da sua Pêra.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              asChild 
              className="h-14 rounded-2xl px-6 border-4 border-black font-black text-sm hover:bg-black/5 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <a href="/dashboard"><ArrowLeft className="mr-2 w-5 h-5" /> Voltar</a>
            </Button>
            <Button 
              onClick={handleExportCSV} 
              disabled={isExporting} 
              className="h-14 rounded-2xl px-8 font-black text-sm bg-primary text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              {isExporting ? "Exportando..." : "Baixar CSV"}
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-black text-white p-6 md:p-8">
            <CardTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              Filtrar por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {[
                { value: "week", label: "Última Semana" },
                { value: "month", label: "Último Mês" },
                { value: "quarter", label: "Trimestre" },
                { value: "year", label: "Último Ano" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? "default" : "outline"}
                  className={`h-12 rounded-xl px-6 font-black uppercase tracking-tighter border-2 ${
                    dateRange === option.value 
                    ? "bg-primary text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    : "border-black/10 hover:border-black"
                  }`}
                  onClick={() => setDateRange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Faturamento Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={`${filteredPayments.length} transações`}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <ReportCard
            title="Ticket Médio"
            value={`R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="Por atendimento"
            icon={<BarChart3 className="w-6 h-6" />}
          />
          <ReportCard
            title="Agendamentos"
            value={filteredAppointments.length}
            subtitle={`${completedAppointments} concluídos`}
            icon={<Calendar className="w-6 h-6" />}
          />
          <ReportCard
            title="Sucesso"
            value={filteredAppointments.length > 0
              ? `${((completedAppointments / filteredAppointments.length) * 100).toFixed(1)}%`
              : "0%"
            }
            subtitle="Atendimentos reais"
            icon={<Sparkles className="w-6 h-6" />}
          />
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments Report */}
          <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white overflow-hidden">
            <CardHeader className="p-8 border-b-4 border-black">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Status da Agenda</CardTitle>
              <CardDescription className="font-bold text-black/40 uppercase text-xs">Visão geral do período</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <ReportRow
                  label="Agendados"
                  value={filteredAppointments.filter((a) => a.status === "scheduled").length}
                  color="bg-primary/20 text-black border-2 border-black"
                />
                <ReportRow
                  label="Concluídos"
                  value={completedAppointments}
                  color="bg-emerald-500 text-white border-2 border-black"
                />
                <ReportRow
                  label="Cancelados"
                  value={cancelledAppointments}
                  color="bg-red-500 text-white border-2 border-black"
                />
                <ReportRow
                  label="Não Compareceu"
                  value={noShowAppointments}
                  color="bg-amber-500 text-white border-2 border-black"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Report */}
          <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white overflow-hidden text-center md:text-left">
            <CardHeader className="p-8 border-b-4 border-black bg-black text-white text-center md:text-left">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Meios de Pagamento</CardTitle>
              <CardDescription className="font-bold text-white/40 uppercase text-xs">Onde o dinheiro entra</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {["cash", "card", "pix", "transfer"].map((method) => {
                  const count = filteredPayments.filter(
                    (p) => p.paymentMethod === method
                  ).length;
                  const amount = filteredPayments
                    .filter((p) => p.paymentMethod === method)
                    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

                  return (
                    <div key={method} className="flex justify-between items-center p-4 border-2 border-black rounded-2xl bg-muted/20 hover:bg-primary/10 transition-all">
                      <span className="capitalize font-black text-sm uppercase tracking-widest">{method === 'cash' ? 'Dinheiro' : method}</span>
                      <div className="text-right">
                        <p className="font-black text-lg">R$ {amount.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-black/40 uppercase">{count} Transações</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Report */}
        <Card className="border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[4rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b-4 border-black text-center md:text-left">
            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Minhas Clientes</CardTitle>
            <CardDescription className="font-bold text-black/40 uppercase text-xs">Análise de base</CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(120,190,32,1)] bg-background">
                <p className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Base Total</p>
                <p className="text-4xl font-black tracking-tighter">{clients?.length ?? 0}</p>
              </div>
              <div className="border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(120,190,32,1)] bg-background">
                <p className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Fiéis (Visitaram)</p>
                <p className="text-4xl font-black tracking-tighter">
                  {clients?.filter((c) => c.lastVisit).length ?? 0}
                </p>
              </div>
              <div className="border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(120,190,32,1)] bg-background">
                <p className="text-xs font-black text-black/40 uppercase tracking-widest mb-2">Valor de Vida</p>
                <p className="text-4xl font-black tracking-tighter">
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
    <motion.div whileHover={{ y: -5 }}>
      <Card className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] bg-white overflow-hidden relative group h-full">
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 relative z-10">
          <CardTitle className="text-xs font-black text-black/40 uppercase tracking-[0.2em]">{title}</CardTitle>
          <div className="text-primary drop-shadow-md">{icon}</div>
        </CardHeader>
        <CardContent className="p-6 pt-0 relative z-10">
          <div className="text-3xl font-black tracking-tighter text-black">{value}</div>
          <p className="text-[10px] font-bold text-black/40 uppercase mt-1 tracking-widest">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReportRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center p-4 border-2 border-black rounded-2xl bg-muted/10 hover:scale-[1.01] transition-transform">
      <span className="font-black text-sm uppercase tracking-widest">{label}</span>
      <span className={`inline-block px-4 py-1.5 text-base rounded-full font-black shadow-sm ${color}`}>
        {value}
      </span>
    </div>
  );
}
