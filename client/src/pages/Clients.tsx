import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function ClientAppointmentHistory({ clientId }: { clientId: number }) {
  const { data: appointments, isLoading } = trpc.appointments.list.useQuery();
  
  const clientAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter((apt: any) => apt.clientId === clientId)
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 3);
  }, [appointments, clientId]);

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Carregando...</div>;
  }

  if (clientAppointments.length === 0) {
    return <div className="text-xs text-muted-foreground">Sem agendamentos</div>;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-2">
        <Calendar className="w-3 h-3" />
        Ultimos agendamentos
      </div>
      {clientAppointments.map((apt: any) => (
        <div key={apt.id} className="text-xs text-muted-foreground">
          {new Date(apt.startTime).toLocaleDateString("pt-BR")} - {apt.status}
        </div>
      ))}
    </div>
  );
}

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
    onError: (error) => {
      toast.error("Erro ao criar cliente: " + error.message);
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      setIsOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar cliente: " + error.message);
    },
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

    const data = {
      name: selectedName,
      email: selectedEmail,
      phone: selectedPhone,
      notes: selectedNotes,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Clientes
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o CRM do seu negocio
            </p>
          </div>
          <div className="flex gap-2 flex-col md:flex-row md:items-center">
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={selectedPhone}
                    onChange={(e) => setSelectedPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={selectedNotes}
                    onChange={(e) => setSelectedNotes(e.target.value)}
                    placeholder="Observações sobre o cliente..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar" : "Criar"} Cliente
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clients Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredClients && filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="bg-card/50 border border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">{client.name}</CardTitle>
                        <CardDescription className="mt-1 text-cyan-400 font-semibold">
                          R$ {parseFloat(client.totalSpent || "0").toFixed(2)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(client)}
                          className="hover:bg-purple-500/20 hover:text-purple-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate({ id: client.id })}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span className="text-foreground">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span className="text-foreground">{client.phone}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border/30">
                      <ClientAppointmentHistory clientId={client.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
