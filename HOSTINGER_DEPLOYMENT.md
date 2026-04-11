# 🚀 Guia Completo de Deployment no Hostinger

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta no Hostinger** (https://www.hostinger.com.br)
2. **Domínio próprio** (ex: businesshub.com.br)
3. **Conhecimento básico de terminal**
4. **Git instalado** localmente

---

## 📊 Arquitetura de Deployment

```
Domínio (businesshub.com.br)
        ↓
    Nginx (Reverse Proxy)
        ↓
    Node.js (Express)
        ↓
    MySQL (Database)
        ↓
    S3 (File Storage)
```

---

## 🔧 Passo 1: Preparar o Hostinger

### 1.1 Criar Conta e Contratar Plano

**Plano Recomendado:** Hostinger Business ou VPS
- Mínimo: 2GB RAM
- Mínimo: 20GB SSD
- Node.js suportado
- SSH access

### 1.2 Acessar o Painel de Controle

1. Faça login no Hostinger
2. Vá para "Hosting" → Seu domínio
3. Clique em "Gerenciar"

### 1.3 Configurar Domínio

1. Vá para "Domínios" → Seu domínio
2. Aponte para o IP do seu servidor Hostinger
3. Aguarde propagação DNS (até 24h)

---

## 🖥️ Passo 2: Configurar o Servidor

### 2.1 Acessar via SSH

```bash
# No seu computador
ssh root@seu-ip-hostinger

# Digite a senha fornecida pelo Hostinger
```

### 2.2 Atualizar Sistema

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar dependências essenciais
apt install -y curl wget git build-essential
```

### 2.3 Instalar Node.js

```bash
# Instalar Node.js 18+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verificar instalação
node --version  # v18.x.x
npm --version   # 9.x.x

# Instalar pnpm (gerenciador de pacotes)
npm install -g pnpm
pnpm --version
```

### 2.4 Instalar MySQL

```bash
# Instalar MySQL Server
apt install -y mysql-server

# Iniciar serviço
systemctl start mysql-server
systemctl enable mysql-server

# Verificar status
systemctl status mysql-server
```

### 2.5 Instalar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Iniciar serviço
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

### 2.6 Instalar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 --version
```

---

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1 Criar Banco de Dados

```bash
# Acessar MySQL
mysql -u root -p

# Dentro do MySQL:
CREATE DATABASE businesshub;
CREATE USER 'businesshub'@'localhost' IDENTIFIED BY 'senha-super-segura-aqui';
GRANT ALL PRIVILEGES ON businesshub.* TO 'businesshub'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 Criar Arquivo de Backup

```bash
# Criar diretório de backups
mkdir -p /home/backups

# Criar script de backup automático
cat > /home/backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mysqldump -u businesshub -p'sua-senha' businesshub > $BACKUP_DIR/businesshub_$TIMESTAMP.sql
# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "businesshub_*.sql" -mtime +30 -delete
EOF

# Dar permissão de execução
chmod +x /home/backups/backup.sh

# Agendar backup diário (cron)
crontab -e
# Adicionar linha:
# 0 2 * * * /home/backups/backup.sh
```

---

## 📂 Passo 4: Deploy do Código

### 4.1 Clonar Repositório

```bash
# Criar diretório de aplicações
mkdir -p /var/www
cd /var/www

# Clonar repositório
git clone https://github.com/seu-usuario/businesshub.git
cd businesshub
```

### 4.2 Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://businesshub:senha-super-segura@localhost:3306/businesshub"

# Node Environment
NODE_ENV=production

# JWT Secret (gere com: openssl rand -base64 32)
JWT_SECRET="seu-jwt-secret-aleatorio-aqui"

# OAuth (Manus)
VITE_APP_ID="seu-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"

# Owner Info
OWNER_NAME="Seu Nome"
OWNER_OPEN_ID="seu-open-id"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua-frontend-api-key"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"

# App Info
VITE_APP_TITLE="BusinessHub"
VITE_APP_LOGO="https://seu-cdn/logo.png"
EOF

# Proteger arquivo
chmod 600 .env
```

### 4.3 Instalar Dependências e Build

```bash
# Instalar dependências
pnpm install

# Gerar migrations
pnpm drizzle-kit generate

# Executar migrations
pnpm drizzle-kit migrate

# Build para produção
pnpm run build

# Verificar build
ls -la dist/
```

---

## ⚙️ Passo 5: Configurar Nginx

### 5.1 Criar Configuração Nginx

```bash
# Criar arquivo de configuração
cat > /etc/nginx/sites-available/businesshub << 'EOF'
upstream businesshub_backend {
    server localhost:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name businesshub.com.br www.businesshub.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name businesshub.com.br www.businesshub.com.br;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/businesshub.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/businesshub.com.br/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Proxy Settings
    location / {
        proxy_pass http://businesshub_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Files Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar configuração
ln -s /etc/nginx/sites-available/businesshub /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 5.2 Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado SSL
certbot certonly --nginx -d businesshub.com.br -d www.businesshub.com.br

# Renovação automática
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## 🚀 Passo 6: Iniciar Aplicação com PM2

### 6.1 Criar Arquivo de Configuração PM2

```bash
# Criar arquivo ecosystem.config.js
cat > /var/www/businesshub/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'businesshub',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
```

### 6.2 Iniciar Aplicação

```bash
# Criar diretório de logs
mkdir -p /var/www/businesshub/logs

# Iniciar com PM2
cd /var/www/businesshub
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar startup
pm2 startup
# Execute o comando que PM2 sugerir

# Verificar status
pm2 status
pm2 logs businesshub
```

---

## 🔍 Passo 7: Monitoramento e Manutenção

### 7.1 Verificar Status

```bash
# Verificar status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs businesshub

# Monitorar recursos
pm2 monit
```

### 7.2 Atualizar Código

```bash
# Puxar atualizações
cd /var/www/businesshub
git pull origin main

# Reinstalar dependências (se necessário)
pnpm install

# Build
pnpm run build

# Reiniciar aplicação
pm2 restart businesshub
```

### 7.3 Backup Automático

```bash
# Backup já configurado no Passo 3
# Verificar se está funcionando:
ls -la /home/backups/
```

---

## 📊 Passo 8: Configurar Monitoramento (Opcional)

### 8.1 Sentry (Error Tracking)

```bash
# Instalar Sentry
npm install @sentry/node @sentry/tracing

# Adicionar ao código (server/_core/index.ts):
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "seu-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 8.2 Uptime Monitoring

Use serviços como:
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://www.pingdom.com)
- StatusCake (https://www.statuscake.com)

---

## 💰 Passo 9: Configurar Monetização

### 9.1 Stripe Integration (Opcional)

```bash
# Instalar Stripe
npm install stripe

# Adicionar chaves ao .env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### 9.2 Configurar Planos

**Plano Gratuito**
- Até 10 clientes
- Até 20 agendamentos/mês

**Plano Profissional - R$ 99/mês**
- Clientes ilimitados
- Agendamentos ilimitados
- Lembretes WhatsApp

**Plano Empresarial - R$ 299/mês**
- Tudo do Profissional
- Múltiplos usuários
- API pública

---

## ✅ Checklist de Deployment

- [ ] Servidor configurado (Node.js, MySQL, Nginx)
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS ativado
- [ ] Código clonado e buildado
- [ ] PM2 rodando a aplicação
- [ ] Nginx proxy configurado
- [ ] Backup automático ativo
- [ ] Monitoramento configurado
- [ ] Domínio apontando corretamente
- [ ] Testes de funcionalidade completos

---

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs businesshub

# Verificar porta 3000
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>

# Reiniciar
pm2 restart businesshub
```

### Erro de conexão com banco de dados

```bash
# Verificar MySQL
systemctl status mysql-server

# Testar conexão
mysql -u businesshub -p -h localhost businesshub

# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### Nginx não funciona

```bash
# Testar configuração
nginx -t

# Ver logs
tail -f /var/log/nginx/error.log

# Reiniciar
systemctl restart nginx
```

---

## 📞 Suporte Hostinger

- **Chat ao vivo:** https://www.hostinger.com.br/suporte
- **Email:** suporte@hostinger.com.br
- **Documentação:** https://www.hostinger.com.br/tutoriais

---

## 🎯 Próximos Passos

1. ✅ Fazer deploy
2. ✅ Testar todas as funcionalidades
3. ✅ Configurar domínio personalizado
4. ✅ Ativar HTTPS
5. ✅ Configurar backups
6. ✅ Começar a vender!

---

**Parabéns! Seu BusinessHub está no ar! 🚀**

*Última atualização: 11 de Abril de 2026*
