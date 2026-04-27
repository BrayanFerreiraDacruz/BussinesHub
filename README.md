# 🍐 Pêra SaaS - Gestão Inteligente de Agendamentos

O **Pêra** é um SaaS (Software as a Service) ultra-premium focado na gestão de agendamentos, clientes e financeiro para profissionais liberais (salões, clínicas, consultórios, etc.). Com visual Neo-Brutalista e experiência focada no mobile, ele transforma a gestão de negócios em algo simples, moderno e lucrativo.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Framer Motion.
- **Backend:** Node.js + Express + tRPC.
- **Banco de Dados:** MySQL (via Drizzle ORM).
- **Inteligência Artificial:** Google Gemini 1.5 Flash (via API).
- **Integrações:** WhatsApp (Baileys) e Pagamentos (Abacatepay).
- **Segurança:** JWT (JSON Web Token) + Bcrypt para senhas.

---

## 🛠️ Configuração Local

Para rodar o Pêra no seu computador:

1.  **Instale as dependências:**
    ```bash
    pnpm install
    ```
2.  **Configure o Banco de Dados:**
    - Tenha um MySQL rodando (XAMPP/Wamp).
    - Crie um banco chamado `businesshub`.
    - Execute `pnpm drizzle-kit push` para criar as tabelas.
3.  **Variáveis de Ambiente:**
    - Crie um arquivo `.env` baseado no `.env.example`.
4.  **Inicie o desenvolvimento:**
    ```bash
    pnpm dev
    ```

---

## 📦 Deploy na Hostinger (Método Infalível)

Devido às restrições de build da Hostinger, o método recomendado é gerar o pacote pronto no seu PC e subir manualmente.

### 1. No seu PC:
Gere o arquivo de deploy rodando o script de build:
```bash
pnpm build
```
O projeto já possui um script que gera o arquivo **`VITORIA_RESPONSIVA_V4.zip`** na raiz.

### 2. Na Hostinger (Gerenciador de Arquivos):
1.  Limpe a pasta `public_html`.
2.  Suba o arquivo `.zip` e extraia-o na raiz.
3.  Certifique-se de que os arquivos `index.js`, `package.json` e a pasta `public` estão soltos na raiz.

### 3. Painel Node.js da Hostinger:
- **Arquivo de Entrada:** `index.js`
- **Gerente de Pacotes:** `npm` (ou `None` se preferir não instalar nada lá).
- **Comando de Compilação:** Deixar Vazio.
- **Variáveis de Ambiente:** Configure conforme o item abaixo.

### 4. Banco de Dados (phpMyAdmin):
Cole este SQL para criar as tabelas iniciais:
```sql
CREATE TABLE `users` (`id` int AUTO_INCREMENT NOT NULL, `openId` varchar(64) UNIQUE, `name` text, `email` varchar(320) NOT NULL UNIQUE, `password` text, `phone` varchar(20), `businessName` text, `businessType` enum('salon','clinic','consulting','other') DEFAULT 'salon', `loginMethod` varchar(64), `role` enum('user','admin') NOT NULL DEFAULT 'user', `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, `lastSignedIn` timestamp NOT NULL DEFAULT (now()), CONSTRAINT `users_id` PRIMARY KEY(`id`));
CREATE TABLE `clients` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `name` text NOT NULL, `email` varchar(320), `phone` varchar(20), `address` text, `city` text, `notes` text, `lastVisit` timestamp, `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `clients_id` PRIMARY KEY(`id`));
CREATE TABLE `services` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `name` text NOT NULL, `description` text, `price` decimal(10,2) NOT NULL, `duration` int NOT NULL, `isActive` boolean NOT NULL DEFAULT true, `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `services_id` PRIMARY KEY(`id`));
CREATE TABLE `appointments` (`id` int AUTO_INCREMENT NOT NULL, `userId` int NOT NULL, `clientId` int NOT NULL, `serviceId` int NOT NULL, `startTime` datetime NOT NULL, `endTime` datetime NOT NULL, `status` enum('scheduled','completed','cancelled','no-show') NOT NULL DEFAULT 'scheduled', `price` decimal(10,2) NOT NULL, `notes` text, `createdAt` timestamp NOT NULL DEFAULT (now()), `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT `appointments_id` PRIMARY KEY(`id`));
```

---

## 🔑 Variáveis de Ambiente (.env)

| Variável | Descrição | Exemplo / Valor |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave secreta para tokens | Uma string aleatória e longa |
| `FORGE_API_KEY` | Chave do Google Gemini | Pegar no Google AI Studio |
| `NODE_ENV` | Modo do Node | `production` |
| `PORT` | Porta do servidor | `3000` |

---

## 🍐 Identidade Visual e Rebranding

O Pêra utiliza uma paleta de cores Creme (`#F8F7E5`) e Verde Pêra (`oklch(0.65 0.22 145)`). O design é baseado no Neo-Brutalismo, com bordas grossas pretas, sombras sólidas e tipografia impactante.

---

**Desenvolvido com ❤️ por Gemini CLI para o Brayan.**
