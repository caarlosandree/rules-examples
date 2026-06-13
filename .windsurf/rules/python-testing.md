---
trigger: always_on
description: Regras para testes em Python com pytest: fixtures, factories, mocks, testes de integração, cobertura e organização.
globs: **/*.py
---

# Regras de Desenvolvimento - Python Testing

## Stack de Testes

Este projeto utiliza:
- **pytest** como runner principal de testes
- **pytest-asyncio** para testes assíncronos
- **factory-boy** + **Faker** para criação de dados de teste
- **pytest-mock** ou **unittest.mock** para mocks e monkeypatch
- **httpx** e **TestClient** do FastAPI/Flask para testes de API
- **pytest-cov** para medição de cobertura
- **freezegun** para manipulação de data/hora quando necessário
- **SQLAlchemy 2.0** com banco de testes isolado (quando aplicável)

## Organização dos Testes

Estruture os testes espelhando a pasta `src/` ou agrupando por tipo:

```
tests/
├── conftest.py                 # Fixtures globais
├── factories/                  # Factories do factory-boy
│   ├── __init__.py
│   ├── user_factory.py
│   └── order_factory.py
├── unit/                       # Testes unitários rápidos sem I/O
│   ├── modules/
│   │   └── users/
│   │       └── test_service.py
│   └── shared/
│       └── test_validators.py
├── integration/                # Testes com banco, cache, filas, APIs externas
│   ├── test_user_repository.py
│   └── test_order_flow.py
└── e2e/                        # Testes end-to-end pelos endpoints
    └── test_users_api.py
```

### Convenções de Nomenclatura
- Arquivos de teste: `test_<nome>.py`
- Funções de teste: `test_<descricao>`
- Classes de teste: `Test<Descricao>`
- Fixtures: nomes descritivos em snake_case

```python
# ✅ Bom
def test_create_user_with_valid_email():
    ...


class TestUserService:
    def test_activate_user_sets_active_flag(self):
        ...


# ❌ Ruim
def test1():
    ...
```

## Fixtures

Use `conftest.py` para fixtures compartilhadas e `fixtures` locais para casos específicos.

```python
from collections.abc import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from meuprojeto.database import Base
from meuprojeto.main import app
from tests.factories.user_factory import UserFactory


@pytest.fixture(scope="session")
def event_loop():
    import asyncio

    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost:5432/test")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def session(engine) -> AsyncGenerator[AsyncSession, None]:
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
```

### Escopo de Fixtures
- Use `function` (padrão) para estado limpo a cada teste
- Use `session` para recursos caros (conexão com banco, motor de teste)
- Use `module` ou `package` quando vários testes compartilham dados imutáveis

```python
# ✅ Bom: fixture de sessão para conexão com banco
@pytest.fixture(scope="session")
def engine():
    ...


# ✅ Bom: fixture de função para sessão transacional limpa
@pytest.fixture
async def session(engine):
    ...
```

## Factories

Use `factory-boy` para criar modelos de teste de forma declarativa e reutilizável.

```python
import factory
from factory.alchemy import SQLAlchemyModelFactory

from meuprojeto.modules.users.models import User


class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    hashed_password = factory.LazyFunction(lambda: "fake_hash")
    is_active = True
```

### Boas Práticas
- ✅ Configure `Meta.sqlalchemy_session` para associar à sessão de teste
- ✅ Use `factory.Sequence` para campos únicos
- ✅ Use `factory.Faker` para dados realistas
- ✅ Use `factory.SubFactory` para relacionamentos
- ❌ Não crie dados manualmente repetidamente dentro dos testes

```python
# ✅ Bom: criação via factory
def test_user_is_active_by_default(session):
    user = UserFactory()
    assert user.is_active is True


# ❌ Ruim: criação manual repetitiva
def test_user_is_active_by_default(session):
    user = User(
        email="test@example.com",
        full_name="Test User",
        hashed_password="hash",
        is_active=True,
    )
    session.add(user)
    session.commit()
    assert user.is_active is True
```

## Mocks

Use mocks para isolar unidades e simular dependências externas.

```python
from unittest.mock import AsyncMock, patch

import pytest

from meuprojeto.modules.orders.service import OrderService


@pytest.fixture
def service():
    return OrderService(
        repository=AsyncMock(),
        email_client=AsyncMock(),
    )


async def test_create_order_sends_email(service):
    service.repository.create.return_value = {"id": 1, "total": 100}

    await service.create({"items": [{"product_id": 1, "quantity": 2}]})

    service.email_client.send_confirmation.assert_awaited_once()
```

### Boas Práticas
- ✅ Use `AsyncMock` para corrotinas
- ✅ Prefira injetar mocks via construtor em vez de `patch` quando possível
- ✅ Use `patch` para funções/constantes globais e efeitos colaterais
- ❌ Não mock tudo em testes de integração

```python
# ✅ Bom: mock via injeção
async def test_service_calls_repository(service):
    await service.list_orders()
    service.repository.find_all.assert_awaited_once()


# ✅ Bom: patch para funções externas
@patch("meuprojeto.shared.clients.http_client.fetch")
def test_fetch_user_retries_on_failure(mock_fetch):
    mock_fetch.side_effect = [Exception("timeout"), {"id": 1}]
    ...
```

## Testes de Integração

Testes de integração validam a comunicação entre camadas (service + repository + banco, rotas + service).

```python
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from meuprojeto.main import app
from tests.factories.user_factory import UserFactory


@pytest.mark.asyncio
async def test_create_user_endpoint(client: TestClient):
    payload = {"email": "new@example.com", "full_name": "New User", "password": "secret123"}

    response = client.post("/api/v1/users", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert "password" not in data
```

### Boas Práticas
- ✅ Use banco de dados de teste isolado
- ✅ Limpe o estado entre os testes (rollback ou recriação)
- ✅ Use fixtures para configurar o ambiente de integração
- ❌ Não dependa de dados de produção ou ambientes compartilhados

```python
# ✅ Bom: rollback após cada teste
@pytest.fixture
async def session(engine):
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        async with session.begin():
            yield session
```

## Testes Assíncronos

Marque testes assíncronos com `@pytest.mark.asyncio` ou configure o modo automático no `pyproject.toml`.

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

```python
import pytest

from meuprojeto.modules.users.service import UserService


async def test_list_users_returns_all(service):
    users = await service.list_users()
    assert len(users) == 0
```

## Cobertura

Use `pytest-cov` para medir cobertura. Defina thresholds no CI.

```bash
# Gera relatório de cobertura
pytest --cov=src/meuprojeto --cov-report=term-missing --cov-report=html
```

```toml
# ✅ Bom: pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
asyncio_mode = "auto"

[tool.coverage.run]
source = ["src/meuprojeto"]
branch = true

[tool.coverage.report]
fail_under = 80
show_missing = true
skip_covered = true
```

### Boas Práticas
- ✅ Cobertura mínima de 80% para projetos novos
- ✅ Foque cobertura em lógica de negócio, não apenas em schemas
- ✅ Use `--cov-report=html` para inspecionar gaps
- ❌ Não escreva testes apenas para aumentar cobertura sem valor

## Asserções e Legibilidade

- ✅ Use uma asserção por comportamento quando claro
- ✅ Use nomes descritivos para variáveis dentro do teste
- ✅ Separe as três fases: Arrange, Act, Assert
- ❌ Não escreva testes que verificam muitos comportamentos de uma vez

```python
def test_apply_discount_reduces_total():
    # Arrange
    order = OrderFactory(total=200)

    # Act
    discounted = apply_discount(order, percentage=10)

    # Assert
    assert discounted == 180
```

## Testes de Exceções

```python
import pytest

from meuprojeto.shared.exceptions import NotFoundError


def test_get_user_by_id_raises_when_missing(service):
    service.repository.find_by_id.return_value = None

    with pytest.raises(NotFoundError, match="Usuário não encontrado"):
        service.get_by_id(999)
```

## Módulos Relacionados

- **python-core.md**: Stack, estrutura, nomenclatura e padrões gerais do Python
- **python-api.md**: Regras para desenvolvimento de APIs com FastAPI, DRF e Flask
- **python-checklist.md**: Checklist para revisão antes de commit
