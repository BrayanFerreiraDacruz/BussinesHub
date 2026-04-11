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
  const [selectedName, setSelectedName] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const { data: services, isLoading, refetch } = trpc.services.list.useQuery();

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Servico criado com sucesso!");
      setIsOpen(false);
      resetForm();
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
      resetForm();
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

  const resetForm = () => {
    setSelectedName("");
    setSelectedDescription("");
    setSelectedPrice("");
    setSelectedDuration("");
  };

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setEditingId(service.id);
      setSelectedName(service.name);
      setSelectedDescription(service.description || "");
      setSelectedPrice(service.price.toString());
      setSelectedDuration(service.duration.toString());
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
      description: selectedDescription,
      price: selectedPrice,
      duration: parseInt(selectedDuration),
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
              Serviços
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie o catalogo de servicos do seu negocio
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
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
                    value={selectedName}
                    onChange={(e) => setSelectedName(e.target.value)}
                    placeholder="Ex: Corte de Cabelo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    value={selectedDescription}
                    onChange={(e) => setSelectedDescription(e.target.value)}
                    placeholder="Descricao detalhada do servico..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preco (R$) *</Label>
                    <Input
                      type="number"
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duracao (minutos) *</Label>
                    <Input
                      type="number"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
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
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="bg-card/50 border border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-foreground">{service.name}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(service)}
                          className="hover:bg-purple-500/20 hover:text-purple-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate({ id: service.id })}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-cyan-400">R$ {parseFloat(service.price).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-foreground">{service.duration} minutos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="text-center py-12">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum servico encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
