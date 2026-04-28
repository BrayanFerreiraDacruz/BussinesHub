import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2 } from "lucide-react";

export default function PublicBooking() {
  const [, params] = useRoute<{ userId: string }>("/book/:userId");
  const userId = params ? parseInt(params.userId) : null;

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const providerQuery = trpc.booking.getProvider.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const slotsQuery = trpc.booking.getAvailableSlots.useQuery(
    {
      userId: userId!,
      serviceId: parseInt(selectedService),
      date: selectedDate!,
    },
    { enabled: !!userId && !!selectedService && !!selectedDate }
  );

  const submitMutation = trpc.booking.submit.useMutation({
    onSuccess: () => {
      setStep(4);
      toast.success("Agendamento realizado!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (providerQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!providerQuery.data) {
    return <div className="p-8 text-center">Prestador não encontrado</div>;
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedService) return;

    submitMutation.mutate({
      userId: userId!,
      serviceId: parseInt(selectedService),
      startTime: selectedSlot,
      clientName,
      clientPhone,
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg border-primary/10">
        <CardHeader className="text-center bg-primary/5 rounded-t-lg border-b flex flex-col items-center">
          <img src="/logo.png" alt="Pêra Logo" className="w-12 h-12 object-contain mb-2" />
          <CardTitle className="text-2xl font-bold">{providerQuery.data.name}</CardTitle>
          <CardDescription>Reserve seu horário de forma rápida e prática via Pêra</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <Label className="text-lg font-medium">1. Selecione o Serviço</Label>
                <div className="grid grid-cols-1 gap-3">
                  {providerQuery.data.services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id.toString())}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary/50 ${
                        selectedService === service.id.toString()
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-muted bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.duration} minutos</p>
                        </div>
                        <p className="font-bold text-primary">R$ {service.price.toString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full h-12 text-lg font-semibold"
                disabled={!selectedService}
                onClick={() => setStep(2)}
              >
                Próximo Passo
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label className="text-lg font-medium">2. Escolha o Dia</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border shadow-sm bg-card mx-auto md:mx-0"
                    locale={ptBR}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-lg font-medium">3. Escolha o Horário</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {slotsQuery.isLoading ? (
                      <div className="col-span-2 flex justify-center p-8">
                        <Spinner className="w-6 h-6" />
                      </div>
                    ) : slotsQuery.data?.length === 0 ? (
                      <p className="col-span-2 text-center py-8 text-muted-foreground italic">
                        Nenhum horário disponível para este dia.
                      </p>
                    ) : (
                      slotsQuery.data?.map((slot) => (
                        <Button
                          key={slot.toISOString()}
                          variant={selectedSlot?.toISOString() === slot.toISOString() ? "default" : "outline"}
                          className={`h-11 ${selectedSlot?.toISOString() === slot.toISOString() ? "shadow-md scale-105" : ""}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {format(slot, "HH:mm")}
                        </Button>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Voltar</Button>
                <Button
                  className="flex-[2] h-12 text-lg font-semibold"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                >
                  Confirmar Horário
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleBooking} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label className="text-lg font-medium">4. Seus Dados</Label>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Como podemos te chamar?"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <p className="font-semibold text-primary mb-1 text-center">Resumo do Agendamento</p>
                <div className="flex justify-between text-sm py-1">
                  <span>Serviço:</span>
                  <span className="font-bold">
                    {providerQuery.data.services.find(s => s.id.toString() === selectedService)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span>Data:</span>
                  <span className="font-bold">
                    {selectedSlot && format(selectedSlot, "eeee, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span>Horário:</span>
                  <span className="font-bold">
                    {selectedSlot && format(selectedSlot, "HH:mm")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>Voltar</Button>
                <Button
                  type="submit"
                  className="flex-[2] h-12 text-lg font-semibold"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Agendando..." : "Finalizar Agendamento"}
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-12 space-y-6 animate-in zoom-in-95">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Agendado com Sucesso!</h2>
                <p className="text-muted-foreground text-lg">
                  Tudo pronto, <strong>{clientName}</strong>! <br />
                  Você receberá uma confirmação via WhatsApp em instantes.
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Fazer outro agendamento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
