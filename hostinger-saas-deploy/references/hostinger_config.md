# Configurações Técnicas Hostinger

## Banco de Dados MySQL
Na Hostinger VPS ou Hospedagem Cloud:
- **Host**: Geralmente `localhost` ou `127.0.0.1`.
- **Porta**: `3306`.
- **DATABASE_URL**: `mysql://user:password@localhost:3306/db_name`.

## Node.js Selector (hPanel)
Se estiver usando o instalador automático:
1. Carregue os arquivos.
2. Vá em **Node.js** no painel.
3. Clique em **Instalar dependências**.
4. Configure a variável `PORT` se necessário, mas o sistema costuma injetar uma automaticamente.

## PM2 (VPS)
Recomendado para manter o processo vivo:
```bash
pm2 start dist/index.js --name businesshub --max-memory-restart 500M
```

## Logs
Verifique sempre os logs para erros de permissão:
- Local: `~/.pm2/logs/`
- Hostinger hPanel: Aba **Logs** no seletor de Node.js.
