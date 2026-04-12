# 🚀 Guia de Deploy - BusinessHub v3.0.0

## 📋 Visão Geral

BusinessHub é um SaaS completo para gestão de agendamentos, clientes e serviços voltado para pequenos negócios brasileiros. Este guia fornece instruções passo a passo para deploy em produção.

**Versão:** 3.0.0  
**Stack:** Next.js + tRPC + Prisma + MySQL  
**Integração de Pagamentos:** Abacatepay (100% gratuito)  
**Notificações:** WhatsApp via Baileys (100% gratuito)

---

## 📊 Arquitetura

```
Domínio (seu-dominio.com.br)
        ↓
    Nginx (Reverse Proxy)
        ↓
    Node.js (Express + tRPC)
        ↓
    MySQL (Banco de Dados)
        ↓
    Abacatepay (Pagamentos PIX)
    WhatsApp (Notificações)
```

---

## 🔧 Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta no Hostinger** (https://www.hostinger.com.br)
2. **Domínio próprio** (ex: businesshub.com.br)
3. **Conhecimento básico de terminal/SSH**
4. **Git instalado** localmente
5. **Credenciais Abacatepay:**
   - API Key: `abc_dev_KWs4EnnEpqcrAbYqWbgaAbgK`
   - Webhook Secret: `webh_dev_AyfKxCmw2XCZTh2NKAyCsnmE`

---

## 🖥️ Passo 1: Preparar o Hostinger

### 1.1 Contratar Plano

**Plano Recomendado:** Hostinger Business ou VPS
- Mínimo: 2GB RAM
- Mínimo: 20GB SSD
- Node.js 18+ suportado
- SSH access habilitado

### 1.2 Acessar via SSH

```bash
# No seu computador
ssh root@seu-ip-hostinger

# Digite a senha fornecida pelo Hostinger
```

### 1.3 Atualizar Sistema

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar dependências essenciais
apt install -y curl wget git build-essential nginx mysql-server
```

---

## 📦 Passo 2: Instalar Node.js e pnpm

### 2.1 Instalar Node.js 18+

```bash
# Instalar Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2.2 Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

---

## 🗄️ Passo 3: Configurar Banco de Dados MySQL

### 3.1 Iniciar MySQL

```bash
# Iniciar serviço MySQL
systemctl start mysql
systemctl enable mysql

# Verificar status
systemctl status mysql
```

### 3.2 Criar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root

# Executar comandos SQL
CREATE DATABASE businesshub;
CREATE USER 'businesshub'@'localhost' IDENTIFIED BY 'sua-senha-segura';
GRANT ALL PRIVILEGES ON businesshub.* TO 'businesshub'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Configurar Conexão

Salve a string de conexão para usar no `.env`:

```
DATABASE_URL="mysql://businesshub:sua-senha-segura@localhost:3306/businesshub"
```

---

## 📂 Passo 4: Clonar e Configurar Aplicação

### 4.1 Clonar Repositório

```bash
# Criar diretório para aplicação
mkdir -p /var/www/businesshub
cd /var/www/businesshub

# Clonar repositório (substitua pela sua URL)
git clone https://github.com/seu-usuario/businesshub.git .
```

### 4.2 Instalar Dependências

```bash
# Instalar dependências
pnpm install

# Verificar instalação
pnpm list
```

### 4.3 Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="mysql://businesshub:sua-senha-segura@localhost:3306/businesshub"

# Autenticação
JWT_SECRET="gere-uma-chave-aleatoria-segura"

# OAuth Manus
VITE_APP_ID="seu-app-id-manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im"

# Abacatepay (Pagamentos)
ABACATEPAY_API_KEY="abc_dev_KWs4EnnEpqcrAbYqWbgaAbgK"
ABACATEPAY_WEBHOOK_SECRET="webh_dev_AyfKxCmw2XCZTh2NKAyCsnmE"

# URLs
VITE_FRONTEND_URL="https://seu-dominio.com.br"

# Ambiente
NODE_ENV="production"
PORT=3000
```

### 4.4 Executar Migrations

```bash
# Gerar e executar migrations Prisma
pnpm run db:push

# Verificar se tudo correu bem
pnpm run db:studio
```

---

## 🌐 Passo 5: Configurar Nginx

### 5.1 Criar Arquivo de Configuração

```bash
# Criar arquivo de configuração
nano /etc/nginx/sites-available/businesshub
```

### 5.2 Adicionar Configuração

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    # Certificado SSL (será configurado com Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy para Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook Abacatepay
    location /api/webhooks/abacatepay {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
}
```

