import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CreditCard, Check, Clock, AlertCircle, ArrowLeft, Plus, DollarSign, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function Payments() {
  const [selectedAppointment, setSelectedAppointment] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: appointments, isLoading: appointmentsLoading } = trpc.appointments.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.list.useQuery();
  const { data: totalReceived } = trpc.abacatepay.getTotalReceived.useQuery();
  const createPaymentMutation = trpc.abacatepay.createLink.useMutation();

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!payments) return { completed: 0, pending: 0, total: 0 };
    
    const completed = payments.filter((p) => p.status === "completed").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    
    return { completed, pending, total: completed + pending };
  }, [payments]);

  const handleGeneratePaymentLink = async () => {
    if (!selectedAppointment) {
      toast.error("Selecione um agendamento");
      return;
    }

    const appointment = appointments?.find((a) => a.id === parseInt(selectedAppointment));
    if (!appointment) {
      toast.error("Agendamento não encontrado");
      return;
    }

    const client = clients?.find((c) => c.id === appointment.clientId);
    if (!client) {
      toast.error("Cliente não encontrado");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createPaymentMutation.mutateAsync({
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        amount: parseFloat(appointment.price || "0"),
        description: `Pagamento - Agendamento #${appointment.id}`,
        customerName: client.name,
        customerEmail: client.email || "nao-informado@example.com",
      });

      if (result.success) {
        toast.success("Link de pagamento gerado!");
        navigator.clipboard.writeText(result.paymentUrl);
        toast.success("Link copiado para clipboard!");
        setSelectedAppointment("");
      }
    } catch (error) {
      toast.error("Erro ao gerar link de pagamento");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <img src="/logo.png" className="absolute top-20 right-10 w-40 h-40 rotate-12" alt="" />
          <img src="/logo.png" className="absolute bottom-40 left-10 w-32 h-32 -rotate-45" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <DollarSign size={12} className="text-primary" /> Gestão Financeira
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              Financeiro
            </h1>
            <p className="text-black/60 font-bold text-xl">Gerencie seus ganhos com clareza.</p>
          </div>
          <Button 
            variant="outline" 
            asChild 
            className="h-14 rounded-2xl px-8 border-4 border-black font-black text-sm hover:bg-black/5 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto md:mx-0"
          >
            <a href="/dashboard"><ArrowLeft className="mr-2 w-5 h-5" /> Voltar</a>
          </Button>
        </div>

        {/* Métricas Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Total Recebido"
            value={`R$ ${(totalReceived?.total || 0).toFixed(2)}`}
            icon={<DollarSign size={24} />}
            color="primary"
          />
          <MetricCard
            title="Concluídos"
            value={metrics.completed}
            icon={<Check size={24} />}
            color="emerald"
          />
          <MetricCard
            title="Pendentes"
            value={metrics.pending}
            icon={<Clock size={24} />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulário de Geração de Link */}
          <Card className="lg:col-span-5 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b-4 border-black bg-black text-white">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Plus size={24} className="text-primary" /> Gerar Cobrança
              </CardTitle>
              <CardDescription className="font-bold text-white/40 uppercase text-xs mt-2">Envie um link PIX rápido</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="font-black text-xs uppercase tracking-widest text-black/60 ml-1">Selecione o Agendamento</Label>
                <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                  <SelectTrigger className="h-16 rounded-2xl border-4 border-black bg-muted/20 focus:ring-primary text-lg font-bold px-6">
                    <SelectValue placeholder="Escolha um serviço..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 border-black p-2">
                    {appointmentsLoading ? (
                      <div className="p-4 text-center font-bold italic">Carregando...</div>
                    ) : appointments && appointments.length > 0 ? (
                      appointments
                        .filter((apt) => apt.status !== "cancelled" && apt.status !== "no-show")
                        .map((appointment) => {
                          const client = clients?.find((c) => c.id === appointment.clientId);
                          return (
                            <SelectItem key={appointment.id} value={appointment.id.toString()} className="rounded-xl font-bold p-3">
                              {`${client?.name || `Cliente #${appointment.clientId}`} - R$ ${appointment.price}`}
                            </SelectItem>
                          );
                        })
                    ) : (
                      <div className="p-4 text-center font-bold italic">Nenhum agendamento</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGeneratePaymentLink}
                disabled={!selectedAppointment || isGenerating}
                className="w-full h-20 rounded-[2rem] text-2xl font-black bg-primary text-black border-4 border-black shadow-xl btn-hover-effect"
              >
                {isGenerating ? "GERANDO..." : "GERAR LINK PIX"}
              </Button>

              <div className="bg-primary/5 border-2 border-black/10 rounded-2xl p-6 text-center">
                <p className="text-black/60 text-sm font-bold uppercase tracking-tight">
                  <Sparkles size={16} className="inline mr-2 text-primary" />
                  O link será copiado na hora. <br />Só colar no WhatsApp da cliente!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Pagamentos */}
          <Card className="lg:col-span-7 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b-4 border-black">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Histórico de Fluxo</CardTitle>
              <CardDescription className="font-bold text-black/40 uppercase text-xs">Entradas recentes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsLoading ? (
                <div className="text-center py-20 font-bold italic">Carregando dados...</div>
              ) : payments && payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b-2 border-black">
                        <th className="py-4 px-6 text-left font-black text-xs uppercase tracking-widest text-black/40">Cliente</th>
                        <th className="py-4 px-6 text-left font-black text-xs uppercase tracking-widest text-black/40">Valor</th>
                        <th className="py-4 px-6 text-left font-black text-xs uppercase tracking-widest text-black/40">Status</th>
                        <th className="py-4 px-6 text-left font-black text-xs uppercase tracking-widest text-black/40">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => {
                        const client = clients?.find((c) => c.id === payment.clientId);
                        const statusStyles = {
                          completed: "bg-emerald-500 text-white",
                          pending: "bg-amber-500 text-white",
                          failed: "bg-red-500 text-white",
                          refunded: "bg-slate-500 text-white",
                        };
                        const statusLabel = {
                          completed: "PAGO",
                          pending: "PENDENTE",
                          failed: "FALHOU",
                          refunded: "ESTORNADO",
                        };

                        return (
                          <tr key={payment.id} className="border-b-2 border-black/5 hover:bg-primary/5 transition-all group text-center md:text-left">
                            <td className="py-5 px-6 font-black text-sm uppercase">{client?.name || "CLIENTE"}</td>
                            <td className="py-5 px-6 font-black text-lg text-primary drop-shadow-sm">R$ {parseFloat(payment.amount.toString()).toFixed(2)}</td>
                            <td className="py-5 px-6">
                              <span className={`px-3 py-1 rounded-full font-black text-[10px] border-2 border-black shadow-sm ${statusStyles[payment.status as keyof typeof statusStyles]}`}>
                                {statusLabel[payment.status as keyof typeof statusLabel]}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-xs font-bold text-black/40 uppercase">
                              {format(new Date(payment.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 text-black/20 flex flex-col items-center gap-4">
                  <AlertCircle size={48} className="opacity-20" />
                  <p className="font-black text-xl uppercase tracking-tighter italic">Nenhum pagamento registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorStyles = {
    primary: "bg-primary border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    emerald: "bg-emerald-500 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    amber: "bg-amber-500 border-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card className={`border-4 rounded-[2rem] p-8 transition-all ${colorStyles[color as keyof typeof colorStyles]}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{title}</p>
            <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
          </div>
          <div className="p-4 rounded-2xl bg-white/20 border-2 border-white/20 shadow-inner">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
