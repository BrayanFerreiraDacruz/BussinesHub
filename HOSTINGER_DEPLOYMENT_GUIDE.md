# 🚀 Guia Completo de Deployment - BusinessHub no Hostinger

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Escolha do Plano](#escolha-do-plano)
3. [Configuração Inicial](#configuração-inicial)
4. [Setup do Servidor](#setup-do-servidor)
5. [Deploy da Aplicação](#deploy-da-aplicação)
6. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
7. [Configuração do Domínio](#configuração-do-domínio)
8. [SSL/TLS](#ssltls)
9. [Monitoramento](#monitoramento)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, você vai precisar de:
- ✅ Conta no Hostinger (criar em https://www.hostinger.com.br)
- ✅ Domínio próprio (ou usar subdomínio do Hostinger)
- ✅ Repositório GitHub: https://github.com/BrayanFerreiraDacruz/BussinesHub
- ✅ Credenciais Abacatepay (API Key e Webhook Secret)
- ✅ Cliente SSH (PuTTY no Windows ou Terminal no Mac/Linux)

---

## 💰 Escolha do Plano

### Plano Recomendado: **Hatchling Plan** ou superior

| Recurso | Mínimo Recomendado |
|---------|-------------------|
| **CPU** | 2 vCores |
| **RAM** | 2 GB |
| **Armazenamento** | 50 GB SSD |
| **Banda** | Ilimitada |
| **Banco de Dados MySQL** | Sim (incluído) |
| **SSH Access** | Sim |
| **Node.js** | Sim |

**Preço:** ~R$ 30-50/mês

---

## 🎯 Configuração Inicial

### Passo 1: Criar Conta no Hostinger

1. Acesse https://www.hostinger.com.br
2. Clique em **"Começar"** ou **"Planos"**
3. Escolha o plano **Hatchling** (ou superior)
4. Selecione o período (recomendo 12 meses para desconto)
5. Preencha seus dados
6. Escolha um domínio ou use subdomínio temporário
7. Complete o pagamento

### Passo 2: Acessar o Painel

1. Após o pagamento, acesse https://hpanel.hostinger.com
2. Faça login com suas credenciais
3. Você verá seu domínio no painel

---

## 🖥️ Setup do Servidor

### Passo 1: Ativar SSH

1. No painel Hostinger, vá para **Conta** → **SSH**
2. Clique em **"Ativar SSH"**
3. Copie as credenciais:
   - **Host:** seu-dominio.com ou IP
   - **Usuário:** seu_usuario
   - **Porta:** 22 (padrão)
   - **Senha:** será fornecida

### Passo 2: Conectar via SSH

**No Windows (PuTTY):**
1. Baixe PuTTY: https://www.putty.org
2. Abra PuTTY
3. Preencha:
   - Host: `seu-dominio.com`
   - Port: `22`
   - Username: `seu_usuario`
4. Clique **Open**
5. Digite a senha

**No Mac/Linux (Terminal):**
```bash
ssh seu_usuario@seu-dominio.com
```

### Passo 3: Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### Passo 4: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Passo 5: Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

### Passo 6: Instalar Git

```bash
sudo apt install -y git
git --version
```

### Passo 7: Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2
pm2 --version
```

### Passo 8: Instalar Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Passo 9: Instalar Certbot (SSL/TLS)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 📦 Deploy da Aplicação

### Passo 1: Clonar Repositório

```bash
cd /home/seu_usuario
git clone https://github.com/BrayanFerreiraDacruz/BussinesHub.git
cd BussinesHub
```

### Passo 2: Instalar Dependências

```bash
pnpm install
```

### Passo 3: Criar Arquivo .env

```bash
nano .env
```

Cole o seguinte conteúdo (substitua com seus valores reais):

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/businesshub"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui-32-caracteres"

# OAuth Manus
VITE_APP_ID="seu-app-id-do-manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Abacatepay
ABACATEPAY_API_KEY="sua-chave-api-abacatepay"
ABACATEPAY_WEBHOOK_SECRET="seu-webhook-secret"

# Frontend URL
VITE_FRONTEND_URL="https://seu-dominio.com.br"

# Owner Info
OWNER_NAME="Seu Nome"
OWNER_OPEN_ID="seu-open-id"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-forge"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-forge-frontend"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"

# App Info
VITE_APP_TITLE="BusinessHub"
VITE_APP_LOGO="https://seu-cdn/logo.png"
```

**Salve:** Ctrl+X → Y → Enter

### Passo 4: Build da Aplicação

```bash
pnpm build
```

### Passo 5: Iniciar com PM2

```bash
pm2 start "pnpm start" --name "businesshub"
pm2 save
pm2 startup
```

Copie e execute o comando que aparecer no terminal.

---

## 🗄️ Configuração do Banco de Dados

### Passo 1: Acessar MySQL no Hostinger

1. No painel Hostinger, vá para **Banco de Dados** → **MySQL**
2. Clique em **"Criar Banco de Dados"**
3. Preencha:
   - **Nome:** businesshub
   - **Usuário:** businesshub_user
   - **Senha:** gere uma senha forte
4. Clique **Criar**

### Passo 2: Obter Credenciais

1. Copie as credenciais fornecidas
2. Atualize o arquivo `.env` com:
   ```
   DATABASE_URL="mysql://businesshub_user:sua_senha@localhost:3306/businesshub"
   ```

### Passo 3: Executar Migrations

```bash
cd /home/seu_usuario/BussinesHub
pnpm drizzle-kit migrate
```

---

## 🌐 Configuração do Domínio

### Passo 1: Apontar DNS

Se você comprou domínio no Hostinger:
1. Vá para **Domínios** → Seu domínio
2. Clique em **Gerenciar DNS**
3. Procure por **Registros A**
4. Aponte para o IP do seu servidor Hostinger

Se você comprou domínio em outro lugar:
1. Acesse o painel do seu registrador
2. Procure por **DNS** ou **Nameservers**
3. Aponte para os nameservers do Hostinger:
   - ns1.hostinger.com
   - ns2.hostinger.com
   - ns3.hostinger.com

### Passo 2: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/businesshub
```

Cole:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Salve:** Ctrl+X → Y → Enter

### Passo 3: Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/businesshub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL/TLS

### Passo 1: Gerar Certificado

```bash
sudo certbot certonly --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

### Passo 2: Atualizar Nginx

```bash
sudo nano /etc/nginx/sites-available/businesshub
```

Substitua todo o conteúdo por:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Passo 3: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### Passo 4: Renovação Automática

```bash
sudo certbot renew --dry-run
```

---

## 📊 Monitoramento

### Verificar Status da Aplicação

```bash
pm2 status
pm2 logs businesshub
```

### Reiniciar Aplicação

```bash
pm2 restart businesshub
```

### Ver Logs em Tempo Real

```bash
pm2 logs businesshub --lines 100 --follow
```

### Parar Aplicação

```bash
pm2 stop businesshub
```

---

## 🔧 Configuração do Webhook Abacatepay

### No Dashboard Abacatepay:

1. Acesse https://dashboard.abacatepay.com
2. Vá para **Webhooks** ou **Configurações**
3. Adicione a URL do webhook:
   ```
   https://seu-dominio.com.br/api/webhooks/abacatepay
   ```
4. Selecione os eventos:
   - ✅ payment.completed
   - ✅ payment.failed
   - ✅ payment.pending
5. Salve

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
cd /home/seu_usuario/BussinesHub
pnpm install
pnpm build
pm2 restart businesshub
```

### Erro: "Port 3000 already in use"

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
pm2 restart businesshub
```

### Erro: "Database connection failed"

1. Verifique se MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```

2. Verifique as credenciais no `.env`

3. Teste a conexão:
   ```bash
   mysql -u businesshub_user -p -h localhost
   ```

### Erro: "SSL certificate not found"

```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

### Erro: "502 Bad Gateway"

1. Verifique se a aplicação está rodando:
   ```bash
   pm2 status
   ```

2. Verifique os logs:
   ```bash
   pm2 logs businesshub
   ```

3. Reinicie:
   ```bash
   pm2 restart businesshub
   ```

---

## 📝 Checklist Final

- [ ] Conta Hostinger criada e ativa
- [ ] SSH ativado e conectado
- [ ] Node.js, pnpm e Git instalados
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado
- [ ] Migrations executadas
- [ ] Aplicação iniciada com PM2
- [ ] Nginx configurado
- [ ] SSL/TLS ativado
- [ ] Domínio apontando para servidor
- [ ] Webhook Abacatepay configurado
- [ ] Testes de pagamento realizados

---

## 🎉 Pronto!

Sua aplicação BusinessHub está rodando em produção! 🚀

**URL:** https://seu-dominio.com.br

### Próximos Passos:

1. **Teste de Pagamento:** Faça um pagamento teste via Abacatepay
2. **Monitoramento:** Monitore os logs regularmente
3. **Backups:** Configure backups automáticos do banco de dados
4. **Updates:** Mantenha Node.js e dependências atualizadas

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs businesshub`
2. Consulte a documentação do Hostinger
3. Verifique a documentação do Abacatepay
4. Abra uma issue no GitHub

---

**Versão:** 1.0  
**Última atualização:** Abril 2026  
**Status:** ✅ Pronto para Produção
