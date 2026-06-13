---
trigger: model_decision
description: Regras de segurança backend: autenticação, autorização, multi-tenant, tokens, rate limiting, webhooks, arquivos e dados sensíveis.
globs: backend/**
---

# Backend Security

Use junto com `security-core.md`. Este arquivo detalha controles específicos de backend.

## Autenticação e Sessão

- Valide tokens/sessões em toda rota protegida.
- JWT deve validar assinatura, expiração, issuer e audience quando aplicável.
- Access tokens devem ter expiração curta; refresh tokens devem ter rotação ou revogação.
- Logout deve invalidar sessão/token quando o modelo de autenticação permitir.
- Senhas devem usar Argon2id, bcrypt ou scrypt com parâmetros atuais.

## Autorização e Tenant

- Negue por padrão.
- Não confie em rota oculta, botão escondido ou validação de cliente.
- Todo acesso por ID deve validar posse, tenant, organização ou escopo.
- Em multi-tenant, queries devem filtrar pelo tenant no repositório/consulta, não só no service.
- Retorne `404` para recurso fora do escopo quando isso reduzir enumeração.

## Rate Limiting e Abuso

- Aplique limite em login, reset de senha, cadastro, webhooks públicos, download e endpoints caros.
- Use chave adequada: IP, usuário, tenant, token, email ou combinação.
- Retorne `429` com `Retry-After` quando possível.

## Webhooks

- Verifique assinatura ou token compartilhado em todo webhook.
- Rejeite payload fora de janela temporal quando houver timestamp assinado.
- Use idempotência por event id.
- Registre evento recebido, status de processamento e erro seguro.

## Uploads e Arquivos

- Valide tamanho, extensão e MIME real.
- Normalize paths e garanta que o arquivo resolvido fica dentro do diretório permitido.
- Não sirva arquivo privado sem checar autorização.
- Evite persistir URLs assinadas expiráveis como se fossem recurso permanente.

## Módulos Relacionados

- `security-core.md`: baseline transversal.
- `security-analysis.md`: auditoria profunda.
- `backend-api.md`: contratos e erros.
- `backend-data.md`: queries e isolamento por dados.
