import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CreditCard, Check, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

    // Buscar dados do cliente
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
        // Copiar para clipboard
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Pagamentos
          </h1>
          <p className="text-gray-400 mt-2">Gere links de pagamento para seus clientes</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Recebido</p>
                <p className="text-3xl font-bold text-cyan-400">
                  R$ {(totalReceived?.total || 0).toFixed(2)}
                </p>
              </div>
              <CreditCard className="text-cyan-400" size={40} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pagamentos Concluídos</p>
                <p className="text-3xl font-bold text-green-400">{metrics.completed}</p>
              </div>
              <Check className="text-green-400" size={40} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pagamentos Pendentes</p>
                <p className="text-3xl font-bold text-yellow-400">{metrics.pending}</p>
              </div>
              <Clock className="text-yellow-400" size={40} />
            </div>
          </Card>
        </div>

        {/* Formulário de Geração de Link */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Gerar Link de Pagamento</h2>

          <div className="space-y-6">
            <div>
              <Label className="text-gray-300">Selecione um Agendamento</Label>
              <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-2">
                  <SelectValue placeholder="Escolha um agendamento..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {appointmentsLoading ? (
                    <div className="p-2 text-gray-400">Carregando...</div>
                  ) : appointments && appointments.length > 0 ? (
                    appointments
                      .filter((apt) => apt.status !== "cancelled" && apt.status !== "no-show")
                      .map((appointment) => {
                        const client = clients?.find((c) => c.id === appointment.clientId);
                        return (
                          <SelectItem key={appointment.id} value={appointment.id.toString()}>
                            {`${client?.name || `Cliente #${appointment.clientId}`} - R$ ${appointment.price} - ${format(new Date(appointment.startTime), "dd/MM HH:mm", { locale: ptBR })}`}
                          </SelectItem>
                        );
                      })
                  ) : (
                    <div className="p-2 text-gray-400">Nenhum agendamento disponível</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGeneratePaymentLink}
              disabled={!selectedAppointment || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg"
            >
              {isGenerating ? "Gerando..." : "Gerar Link de Pagamento"}
            </Button>

            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-gray-300 text-sm">
                💡 <strong>Dica:</strong> O link será copiado automaticamente para seu clipboard. Compartilhe com o cliente para que ele pague via PIX.
              </p>
            </div>
          </div>
        </Card>

        {/* Histórico de Pagamentos */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 p-8">
          <h2 className="text-xl font-bold text-white mb-6">Histórico de Pagamentos</h2>

          {paymentsLoading ? (
            <div className="text-center py-8 text-gray-400">Carregando...</div>
          ) : payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400">ID</th>
                    <th className="text-left py-3 px-4 text-gray-400">Cliente</th>
                    <th className="text-left py-3 px-4 text-gray-400">Valor</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const client = clients?.find((c) => c.id === payment.clientId);
                    const statusColor = {
                      completed: "text-green-400",
                      pending: "text-yellow-400",
                      failed: "text-red-400",
                      refunded: "text-gray-400",
                    };
                    const statusLabel = {
                      completed: "Concluído",
                      pending: "Pendente",
                      failed: "Falhou",
                      refunded: "Reembolsado",
                    };

                    return (
                      <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-3 px-4 text-gray-300">#{payment.id}</td>
                        <td className="py-3 px-4 text-gray-300">{client?.name || "Cliente desconhecido"}</td>
                        <td className="py-3 px-4 text-gray-300">R$ {parseFloat(payment.amount.toString()).toFixed(2)}</td>
                        <td className={`py-3 px-4 font-semibold ${statusColor[payment.status as keyof typeof statusColor]}`}>
                          {statusLabel[payment.status as keyof typeof statusLabel]}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle size={32} className="opacity-50" />
              <p>Nenhum pagamento registrado</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
