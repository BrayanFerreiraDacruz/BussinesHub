import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery();

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      setIsOpen(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      notes: formData.get("notes") as string,
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
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o CRM do seu negocio
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
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
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    name="notes"
                    placeholder="Observacoes sobre o cliente..."
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

        {/* Clients Grid */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Total de {clients?.length ?? 0} clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : clients && clients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="border border-border/40 rounded-lg p-4 hover:border-primary/40 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-base">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {client.id}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(client.id);
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
                            if (window.confirm("Tem certeza que deseja deletar este cliente?")) {
                              deleteMutation.mutate({ id: client.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${client.email}`} className="hover:text-primary">
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${client.phone}`} className="hover:text-primary">
                            {client.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {client.notes && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {client.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-border/40 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Gasto: R$ {parseFloat(client.totalSpent?.toString() || "0").toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum cliente criado ainda</p>
                <Button onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Cliente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
