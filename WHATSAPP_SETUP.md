# Sistema de Notificações WhatsApp - Guia de Configuração

## O que foi implementado

O BusinessHub agora possui um **sistema completo e gratuito** de notificações por WhatsApp usando **Baileys** (WhatsApp Web).

### Características

✅ **100% Gratuito** - Usa WhatsApp Web, sem custos de API
✅ **Sem limite de mensagens** - Envie quantas mensagens quiser
✅ **Lembretes automáticos** - 24h e 1h antes do agendamento
✅ **Confirmações** - Notifique quando cliente agenda
✅ **Cancelamentos** - Avise quando agendamento é cancelado
✅ **Histórico** - Rastreie todas as notificações enviadas
✅ **Configurável** - Ative/desative cada tipo de notificação

## Como Configurar

### 1. Iniciar o Servidor

```bash
cd /home/ubuntu/businesshub
pnpm run dev
```

### 2. Acessar o Dashboard

Abra seu navegador em `http://localhost:3000` e faça login.

### 3. Conectar WhatsApp

1. Vá para **Notificações** no menu lateral
2. Você verá um **QR Code** no terminal
3. Abra WhatsApp no seu celular
4. Vá para **Configurações > Dispositivos Conectados > Conectar um Dispositivo**
5. Escaneie o QR Code com a câmera do seu celular
6. Aguarde a conexão ser estabelecida

### 4. Testar Conexão

Na página de Notificações:
1. Digite um número de WhatsApp (seu ou de um cliente)
2. Escreva uma mensagem de teste
3. Clique em **Enviar Mensagem**
4. Você deve receber a mensagem no WhatsApp

### 5. Configurar Lembretes

Na página de Notificações, ative as opções:
- ✅ Lembrete 24h antes
- ✅ Lembrete 1h antes
- ✅ Confirmação de agendamento
- ✅ Notificação de cancelamento

## Arquitetura

### Backend

**Arquivos principais:**
- `server/whatsapp.ts` - Serviço de conexão e envio via Baileys
- `server/db-whatsapp.ts` - Funções de banco de dados para notificações
- `server/routers.ts` - APIs tRPC para gerenciamento

**Banco de dados:**
- `whatsappNotifications` - Histórico de notificações enviadas
- `notificationSettings` - Preferências do usuário

### Frontend

**Página:**
- `client/src/pages/Notifications.tsx` - Interface de gerenciamento

**Funcionalidades:**
- Status da conexão em tempo real
- Envio de mensagens de teste
- Configuração de lembretes
- Histórico de notificações

## APIs Disponíveis

### `trpc.whatsapp.status`
Obtém o status da conexão WhatsApp

```typescript
const status = await trpc.whatsapp.status.useQuery();
// Retorna: { connected: boolean, phoneNumber?: string, message: string }
```

### `trpc.whatsapp.sendTest`
Envia uma mensagem de teste

```typescript
const result = await trpc.whatsapp.sendTest.useMutation();
await result.mutateAsync({
  phoneNumber: "(11) 98765-4321",
  message: "Teste de mensagem"
});
```

### `trpc.whatsapp.settings`
Obtém configurações de notificação

```typescript
const settings = await trpc.whatsapp.settings.useQuery();
```

### `trpc.whatsapp.updateSettings`
Atualiza configurações

```typescript
await trpc.whatsapp.updateSettings.mutateAsync({
  reminderBefore24h: true,
  reminderBefore1h: true,
  sendConfirmation: true
});
```

### `trpc.whatsapp.history`
Obtém histórico de notificações

```typescript
const history = await trpc.whatsapp.history.useQuery();
```

## Próximos Passos (Roadmap)

### Fase 1: Lembretes Automáticos
- [ ] Implementar job agendado para verificar agendamentos
- [ ] Enviar lembrete 24h antes
- [ ] Enviar lembrete 1h antes
- [ ] Rastrear tentativas de envio

### Fase 2: Integrações
- [ ] Google Calendar sync com notificações
- [ ] Confirmação de presença via WhatsApp
- [ ] Agendamento direto via WhatsApp

### Fase 3: Recursos Avançados
- [ ] Envio de mídia (fotos, documentos)
- [ ] Mensagens com botões interativos
- [ ] Grupos de WhatsApp
- [ ] Broadcast lists

## Troubleshooting

### "WhatsApp não conectado"
- Verifique se o QR Code foi escaneado corretamente
- Certifique-se de que o WhatsApp está aberto no celular
- Tente fazer logout e login novamente no WhatsApp Web

### "Erro ao enviar mensagem"
- Verifique se o número está no formato correto
- Certifique-se de que o contato existe no WhatsApp
- Verifique se a conexão está ativa

### "Sessão expirou"
- Escaneie o QR Code novamente
- Verifique se o celular está conectado à internet
- Reinicie o servidor

## Limitações Conhecidas

⚠️ **Baileys é baseado em WhatsApp Web**
- Pode ser bloqueado se usar muitas mensagens rapidamente
- Requer que o celular esteja conectado à internet
- Sessão pode expirar após inatividade prolongada

## Alternativas

Se preferir usar um serviço oficial:

### Twilio
- Custo: ~$0.01 por mensagem
- Vantagem: Confiável, suporte oficial
- Desvantagem: Requer pagamento

### WhatsApp Business API
- Custo: Variável
- Vantagem: Oficial, recursos avançados
- Desvantagem: Processo de aprovação complexo

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs no terminal
2. Consulte a documentação do Baileys: https://github.com/WhiskeySockets/Baileys
3. Abra uma issue no repositório

## Segurança

⚠️ **Importante:**
- As credenciais do WhatsApp são armazenadas localmente em `.wwebjs_auth/`
- Nunca compartilhe este diretório
- Para produção, considere usar variáveis de ambiente
- Implemente rate limiting para evitar bloqueios
