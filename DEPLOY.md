# BusinessHub - Guia de Deployment

## Visão Geral

BusinessHub é um SaaS completo para gestão de agendamentos, clientes e relatórios. Este guia descreve como fazer o deploy em um servidor Hostinger ou similar.

## Requisitos

- Node.js 22.x ou superior
- MySQL 8.0 ou superior
- npm ou pnpm
- Domínio próprio (opcional, mas recomendado)
- Certificado SSL (incluído na maioria dos planos Hostinger)

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL=mysql://usuario:senha@localhost:3306/businesshub

# Autenticação OAuth (Manus)
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=sua_chave_secreta_aleatoria_aqui

# Informações do proprietário
OWNER_OPEN_ID=seu_open_id_aqui
OWNER_NAME=Seu Nome

# APIs Manus (para notificações e storage)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend_aqui

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id_aqui

# Ambiente
NODE_ENV=production
```

## Passo a Passo de Deployment

### 1. Preparar o Servidor

Acesse o painel de controle do Hostinger e:

1. Crie um novo banco de dados MySQL
2. Crie um usuário MySQL com permissões completas no banco
3. Ative Node.js no seu plano (se necessário)
4. Configure o domínio para apontar para seu servidor

### 2. Clonar e Configurar o Projeto

```bash
# Conectar via SSH ao servidor
ssh usuario@seu_dominio.com

# Navegar para o diretório de aplicações
cd ~/public_html  # ou o diretório configurado

# Clonar o repositório (ou fazer upload dos arquivos)
git clone seu_repositorio_aqui businesshub
cd businesshub

# Instalar dependências
pnpm install

# Criar arquivo .env com as variáveis acima
nano .env
```

### 3. Configurar o Banco de Dados

```bash
# Executar migrations
pnpm run db:push

# Ou manualmente, conectar ao MySQL e executar o SQL
mysql -u usuario -p businesshub < drizzle/migrations.sql
```

### 4. Build da Aplicação

```bash
# Compilar para produção
pnpm run build

# Isso gera a pasta dist/ com os arquivos otimizados
```

### 5. Iniciar a Aplicação

#### Opção A: Usando PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar a aplicação
pm2 start dist/index.js --name "businesshub"

# Salvar configuração para reiniciar automaticamente
pm2 startup
pm2 save
```

#### Opção B: Usando Node Direto

```bash
# Iniciar em background
nohup node dist/index.js > app.log 2>&1 &
```

### 6. Configurar Reverse Proxy (Nginx)

Se usando Nginx, crie um arquivo de configuração:

```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu_dominio.com;

    # Certificados SSL (Hostinger fornece automaticamente)
    ssl_certificate /etc/ssl/certs/seu_dominio.com.crt;
    ssl_certificate_key /etc/ssl/private/seu_dominio.com.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy para a aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Configurar SSL/TLS

O Hostinger geralmente fornece certificados SSL automaticamente. Se não:

```bash
# Usando Let's Encrypt (se disponível)
sudo certbot certonly --standalone -d seu_dominio.com
```

### 8. Monitoramento e Logs

```bash
# Ver logs da aplicação
pm2 logs businesshub

# Ver status
pm2 status

# Reiniciar se necessário
pm2 restart businesshub
```

## Troubleshooting

### Erro de Conexão com Banco de Dados

- Verificar se o MySQL está rodando: `mysql -u usuario -p`
- Verificar variável `DATABASE_URL` no `.env`
- Confirmar que o banco e usuário foram criados

### Aplicação não inicia

- Verificar logs: `pm2 logs businesshub`
- Verificar se todas as variáveis de ambiente estão definidas
- Tentar rodar localmente: `npm run dev`

### Porta 3000 já em uso

```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar o processo
kill -9 PID
```

### Problemas com SSL

- Verificar certificado: `openssl s_client -connect seu_dominio.com:443`
- Renovar certificado Let's Encrypt: `certbot renew`

## Backup e Manutenção

### Backup do Banco de Dados

```bash
# Fazer backup
mysqldump -u usuario -p businesshub > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u usuario -p businesshub < backup_20240101.sql
```

### Atualizações

```bash
# Parar a aplicação
pm2 stop businesshub

# Atualizar código
git pull origin main

# Instalar dependências
pnpm install

# Executar migrations se houver
pnpm run db:push

# Build
pnpm run build

# Reiniciar
pm2 restart businesshub
```

## Performance e Otimizações

1. **Habilitar Gzip**: Adicionar ao Nginx
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

2. **Cache HTTP**: Configurar headers de cache no Nginx
3. **CDN**: Considerar usar CDN para arquivos estáticos
4. **Database**: Criar índices nas colunas frequentemente consultadas

## Suporte e Contato

Para problemas ou dúvidas:
- Documentação: [seu_dominio.com/docs](seu_dominio.com/docs)
- Email: suporte@seu_dominio.com
- GitHub Issues: [seu_repositorio/issues](seu_repositorio/issues)

---

**Última atualização**: 2026-04-11
**Versão**: 1.0.0
