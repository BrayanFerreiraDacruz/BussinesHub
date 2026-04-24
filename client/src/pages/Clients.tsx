import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Edit2, Trash2, Mail, Phone, Search, Filter, MoreHorizontal, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ClientAppointmentHistory({ clientId }: { clientId: number }) {
  const { data: appointments, isLoading } = trpc.appointments.list.useQuery();
  
  const clientAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((apt: any) => apt.clientId === clientId)
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 3);
  }, [appointments, clientId]);

  if (isLoading) return <div className="h-4 w-24 bg-muted animate-pulse rounded" />;

  if (clientAppointments.length === 0) {
    return <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Sem histórico</p>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Últimos Agendamentos</p>
      {clientAppointments.map((apt: any) => (
        <div key={apt.id} className="flex items-center justify-between text-xs">
          <span className="text-foreground/80">{new Date(apt.startTime).toLocaleDateString("pt-BR")}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium
            ${apt.status === 'scheduled' ? 'bg-amber-500/10 text-amber-500' : 
              apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
            {apt.status}
          </span>
        </div>
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedNotes, setSelectedNotes] = useState("");

  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery();

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro ao criar: " + error.message),
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado!");
      setIsOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro ao atualizar: " + error.message),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido");
      refetch();
    },
    onError: (error) => toast.error("Erro ao deletar: " + error.message),
  });

  const resetForm = () => {
    setSelectedName("");
    setSelectedEmail("");
    setSelectedPhone("");
    setSelectedNotes("");
  };

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingId(client.id);
      setSelectedName(client.name);
      setSelectedEmail(client.email || "");
      setSelectedPhone(client.phone || "");
      setSelectedNotes(client.notes || "");
    } else {
      resetForm();
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { name: selectedName, email: selectedEmail, phone: selectedPhone, notes: selectedNotes };
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Gestão de Clientes</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Visualize e gerencie sua base de contatos.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full md:w-64 bg-card/40 border-border/40 focus:bg-card transition-all"
              />
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="glass shadow-2xl border-primary/10">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Perfil" : "Cadastrar Cliente"}</DialogTitle>
                  <DialogDescription>Insira as informações básicas do seu cliente.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" value={selectedName} onChange={(e) => setSelectedName(e.target.value)} placeholder="Ex: João Silva" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)} placeholder="joao@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input id="phone" value={selectedPhone} onChange={(e) => setSelectedPhone(e.target.value)} placeholder="(11) 99999-9999" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea id="notes" value={selectedNotes} onChange={(e) => setSelectedNotes(e.target.value)} placeholder="Alergias, preferências, histórico..." className="resize-none h-24" />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" className="px-8" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? "Salvar Alterações" : "Confirmar Cadastro"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clients Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 bg-muted/40 rounded-2xl animate-pulse border border-border/20" />)}
            </motion.div>
          ) : filteredClients.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <motion.div key={client.id} variants={itemVariants}>
                  <Card className="glass-card group overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-bold leading-tight group-hover:text-primary transition-colors">{client.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium mt-1">
                              <Sparkles className="w-3 h-3" />
                              R$ {parseFloat(client.totalSpent || "0").toFixed(2)} acumulados
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(client)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate({ id: client.id })} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 text-primary/60" />
                            {client.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-primary/60" />
                          {client.phone}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/40">
                        <ClientAppointmentHistory clientId={client.id} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="glass-card border-dashed py-20">
                <CardContent className="flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4 text-muted-foreground/40">
                    <Users className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">Tente ajustar sua busca ou cadastre um novo cliente para começar.</p>
                  <Button variant="outline" onClick={() => handleOpenDialog()} className="mt-6 rounded-full">
                    Cadastrar Primeiro Cliente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
