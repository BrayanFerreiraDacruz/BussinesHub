import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Services() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: services, isLoading, refetch } = trpc.services.list.useQuery();

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Servico criado com sucesso!");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar servico: " + error.message);
    },
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Servico atualizado com sucesso!");
      setIsOpen(false);
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar servico: " + error.message);
    },
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Servico deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar servico: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      duration: parseInt(formData.get("duration") as string),
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
            <h1 className="text-3xl font-bold">Servicos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o catalogo de servicos do seu negocio
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Servico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Servico" : "Novo Servico"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do servico
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Servico *</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Ex: Corte de Cabelo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    name="description"
                    placeholder="Descricao detalhada do servico..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preco (R$) *</Label>
                    <Input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duracao (minutos) *</Label>
                    <Input
                      type="number"
                      name="duration"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar" : "Criar"} Servico
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Catalogo de Servicos</CardTitle>
            <CardDescription>
              Total de {services?.length ?? 0} servicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border border-border/40 rounded-lg p-4 hover:border-primary/40 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-base">{service.name}</h3>
                        <p className="text-xs text-muted-foreground">ID: {service.id}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(service.id);
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
                            if (window.confirm("Tem certeza que deseja deletar este servico?")) {
                              deleteMutation.mutate({ id: service.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-semibold">
                          R$ {parseFloat(service.price.toString()).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{service.duration} minutos</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/40">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        service.isActive
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {service.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Nenhum servico criado ainda</p>
                <Button onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Servico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
