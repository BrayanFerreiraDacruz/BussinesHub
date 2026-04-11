import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { MessageCircle, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Notifications() {
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Este é um teste de notificação do BusinessHub.");
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notificações WhatsApp</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie lembretes automáticos de agendamento via WhatsApp
            </p>
          </div>
        </div>

        {/* Status da Conexão */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Status da Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {status?.connected ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">{status.message}</p>
                    {status.phoneNumber && (
                      <p className="text-sm text-green-700">Número: {status.phoneNumber}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">{status?.message}</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Escaneie o código QR no terminal para conectar seu WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Configurações de Notificação</CardTitle>
            <CardDescription>
              Customize quando e como você recebe lembretes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {settingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : settings ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div>
                    <p className="font-medium">Ativar WhatsApp</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações via WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsappEnabled ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("whatsappEnabled", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div>
                    <p className="font-medium">Lembrete 24h antes</p>
                    <p className="text-sm text-muted-foreground">
                      Receber aviso 1 dia antes do agendamento
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminderBefore24h ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("reminderBefore24h", checked)
                    }
                    disabled={!(settings.whatsappEnabled ?? false)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div>
                    <p className="font-medium">Lembrete 1h antes</p>
                    <p className="text-sm text-muted-foreground">
                      Receber aviso 1 hora antes do agendamento
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminderBefore1h ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("reminderBefore1h", checked)
                    }
                    disabled={!(settings.whatsappEnabled ?? false)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div>
                    <p className="font-medium">Confirmação de agendamento</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmação quando cliente agenda
                    </p>
                  </div>
                  <Switch
                    checked={settings.sendConfirmation ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("sendConfirmation", checked)
                    }
                    disabled={!(settings.whatsappEnabled ?? false)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div>
                    <p className="font-medium">Notificação de cancelamento</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando agendamento é cancelado
                    </p>
                  </div>
                  <Switch
                    checked={settings.sendCancellation ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings("sendCancellation", checked)
                    }
                    disabled={!(settings.whatsappEnabled ?? false)}
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Enviar Mensagem de Teste */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Enviar Mensagem de Teste</CardTitle>
            <CardDescription>
              Teste a conexão enviando uma mensagem para seu WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-phone">Número de WhatsApp</Label>
                <Input
                  id="test-phone"
                  placeholder="(11) 98765-4321 ou +55 11 98765-4321"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="test-message">Mensagem</Label>
                <textarea
                  id="test-message"
                  placeholder="Digite a mensagem de teste..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2 border border-border/40 rounded-lg mt-1 font-mono text-sm"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSendTest}
                disabled={isSending || !status?.connected}
                className="w-full"
              >
                {isSending ? "Enviando..." : "Enviar Mensagem"}
              </Button>

              {!status?.connected && (
                <p className="text-sm text-yellow-600">
                  ⚠️ WhatsApp não está conectado. Escaneie o QR code no terminal primeiro.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Notificações */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Histórico de Notificações</CardTitle>
            <CardDescription>
              Últimas notificações enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-2">
                {history.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-center justify-between p-3 border border-border/40 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {notif.type === "confirmation"
                          ? "Confirmação"
                          : notif.type === "reminder_24h"
                          ? "Lembrete 24h"
                          : notif.type === "reminder_1h"
                          ? "Lembrete 1h"
                          : "Cancelamento"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notif.status === "sent" && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {notif.status === "failed" && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {notif.status === "pending" && (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-xs font-medium capitalize">
                        {notif.status === "sent"
                          ? "Enviada"
                          : notif.status === "failed"
                          ? "Falha"
                          : "Pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma notificação enviada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
