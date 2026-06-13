---
trigger: model_decision
description: Regras para formulários frontend: schemas, validação, erros, submit, acessibilidade e integração com API.
globs: frontend/**
---

# Frontend Forms

## Contrato

- Defina schema de validação para entrada do usuário.
- Reuse tipos derivados do schema quando a stack permitir.
- Valide no cliente para UX e no servidor para segurança.
- Não envie campos que o backend deve controlar.

## UX

- Mostre erro perto do campo.
- Preserve dados preenchidos quando submit falhar.
- Desabilite submit ou torne idempotente durante envio.
- Indique loading em ações assíncronas.
- Use labels reais, mensagens claras e foco no primeiro erro quando apropriado.

## Integração

- Normalize payload antes de enviar.
- Trate erros de validação do backend campo a campo.
- Evite mascarar erro de autorização como validação.

## Módulos Relacionados

- `frontend-core.md`: organização.
- `frontend-security.md`: dados sensíveis e validação.
- `security-core.md`: validação de entrada.
