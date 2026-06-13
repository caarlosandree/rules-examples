---
trigger: always_on
description: Checklist pré-commit para projetos NestJS. Valida código, testes, segurança, documentação e qualidade antes de finalizar uma alteração.
globs: **/*.{ts,js}
---
# Checklist Pré-Commit - NestJS

Execute este checklist antes de commitar ou abrir um pull request em projetos NestJS.

## 1. Código e Estilo

- [ ] Código segue o padrão **Package by Feature** (`src/modules/<feature>/`)
- [ ] Controllers estão finos e delegam lógica para services
- [ ] Services possuem responsabilidade única e retornam DTOs
- [ ] Nomes de arquivos, classes, métodos e variáveis seguem as convenções do projeto
- [ ] Não há `console.log` ou debuggers esquecidos
- [ ] Não há código comentado morto
- [ ] Não há importações não utilizadas
- [ ] Métodos estão pequenos e legíveis (máximo ~30 linhas quando possível)
- [ ] Não há `any` implícito ou explícito sem justificativa

## 2. Formatação e Lint

- [ ] Arquivos estão formatados com Prettier (`pnpm format`)
- [ ] ESLint passa sem erros (`pnpm lint`)
- [ ] TypeScript compila sem erros (`pnpm typecheck` ou `tsc --noEmit`)
- [ ] Linhas respeitam o limite de 100 caracteres
- [ ] Indentação com 2 espaços
- [ ] Uso consistente de aspas simples e ponto e vírgula

## 3. DTOs e Validação

- [ ] DTOs de entrada usam `class-validator` e são classes
- [ ] `ValidationPipe` global está configurado com `whitelist: true` e `forbidNonWhitelisted: true`
- [ ] DTOs de resposta não expõem campos sensíveis (ex: `password`)
- [ ] Campos opcionais usam `@IsOptional()` corretamente
- [ ] Tipos de dados estão corretos (`@IsString`, `@IsNumber`, `@IsUUID`, etc.)
- [ ] DTOs de atualização usam `PartialType` quando apropriado

## 4. Controllers e API

- [ ] Rotas seguem convenção RESTful
- [ ] Métodos HTTP são semânticos (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- [ ] Status HTTP estão corretos (`201 Created`, `204 No Content`, etc.)
- [ ] Parâmetros de rota usam pipes quando necessário (`ParseUUIDPipe`, `ParseIntPipe`)
- [ ] Query params estão tipados em DTOs
- [ ] Versionamento da API está respeitado quando aplicável
- [ ] Endpoints sensíveis possuem autenticação/autorização (`@UseGuards`)

## 5. Serviços e Lógica de Negócio

- [ ] Services usam injeção de dependência por construtor
- [ ] Services não dependem de controllers
- [ ] Acesso ao banco isolado em repositories
- [ ] Transações são usadas para operações multi-recurso
- [ ] Exceções de negócio são claras e usam status HTTP adequados
- [ ] Não há lógica de negócio em controllers, guards ou interceptors

## 6. Segurança

- [ ] Senhas e tokens nunca são logados ou retornados
- [ ] Entrada do usuário é validada antes do uso
- [ ] Queries ao banco não concatenam strings (uso de ORM/parameterized queries)
- [ ] Endpoints administrativos possuem controle de acesso
- [ ] Headers de segurança estão configurados (helmet ou equivalente)
- [ ] CORS está configurado de forma restritiva
- [ ] Variáveis sensíveis estão em `.env`, nunca no código

## 7. Banco de Dados

- [ ] Migrations foram geradas e revisadas (`prisma migrate dev` ou TypeORM equivalente)
- [ ] Não há alterações em migrations já aplicadas
- [ ] Índices foram considerados para queries frequentes
- [ ] Relacionamentos estão bem modelados
- [ ] Campos sensíveis possuem criptografia quando necessário

## 8. Testes

- [ ] Testes unitários cobrem a lógica de negócio adicionada/alterada
- [ ] Mocks de providers estão corretos e isolam a unidade sob teste
- [ ] Testes de integração verificam persistência quando relevante
- [ ] Testes E2E verificam endpoints novos ou alterados
- [ ] Todos os testes passam (`pnpm test`)
- [ ] Cobertura de código permanece acima do mínimo definido (mínimo 80%)
- [ ] Não há testes `.only` ou `.skip` esquecidos

## 9. Documentação

- [ ] Swagger/OpenAPI foi atualizado para endpoints novos/alterados
- [ ] DTOs possuem `@ApiProperty` com exemplos quando necessário
- [ ] README possui instruções de setup atualizadas quando aplicável
- [ ] Breaking changes foram documentadas
- [ ] Mensagens de commit seguem o padrão convencional

## 10. Variáveis de Ambiente e Configuração

- [ ] Variáveis novas foram adicionadas ao `.env.example`
- [ ] Variáveis obrigatórias são validadas na inicialização
- [ ] Configurações por ambiente estão corretas
- [ ] Não há valores hardcoded de URLs, secrets ou credenciais

## 11. Commits

- [ ] Commits são atômicos e representam uma única mudança lógica
- [ ] Mensagens seguem o padrão convencional (`feat:`, `fix:`, `refactor:`, etc.)
- [ ] Descrição do commit é clara e no imperativo
- [ ] Não há commits de teste/merge desnecessários

## Comandos de Verificação Rápida

```bash
# Formatação e lint
pnpm format
pnpm lint

# Typecheck
pnpm typecheck

# Testes
pnpm test
pnpm test:cov
pnpm test:e2e

# Build de produção
pnpm build
```

## Antes de Abrir PR

- [ ] Branch está atualizada com a base (`git pull origin main` ou `homolog`)
- [ ] Conflitos foram resolvidos
- [ ] CI passa (lint, typecheck, testes)
- [ ] PR possui descrição clara do que mudou e por quê
- [ ] Foram adicionados reviewers adequados

## Módulos Relacionados

- **nestjs-core.md**: Stack, princípios, estrutura, nomenclatura, formatação e padrões NestJS
- **nestjs-api.md**: Controllers, versionamento, DTOs, pipes, guards, interceptors e Swagger
- **nestjs-testing.md**: Testes unitários, testes de integração e cobertura
- **commit.md**: Padrões detalhados de mensagens de commit
