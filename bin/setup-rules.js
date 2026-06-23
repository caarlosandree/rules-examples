#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RULES_DIR = path.join(__dirname, '..', '.windsurf', 'rules');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const CWD = process.cwd();

// --- Cores ANSI sem dependências externas ---
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${c.blue}ℹ${c.reset}  ${msg}`),
  ok: (msg) => console.log(`${c.green}✓${c.reset}  ${msg}`),
  warn: (msg) => console.log(`${c.yellow}⚠${c.reset}  ${msg}`),
  item: (msg) => console.log(`   ${c.gray}•${c.reset} ${msg}`),
  section: (msg) => console.log(`\n${c.bold}${msg}${c.reset}`),
};

// --- Detecção de stack ---
function detectStack() {
  const result = { stacks: [], databases: [], isBackend: false, isFrontend: false };

  const pkgPath = path.join(CWD, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let pkg = {};
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch {}
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['@nestjs/core'])   { result.stacks.push('nestjs');  result.isBackend  = true; }
    if (deps['next'])           { result.stacks.push('nextjs');  result.isFrontend = true; }
    if (deps['@angular/core'])  { result.stacks.push('angular'); result.isFrontend = true; }
    if (deps['vue'])            { result.stacks.push('vue');     result.isFrontend = true; }
    if (deps['vite'] && !result.stacks.length) {
                                  result.stacks.push('vite');    result.isFrontend = true; }
    if (deps['react-native'] || deps['expo']) result.stacks.push('mobile');

    if (deps['pg'] || deps['@prisma/client'] || deps['typeorm']) result.databases.push('postgresql');
    if (deps['mysql'] || deps['mysql2'] || deps['mariadb'])      result.databases.push('mysql');
    if (deps['mongoose'] || deps['mongodb'])                      result.databases.push('mongodb');
  }

  if (fs.existsSync(path.join(CWD, 'pom.xml')) || fs.existsSync(path.join(CWD, 'build.gradle'))) {
    result.stacks.push('java'); result.isBackend = true;
  }
  if (fs.existsSync(path.join(CWD, 'go.mod'))) {
    result.stacks.push('go'); result.isBackend = true;
  }
  if (fs.existsSync(path.join(CWD, 'pyproject.toml')) ||
      fs.existsSync(path.join(CWD, 'setup.py')) ||
      fs.existsSync(path.join(CWD, 'requirements.txt'))) {
    result.stacks.push('python'); result.isBackend = true;
  }

  // Banco via docker-compose
  for (const f of ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml']) {
    const p = path.join(CWD, f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    if (content.includes('postgres') && !result.databases.includes('postgresql')) result.databases.push('postgresql');
    if ((content.includes('mysql') || content.includes('mariadb')) && !result.databases.includes('mysql')) result.databases.push('mysql');
    if (content.includes('mongo') && !result.databases.includes('mongodb')) result.databases.push('mongodb');
  }

  return result;
}

// --- Mapeamento stack → arquivos de regra ---
const STACK_RULES = {
  java:    ['java-core.md', 'java-api.md', 'java-testing.md', 'java-checklist.md'],
  go:      ['go-core.md', 'go-api.md', 'go-testing.md', 'go-checklist.md'],
  nestjs:  ['nestjs-core.md', 'nestjs-api.md', 'nestjs-testing.md', 'nestjs-checklist.md'],
  nextjs:  ['nextjs-core.md', 'nextjs-ui.md', 'nextjs-testing.md', 'nextjs-checklist.md'],
  python:  ['python-core.md', 'python-api.md', 'python-testing.md', 'python-checklist.md'],
  vue:     ['vue-core.md', 'vue-ui.md', 'vue-testing.md', 'vue-checklist.md'],
  vite:    ['vite-core.md', 'vite-checklist.md'],
  angular: ['angular-core.md', 'angular-ui.md', 'angular-testing.md', 'angular-checklist.md'],
  mobile:  ['mobile-core.md', 'mobile-checklist.md'],
};

const DB_RULES = {
  postgresql: ['postgresql.md'],
  mysql:      ['mysql.md'],
  mongodb:    ['mongodb.md'],
};

const TRANSVERSAL_RULES = ['commit.md', 'release.md', 'security-core.md'];

const BACKEND_RULES  = ['backend-core.md', 'backend-api.md', 'backend-security.md', 'backend-observability.md', 'backend-data.md'];
const FRONTEND_RULES = ['frontend-core.md', 'frontend-state.md', 'frontend-security.md', 'frontend-forms.md'];

// --- Helpers de prompt ---
function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function confirm(rl, question, defaultYes = true) {
  const hint = defaultYes ? `${c.gray}(S/n)${c.reset}` : `${c.gray}(s/N)${c.reset}`;
  const answer = await ask(rl, `${question} ${hint} `);
  if (!answer.trim()) return defaultYes;
  return answer.trim().toLowerCase().startsWith('s');
}

// --- Instalação de arquivos ---
function installFiles(files, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  let installed = 0;
  let missing = 0;
  for (const file of files) {
    const src = path.join(RULES_DIR, file);
    if (!fs.existsSync(src)) { log.warn(`não encontrado: ${file}`); missing++; continue; }
    fs.copyFileSync(src, path.join(destDir, file));
    log.ok(file);
    installed++;
  }
  return { installed, missing };
}

// --- Geração do AGENTS.md consolidado ---
function buildAgentsMd(files) {
  const lines = ['# Agent Instructions\n'];
  lines.push('> Gerado por setup-ai-rules — edite conforme o contexto real do projeto.\n');

  for (const file of files) {
    const src = path.join(RULES_DIR, file);
    if (!fs.existsSync(src)) continue;
    let content = fs.readFileSync(src, 'utf8');
    // remove frontmatter YAML
    content = content.replace(/^---[\s\S]*?---\s*\n?/, '');
    const title = file.replace(/\.md$/, '');
    lines.push(`\n---\n\n## ${title}\n`);
    lines.push(content.trim());
  }

  return lines.join('\n') + '\n';
}

