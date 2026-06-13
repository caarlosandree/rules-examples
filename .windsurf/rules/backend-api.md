---
trigger: model_decision
description: Regras para APIs backend: versionamento, DTOs, status HTTP, paginação, erros, idempotência e documentação.
globs: backend/**
---

# Backend API

## Contratos HTTP

- Versione APIs públicas (`/api/v1`) ou documente explicitamente a estratégia de evolução.
- Use métodos HTTP semânticos: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Retorne status adequados: `201` para criação, `204` para deleção sem corpo, `400` para contrato inválido, `401` não autenticado, `403` sem permissão.
- Para recursos inexistentes ou fora do tenant, prefira `404` quando isso evitar enumeração.
- Padronize envelope de erro com código estável, mensagem segura e detalhes de validação.

## DTOs e Validação

- Requests devem usar DTO/schema com validação de tipo, tamanho, formato e enum.
- Responses devem expor apenas campos necessários.
- Não aceite campos controlados pelo servidor (`id`, `tenantId`, `role`, `createdAt`, `status` sensível) em DTOs de entrada.
- Para updates parciais, diferencie campo ausente de campo enviado como `null`.

## Paginação e Filtros

- Listagens potencialmente grandes devem ser paginadas no banco.
- Defina limite máximo de `pageSize`/`limit`.
- Use cursor pagination para datasets grandes ou ordenações instáveis.
- Valide campos de ordenação por allow-list.

## Idempotência

- Endpoints de cobrança, criação externa, webhook e operações reprocessáveis devem aceitar idempotency key ou ter chave natural única.
- Reprocessamento deve retornar o resultado já criado ou falhar com erro de negócio claro.

## Documentação

- Atualize OpenAPI/Swagger quando endpoints, campos, erros ou autenticação mudarem.
- Documente exemplos reais, mas sem secrets, tokens ou dados pessoais.

## Módulos Relacionados

- `backend-core.md`: organização e transações.
- `backend-security.md`: autorização e proteção contra abuso.
- `security-core.md`: validação de entrada e exposição segura.
