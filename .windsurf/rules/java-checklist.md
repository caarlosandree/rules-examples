---
trigger: always_on
description: Checklist pré-commit para projetos Java, consolidando verificações de qualidade, API, banco de dados, segurança, testes e build.
globs: **/*.java
---

# Checklist Antes de Commitar - Projetos Java

Antes de fazer commit, revise este checklist. Marque cada item e só prossiga quando o código estiver adequado.

## Compilação e Build

- [ ] O projeto compila sem erros (`mvn compile` ou `./gradlew compileJava`)
- [ ] Não há warnings críticos não justificados
- [ ] O build passa no lint/style (`mvn checkstyle:check` ou `./gradlew checkstyleMain`)
- [ ] Não há código comentado, arquivos de debug ou configurações locais
- [ ] Não há imports não utilizados

## Qualidade de Código

- [ ] Nomes descritivos para classes, métodos, variáveis e constantes
- [ ] Métodos pequenos, com responsabilidade única
- [ ] Classes não estão acumulando responsabilidades (princípio da responsabilidade única)
- [ ] Código formatado conforme as regras do projeto (4 espaços, 120 caracteres)
- [ ] Comentários explicam o porquê, não o o quê
- [ ] JavaDoc presente em métodos e classes públicos quando necessário

## Estrutura e Organização

- [ ] Código organizado segundo Package by Feature
- [ ] Pacotes, classes e arquivos seguem as convenções de nomenclatura
- [ ] Código compartilhado está em `shared/` ou local apropriado
- [ ] Não há dependências cíclicas entre módulos

## API REST

- [ ] Endpoints estão versionados corretamente (`/api/v1/...`)
- [ ] Controllers retornam DTOs, nunca entidades JPA
- [ ] Controllers são finos e delegam lógica para services
- [ ] Status HTTP estão corretos (`201` para criação, `204` para deleção, etc.)
- [ ] DTOs de request possuem validações Jakarta (`@NotBlank`, `@Size`, `@Email`, etc.)
- [ ] O controller usa `@Valid` para acionar a validação
- [ ] Endpoints de listagem implementam paginação quando apropriado

## Tratamento de Exceções

- [ ] Exceções de negócio são tratadas por `@ControllerAdvice`/`@RestControllerAdvice`
- [ ] Códigos HTTP retornados são adequados ao tipo de erro
- [ ] Mensagens de erro são claras, mas não expõem detalhes internos sensíveis
- [ ] Erros são logados sem vazar dados confidenciais

## Banco de Dados e Transações

- [ ] Operações de leitura usam `@Transactional(readOnly = true)`
- [ ] Operações de escrita usam `@Transactional`
- [ ] Não há chamadas externas (HTTP, filas) dentro de transações
- [ ] Queries usam parametrização (evita SQL injection)
- [ ] N+1 queries foram evitados (`@EntityGraph`, `JOIN FETCH`, etc.)
- [ ] Paginação é feita no banco (não em memória)
- [ ] Se houver mudança de schema, uma nova migration foi criada

## Migrations

- [ ] Migrations seguem a convenção de nomenclatura (`V{versão}__descricao.sql`)
- [ ] Migrations já aplicadas em ambientes compartilhados **não foram editadas**
- [ ] Migrations são reversíveis ou possuem plano de rollback documentado
- [ ] Scripts de migration são testados localmente antes do commit

## Segurança

- [ ] Não há segredos, senhas ou tokens no código
- [ ] Variáveis sensíveis são lidas de variáveis de ambiente
- [ ] Endpoints sensíveis estão protegidos por autenticação/autorização
- [ ] Validação de entrada está implementada
- [ ] Dados sensíveis não são expostos em logs nem em respostas de erro

## Testes

- [ ] Testes unitários cobrem lógica de negócio
- [ ] Testes de integração cobrem controllers e repositories quando necessário
- [ ] Testcontainers é usado para testes que dependem de funcionalidades do banco real
- [ ] Factories de teste são usadas para evitar repetição
- [ ] Testes são determinísticos e independentes
- [ ] Cobertura mínima de lógica de negócio está atendida (meta: 80%)

## Documentação

- [ ] OpenAPI/Swagger está atualizado para endpoints alterados
- [ ] README.md está atualizado se necessário
- [ ] Decisões arquiteturais importantes foram documentadas
- [ ] Variáveis de ambiente novas foram adicionadas ao arquivo de exemplo

## Git e Commits

- [ ] Commit é atômico (uma mudança lógica por commit)
- [ ] Mensagem de commit segue Conventional Commits
- [ ] Mensagem está em português brasileiro e é descritiva
- [ ] Não há alterações não relacionadas no mesmo commit

## Antes do Push

- [ ] Testes de integração passam (`mvn test` ou `./gradlew test`) quando solicitado
- [ ] Build completo passa (`mvn verify` ou `./gradlew build`)
- [ ] Checklist foi revisado e todos os itens críticos estão marcados

## Referências aos Módulos de Regras

Este checklist consolida verificações dos seguintes módulos:

- **java-core.md**: princípios, estrutura, nomenclatura, formatação e padrões Java/Spring
- **java-api.md**: versionamento de API, controllers, DTOs, validação, tratamento de exceções e paginação
- **java-testing.md**: testes unitários, testes de integração, Testcontainers e cobertura
- **commit.md**: convenções de commits
