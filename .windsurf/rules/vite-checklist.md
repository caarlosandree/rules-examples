---
trigger: always_on
description: Checklist pré-commit e de configuração para projetos frontend com Vite, cobrindo estrutura, TypeScript, configuração do Vite, variáveis de ambiente, build, testes e commits.
globs: **/*.{ts,tsx,js,jsx,vue,svelte}
---
# Checklist - Vite

Use este checklist antes de finalizar uma tarefa, abrir um pull request ou fazer commit em projetos que utilizam Vite.

## Configuração Inicial do Projeto

- [ ] O projeto foi criado com o scaffolding oficial do Vite (`npm create vite@latest` ou equivalente)
- [ ] O `package.json` possui `type: "module"` e scripts padronizados:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "typecheck": "tsc --noEmit",
      "test": "vitest"
    }
  }
  ```
- [ ] As versões do Node e pnpm/npm estão definidas em `engines`
- [ ] O arquivo `vite.config.ts` existe na raiz do projeto
- [ ] Os arquivos `tsconfig.json`, `tsconfig.app.json` e `tsconfig.node.json` estão configurados
- [ ] O arquivo `index.html` aponta para o script de entrada correto (`/src/main.tsx` ou equivalente)
- [ ] O arquivo `.gitignore` ignora `node_modules/`, `dist/`, `.env.local` e `.vite/`

## Estrutura de Pastas

- [ ] A pasta `src/` existe e contém o código da aplicação
- [ ] A pasta `public/` contém apenas assets estáticos servidos na raiz
- [ ] Componentes estão em `src/components/` com nomenclatura PascalCase
- [ ] Hooks/composables estão em `src/hooks/` ou `src/composables/` com prefixo `use`
- [ ] Serviços HTTP estão em `src/services/`
- [ ] Tipos TypeScript estão em `src/types/`
- [ ] Utilitários estão em `src/utils/`
- [ ] Assets processados pelo Vite estão em `src/assets/`

## Path Alias `@/`

- [ ] O alias `@/` está configurado no `vite.config.ts` apontando para `src/`
- [ ] O alias `@/` está configurado no `tsconfig.json` em `compilerOptions.paths`
- [ ] Todos os imports internos usam `@/` em vez de imports relativos complexos

✅ **Bom**:
```typescript
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
```

❌ **Ruim**:
```typescript
import { Button } from '../../../components/Button'
import { useAuth } from '../../../hooks/useAuth'
```

## TypeScript

- [ ] `strict: true` está ativado no `tsconfig.json`
- [ ] Não há uso de `any` sem justificativa documentada
- [ ] Todos os props de componentes possuem tipagem
- [ ] Todos os retornos de funções públicas possuem tipagem explícita
- [ ] Type imports são usados quando apropriado (`import type { ... }`)
- [ ] O comando `pnpm typecheck` (ou `tsc --noEmit`) executa sem erros

## Configuração do `vite.config.ts`

- [ ] O plugin do framework está configurado (React, Vue ou Svelte)
- [ ] O path alias `@/` está em `resolve.alias`
- [ ] As configurações de `build` definem `target`, `outDir`, `sourcemap` e `minify`
- [ ] O `server.port` está configurado (padrão: 5173)
- [ ] Code splitting está configurado com `rollupOptions.output.manualChunks` quando aplicável
- [ ] A configuração do Vitest está presente em `test` quando o projeto possui testes

## Variáveis de Ambiente

- [ ] Variáveis públicas usam o prefixo `VITE_`
- [ ] Variáveis sem prefixo `VITE_` não são usadas no código do cliente
- [ ] O arquivo `src/vite-env.d.ts` tipa as variáveis de ambiente usadas
- [ ] O arquivo `.env.local` não está versionado
- [ ] Não há secrets, chaves de API privadas ou credenciais em variáveis `VITE_`
- [ ] Variáveis obrigatórias são validadas no startup da aplicação

✅ **Bom**:
```env
VITE_API_URL=https://api.exemplo.com
VITE_APP_NAME=Minha Aplicação
```

```typescript
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error('VITE_API_URL é obrigatória')
}
```

❌ **Ruim**:
```env
API_URL=https://api.exemplo.com
SECRET_KEY=<valor-real-fora-do-repositorio>
```

```typescript
const apiUrl = import.meta.env.API_URL // undefined no cliente
```

## Código e Componentes

- [ ] Componentes usam nomenclatura PascalCase
- [ ] Hooks/composables usam prefixo `use` + camelCase
- [ ] Funções são pequenas e com responsabilidade única
- [ ] Imports estão organizados (externos → internos → types)
- [ ] Não há imports não utilizados
- [ ] Não há variáveis não utilizadas
- [ ] Comentários explicam o **porquê**, não o **o quê**
- [ ] O código segue a estrutura padrão de organização (imports → types → componente → hooks → efeitos → handlers → render)

## HMR e Fast Refresh

- [ ] Componentes React usam exportações nomeadas quando possível
- [ ] Não há exportações anônimas que possam quebrar Fast Refresh
- [ ] O HMR não foi desabilitado sem motivo documentado
- [ ] Alterações em CSS são refletidas sem recarregar a página

✅ **Bom**:
```typescript
export function Counter() {
  return <div>0</div>
}
```

❌ **Ruim**:
```typescript
export default function() {
  return <div>0</div>
}
```

## Build e Performance

- [ ] O comando `pnpm build` executa sem erros
- [ ] Não há warnings críticos no build
- [ ] Code splitting está aplicado para rotas grandes
- [ ] Bibliotecas grandes estão em chunks separados via `manualChunks`
- [ ] Assets em `public/` são realmente estáticos e não precisam ser processados
- [ ] Assets em `src/assets/` são importados no código (não referenciados por path relativo)
- [ ] O tamanho dos chunks está dentro do limite configurado (`chunkSizeWarningLimit`)

## Testes

- [ ] O Vitest está configurado no `vite.config.ts`
- [ ] Testes críticos passam (`pnpm test`)
- [ ] Novas funcionalidades possuem testes quando aplicável
- [ ] Testes usam nomes descritivos
- [ ] Mocks de módulos internos respeitam o path alias `@/`

## Lint e Formatação

- [ ] O comando `pnpm lint` executa sem erros
- [ ] Não há warnings não tratados no lint
- [ ] O estilo de código é consistente com o restante do projeto
- [ ] Linhas não excedem 100 caracteres
- [ ] A indentação usa 2 espaços
- [ ] Strings usam aspas simples quando possível

## Git e Commits

- [ ] O commit é atômico e representa uma única mudança lógica
- [ ] A mensagem de commit segue o padrão: `tipo: descrição curta`
- [ ] Não há arquivos `.env.local`, `dist/` ou `.vite/` sendo commitados
- [ ] O diff foi revisado antes do commit

✅ **Bom**:
```
feat: adiciona página de configurações do usuário
fix: corrige carregamento de variáveis de ambiente no build
docs: atualiza instruções de setup no README
```

❌ **Ruim**:
```
atualiza coisas
wip
fix
```

## Segurança

- [ ] Não há secrets hardcoded no código
- [ ] Não há console.log de dados sensíveis
- [ ] Inputs de usuário são validados antes de uso
- [ ] Renderização de HTML a partir de dados externos usa sanitização adequada
- [ ] URLs de imagens/iframe são validadas quando dinâmicas

## Antes do Commit Final

- [ ] `pnpm typecheck` passou
- [ ] `pnpm lint` passou
- [ ] `pnpm build` passou (para features significativas)
- [ ] `pnpm test` passou (quando houver testes afetados)
- [ ] A aplicação roda corretamente em modo de desenvolvimento
- [ ] Não há regressões visuais óbvias
- [ ] O código foi revisado seguindo este checklist

## Pós-Merge

- [ ] A pipeline de CI/CD executou com sucesso
- [ ] O deploy de preview foi validado
- [ ] Não há erros no console do navegador em produção
- [ ] As variáveis de ambiente de produção estão configuradas corretamente
