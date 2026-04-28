---
name: hostinger-saas-deploy
description: Fluxo de deploy especializado para o SaaS BusinessHub na Hostinger. Cobre configurações de porta, caminhos de build, WhatsApp Baileys e variáveis de ambiente para VPS e Hospedagem Gerenciada.
---

# Hostinger SaaS Deploy Guide

Este guia fornece instruções precisas para implantar o BusinessHub na Hostinger, corrigindo os erros comuns de porta, caminhos estáticos e persistência.

## 🚀 Fluxo de Deploy Principal

### 1. Preparação do Ambiente
- **Porta**: NUNCA force a porta 3000. Use sempre `process.env.PORT`. O código já foi corrigido para isso.
- **Node.js**: Use a versão 18 ou superior.
- **Variáveis de Ambiente**: Certifique-se de que o `.env` contenha `NODE_ENV=production`.

### 2. Build e Empacotamento
Para evitar erros de compilação no servidor, faça o build localmente:
1. `npm run build` (gera a pasta `dist`)
2. Certifique-se de que a pasta `dist/public` contém o `index.html`.

### 3. Configuração na Hostinger (hPanel / Managed Node.js)
Se estiver usando o Seletor de Node.js do painel:
- **App Directory**: Aponte para a pasta raiz onde está o `package.json`.
- **Application Startup File**: `dist/index.js`.
- **Variáveis de Ambiente**: Adicione via painel ou arquivo `.env`.

### 4. Configuração na VPS (Ubuntu)
Se estiver usando o script `setup-hostinger.sh`:
1. Execute o script para instalar dependências.
2. Use PM2 para gerenciar o processo: `pm2 start dist/index.js --name businesshub`.
3. **Nginx**: O proxy reverso deve apontar para a porta definida em `process.env.PORT` (padrão 3000 na VPS se não houver outra).

## ⚠️ Resolução de Problemas (Troubleshooting)

### Erro 503 / Porta Ocupada
- **Causa**: O suporte da Hostinger informou que a porta 3000 é usada pelo sistema.
- **Solução**: O código agora usa `process.env.PORT`. No painel hPanel, a Hostinger atribui uma porta aleatória automaticamente. Se estiver na VPS, mude a porta no `.env`: `PORT=3001` e atualize o arquivo do Nginx.

### Tela Branca (Frontend não carrega)
- **Causa**: Caminho `dist/public` incorreto.
- **Solução**: Verifique se a pasta `public` está dentro de `dist` após o build. O `serveStatic` no código foi atualizado para ser mais robusto.

### WhatsApp não conecta
- **Causa**: Pasta `.wwebjs_auth` sem permissão ou processo reiniciando.
- **Solução**: Garanta que o usuário do Node.js tenha permissão de escrita na raiz do projeto. No PM2, use `--watch` com cautela para não entrar em loop infinito ao salvar a sessão.

## 🛠️ Comandos Úteis
- Ver logs: `pm2 logs businesshub`
- Reiniciar: `pm2 restart businesshub`
- Verificar porta: `netstat -tulpn | grep :3000`
