# BusinessHub - Testing Checklist

## 🎨 Design & UI Tests

### Dashboard
- [ ] Verificar cores roxo/neon em cards (roxo, cyan, verde, pink)
- [ ] Verificar calendário de agendamentos funciona
- [ ] Verificar gráfico de faturamento mostra dados
- [ ] Verificar toggle light/dark mode funciona
- [ ] Verificar responsividade (mobile, tablet, desktop)

### Agendamentos
- [ ] Verificar header com gradiente roxo/pink/cyan
- [ ] Verificar botão "Novo Agendamento" com gradiente roxo
- [ ] Verificar tabela com cores neon (status coloridos)
- [ ] Verificar ícones em cyan
- [ ] Verificar responsividade

### Clientes
- [ ] Verificar header com gradiente roxo/pink/cyan
- [ ] Verificar cards com design neon
- [ ] Verificar ícones de email/telefone em cyan
- [ ] Verificar gasto total em cyan
- [ ] Verificar botões edit/delete com hover roxo/vermelho
- [ ] Verificar histórico de atendimentos

### Serviços
- [ ] Verificar header com gradiente roxo/pink/cyan
- [ ] Verificar cards com design neon
- [ ] Verificar preço em cyan
- [ ] Verificar duração em roxo
- [ ] Verificar botões com hover colorido

### Relatórios
- [ ] Verificar header com gradiente roxo/pink/cyan
- [ ] Verificar botão exportar com gradiente roxo
- [ ] Verificar cards de métricas com gradiente roxo/pink
- [ ] Verificar valores em cyan/pink
- [ ] Verificar filtros por período

---

## 🔧 Funcionalidades Principais

### Autenticação
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sessão persiste

### Clientes (CRM)
- [ ] Criar novo cliente
- [ ] Editar cliente (valores pré-preenchidos)
- [ ] Deletar cliente
- [ ] Buscar cliente por nome/email/telefone
- [ ] Visualizar histórico de atendimentos

### Serviços
- [ ] Criar novo serviço
- [ ] Editar serviço (valores pré-preenchidos)
- [ ] Deletar serviço
- [ ] Preço salvo corretamente

### Agendamentos
- [ ] Criar novo agendamento
- [ ] Preço do serviço preenche automaticamente
- [ ] Editar agendamento (valores pré-preenchidos)
- [ ] Cancelar agendamento
- [ ] Status muda corretamente
- [ ] Aparece no calendário

### Dashboard
- [ ] Total de clientes correto
- [ ] Total de agendamentos correto
- [ ] Faturamento total correto
- [ ] Agendamentos confirmados conta corretamente
- [ ] Agendamentos concluídos conta corretamente

### Relatórios
- [ ] Filtro por período funciona
- [ ] Faturamento total correto
- [ ] Ticket médio correto
- [ ] Exportação CSV funciona
- [ ] Arquivo baixa corretamente

---

## 🌙 Light/Dark Mode

- [ ] Toggle funciona no header
- [ ] Tema dark carrega por padrão
- [ ] Tema light carrega quando selecionado
- [ ] Cores mantêm legibilidade em ambos temas
- [ ] Preferência salva no localStorage

---

## 📱 Responsividade

- [ ] Mobile (320px) - layouts se adaptam
- [ ] Tablet (768px) - layouts se adaptam
- [ ] Desktop (1024px) - layouts se adaptam
- [ ] Sidebar colapsável em mobile
- [ ] Tabelas scrolláveis em mobile

---

## ⚠️ Tratamento de Erros

- [ ] Mensagens de erro aparecem em toast
- [ ] Mensagens de sucesso aparecem em toast
- [ ] Estados loading funcionam
- [ ] Estados vazios mostram mensagens
- [ ] Validações de formulários funcionam

---

## 🔔 WhatsApp Notifications

- [ ] Página de Notificações acessível
- [ ] QR Code para conectar WhatsApp
- [ ] Histórico de notificações mostra
- [ ] Jobs agendados funcionam (24h, 1h antes)

---

## 📊 Performance

- [ ] Página carrega em menos de 3s
- [ ] Sem erros no console
- [ ] Sem memory leaks
- [ ] Animações suaves

---

## ✅ Final Checklist

- [ ] Todos os testes acima passaram
- [ ] Sem erros TypeScript
- [ ] Sem erros no console do navegador
- [ ] 11 testes vitest passando
- [ ] Pronto para deploy
