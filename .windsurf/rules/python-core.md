---
trigger: always_on
description: Regras fundamentais de desenvolvimento Python: stack, princípios, estrutura de pastas, nomenclatura, formatação, type hints, padrões Python e variáveis de ambiente.
globs: **/*.py
---

# Regras de Desenvolvimento - Python Core

## Stack Tecnológica

Este projeto utiliza:
- **Python 3.12+** como linguagem de programação
- **FastAPI** como framework principal para APIs (preferencial)
- **Django** ou **Flask** quando o domínio exigir aplicação full-stack ou stack legado
- **Pydantic v2** para validação de dados, serialização e configurações
- **SQLAlchemy 2.0** para acesso ao banco de dados relacional (quando não usar Django ORM)
- **Django ORM** quando o framework Django for escolhido
- **Alembic** para migrations de schema (com SQLAlchemy)
- **Django Migrations** quando usar Django
- **PostgreSQL** como banco de dados relacional
- **Uvicorn** como servidor ASGI para FastAPI
- **Gunicorn** como process manager em produção
- **Ruff** para lint e formatação unificada
- **Black** como formatador alternativo (quando Ruff não cobrir todo o projeto)
- **Mypy** ou **Pyright** para verificação estática de tipos
- **pytest** para testes unitários, integração e end-to-end
- **pydantic-settings** para carregar e validar variáveis de ambiente
- **structlog** ou **logging** padrão para logs estruturados

O pacote base do projeto é `src/meuprojeto`. A estrutura adota **Package by Feature** com módulos em `src/meuprojeto/modules/*`.

## Princípios Gerais

### Código Limpo e Legível
- Sempre escreva código que seja fácil de entender para você e outros desenvolvedores
- Priorize clareza sobre concisão quando necessário
- Use nomes descritivos que expliquem o propósito do código
- Siga os princípios SOLID e o Zen do Python (`import this`)

### Consistência
- Mantenha estilo de codificação consistente em todo o projeto
- Siga os padrões estabelecidos no projeto e na comunidade Python
- Use as mesmas convenções de nomenclatura em arquivos relacionados
- Siga a **PEP 8** como base de estilo

### Programação para Manutenção
- Escreva código pensando em quem vai mantê-lo no futuro
- Documente decisões complexas ou não óbvias
- Facilite a localização e correção de bugs
- Mantenha funções pequenas e com responsabilidade única

## Organização e Estrutura

### Estrutura de Pastas

```
meuprojeto/
├── pyproject.toml
├── .env
├── .env.example
├── README.md
├── src/
│   └── meuprojeto/
│       ├── __init__.py
│       ├── main.py                 # Ponto de entrada FastAPI/Django/Flask
│       ├── config.py               # Configurações via pydantic-settings
│       ├── logging_config.py       # Configuração de logs
│       ├── shared/                 # Domínio-agnóstico: exceptions, security, utils, pagination
│       └── modules/                # Package by Feature
│           ├── auth/
│           │   ├── __init__.py
│           │   ├── router.py
│           │   ├── schemas.py
│           │   ├── service.py
│           │   ├── repository.py
│           │   └── models.py
│           ├── users/
│           ├── orders/
│           └── products/
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── alembic/                        # Quando usar SQLAlchemy
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
└── docs/                           # ADRs, guias e documentação técnica
```

### Organização do Código: Package by Feature

**Benefícios do Package by Feature:**
- **Coesão**: Classes, schemas, serviços e repositórios relacionados ficam juntos
- **Modularização**: Facilita extração futura para microsserviços ou pacotes internos
- **Escalabilidade**: Projetos grandes não viram “gavetas de bagunça”
- **Manutenibilidade**: Desenvolvedores encontram código relacionado mais rapidamente

**Nota**: A estrutura “Package by Layer” (`routers/`, `services/`, `models/`) ainda é válida para projetos pequenos, mas para sistemas complexos, Package by Feature é recomendado.

### Nomenclatura

#### Arquivos e Pacotes
- Pacotes e módulos: **lowercase**, palavras separadas por underscore quando necessário (ex: `meuprojeto.modules.user_service`)
- Classes: **PascalCase** (ex: `UserService`, `OrderRepository`)
- Testes: prefixo `test_` e sufixo `_test` (ex: `test_user_service.py`)

#### Variáveis e Funções
- Variáveis e funções: **snake_case** (ex: `user_name`, `get_user_data()`)
- Constantes: **UPPER_SNAKE_CASE** (ex: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- Classes: **PascalCase** (ex: `User`, `UserCreateSchema`)
- Atributos/métodos privados: prefixo com underscore (ex: `_calculate_discount()`)
- Mágicos/dunder: mantenha os já definidos pela linguagem (ex: `__init__`, `__repr__`)

#### Nomes Descritivos
- ✅ **Bom**: `get_user_by_id()`, `calculate_total_price()`, `is_user_authenticated()`
- ❌ **Ruim**: `get()`, `calc()`, `flag()`, `x`, `data`, `temp`

### Organização do Código

#### Estrutura de Services (Lógica de Negócio)

```python
from __future__ import annotations

from meuprojeto.modules.users.repository import UserRepository
from meuprojeto.modules.users.schemas import UserResponse


class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    async def list_active_users(self) -> list[UserResponse]:
        users = await self._repository.find_active()
        return [UserResponse.model_validate(user) for user in users]
```

#### Funções e Métodos
- Mantenha funções pequenas e com responsabilidade única
- Máximo de ~50 linhas por função quando possível
- Se uma função faz mais de uma coisa, divida-a
- Use funções auxiliares para lógica complexa
- Trate exceções explicitamente (não ignore exceções com `pass` vazio)

```python
# ❌ Ruim: função faz muitas coisas
def process_order(raw_data: dict[str, str]) -> None:
    # valida, salva, envia e-mail, notifica, gera fatura...
    ...

# ✅ Bom: funções pequenas e especializadas
async def create_order(data: OrderCreate, service: OrderService) -> OrderResponse:
    order = await service.create(data)
    await event_bus.publish(OrderCreated(order_id=order.id))
    return order
```

## Indentação e Formatação

- Use **4 espaços** para indentação (nunca tabs)
- Configure Ruff como linter e formatador padrão
- Limite de linha: **88 caracteres** quando usar Black; **100 caracteres** quando a equipe optar por Ruff com `line-length = 100`
- Use aspas duplas para strings consistentemente
- Mantenha imports ordenados (Ruff organiza automaticamente)

```toml
# ✅ Bom: pyproject.toml
[tool.ruff]
target-version = "py312"
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP", "B", "C4", "SIM"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

## Type Hints

- Use type hints em todas as funções e métodos públicos
- Adicione `from __future__ import annotations` no topo dos módulos para usar sintaxe moderna
- Evite `Any`; prefira tipos específicos ou genéricos
- Use `| None` em vez de `Optional[T]`
- Use `Sequence[T]` para leitura e `list[T]` para mutação
- Use `Mapping[str, int]` para dicionários de leitura
- Configure Mypy/Pyright em modo estrito quando o projeto permitir

```python
from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from meuprojeto.modules.users.models import User


def find_admins(users: Sequence[User]) -> list[User]:
    return [user for user in users if user.is_admin]


def get_user_name(user: User | None) -> str | None:
    if user is None:
        return None
    return user.full_name
```

## Comentários

### Comentários no Código
- Comente apenas o **porquê**, não o **o quê**
- Comente lógica complexa ou não óbvia
- Evite comentários redundantes
- Use docstrings para módulos, classes e funções públicas

```python
# ✅ Bom: Explica o porquê
# O desconto só é aplicado em pedidos acima de R$ 100 para evitar
# uso indevido de cupons em valores muito baixos.
MIN_ORDER_VALUE_FOR_DISCOUNT = 100

# ❌ Ruim: Redundante
# Incrementa o contador em 1
count += 1
```

### Docstrings

```python
def calculate_shipping_cost(distance_km: float, weight_kg: float) -> float:
    """Calcula o custo de envio com base na distância e no peso.

    Args:
        distance_km: Distância em quilômetros.
        weight_kg: Peso do pacote em quilogramas.

    Returns:
        Custo total do envio em reais.

    Raises:
        ValueError: Se a distância ou o peso forem negativos.
    """
    if distance_km < 0 or weight_kg < 0:
        raise ValueError("Distância e peso devem ser não negativos")
    return distance_km * 0.5 + weight_kg * 2.0
```

## Padrões Específicos do Stack

### Python
- Siga as convenções da PEP 8
- Prefira comprehensions claras em vez de loops imperativos
- Use `pathlib` em vez de `os.path`
- Use context managers (`with`) para recursos externos
- Use `dataclasses` ou `Pydantic models` para estruturas de dados
- Evite mutação global de estado
- Use `isinstance` em vez de `type()` para verificação de tipos

```python
# ✅ Bom: pathlib + context manager
from pathlib import Path

config_path = Path(__file__).parent / "config.json"
with config_path.open(encoding="utf-8") as file:
    content = file.read()

# ❌ Ruim: os.path e sem context manager
import os

config_path = os.path.join(os.path.dirname(__file__), "config.json")
file = open(config_path)
content = file.read()
file.close()
```

### FastAPI
- Crie routers por módulo e registre-os na aplicação principal
- Use schemas Pydantic para request e response
- Injete dependências via `Depends`
- Mantenha controllers finos; lógica de negócio fica no service

```python
from fastapi import APIRouter, Depends
from meuprojeto.modules.users.schemas import UserCreate, UserResponse
from meuprojeto.modules.users.service import UserService
from meuprojeto.modules.users.dependencies import get_user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    return await service.create(data)
```

### SQLAlchemy 2.0
- Use estilo declarativo e queries no formato 2.0 (`select()`, `where()`)
- Evite `Query` legado
- Use `AsyncSession` com drivers assíncronos (`asyncpg`)
- Mapeie colunas com `mapped_column()`

```python
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
```

### Django ORM
- Use `models.Model` com tipagem via `django-stubs`
- Prefira `select_related` e `prefetch_related` para evitar N+1
- Use `Manager` customizados para queries reutilizáveis
- Mantenha a lógica de negócio fora dos models quando crescer demais

```python
from django.db import models


class OrderManager(models.Manager):
    def pending(self):
        return self.filter(status=Order.Status.PENDING)


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        PAID = "paid", "Pago"

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = OrderManager()
```

### Alembic
- Use Alembic para gerenciar migrations de schema
- Crie uma migration por alteração lógica
- Revise o arquivo gerado antes de commitar
- Nunca edite uma migration já aplicada em produção

```bash
# ✅ Bom: gerar migration
alembic revision --autogenerate -m "create users table"

# ✅ Bom: aplicar migrations
alembic upgrade head
```

### Pydantic Settings
- Centralize configurações em uma classe `Settings`
- Use `model_config = SettingsConfigDict(env_file=".env")`
- Valide variáveis obrigatórias e tipos

```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = Field(alias="DATABASE_URL")
    secret_key: str = Field(alias="SECRET_KEY")
    debug: bool = Field(default=False, alias="DEBUG")
```

## Variáveis de Ambiente
- Use `pydantic-settings` ou `python-dotenv` para carregar variáveis
- Documente todas as variáveis em `.env.example`
- Valide variáveis obrigatórias na inicialização
- Use tipos apropriados para variáveis (bool, int, float, str)
- Nunca commite arquivos `.env` com valores reais

```bash
# ✅ Bom: .env.example
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/meuprojeto
SECRET_KEY=change-me-in-production
DEBUG=True
PORT=8000
```

## Git e Commits
- Faça commits frequentes e atômicos
- Use mensagens de commit descritivas
- Um commit = uma mudança lógica
- Siga o padrão: `tipo: descrição curta` (ex: `feat: adiciona endpoint de usuários`)

**Nota**: Para padrões detalhados de commits, consulte o arquivo de regras `commit.md`.

## Documentação
- Mantenha o `README.md` atualizado com instruções de setup
- Documente decisões arquiteturais importantes em `docs/adr/`
- Use docstrings em funções e classes públicas
- Documente endpoints da API usando OpenAPI/Swagger (FastAPI gera automaticamente)
- Documente versionamento da API e breaking changes

## Docs Oficiais
- PEP 8 - https://peps.python.org/pep-0008/
- Python 3.12 - https://docs.python.org/3.12/
- FastAPI - https://fastapi.tiangolo.com/
- Django - https://docs.djangoproject.com/
- SQLAlchemy 2.0 - https://docs.sqlalchemy.org/
- Pydantic - https://docs.pydantic.dev/
- pytest - https://docs.pytest.org/
- Ruff - https://docs.astral.sh/ruff/

## Restrições Operacionais

- **Não inicie serviços locais** (`docker compose up`, `docker run`, `brew services start`) sem pedido explícito do usuário.
- **Migrations são imutáveis** após aplicadas em produção — nunca edite `alembic/versions/*.py` ou `**/migrations/*.py` existente. Mudança de schema = nova migration.
- **Não commite arquivos `.env`** com valores reais; use `.env.example` como modelo.
- **Não use `print()`** em código de produção; use logging estruturado.

## Módulos Relacionados

Este arquivo contém as regras fundamentais do Python. Para regras específicas, consulte:

- **python-api.md**: FastAPI, Django REST Framework, rotas, schemas, dependências, tratamento de erros, OpenAPI, status HTTP e autenticação
- **python-testing.md**: pytest, fixtures, factories, mocks, testes de integração e cobertura
- **python-checklist.md**: Checklist consolidado para verificação antes de commit
