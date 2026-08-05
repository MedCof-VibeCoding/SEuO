# Integração Microsoft Clarity

O projeto está preparado para:

1. instalar o tracking oficial do Clarity no navegador;
2. consultar métricas agregadas pela Data Export API no servidor.

## Configuração

No Microsoft Clarity:

1. abra o projeto;
2. copie o Project ID em **Settings → Setup**;
3. gere um token em **Settings → Data Export → Generate new API token**.

Adicione ao `.env`:

```env
NEXT_PUBLIC_CLARITY_PROJECT_ID="project-id"
CLARITY_API_TOKEN="token-secreto"
CLARITY_ALLOWED_EMAILS="usuario@empresa.com.br"
```

Reinicie o servidor depois de alterar o `.env`.

O Project ID é público porque faz parte do script de tracking. O token de exportação é secreto e
nunca deve usar o prefixo `NEXT_PUBLIC_`.

## Data Export API

Endpoint interno:

```text
GET /api/seo/clarity/insights?numOfDays=1&dimension=URL
```

Dashboard normalizado usado na análise comparativa:

```text
GET /api/seo/clarity/dashboard
```

Esse endpoint consolida as últimas 72 horas em:

- sessões, usuários e páginas por sessão;
- erros JavaScript, cliques com erro e sinais de frustração;
- dispositivos, navegadores, sistemas operacionais e países;
- páginas mais acessadas.

O Clarity não exporta tempos de carregamento ou Core Web Vitals. O dashboard não estima essas
métricas.

Requisitos:

- sessão NextAuth válida;
- e-mail presente em `CLARITY_ALLOWED_EMAILS`;
- `numOfDays` entre 1 e 3;
- no máximo três parâmetros `dimension`.

Dimensões permitidas:

```text
Browser, Device, Country/Region, OS, Source, Medium, Campaign, Channel, URL
```

Exemplo com mais dimensões:

```text
/api/seo/clarity/insights?numOfDays=3&dimension=URL&dimension=Device
```

O retorno inclui `source`, timezone UTC, parâmetros usados, horário da consulta e `metrics`.

## Limites e segurança

- A Microsoft limita a Data Export API a 10 chamadas por projeto por dia.
- A API entrega métricas agregadas; não fornece gravações individuais.
- O endpoint exige autenticação e lista explícita de e-mails autorizados.
- Não registre o token nem o conteúdo do header `Authorization`.
- Em produção, configure o token no gerenciador de secrets da hospedagem.

Documentação oficial:
[Clarity Data Export API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api).
