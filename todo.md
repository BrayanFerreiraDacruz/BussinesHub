# BusinessHub - TODO

## Fase 1: Modelagem de Banco de Dados
- [x] Criar schema de usuários (dono do negócio)
- [x] Criar schema de clientes
- [x] Criar schema de serviços
- [x] Criar schema de agendamentos
- [x] Criar schema de pagamentos/faturamento
- [x] Executar migrations SQL

## Fase 2: Backend - APIs e Lógica
- [x] API de autenticação e login
- [x] API de gestão de clientes (CRUD)
- [x] API de gestão de serviços (CRUD)
- [x] API de agendamentos (CRUD)
- [x] API de dashboard (métricas e visão geral)
- [x] API de relatórios (faturamento, agendamentos, clientes)
- [x] Testes unitários (vitest)

## Fase 3: Frontend - Dashboard Principal
- [x] Design system e cores profissionais
- [x] Layout principal com sidebar de navegação
- [x] Dashboard com cards de métricas
- [x] Calendário de agendamentos (visualização mês)
- [x] Gráficos de faturamento (série temporal - ultimos 7 dias)

## Fase 4: Frontend - Módulo de Agendamentos
- [x] Página de agendamentos com calendário
- [x] Formulário de novo agendamento
- [x] Edição de agendamento
- [x] Cancelamento de agendamento
- [x] Visualização de detalhes

## Fase 5: Frontend - Módulo de Clientes (CRM)
- [x] Página de listagem de clientes
- [x] Cadastro de novo cliente
- [x] Edição de cliente
- [x] Visualização de histórico de atendimentos (ultimos 3 agendamentos por cliente)
- [x] Busca e filtros (nome/telefone/email)

## Fase 6: Frontend - Módulo de Serviços
- [x] Página de catálogo de serviços
- [x] Cadastro de novo serviço
- [x] Edição de serviço
- [x] Exclusão de serviço

## Fase 7: Frontend - Módulo de Relatórios
- [x] Página de relatórios
- [x] Filtros por período
- [x] Relatório de faturamento
- [x] Relatório de agendamentos
- [x] Relatório de clientes
- [x] Exportação de dados (CSV)

## Fase 8: Integrações e Notificações (Fase 1 Completa)
- [ ] Sistema de notificações por email (futuro - roadmap)
- [x] Lembretes automáticos de agendamento (WhatsApp com jobs agendados)
- [ ] Integração com Stripe/PIX (futuro - roadmap)

## Fase 9: Testes, UI/UX e Polimento
- [x] Testes de fluxos principais (11 testes passando)
- [x] Ajustes de responsividade
- [x] Otimizações de performance
- [x] Validações de formulários
- [x] Tratamento de erros

## Fase 10: Preparação para Deploy
- [x] Documentação de deployment
- [x] Instruções para Hostinger
- [x] Variáveis de ambiente
- [x] Checkpoint final

## Fase 11: Sistema de Notificações WhatsApp
- [x] Configurar Baileys (WhatsApp Web - 100% gratuito)
- [x] Estender schema com tabelas de notificações
- [x] Implementar APIs de envio WhatsApp
- [x] Criar job agendado para lembretes automáticos (24h, 1h, confirmação, cancelamento)
- [x] Desenvolver frontend de gerenciamento
- [x] Testes e validação


## Bugs a Corrigir (Fase 12)
- [x] Pagamento salva valor do serviço concluído (preço do serviço é preenchido automaticamente)
- [x] Edição de cliente/serviço mantém todos os campos (formulários com estado controlado)
- [x] Dashboard mostra faturamento dos serviços concluídos (preço salvo corretamente)
- [x] Tema mudado para roxo moderno (paleta roxo vibrante implementada)


## Fase 13: Redesign Completo - Dark Mode Profissional
- [x] Redesenhar tema global com cores roxo/neon
- [x] Atualizar DashboardLayout com novo design (sidebar + top bar profissional)
- [x] Redesenhar Dashboard com cards gradientes e design neon
- [x] Atualizar página de Agendamentos com novo design
- [x] Atualizar páginas de Clientes, Serviços e Relatórios com novo design roxo/neon
- [x] Adicionar toggle light/dark mode
- [x] Testes e validação (11 testes passando)

## Fase 14: Testes Completos (CONCLUÍDO)
- [x] Testes de design roxo/neon em todas as páginas
- [x] Testes de funcionalidades principais (CRUD)
- [x] Testes de responsividade (mobile/tablet/desktop)
- [x] Testes de light/dark mode
- [x] Testes de WhatsApp notifications
- [x] 11 testes vitest passando
- [x] TypeScript sem erros
- [x] Console sem erros

## Fase 15: Integração Abacatepay (100% Gratuito)
- [ ] Configurar credenciais do Abacatepay
- [ ] Estender schema com tabelas de transações
- [ ] Implementar APIs backend Abacatepay
- [ ] Criar frontend de pagamentos
- [ ] Implementar webhook de confirmação
- [ ] Testes e validação
