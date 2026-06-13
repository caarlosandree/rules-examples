---
trigger: always_on
description: Regras para desenvolvimento de APIs Python com FastAPI, Django REST Framework e Flask: rotas, schemas Pydantic, dependências, erros, OpenAPI, status HTTP e autenticação.
globs: **/*.py
---

# Regras de Desenvolvimento - Python API

## Stack de API

Este projeto utiliza:
- **FastAPI** como framework preferencial para APIs novas
- **Django REST Framework (DRF)** quando o projeto já usa Django
- **Flask** apenas para microserviços pequenos ou legados
- **Pydantic v2** para schemas de entrada e saída
- **Uvicorn** como servidor ASGI para FastAPI
- **HTTPX** ou **TestClient** do FastAPI/Flask para testes de API

## FastAPI

### Aplicação Principal

Mantenha o ponto de entrada enxuto. Registre routers, middlewares e handlers de exceção em arquivos separados.

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from meuprojeto.config import settings
from meuprojeto.modules.users.router import router as users_router
from meuprojeto.shared.exceptions import setup_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização de conexões, filas, etc.
    yield
    # Limpeza ao desligar


app = FastAPI(
    title="Meu Projeto API",
    version="1.0.0",
    lifespan=lifespan,
)

setup_exception_handlers(app)
app.include_router(users_router, prefix="/api/v1")
```

### Routers

Crie um router por módulo de negócio. Use prefixos e tags para organizar o OpenAPI.

```python
from fastapi import APIRouter

from meuprojeto.modules.orders.router import router as orders_router
from meuprojeto.modules.users.router import router as users_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(orders_router, prefix="/orders", tags=["orders"])
```

## Rotas

### Nomenclatura e Recursos
- Use recursos no **plural**: `/users`, `/orders`, `/products`
- Use substantivos, não verbos: ✅ `/orders/123` ❌ `/getOrder/123`
- Use métodos HTTP para expressar ações:
  - `GET /users` → listar
  - `GET /users/{id}` → obter um
  - `POST /users` → criar
  - `PUT /users/{id}` → atualizar completo
  - `PATCH /users/{id}` → atualizar parcial
  - `DELETE /users/{id}` → remover
- Use aninhamento para relacionamentos: `/users/{id}/orders`
- Use query params para filtros, paginação e ordenação: `?status=pending&limit=20&offset=0`

### Versionamento
- Prefixe as rotas com a versão da API: `/api/v1/users`
- Evite versionar via header em projetos novos; use path prefix

### Status HTTP
- `200 OK` para GET e PUT/PATCH bem-sucedidos
- `201 Created` para POST que cria recurso
- `204 No Content` para DELETE bem-sucedido sem corpo
- `400 Bad Request` para dados inválidos
- `401 Unauthorized` quando autenticação falhar ou estiver ausente
- `403 Forbidden` quando o usuário não tem permissão
- `404 Not Found` quando o recurso não existe
- `409 Conflict` quando houver conflito de estado (ex: e-mail duplicado)
- `422 Unprocessable Entity` para erros de validação do Pydantic (FastAPI já retorna automaticamente)
- `500 Internal Server Error` apenas para erros inesperados

```python
from fastapi import APIRouter, status

from meuprojeto.modules.users.schemas import UserCreate, UserResponse
from meuprojeto.modules.users.service import UserService
from meuprojeto.modules.users.dependencies import get_user_service

router = APIRouter()


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo usuário",
)
async def create_user(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
) -> UserResponse:
    return await service.create(data)
```

## Schemas Pydantic

Separe schemas de entrada e saída. Use nomes descritivos e validações explicitas.

```python
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None

    model_config = {"from_attributes": True}
```

### Boas Práticas com Pydantic
- ✅ Use `model_config = {"from_attributes": True}` para converter de ORM
- ✅ Use `EmailStr`, `HttpUrl` e outros tipos especializados
- ✅ Coloque validações nos campos (`min_length`, `ge`, `le`)
- ❌ Não exponha campos sensíveis (senha, token) em schemas de resposta
- ❌ Não reutilize o mesmo schema para entrada e saída quando a semântica for diferente

```python
# ✅ Bom: schemas separados
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None


# ❌ Ruim: mesmo schema para criação e resposta expõe a senha
class UserSchema(BaseModel):
    id: int | None = None
    email: EmailStr
    password: str
```

## Dependências

Use `Depends` para injetar serviços, sessões de banco e usuários autenticados.

```python
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from meuprojeto.database import async_session_factory
from meuprojeto.modules.auth.security import get_current_user
from meuprojeto.modules.users.models import User
from meuprojeto.modules.users.repository import UserRepository
from meuprojeto.modules.users.service import UserService


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session


DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_user_repository(session: DbSession) -> UserRepository:
    return UserRepository(session)


async def get_user_service(
    repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserService:
    return UserService(repository)


async def get_current_active_user(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )
    return user
```

### Boas Práticas
- ✅ Injete dependências nas camadas de service/repository, não acesse o banco direto no router
- ✅ Use `Annotated` para deixar as assinaturas mais limpas
- ✅ Crie funções de dependência reutilizáveis
- ❌ Não coloque lógica de negócio complexa nas dependências

## Tratamento de Erros

Crie exceções customizadas e handlers globais para padronizar respostas.

```python
from fastapi import Request
from fastapi.responses import JSONResponse

from meuprojeto.shared.exceptions import NotFoundError, ValidationError


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: dict | list | None = None


async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(
            error="not_found",
            message=str(exc),
        ).model_dump(),
    )


async def validation_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error="validation_error",
            message=str(exc),
            details=exc.details,
        ).model_dump(),
    )


def setup_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(NotFoundError, not_found_handler)
    app.add_exception_handler(ValidationError, validation_handler)
```

### Exceções Customizadas

```python
class NotFoundError(Exception):
    pass


class ValidationError(Exception):
    def __init__(self, message: str, details: dict | None = None) -> None:
        super().__init__(message)
        self.details = details or {}
```

## OpenAPI

O FastAPI gera OpenAPI automaticamente. Mantenha a documentação útil com:
- `summary` e `description` claros
- `tags` para agrupar endpoints
- `response_model` para documentar respostas de sucesso
- `responses` para documentar erros esperados

```python
@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Busca um usuário pelo ID",
    description="Retorna os dados públicos de um usuário cadastrado.",
    tags=["users"],
    responses={
        404: {"description": "Usuário não encontrado"},
    },
)
async def get_user(user_id: int, service: UserService = Depends(get_user_service)) -> UserResponse:
    return await service.get_by_id(user_id)
```

## Autenticação

Prefira OAuth2 com JWT para APIs REST. Use scopes quando necessário.

```python
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from meuprojeto.config import settings
from meuprojeto.modules.users.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await find_user_by_id(int(user_id))
    if user is None:
        raise credentials_exception
    return user
```

### Boas Práticas de Segurança
- ✅ Armazene senhas com hash (bcrypt/Argon2), nunca em texto plano
- ✅ Use HTTPS em produção
- ✅ Valide e expire tokens JWT
- ✅ Use `SECRET_KEY` forte e armazenada em variável de ambiente
- ✅ Proteja rotas sensíveis com `Depends(get_current_user)`
- ❌ Nunca retorne tokens ou senhas em logs ou respostas de erro

## Django REST Framework

Quando usar DRF:
- Use `ModelSerializer` para serialização básica
- Use `ViewSet` ou `APIView` por recurso
- Use `permissions` para controle de acesso
- Use `filter_backends` para filtros e ordenação

```python
from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from meuprojeto.users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name"]
        extra_kwargs = {"password": {"write_only": True}}


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
```

## Flask

Use Flask apenas para casos simples. Organize com Blueprints.

```python
from flask import Blueprint, jsonify, request

from meuprojeto.modules.users.service import UserService

users_bp = Blueprint("users", __name__, url_prefix="/api/v1/users")


@users_bp.post("")
def create_user():
    data = request.get_json()
    user = UserService().create(data)
    return jsonify(user.model_dump()), 201
```

## Módulos Relacionados

- **python-core.md**: Stack, estrutura, nomenclatura, formatação e padrões gerais do Python
- **python-testing.md**: Testes de API, fixtures e cobertura
- **python-checklist.md**: Checklist para revisão antes de commit
