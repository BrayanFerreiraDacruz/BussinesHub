import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Plus, Edit2, Trash2, Search, Filter, ArrowRight, Sparkles, ArrowLeft, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState<number>(30);

  const { data: services, isLoading, refetch } = trpc.services.list.useQuery();

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Serviço adicionado ao catálogo! 🍐");
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
    setName("");
    setDescription("");
    setPrice("");
    setDuration(30);
  };

  const handleOpenDialog = (service?: any) => {
    if (service) {
      setEditingId(service.id);
      setName(service.name);
      setDescription(service.description || "");
      setPrice(service.price.toString());
      setDuration(service.duration);
    } else {
      resetForm();
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, description, price, duration, isActive: true };
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10 text-center">
          <img src="/logo.png" className="absolute top-20 left-10 w-32 h-32 rotate-12" alt="" />
          <img src="/logo.png" className="absolute bottom-20 right-10 w-48 h-48 -rotate-12" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <ShoppingBag size={12} className="text-primary fill-primary" /> Catálogo
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              Serviços
            </h1>
            <p className="text-black/60 font-bold text-xl">Defina o que você oferece ao mundo.</p>
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
                  <Plus className="w-5 h-5 mr-2" /> Novo Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black rounded-[2rem] p-0 overflow-hidden max-w-md">
                <DialogHeader className="bg-black text-white p-8">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <ShoppingBag className="text-primary" /> {editingId ? "Editar Serviço" : "Novo Serviço"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-8 space-y-6 text-center md:text-left">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Nome do Serviço</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Corte de Cabelo" className="h-14 rounded-xl border-4 border-black font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Descrição Breve</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que está incluso?" className="h-14 rounded-xl border-4 border-black font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Preço (R$)</Label>
                      <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="h-14 rounded-xl border-4 border-black font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Duração (Min)</Label>
                      <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} placeholder="30" className="h-14 rounded-xl border-4 border-black font-bold" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black border-4 border-black shadow-lg hover:scale-105" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar Catálogo" : "Salvar Serviço"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-[3rem] border-4 border-black/5 bg-muted/20 animate-pulse" />
              ))
            ) : services && services.length > 0 ? (
              services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] bg-white overflow-hidden h-full group flex flex-col justify-between">
                    <div className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-3xl bg-black text-primary border-2 border-black flex items-center justify-center shadow-lg">
                          <ShoppingBag size={32} />
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleOpenDialog(service)} className="h-10 w-10 rounded-xl border-2 border-black hover:bg-primary/20"><Edit2 size={16} /></Button>
                          <Button size="icon" variant="outline" onClick={() => deleteMutation.mutate({ id: service.id })} className="h-10 w-10 rounded-xl border-2 border-black text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-black truncate">{service.name}</h3>
                        <p className="text-sm font-bold text-black/60 leading-relaxed line-clamp-2">
                          {service.description || "Nenhuma descrição adicionada ao serviço."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-4 border-t-2 border-black/5 justify-center md:justify-start">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border-2 border-black/5 font-black text-xs uppercase text-primary">
                          <Clock size={14} /> {service.duration} MIN
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border-2 border-black/5 font-black text-xs uppercase text-emerald-600">
                          <DollarSign size={14} /> R$ {parseFloat(service.price.toString()).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                      <Button variant="outline" className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-all">
                        Ativar no Link Público <CheckCircle2 className="ml-2 w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
                <ShoppingBag className="w-24 h-24 text-black/5 animate-pulse" />
                <p className="text-black/30 text-2xl font-black uppercase tracking-tighter italic">Seu catálogo está vazio</p>
                <Button className="rounded-2xl h-16 px-12 bg-primary text-black border-4 border-black font-black uppercase tracking-widest shadow-xl" onClick={() => handleOpenDialog()}>Adicionar Primeiro Serviço</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
