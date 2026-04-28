import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { MessageCircle, AlertCircle, CheckCircle2, Clock, ArrowLeft, Sparkles, Zap, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Este é um teste de notificação do P�ra.");
  const [isSending, setIsSending] = useState(false);

  const { data: status, refetch: refetchStatus } = trpc.whatsapp.status.useQuery();
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = trpc.whatsapp.settings.useQuery();
  const { data: history } = trpc.whatsapp.history.useQuery();

  const sendTestMutation = trpc.whatsapp.sendTest.useMutation();
  const updateSettingsMutation = trpc.whatsapp.updateSettings.useMutation();

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error("Digite um número de WhatsApp");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendTestMutation.mutateAsync({
        phoneNumber: testPhone,
        message: testMessage,
      });

      if (result.success) {
        toast.success("Mensagem enviada com sucesso!");
        setTestPhone("");
      } else {
        toast.error(result.error || "Erro ao enviar mensagem");
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateSettings = async (key: string, value: boolean) => {
    try {
      await updateSettingsMutation.mutateAsync({
        [key]: value,
      } as any);
      await refetchSettings();
      toast.success("Configurações atualizadas!");
    } catch (error) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 relative">
        {/* Background Decorative Pears */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
          <img src="/logo.png" className="absolute top-20 right-20 w-40 h-40 rotate-45" alt="" />
          <img src="/logo.png" className="absolute bottom-10 left-10 w-24 h-24 -rotate-12" alt="" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-black pb-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest mx-auto md:mx-0">
              <Zap size={12} className="text-primary fill-primary" /> Automação
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black uppercase">
              WhatsApp
            </h1>
            <p className="text-black/60 font-bold text-xl">Notificações inteligentes para sua agenda.</p>
          </div>
          <Button 
            variant="outline" 
            asChild 
            className="h-14 rounded-2xl px-8 border-4 border-black font-black text-sm hover:bg-black/5 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mx-auto md:mx-0"
          >
            <a href="/dashboard"><ArrowLeft className="mr-2 w-5 h-5" /> Voltar</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Status e Configurações */}
          <div className="lg:col-span-7 space-y-10">
            {/* Status da Conexão */}
            <Card className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b-4 border-black bg-black text-white">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                  <MessageCircle className="w-8 h-8 text-primary" /> Status da Conexão
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {status?.connected ? (
                  <div className="flex items-center gap-6 p-6 bg-emerald-500/10 border-4 border-emerald-500 rounded-[2rem] shadow-inner">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-700 uppercase tracking-tighter">{status.message}</p>
                      {status.phoneNumber && (
                        <p className="text-sm font-bold text-emerald-600/80 uppercase tracking-widest mt-1">Conectado em: {status.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 p-6 bg-amber-500/10 border-4 border-amber-500 rounded-[2rem] shadow-inner">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                      <AlertCircle size={32} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-700 uppercase tracking-tighter">Aguardando Conexão</p>
                      <p className="text-sm font-bold text-amber-600/80 uppercase tracking-widest mt-1">
                        Escaneie o QR Code no terminal do servidor.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card className="border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b-4 border-black">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">O que automatizar?</CardTitle>
                <CardDescription className="font-bold text-black/40 uppercase text-xs mt-1">Sua Pêra trabalhando por você</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {settingsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted/40 rounded-2xl animate-pulse border-2 border-black/5" />
                    ))}
                  </div>
                ) : settings ? (
                  <div className="space-y-4">
                    <SettingSwitch
                      title="Ativar WhatsApp"
                      description="Ligar todas as notificações automáticas"
                      checked={settings.whatsappEnabled ?? false}
                      onChange={(v) => handleUpdateSettings("whatsappEnabled", v)}
                    />
                    <SettingSwitch
                      title="Lembrete 24h"
                      description="Avisar cliente um dia antes"
                      checked={settings.reminderBefore24h ?? false}
                      onChange={(v) => handleUpdateSettings("reminderBefore24h", v)}
                      disabled={!settings.whatsappEnabled}
                    />
                    <SettingSwitch
                      title="Confirmação Instantânea"
                      description="Enviar ao realizar o agendamento"
                      checked={settings.sendConfirmation ?? false}
                      onChange={(v) => handleUpdateSettings("sendConfirmation", v)}
                      disabled={!settings.whatsappEnabled}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Teste e Histórico */}
          <div className="lg:col-span-5 space-y-10">
            {/* Teste */}
            <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(120,190,32,1)] rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b-4 border-black bg-primary text-black">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Send size={24} /> Testar Agora
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-black/60 ml-1">Número Destino</Label>
                  <Input
                    placeholder="(11) 98765-4321"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-14 rounded-xl border-4 border-black font-bold text-lg px-6 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-black/60 ml-1">Sua Mensagem</Label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full h-32 rounded-xl border-4 border-black p-4 font-bold text-sm bg-muted/20 focus:ring-0"
                  />
                </div>
                <Button
                  onClick={handleSendTest}
                  disabled={isSending || !status?.connected}
                  className="w-full h-16 rounded-2xl font-black text-lg bg-black text-white border-4 border-black shadow-lg hover:scale-105"
                >
                  {isSending ? "ENVIANDO..." : "ENVIAR TESTE"}
                </Button>
              </CardContent>
            </Card>

            {/* Histórico Simplificado */}
            <Card className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="p-8 border-b-4 border-black bg-muted/20">
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Log de Envios</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {history && history.length > 0 ? (
                  <div className="space-y-3">
                    {history.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="flex items-center justify-between p-4 border-2 border-black/10 rounded-2xl bg-muted/5">
                        <div className="flex-1">
                          <p className="font-black text-xs uppercase tracking-tighter">
                            {notif.type.replace('_', ' ')}
                          </p>
                          <p className="text-[10px] font-bold text-black/40 uppercase mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-black/20 italic font-black uppercase text-xs">Vazio</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingSwitch({ title, description, checked, onChange, disabled = false }: any) {
  return (
    <div className={`flex items-center justify-between p-5 border-2 border-black rounded-[2rem] transition-all ${disabled ? 'opacity-30 grayscale' : 'bg-background hover:bg-primary/5 shadow-sm'}`}>
      <div className="space-y-1">
        <p className="font-black text-base uppercase tracking-tight text-black">{title}</p>
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="scale-125 data-[state=checked]:bg-primary border-2 border-black"
      />
    </div>
  );
}
