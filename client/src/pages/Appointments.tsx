import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Appointments() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento: " + error.message);
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso!");
      setIsOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar agendamento: " + error.message);
    },
  });

  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast.success("Agendamento deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar agendamento: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      clientId: parseInt(formData.get("clientId") as string),
      serviceId: parseInt(formData.get("serviceId") as string),
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
      notes: formData.get("notes") as string,
      status: formData.get("status") as "scheduled" | "completed" | "cancelled" | "no-show",
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    "no-show": "bg-yellow-100 text-yellow-800",
  };

  const statusLabels = {
    scheduled: "Agendado",
    completed: "Concluído",
    cancelled: "Cancelado",
    "no-show": "Não Compareceu",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os agendamentos do seu negócio
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Agendamento" : "Novo Agendamento"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do agendamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientId">Cliente</Label>
                    <Select name="clientId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="serviceId">Serviço</Label>
                    <Select name="serviceId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Data e Hora de Início</Label>
                    <Input
                      type="datetime-local"
                      name="startTime"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">Data e Hora de Término</Label>
                    <Input
                      type="datetime-local"
                      name="endTime"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="scheduled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="no-show">Não Compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    name="notes"
                    placeholder="Observações sobre o agendamento..."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar" : "Criar"} Agendamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
            <CardDescription>
              Total de {appointments?.length ?? 0} agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold">Data e Hora</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Preço</th>
                      <th className="text-right py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-border/40 hover:bg-muted/30 transition">
                        <td className="py-3 px-4">Cliente #{apt.clientId}</td>
                        <td className="py-3 px-4">
                          {format(new Date(apt.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[apt.status as keyof typeof statusColors]}`}>
                            {statusLabels[apt.status as keyof typeof statusLabels]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {apt.price ? `R$ ${parseFloat(apt.price).toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(apt.id);
                                setIsOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (window.confirm("Tem certeza que deseja deletar este agendamento?")) {
                                  deleteMutation.mutate({ id: apt.id });
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum agendamento criado ainda</p>
                <Button onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
