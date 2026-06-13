---
trigger: model_decision
description: Regras de segurança frontend: XSS, variáveis públicas, rotas protegidas, tokens, dados sensíveis e chamadas de API.
globs: frontend/**
---

# Frontend Security

Use junto com `security-core.md`. O frontend melhora a UX, mas autorização final é do backend.

## XSS

- Não use HTML dinâmico sem sanitização com biblioteca confiável.
- React/Vue/Angular escapam texto por padrão; preserve esse padrão.
- Valide URLs dinâmicas antes de usar em `href`, `src` ou redirecionamento.
- Nunca monte handlers ou scripts a partir de entrada do usuário.

## Variáveis e Secrets

- Variáveis com prefixo público (`NEXT_PUBLIC_`, `VITE_`, equivalentes) são visíveis ao usuário.
- Nunca exponha secrets, tokens privados, service account ou chave de backend no bundle.
- Documente variáveis públicas como configuração, não como segredo.

## Autenticação e Rotas

- Proteção de rota no cliente é apenas UX.
- Route handlers/BFF/server actions devem validar sessão e autorização.
- Ao fazer logout, limpe cache remoto e estado sensível.

## Dados Sensíveis

- Evite persistir PII em localStorage/sessionStorage.
- Mascare dados quando o valor completo não for necessário.
- Não logue payloads sensíveis no console.

## Módulos Relacionados

- `security-core.md`: baseline transversal.
- `frontend-core.md`: organização e dados.
- `frontend-forms.md`: validação.
