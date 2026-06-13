---
trigger: model_decision
description: Regras fundamentais para backends: camadas, contratos, configuração, transações, jobs, integrações e restrições operacionais.
globs: backend/**
---

# Backend Core

Use estas regras em projetos backend independentemente da linguagem. Combine com a regra da stack
(`java-*`, `go-*`, `nestjs-*`, `python-*`) e com a regra de banco aplicável.

## Princípios

- Separe entrada HTTP, aplicação, domínio, persistência e integrações externas.
- Controllers/handlers devem ser finos: validar contrato, chamar caso de uso/service e devolver DTO.
- Não exponha entidades de ORM/modelos de banco em request ou response.
- Use DTOs/schemas diferentes para criação, atualização e resposta.
- Aplique regras de negócio no backend, nunca apenas na UI.
- Leia configuração de ambiente validada na inicialização; falhe cedo se variável obrigatória faltar.

## Organização

- Agrupe por feature/domínio quando o projeto crescer.
- Mantenha código compartilhado em módulos explícitos (`shared`, `common`, `infra`, `platform`) sem dependência circular.
- Integrações externas devem ter cliente próprio, timeout, retry controlado e tratamento de erro.
- Jobs e consumers devem ser idempotentes quando processarem eventos, filas ou webhooks.

## Transações

- Abra transações na camada de aplicação/service, não no controller.
- Use transações somente pelo tempo necessário.
- Não faça chamadas HTTP, envio de email, publicação em fila ou I/O externo dentro da transação.
- Em operações financeiras, estoque, agenda ou assinatura, proteja contra concorrência com lock, constraint ou idempotency key.

## Configuração e Ambientes

- Nunca use secrets hardcoded.
- Versione `.env.example`, nunca `.env` real.
- Diferencie configuração de build e de runtime.
- Documente novas variáveis obrigatórias no README/AGENTS do projeto destino.

## Módulos Relacionados

- `backend-api.md`: contratos HTTP, paginação, erros e OpenAPI.
- `backend-data.md`: repositories, ORM, queries e migrations.
- `backend-security.md`: autenticação, autorização, tenant, tokens e hardening.
- `backend-observability.md`: logs, métricas, tracing e diagnóstico.
- `security-core.md`: baseline de segurança transversal.
