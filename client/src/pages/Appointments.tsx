import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Calendar, Plus, Edit2, Trash2, Clock, User, Briefcase, DollarSign, Search, Filter, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
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
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <img src="/logo.png" className="absolute top-10 left-10 w-24 h-24 rotate-12" alt="" />
          <img src="/logo.png" className="absolute bottom-20 right-10 w-32 h-32 -rotate-12" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Sparkles size={12} className="text-primary" /> Planejamento
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              Minha Agenda
            </h1>
            <p className="text-black/60 font-bold text-xl">Gerencie seus horários com perfeição.</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              asChild 
              className="h-14 rounded-2xl px-6 border-4 border-black font-black text-sm hover:bg-black/5 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <a href="/dashboard"><ArrowLeft className="mr-2 w-5 h-5" /> Voltar</a>
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="h-14 rounded-2xl px-8 font-black text-sm bg-primary text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105">
                  <Plus className="w-5 h-5 mr-2" /> Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black rounded-[2rem] p-0 overflow-hidden max-w-md">
                <DialogHeader className="bg-black text-white p-8">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Calendar className="text-primary" /> {editingId ? "Editar Horário" : "Novo Horário"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2 text-center md:text-left">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Cliente</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger className="h-14 rounded-xl border-4 border-black font-bold">
                        <SelectValue placeholder="Escolha a cliente" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-4 border-black">
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()} className="font-bold">{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Serviço</Label>
                    <Select value={selectedService} onValueChange={onServiceChange}>
                      <SelectTrigger className="h-14 rounded-xl border-4 border-black font-bold">
                        <SelectValue placeholder="O que será feito?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-4 border-black">
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()} className="font-bold">{service.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Data/Hora</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-14 rounded-xl border-4 border-black font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Valor (R$)</Label>
                      <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="h-14 rounded-xl border-4 border-black font-bold" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-14 rounded-xl border-4 border-black font-bold uppercase tracking-widest text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-4 border-black font-bold">
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="no-show">Não compareceu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black border-4 border-black shadow-lg hover:scale-105" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? "Salvar Alterações" : "Confirmar Agora"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Appointments List */}
        <Card className="border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)] rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="bg-black text-white p-8 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter">Lista de Horários</CardTitle>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-primary hover:bg-white/10"><Search /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-primary hover:bg-white/10"><Filter /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-black/5 bg-muted/20 text-xs text-black/40 uppercase tracking-[0.2em] font-black">
                    <th className="px-8 py-5">Cliente</th>
                    <th className="px-8 py-5">Serviço</th>
                    <th className="px-8 py-5">Data / Hora</th>
                    <th className="px-8 py-5">Valor</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/5">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-10"><div className="h-6 bg-muted/40 rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : sortedAppointments.length > 0 ? (
                      sortedAppointments.map((apt, index) => (
                        <motion.tr
                          key={apt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-primary/5 transition-all text-center md:text-left"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-black flex items-center justify-center text-black font-black shadow-sm">
                                {clients?.find(c => c.id === apt.clientId)?.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <span className="font-black text-base text-black uppercase tracking-tight">
                                {clients?.find(c => c.id === apt.clientId)?.name || "Cliente Removido"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest text-black/60">
                              <Briefcase className="w-4 h-4 text-primary" />
                              {services?.find(s => s.id === apt.serviceId)?.name || "Serviço Removido"}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <p className="text-sm font-black text-black uppercase">
                                {format(new Date(apt.startTime), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                              <p className="text-xs text-primary flex items-center gap-1 font-black uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                {format(new Date(apt.startTime), "HH:mm")}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-lg font-black text-black">
                              R$ {parseFloat(apt.price?.toString() || "0").toFixed(2)}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <Badge className={`rounded-full border-2 border-black px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm
                              ${apt.status === 'scheduled' ? 'bg-amber-500 text-white' : 
                                apt.status === 'completed' ? 'bg-emerald-500 text-white' : 
                                apt.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'}`}>
                              {apt.status === 'scheduled' ? 'Agendado' : 
                               apt.status === 'completed' ? 'Pago' : 
                               apt.status === 'cancelled' ? 'Cancelado' : apt.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="icon" variant="outline" onClick={() => handleOpenDialog(apt)} className="h-10 w-10 rounded-xl border-2 border-black hover:bg-primary/20"><Edit2 size={16} /></Button>
                              <Button size="icon" variant="outline" onClick={() => deleteMutation.mutate({ id: apt.id })} className="h-10 w-10 rounded-xl border-2 border-black text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Calendar className="w-20 h-20 text-black/10 animate-bounce" />
                            <p className="text-black/40 text-xl font-black uppercase tracking-tighter italic">Nenhum agendamento marcado</p>
                            <Button className="mt-4 rounded-2xl h-14 px-10 bg-primary text-black border-4 border-black font-black uppercase tracking-widest shadow-lg" onClick={() => handleOpenDialog()}>Novo Agendamento</Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="bg-muted/30 border-t-4 border-black p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-black text-xs uppercase tracking-widest text-black/40">Total de {sortedAppointments.length} agendamentos colhidos</p>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary hover:underline cursor-pointer group">
              Ver Histórico Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
