# ✅ Checklist de Deployment - BusinessHub

## 📋 Antes de Começar

- [ ] Conta Hostinger criada (https://www.hostinger.com.br)
- [ ] Plano contratado (Hatchling ou superior)
- [ ] Domínio configurado (próprio ou subdomínio Hostinger)
- [ ] GitHub conectado ao Manus
- [ ] Código enviado para GitHub
- [ ] Credenciais Abacatepay obtidas

---

## 🖥️ Configuração do Servidor

### Acesso SSH
- [ ] SSH ativado no painel Hostinger
- [ ] Credenciais SSH copiadas
- [ ] Conexão SSH testada

### Instalação de Dependências
- [ ] Sistema atualizado (`sudo apt update && sudo apt upgrade -y`)
- [ ] Node.js 22 instalado (`node --version`)
- [ ] pnpm instalado (`pnpm --version`)
- [ ] Git instalado (`git --version`)
- [ ] PM2 instalado (`pm2 --version`)
- [ ] Nginx instalado (`nginx --version`)
- [ ] Certbot instalado (`certbot --version`)

---

## 📦 Deploy da Aplicação

### Repositório
- [ ] Repositório clonado (`git clone https://github.com/BrayanFerreiraDacruz/BussinesHub.git`)
- [ ] Navegado para diretório (`cd BussinesHub`)

### Dependências
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Build realizado (`pnpm build`)

### Configuração
- [ ] Arquivo `.env` criado
- [ ] `DATABASE_URL` configurado
- [ ] `JWT_SECRET` definido (mínimo 32 caracteres)
- [ ] `VITE_APP_ID` configurado (Manus)
- [ ] `ABACATEPAY_API_KEY` configurado
- [ ] `ABACATEPAY_WEBHOOK_SECRET` configurado
- [ ] `VITE_FRONTEND_URL` apontando para seu domínio
- [ ] Todos os valores de ambiente preenchidos

---

## 🗄️ Banco de Dados

### MySQL
- [ ] Banco de dados criado no Hostinger
- [ ] Usuário MySQL criado
- [ ] Senha MySQL gerada e segura
- [ ] Credenciais adicionadas ao `.env`

### Migrations
- [ ] Migrations executadas (`pnpm drizzle-kit migrate`)
- [ ] Tabelas criadas com sucesso
- [ ] Conexão com banco de dados testada

---

## 🚀 Inicialização da Aplicação

### PM2
- [ ] Aplicação iniciada com PM2 (`pm2 start "pnpm start" --name "businesshub"`)
- [ ] PM2 salvo (`pm2 save`)
- [ ] PM2 startup configurado (`pm2 startup`)
- [ ] Status verificado (`pm2 status`)
- [ ] Logs verificados (`pm2 logs businesshub`)

### Nginx
- [ ] Arquivo de configuração criado (`/etc/nginx/sites-available/businesshub`)
- [ ] Symbolic link criado (`/etc/nginx/sites-enabled/businesshub`)
- [ ] Configuração testada (`sudo nginx -t`)
- [ ] Nginx reiniciado (`sudo systemctl restart nginx`)

---

## 🌐 Domínio e DNS

### DNS
- [ ] Domínio apontando para IP do servidor
- [ ] Registros A configurados
- [ ] DNS propagado (pode levar até 24h)
- [ ] Domínio resolvendo para servidor (`ping seu-dominio.com.br`)

### Nginx Virtual Host
- [ ] Arquivo de configuração atualizado com domínio
- [ ] Configuração testada (`sudo nginx -t`)
- [ ] Nginx reiniciado

---

## 🔒 SSL/TLS (HTTPS)

### Certificado
- [ ] Certbot executado (`sudo certbot certonly --nginx -d seu-dominio.com.br`)
- [ ] Certificado gerado com sucesso
- [ ] Certificado localizado em `/etc/letsencrypt/live/seu-dominio.com.br/`

### Nginx com SSL
- [ ] Configuração Nginx atualizada com SSL
- [ ] Redirecionamento HTTP → HTTPS configurado
- [ ] Configuração testada (`sudo nginx -t`)
- [ ] Nginx reiniciado
- [ ] HTTPS funcionando (`https://seu-dominio.com.br`)

### Renovação Automática
- [ ] Renovação automática testada (`sudo certbot renew --dry-run`)
- [ ] Cron job configurado para renovação

---

## 💳 Integração Abacatepay

### Dashboard Abacatepay
- [ ] Conta Abacatepay criada
- [ ] API Key obtida
- [ ] Webhook Secret obtida

### Webhook
- [ ] URL do webhook configurada: `https://seu-dominio.com.br/api/webhooks/abacatepay`
- [ ] Eventos selecionados:
  - [ ] payment.completed
  - [ ] payment.failed
  - [ ] payment.pending
- [ ] Webhook testado com evento de teste

---

## 🧪 Testes

### Aplicação
- [ ] Site acessível via HTTP (`http://seu-dominio.com.br`)
- [ ] Site acessível via HTTPS (`https://seu-dominio.com.br`)
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Certificado SSL válido

### Funcionalidades
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Agendamentos criáveis
- [ ] Clientes criáveis
- [ ] Serviços criáveis

### Pagamentos
- [ ] Página de Pagamentos acessível
- [ ] Link de pagamento gerado com sucesso
- [ ] QR Code exibido corretamente
- [ ] Pagamento teste realizado
- [ ] Webhook recebido com sucesso
- [ ] Status de pagamento atualizado
- [ ] Lucro aparecendo no Dashboard

---

## 📊 Monitoramento

### PM2
- [ ] PM2 monitorando aplicação
- [ ] Logs sendo registrados
- [ ] Reinicialização automática configurada

### Nginx
- [ ] Nginx rodando (`sudo systemctl status nginx`)
- [ ] Logs de erro vazios (`sudo tail -f /var/log/nginx/error.log`)

### Banco de Dados
- [ ] MySQL rodando (`sudo systemctl status mysql`)
- [ ] Backup configurado

---

## 🔧 Manutenção

### Atualizações
- [ ] Node.js atualizado regularmente
- [ ] Dependências atualizadas (`pnpm update`)
- [ ] Certificado SSL renovado automaticamente

### Backups
- [ ] Backup do banco de dados agendado
- [ ] Backup do código configurado
- [ ] Backup testado

### Logs
- [ ] Logs sendo monitorados regularmente
- [ ] Erros sendo investigados
- [ ] Rotação de logs configurada

---

## 🎉 Deployment Concluído!

Quando todos os itens estiverem marcados ✅, seu BusinessHub está pronto para produção!

### Próximos Passos:
1. Monitore os logs regularmente
2. Faça backups regularmente
3. Mantenha o sistema atualizado
4. Configure alertas de erro
5. Teste a aplicação regularmente

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs:**
   ```bash
   pm2 logs businesshub
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Reinicie a aplicação:**
   ```bash
   pm2 restart businesshub
   ```

3. **Verifique a conexão com banco de dados:**
   ```bash
   mysql -u businesshub_user -p -h localhost
   ```

4. **Consulte a documentação:**
   - Hostinger: https://support.hostinger.com.br
   - Abacatepay: https://docs.abacatepay.com
   - Node.js: https://nodejs.org/docs

---

**Versão:** 1.0  
**Última atualização:** Abril 2026  
**Status:** ✅ Pronto para Produção
