import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Plus, Edit2, Trash2, Clock, User, Briefcase, DollarSign, Search, Filter, ArrowRight, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Appointments() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<any>("scheduled");

  const { data: appointments, isLoading, refetch } = trpc.appointments.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento realizado!");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      toast.success("Agendamento atualizado!");
      setIsOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      toast.success("Agendamento removido");
      refetch();
    },
    onError: (error) => toast.error("Erro ao remover: " + error.message),
  });

  const resetForm = () => {
    setSelectedClient("");
    setSelectedService("");
    setStartTime("");
    setPrice("");
    setStatus("scheduled");
  };

  const handleOpenDialog = (apt?: any) => {
    if (apt) {
      setEditingId(apt.id);
      setSelectedClient(apt.clientId.toString());
      setSelectedService(apt.serviceId.toString());
      setStartTime(new Date(apt.startTime).toISOString().slice(0, 16));
      setPrice(apt.price?.toString() || "");
      setStatus(apt.status);
    } else {
      resetForm();
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const onServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services?.find((s) => s.id === parseInt(serviceId));
    if (service) setPrice(service.price.toString());
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const service = services?.find((s) => s.id === parseInt(selectedService));
    if (!service) return;

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    const data = {
      clientId: parseInt(selectedClient),
      serviceId: parseInt(selectedService),
      startTime: start,
      endTime: end,
      price: price,
      status: status,
    };

    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  };

  const sortedAppointments = useMemo(() => {
    if (!appointments) return [];
    return [...appointments].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [appointments]);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Agenda</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie o horário dos seus atendimentos.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg shadow-primary/20 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="glass max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Horário" : "Agendar Atendimento"}</DialogTitle>
                <DialogDescription>Selecione o cliente, serviço e o horário desejado.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="bg-card/40 border-border/40">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select value={selectedService} onValueChange={onServiceChange}>
                    <SelectTrigger className="bg-card/40 border-border/40">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data e Hora</Label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-card/40 border-border/40" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Final (R$)</Label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="bg-card/40 border-border/40" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-card/40 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="no-show">Não compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="px-8" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Salvar Alterações" : "Confirmar Agendamento"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <Card className="glass-card overflow-hidden border-border/40 shadow-xl">
          <CardHeader className="bg-muted/30 border-b border-border/40 py-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Lista de Horários</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Filter className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Serviço</th>
                    <th className="px-6 py-4">Data / Hora</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-muted/40 rounded w-full" /></td>
                        </tr>
                      ))
                    ) : sortedAppointments.length > 0 ? (
                      sortedAppointments.map((apt, index) => (
                        <motion.tr
                          key={apt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-primary/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium text-sm text-foreground">
                                {clients?.find(c => c.id === apt.clientId)?.name || "Cliente Removido"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Briefcase className="w-3.5 h-3.5 text-primary/50" />
                              {services?.find(s => s.id === apt.serviceId)?.name || "Serviço Removido"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {format(new Date(apt.startTime), "dd 'de' MMM", { locale: ptBR })}
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                <Clock className="w-3 h-3" />
                                {format(new Date(apt.startTime), "HH:mm")}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-emerald-500">
                              R$ {parseFloat(apt.price?.toString() || "0").toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`rounded-full border-none px-3 py-1 font-semibold text-[10px] uppercase tracking-wider
                              ${apt.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500' : 
                                apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                                apt.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                              {apt.status === 'scheduled' ? 'Agendado' : 
                               apt.status === 'completed' ? 'Concluído' : 
                               apt.status === 'cancelled' ? 'Cancelado' : apt.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(apt)} className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate({ id: apt.id })} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <Calendar className="w-12 h-12 text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground text-sm font-medium">Nenhum agendamento para exibir</p>
                            <Button variant="outline" className="mt-4 rounded-full" onClick={() => handleOpenDialog()}>Novo Agendamento</Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="bg-muted/10 border-t border-border/40 py-3 px-6 flex items-center justify-between text-xs text-muted-foreground">
            <p>Mostrando {sortedAppointments.length} resultados</p>
            <div className="flex items-center gap-2 font-bold text-primary hover:underline cursor-pointer">
              Ver histórico completo <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
