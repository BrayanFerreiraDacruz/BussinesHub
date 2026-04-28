#!/bin/bash

# 🚀 Script de Setup Automático - BusinessHub no Hostinger
# Este script automatiza o setup do servidor

set -e

echo "================================"
echo "🚀 BusinessHub - Setup Hostinger"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Passo 1: Atualizar Sistema
echo ""
echo "📦 Passo 1: Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
log_info "Sistema atualizado"

# Passo 2: Instalar Node.js
echo ""
echo "📦 Passo 2: Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
log_info "Node.js instalado: $(node --version)"

# Passo 3: Instalar pnpm
echo ""
echo "📦 Passo 3: Instalando pnpm..."
npm install -g pnpm
log_info "pnpm instalado: $(pnpm --version)"

# Passo 4: Instalar Git
echo ""
echo "📦 Passo 4: Instalando Git..."
sudo apt install -y git
log_info "Git instalado: $(git --version)"

# Passo 5: Instalar PM2
echo ""
echo "📦 Passo 5: Instalando PM2..."
sudo npm install -g pm2
log_info "PM2 instalado: $(pm2 --version)"

# Passo 6: Instalar Nginx
echo ""
echo "📦 Passo 6: Instalando Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
log_info "Nginx instalado e ativado"

# Passo 7: Instalar Certbot
echo ""
echo "📦 Passo 7: Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx
log_info "Certbot instalado"

# Passo 8: Clonar Repositório
echo ""
echo "📦 Passo 8: Clonando repositório..."
cd /home/$(whoami)
if [ ! -d "BussinesHub" ]; then
    git clone https://github.com/BrayanFerreiraDacruz/BussinesHub.git
    log_info "Repositório clonado"
else
    log_warn "Repositório já existe"
fi

# Passo 9: Instalar Dependências
echo ""
echo "📦 Passo 9: Instalando dependências..."
cd BussinesHub
pnpm install
log_info "Dependências instaladas"

# Passo 10: Build
echo ""
echo "📦 Passo 10: Fazendo build..."
pnpm build
log_info "Build concluído"

# Passo 11: Criar arquivo .env
echo ""
echo "📝 Passo 11: Criando arquivo .env..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
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
EOF
    log_info "Arquivo .env criado"
    log_warn "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais reais!"
else
    log_warn "Arquivo .env já existe"
fi

# Passo 12: Executar Migrations
echo ""
echo "📦 Passo 12: Executando migrations..."
pnpm drizzle-kit migrate || log_warn "Migrations podem exigir credenciais de banco de dados"

# Passo 13: Iniciar com PM2
echo ""
echo "📦 Passo 13: Iniciando aplicação com PM2..."
pm2 start "pnpm start" --name "businesshub"
pm2 save
pm2 startup
log_info "Aplicação iniciada com PM2"

# Passo 14: Configurar Nginx
echo ""
echo "📦 Passo 14: Configurando Nginx..."
sudo tee /etc/nginx/sites-available/businesshub > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
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
EOF

sudo ln -sf /etc/nginx/sites-available/businesshub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
log_info "Nginx configurado"

# Resumo
echo ""
echo "================================"
echo "✅ Setup Concluído com Sucesso!"
echo "================================"
echo ""
echo "📋 Próximos Passos:"
echo ""
echo "1️⃣  Edite o arquivo .env com suas credenciais:"
echo "   nano /home/$(whoami)/BussinesHub/.env"
echo ""
echo "2️⃣  Configure seu domínio:"
echo "   - Aponte o DNS para este servidor"
echo "   - Ou use o subdomínio do Hostinger"
echo ""
echo "3️⃣  Gere certificado SSL:"
echo "   sudo certbot certonly --nginx -d seu-dominio.com.br"
echo ""
echo "4️⃣  Atualize o Nginx com SSL:"
echo "   sudo nano /etc/nginx/sites-available/businesshub"
echo ""
echo "5️⃣  Configure o webhook Abacatepay:"
echo "   https://seu-dominio.com.br/api/webhooks/abacatepay"
echo ""
echo "6️⃣  Teste a aplicação:"
echo "   https://seu-dominio.com.br"
echo ""
echo "📊 Monitorar aplicação:"
echo "   pm2 logs businesshub"
echo ""
echo "🔄 Reiniciar aplicação:"
echo "   pm2 restart businesshub"
echo ""
echo "================================"
