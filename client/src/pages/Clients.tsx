import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Edit2, Trash2, Search, Filter, ArrowRight, Sparkles, ArrowLeft, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const { data: clients, isLoading, refetch } = trpc.clients.list.useQuery();

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente cadastrada com sucesso! 🍐");
      setIsOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Dados atualizados!");
      setIsOpen(false);
      setEditingId(null);
      resetForm();
      refetch();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente removida");
      refetch();
    },
    onError: (error) => toast.error("Erro ao remover: " + error.message),
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
  };

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingId(client.id);
      setName(client.name);
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setNotes(client.notes || "");
    } else {
      resetForm();
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, email, phone, notes };
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10 text-center">
          <img src="/logo.png" className="absolute top-40 left-10 w-40 h-40 rotate-12" alt="" />
          <img src="/logo.png" className="absolute top-10 right-20 w-32 h-32 -rotate-12" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Users size={12} className="text-primary fill-primary" /> CRM Base
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              Minhas Clientes
            </h1>
            <p className="text-black/60 font-bold text-xl">Sua rede de contatos em um só lugar.</p>
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
                  <Plus className="w-5 h-5 mr-2" /> Nova Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black rounded-[2rem] p-0 overflow-hidden max-w-md">
                <DialogHeader className="bg-black text-white p-8">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Users className="text-primary" /> {editingId ? "Editar Cliente" : "Cadastrar Cliente"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Nome Completo</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Como ela se chama?" className="h-14 rounded-xl border-4 border-black font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">WhatsApp</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="h-14 rounded-xl border-4 border-black font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@exemplo.com" className="h-14 rounded-xl border-4 border-black font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-black/40">Notas / Preferências</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguma observação?" className="h-14 rounded-xl border-4 border-black font-bold" />
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-primary text-black border-4 border-black shadow-lg hover:scale-105" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Atualizar Dados" : "Salvar Cadastro"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Clients Search Bar */}
        <div className="relative group max-w-2xl mx-auto md:mx-0">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Pesquisar cliente por nome ou telefone..." 
            className="h-16 pl-16 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] font-bold text-lg focus:ring-0 bg-white"
          />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-[3rem] border-4 border-black/5 bg-muted/20 animate-pulse" />
              ))
            ) : clients && clients.length > 0 ? (
              clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] bg-white overflow-hidden h-full group">
                    <div className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="w-16 h-16 rounded-3xl bg-primary/20 border-2 border-black flex items-center justify-center text-2xl font-black text-black shadow-inner">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleOpenDialog(client)} className="h-10 w-10 rounded-xl border-2 border-black hover:bg-primary/20"><Edit2 size={16} /></Button>
                          <Button size="icon" variant="outline" onClick={() => deleteMutation.mutate({ id: client.id })} className="h-10 w-10 rounded-xl border-2 border-black text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                        </div>
                      </div>

                      <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-black truncate">{client.name}</h3>
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">ID #{client.id}</p>
                      </div>

                      <div className="space-y-3 border-t-2 border-black/5 pt-6">
                        {client.phone && (
                          <div className="flex items-center gap-3 text-sm font-bold text-black/60">
                            <Phone size={16} className="text-primary" /> {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-3 text-sm font-bold text-black/60">
                            <Mail size={16} className="text-primary" /> {client.email}
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" className="w-full mt-4 h-12 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary group">
                        Ver Histórico <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
                <Users className="w-24 h-24 text-black/5 animate-pulse" />
                <p className="text-black/30 text-2xl font-black uppercase tracking-tighter italic">Nenhuma cliente no seu pomar ainda</p>
                <Button className="rounded-2xl h-16 px-12 bg-primary text-black border-4 border-black font-black uppercase tracking-widest shadow-xl" onClick={() => handleOpenDialog()}>Cadastrar Agora</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