### 5.3 Ativar Configuração

```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/businesshub /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 🔒 Passo 6: Configurar SSL com Let's Encrypt

### 6.1 Instalar Certbot

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado
certbot certonly --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Seguir as instruções na tela
```

### 6.2 Renovação Automática

```bash
# Testar renovação
certbot renew --dry-run

# Certificado será renovado automaticamente
```

---

## 🚀 Passo 7: Iniciar Aplicação

### 7.1 Compilar Aplicação

```bash
# Compilar para produção
pnpm run build

# Verificar se compilou sem erros
ls -la dist/
```

### 7.2 Iniciar com PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start "pnpm run start" --name businesshub

# Salvar configuração
pm2 save

# Ativar restart automático
pm2 startup
```

### 7.3 Verificar Status

```bash
# Ver status da aplicação
pm2 status

# Ver logs
pm2 logs businesshub

# Monitorar em tempo real
pm2 monit
```

---

## 🧪 Passo 8: Testes de Produção

### 8.1 Verificar Aplicação

```bash
# Acessar via navegador
https://seu-dominio.com.br

# Verificar se carrega corretamente
# Testar login com OAuth
# Testar criação de agendamento
# Testar geração de link de pagamento
```

### 8.2 Testar Webhook Abacatepay

```bash
# Verificar se webhook está acessível
curl -X POST https://seu-dominio.com.br/api/webhooks/abacatepay \
  -H "Content-Type: application/json" \
  -H "X-Abacatepay-Signature: test" \
  -d '{"id":"test","event":"payment.completed"}'

# Deve retornar 401 ou 200 (dependendo da assinatura)
```

### 8.3 Verificar Logs

```bash
# Ver logs de erro
pm2 logs businesshub --err

# Ver logs gerais
pm2 logs businesshub

# Verificar logs do Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## 📊 Monitoramento e Manutenção

### 8.1 Monitorar Performance

```bash
# Instalar ferramentas de monitoramento
apt install -y htop iotop

# Monitorar uso de recursos
htop

# Monitorar I/O
iotop
```

### 8.2 Backup Automático

```bash
# Criar script de backup
cat > /usr/local/bin/backup-businesshub.sh << 'EOF'
#!/bin/bash

# Backup do banco de dados
mysqldump -u businesshub -p'sua-senha' businesshub > /backups/businesshub-$(date +%Y%m%d).sql

# Backup dos arquivos
tar -czf /backups/businesshub-files-$(date +%Y%m%d).tar.gz /var/www/businesshub

# Manter apenas últimos 7 dias
find /backups -name "businesshub-*" -mtime +7 -delete
EOF

# Dar permissão de execução
chmod +x /usr/local/bin/backup-businesshub.sh

# Agendar backup diário (via crontab)
crontab -e
# Adicionar linha: 0 2 * * * /usr/local/bin/backup-businesshub.sh
```

### 8.3 Atualizar Aplicação

```bash
# Parar aplicação
pm2 stop businesshub

# Atualizar código
cd /var/www/businesshub
git pull origin main

# Instalar novas dependências
pnpm install

# Executar migrations
pnpm run db:push

# Compilar
pnpm run build

# Reiniciar
pm2 start businesshub
```

---

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs businesshub

# Verificar porta 3000
lsof -i :3000

# Verificar variáveis de ambiente
cat /var/www/businesshub/.env

# Testar localmente
cd /var/www/businesshub
pnpm run dev
```

### Webhook não funciona

```bash
# Verificar se Nginx está redirecionando corretamente
curl -v https://seu-dominio.com.br/api/webhooks/abacatepay

# Verificar logs do Nginx
tail -f /var/log/nginx/error.log

# Verificar se porta 3000 está aberta
netstat -tlnp | grep 3000
```

### Banco de dados não conecta

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão
mysql -u businesshub -p -h localhost businesshub

# Verificar variável DATABASE_URL
grep DATABASE_URL /var/www/businesshub/.env
```

---

## 📞 Suporte

Para mais informações:
- Documentação: https://github.com/seu-usuario/businesshub
- Issues: https://github.com/seu-usuario/businesshub/issues
- Email: suporte@businesshub.com.br

---

**Versão:** 3.0.0  
**Última atualização:** Abril 2026  
**Autor:** Manus AI
