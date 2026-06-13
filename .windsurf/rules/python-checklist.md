---
trigger: always_on
description: Checklist pré-commit para projetos Python: lint, formatação, type check, testes, cobertura, segurança e revisão de código.
globs: **/*.py
---

# Checklist Pré-Commit - Python

Use este checklist antes de considerar uma tarefa finalizada ou abrir um pull request.

## 1. Código e Estilo

- [ ] O código segue a PEP 8 e as regras do projeto
- [ ] Nomes de variáveis, funções, classes e módulos seguem as convenções definidas em `python-core.md`
- [ ] Funções e métodos são pequenos e têm responsabilidade única
- [ ] Type hints estão presentes em funções e métodos públicos
- [ ] Imports estão organizados e sem referências circulares
- [ ] Não há código morto, comentários óbvios ou prints de debug

## 2. Formatação e Lint

- [ ] `ruff check .` passa sem erros
- [ ] `ruff format .` foi executado (ou `black .` quando configurado)
- [ ] `ruff check --select I .` confirma imports ordenados
- [ ] Linhas respeitam o limite de 88 ou 100 caracteres definido no projeto

```bash
ruff check .
ruff format .
ruff check --select I .
```

## 3. Type Check

- [ ] `mypy` ou `pyright` passa sem erros críticos
- [ ] Não há `Any` desnecessário ou `# type: ignore` sem justificativa
- [ ] Tipos de retorno estão explícitos em endpoints e funções de negócio

```bash
mypy src/meuprojeto
# ou
pyright src/meuprojeto
```

## 4. Testes

- [ ] `pytest` passa localmente
- [ ] Novos comportamentos têm testes unitários ou de integração
- [ ] Testes cobrem casos de sucesso e falha
- [ ] Fixtures e factories estão atualizadas se o schema mudou
- [ ] Mocks são apropriados e não mascaram regressões

```bash
pytest
```

## 5. Cobertura

- [ ] `pytest --cov` atinge o threshold mínimo do projeto (geralmente 80%)
- [ ] Código de negócio novo possui cobertura relevante
- [ ] Foram inspecionados trechos sem cobertura via relatório HTML

```bash
pytest --cov=src/meuprojeto --cov-report=term-missing --cov-report=html
```

## 6. API e Schemas

- [ ] Rotas seguem o padrão REST (recursos no plural, métodos HTTP corretos)
- [ ] Status HTTP estão corretos (201 para criação, 204 para delete, etc.)
- [ ] Schemas Pydantic separam entrada e saída
- [ ] Não há exposição de dados sensíveis em respostas (senhas, tokens)
- [ ] OpenAPI/Swagger reflete corretamente os endpoints
- [ ] Dependências são injetadas e não acessam banco diretamente nos routers

## 7. Banco de Dados e Migrations

- [ ] Models e migrations estão alinhados
- [ ] Não editei migrations já aplicadas em produção
- [ ] Criei uma nova migration quando o schema mudou
- [ ] Índices e constraints foram considerados
- [ ] Queries evitam N+1 (quando aplicável)

```bash
alembic revision --autogenerate -m "descricao da mudanca"
alembic upgrade head
```

## 8. Segurança

- [ ] Senhas e tokens nunca são logados ou retornados em respostas
- [ ] Variáveis sensíveis estão em `.env`, não no código
- [ ] Rotas protegidas usam autenticação/autorização
- [ ] Inputs são validados (Pydantic, Django forms/serializers)
- [ ] Não há SQL injection, XSS ou execução dinâmica insegura
- [ ] Dependências foram verificadas por vulnerabilidades conhecidas

```bash
pip-audit
# ou
safety check
```

## 9. Variáveis de Ambiente

- [ ] `.env.example` foi atualizado se novas variáveis foram adicionadas
- [ ] Valores padrão não são usados para segredos em produção
- [ ] Configurações são carregadas via `pydantic-settings` ou equivalente

## 10. Logs e Observabilidade

- [ ] `print()` foi substituído por `logging` ou `structlog`
- [ ] Logs não contêm dados sensíveis
- [ ] Exceções são logadas com contexto suficiente
- [ ] Métricas/tracing foram considerados para operações críticas

## 11. Documentação

- [ ] `README.md` foi atualizado se o setup mudou
- [ ] Docstrings descrevem funções e classes públicas
- [ ] Decisões arquiteturais relevantes foram registradas em `docs/adr/`
- [ ] Breaking changes foram documentadas

## 12. Commits e Git

- [ ] Commits são atômicos e descrevem uma mudança lógica
- [ ] Mensagens de commit seguem o padrão conventional commits
- [ ] Não há arquivos não relacionados no stage
- [ ] `.env`, arquivos de cache e artefatos de build estão no `.gitignore`

## 13. Revisão Final

- [ ] Execute o checklist localmente e corrija problemas antes de abrir PR
- [ ] Verifique o diff final para garantir que apenas mudanças necessárias foram incluídas
- [ ] Solicite revisão de código quando a mudança envolver lógica crítica

## Comandos Consolidados

```bash
# Lint e formatação
ruff check .
ruff format .
ruff check --select I .

# Type check
mypy src/meuprojeto

# Testes e cobertura
pytest --cov=src/meuprojeto --cov-report=term-missing

# Segurança de dependências
pip-audit

# Migrations (SQLAlchemy)
alembic upgrade head
```

## Módulos Relacionados

- **python-core.md**: Stack, estrutura, nomenclatura e padrões gerais do Python
- **python-api.md**: Regras para desenvolvimento de APIs com FastAPI, DRF e Flask
- **python-testing.md**: pytest, fixtures, factories, mocks e cobertura