function installAgentsMd(files, destPath) {
  const content = buildAgentsMd([...files]);
  if (fs.existsSync(destPath)) return { existed: true, content };
  fs.writeFileSync(destPath, content, 'utf8');
  return { existed: false, content };
}

// --- Main ---
async function main() {
  console.log(`\n${c.bold}${c.cyan}setup-ai-rules${c.reset} — regras de desenvolvimento para agentes de IA\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // 1. Detectar stack
    log.section('Detectando stack do projeto...');
    const { stacks, databases, isBackend, isFrontend } = detectStack();

    if (stacks.length)    log.info(`Stack:   ${c.bold}${stacks.join(', ')}${c.reset}`);
    else                  log.warn('Nenhuma stack detectada automaticamente — serão instaladas apenas as regras transversais.');
    if (databases.length) log.info(`Banco:   ${c.bold}${databases.join(', ')}${c.reset}`);

    // 2. Montar lista de arquivos
    const files = new Set(TRANSVERSAL_RULES);
    for (const stack of stacks)    (STACK_RULES[stack] || []).forEach(f => files.add(f));
    for (const db of databases)    (DB_RULES[db]       || []).forEach(f => files.add(f));
    if (isBackend)  BACKEND_RULES.forEach(f => files.add(f));
    if (isFrontend) FRONTEND_RULES.forEach(f => files.add(f));

    // 3. Mostrar plano
    log.section('Arquivos selecionados:');
    [...files].forEach(f => log.item(f));

    // 4. Confirmar e personalizar
    const proceed = await confirm(rl, '\nProsseguir com a instalação?');
    if (!proceed) { console.log('\nCancelado.\n'); return; }

    const addSecurity = await confirm(rl, 'Incluir auditoria de segurança avançada (security-analysis.md)?', false);
    if (addSecurity) files.add('security-analysis.md');

    const addWindsurf    = await confirm(rl, 'Instalar regras para Windsurf (.windsurf/rules/)?');
    const addAntigravity = await confirm(rl, 'Instalar regras para Antigravity (AGENTS.md consolidado)?', false);
    const addTemplates   = await confirm(rl, 'Copiar templates base (AGENTS.md / CLAUDE.md)?', !addAntigravity);

    // 5. Instalar regras — Windsurf
    let installed = 0;
    let missing = 0;
    if (addWindsurf) {
      log.section('Instalando regras em .windsurf/rules/...');
      ({ installed, missing } = installFiles([...files], path.join(CWD, '.windsurf', 'rules')));
    }

    // 5b. Instalar regras — Antigravity (AGENTS.md consolidado)
    if (addAntigravity) {
      log.section('Gerando AGENTS.md para Antigravity...');
      const agentsDst = path.join(CWD, 'AGENTS.md');
      let doWrite = true;
      if (fs.existsSync(agentsDst)) {
        doWrite = await confirm(rl, 'AGENTS.md já existe. Sobrescrever com versão consolidada?', false);
      }
      if (doWrite) {
        const content = buildAgentsMd([...files]);
        fs.writeFileSync(agentsDst, content, 'utf8');
        log.ok('AGENTS.md (consolidado com todas as regras)');
      } else {
        log.warn('AGENTS.md mantido sem alteração.');
      }
    }

    // 6. Copiar templates
    if (addTemplates) {
      log.section('Copiando templates...');
      const tpls = addAntigravity ? ['CLAUDE.md'] : ['AGENTS.md', 'CLAUDE.md'];
      for (const tpl of tpls) {
        const src = path.join(TEMPLATES_DIR, tpl);
        const dst = path.join(CWD, tpl);
        if (!fs.existsSync(src)) { log.warn(`template não encontrado: ${tpl}`); continue; }
        if (fs.existsSync(dst)) {
          const overwrite = await confirm(rl, `${tpl} já existe. Sobrescrever?`, false);
          if (!overwrite) { log.warn(`${tpl} mantido sem alteração.`); continue; }
        }
        fs.copyFileSync(src, dst);
        log.ok(tpl);
      }
    }

    // 7. Resumo final
    console.log(`\n${c.green}${c.bold}✅ Pronto!${c.reset}`);
    if (addWindsurf) {
      console.log(`   ${installed} regra(s) instalada(s) em .windsurf/rules/`);
      if (missing) console.log(`   ${c.yellow}${missing} arquivo(s) não encontrado(s) — verifique a versão do pacote${c.reset}`);
    }
    if (addAntigravity) console.log(`   AGENTS.md consolidado gerado na raiz do projeto`);
    console.log(`\n${c.gray}Próximos passos:${c.reset}`);
    if (addAntigravity) {
      console.log(`  1. Abra AGENTS.md e ajuste nomes de módulos, comandos e restrições reais`);
      console.log(`  2. Abra o projeto no Antigravity — o agy já lerá AGENTS.md automaticamente`);
    } else {
      console.log(`  1. Edite AGENTS.md e CLAUDE.md com os dados reais do projeto`);
      console.log(`  2. Ajuste versões, comandos e namespaces nos arquivos de regra`);
    }
    console.log(`  3. Abra o projeto no Claude Code, Cursor ou Windsurf — as regras já estarão ativas\n`);

  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(`\n${c.red}Erro:${c.reset}`, err.message);
  process.exit(1);
});
