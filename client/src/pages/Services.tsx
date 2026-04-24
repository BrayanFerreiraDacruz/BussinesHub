import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Plus, Edit2, Trash2, Clock, DollarSign, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

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
      toast.success("Serviço adicionado!");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Serviço atualizado!");
      setIsOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Serviço removido");
      refetch();
    },
    onError: (error) => toast.error("Erro ao remover: " + error.message),
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
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Catálogo</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Serviços</h1>
            <p className="text-muted-foreground">Configure seus serviços, preços e durações.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg shadow-primary/20 px-6">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Serviço" : "Criar Novo Serviço"}</DialogTitle>
                <DialogDescription>Personalize os detalhes do seu atendimento.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço</Label>
                  <Input id="name" value={selectedName} onChange={(e) => setSelectedName(e.target.value)} placeholder="Ex: Corte de Cabelo Masculino" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="price" value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} placeholder="0.00" className="pl-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (min)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="duration" type="number" value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} placeholder="45" className="pl-9" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea id="description" value={selectedDescription} onChange={(e) => setSelectedDescription(e.target.value)} placeholder="Descreva o que está incluso no serviço..." className="resize-none h-24" />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="px-8" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Salvar Alterações" : "Criar Serviço"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-muted/40 rounded-2xl animate-pulse" />)}
            </motion.div>
          ) : services && services.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="glass-card group overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{service.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                              <Clock className="w-3.5 h-3.5 text-primary/70" />
                              {service.duration} min
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                              <DollarSign className="w-3.5 h-3.5" />
                              R$ {parseFloat(service.price.toString()).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(service)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate({ id: service.id })} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {service.description || "Nenhuma descrição informada."}
                      </p>
                      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                              <Star className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ativo</span>
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
                    <ShoppingBag className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-medium">Catálogo Vazio</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">Adicione seu primeiro serviço para começar a realizar agendamentos.</p>
                  <Button variant="outline" onClick={() => handleOpenDialog()} className="mt-6 rounded-full">
                    Adicionar Serviço
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
