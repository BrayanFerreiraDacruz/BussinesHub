# ⚡ Quick Start - Deploy no Hostinger

## 🎯 Resumo Executivo

Este guia simplificado mostra os passos essenciais para fazer deploy do BusinessHub no Hostinger em menos de 30 minutos.

---

## 📋 O Que Você Vai Precisar

1. **Conta Hostinger** (criar em https://www.hostinger.com.br)
2. **Plano Hatchling** ou superior (~R$ 30-50/mês)
3. **Domínio** (próprio ou usar subdomínio Hostinger)
4. **Cliente SSH** (PuTTY no Windows, Terminal no Mac/Linux)
5. **Credenciais:**
   - Abacatepay API Key
   - Abacatepay Webhook Secret
   - Manus App ID

---

## 🚀 Passo a Passo Rápido

### 1️⃣ Criar Conta e Contratar Plano (5 min)

```
https://www.hostinger.com.br → Escolher Plano → Pagar → Pronto!
```

### 2️⃣ Conectar via SSH (2 min)

**No Windows:**
- Baixe PuTTY: https://www.putty.org
- Host: seu-dominio.com
- Username: seu_usuario
- Clique "Open"

**No Mac/Linux:**
```bash
ssh seu_usuario@seu-dominio.com
```

### 3️⃣ Executar Script de Setup (10 min)

```bash
# Clonar repositório
git clone https://github.com/BrayanFerreiraDacruz/BussinesHub.git
cd BussinesHub

# Executar script de setup automático
bash setup-hostinger.sh
```

### 4️⃣ Configurar Variáveis de Ambiente (3 min)

```bash
nano .env
```

Preencha com suas credenciais:
```
DATABASE_URL=mysql://user:pass@localhost:3306/businesshub
JWT_SECRET=sua-chave-secreta-32-caracteres
ABACATEPAY_API_KEY=sua-chave
ABACATEPAY_WEBHOOK_SECRET=seu-secret
VITE_APP_ID=seu-app-id
```

Salve: `Ctrl+X` → `Y` → `Enter`

### 5️⃣ Configurar SSL (5 min)

```bash
sudo certbot certonly --nginx -d seu-dominio.com.br
```

Depois edite o Nginx:
```bash
sudo nano /etc/nginx/sites-available/businesshub
```

Atualize com a configuração SSL (veja HOSTINGER_DEPLOYMENT_GUIDE.md).

### 6️⃣ Configurar Webhook Abacatepay (2 min)

1. Acesse: https://dashboard.abacatepay.com
2. Vá para Webhooks
3. Adicione: `https://seu-dominio.com.br/api/webhooks/abacatepay`
4. Selecione eventos: payment.completed, payment.failed, payment.pending
5. Salve

### 7️⃣ Testar (2 min)

```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs businesshub

# Acessar
https://seu-dominio.com.br
```

---

## ✅ Checklist Rápido

- [ ] Conta Hostinger criada
- [ ] SSH conectado
- [ ] Script setup executado
- [ ] .env configurado
- [ ] SSL ativado
- [ ] Webhook configurado
- [ ] Site acessível em HTTPS
- [ ] Pagamento teste realizado

---

## 🆘 Troubleshooting Rápido

**Erro: "Cannot find module"**
```bash
cd ~/BussinesHub
pnpm install
pnpm build
pm2 restart businesshub
```

**Erro: "Port 3000 already in use"**
```bash
pm2 restart businesshub
```

**Erro: "Database connection failed"**
```bash
# Verifique o .env
nano .env

# Teste conexão
mysql -u usuario -p -h localhost
```

**Erro: "502 Bad Gateway"**
```bash
pm2 logs businesshub
pm2 restart businesshub
```

---

## 📞 Próximos Passos

1. ✅ Teste com pagamento real
2. ✅ Configure backups automáticos
3. ✅ Monitore os logs regularmente
4. ✅ Mantenha o sistema atualizado

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **HOSTINGER_DEPLOYMENT_GUIDE.md** - Guia completo
- **DEPLOYMENT_CHECKLIST.md** - Checklist detalhado
- **setup-hostinger.sh** - Script de setup automático

---

**Tempo total estimado:** 30-45 minutos  
**Dificuldade:** ⭐⭐ (Fácil)  
**Status:** ✅ Pronto para Produção
