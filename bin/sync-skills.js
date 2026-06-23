#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const HOME = process.env.HOME || process.env.USERPROFILE;
const CLAUDE_PLUGINS_JSON = path.join(HOME, '.claude', 'plugins', 'installed_plugins.json');

// --- Cores ANSI ---
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', blue: '\x1b[34m',
  yellow: '\x1b[33m', cyan: '\x1b[36m',
  gray: '\x1b[90m', red: '\x1b[31m',
};

const log = {
  info:    (msg) => console.log(`${c.blue}ℹ${c.reset}  ${msg}`),
  ok:      (msg) => console.log(`${c.green}✓${c.reset}  ${msg}`),
  warn:    (msg) => console.log(`${c.yellow}⚠${c.reset}  ${msg}`),
  error:   (msg) => console.log(`${c.red}✗${c.reset}  ${msg}`),
  item:    (msg) => console.log(`   ${c.gray}•${c.reset} ${msg}`),
  section: (msg) => console.log(`\n${c.bold}${msg}${c.reset}`),
};

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function confirm(rl, question, defaultYes = true) {
  const hint = defaultYes ? `${c.gray}(S/n)${c.reset}` : `${c.gray}(s/N)${c.reset}`;
  const answer = await ask(rl, `${question} ${hint} `);
  if (!answer.trim()) return defaultYes;
  return answer.trim().toLowerCase().startsWith('s');
}

// --- Detecta o agy ---
function detectAgy() {
  try {
    const result = execSync('which agy', { encoding: 'utf8' }).trim();
    if (result) return result;
  } catch {}
  // fallback: caminho padrão do Antigravity
  const fallback = path.join(HOME, '.antigravity', 'antigravity', 'bin', 'agy');
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

// --- Lê plugins instalados no Claude ---
function readClaudePlugins() {
  if (!fs.existsSync(CLAUDE_PLUGINS_JSON)) return null;
  try {
    return JSON.parse(fs.readFileSync(CLAUDE_PLUGINS_JSON, 'utf8'));
  } catch {
    return null;
  }
}

function resolveInstallPath(install) {
  const p = install.installPath;
  if (!p || !fs.existsSync(p)) return null;
  return p;
}

// --- Instala um plugin via agy ---
function installPlugin(agy, pluginPath) {
  try {
    const out = execSync(`"${agy}" plugin install "${pluginPath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { ok: true, output: out.trim() };
  } catch (err) {
    const msg = (err.stderr || err.stdout || err.message || '').trim();
    return { ok: false, output: msg };
  }
}

// --- Main ---
async function main() {
  console.log(`\n${c.bold}${c.cyan}sync-skills${c.reset} — sincroniza plugins do Claude Code → Antigravity\n`);

  // 1. Verificar pré-requisitos
  const agy = detectAgy();
  if (!agy) {
    log.error('Antigravity (agy) não encontrado. Instale o Antigravity e tente novamente.');
    process.exit(1);
  }
  log.info(`agy encontrado: ${c.gray}${agy}${c.reset}`);

  const data = readClaudePlugins();
  if (!data) {
    log.error(`Arquivo de plugins do Claude não encontrado: ${CLAUDE_PLUGINS_JSON}`);
    log.info('Certifique-se de que o Claude Code está instalado e tem plugins instalados.');
    process.exit(1);
  }

  const plugins = data.plugins || {};
  const pluginNames = Object.keys(plugins);
  log.info(`${pluginNames.length} plugin(s) instalado(s) no Claude Code.`);

  // 2. Montar lista de plugins com path válido
  const candidates = [];
  for (const [key, installs] of Object.entries(plugins)) {
    const name = key.split('@')[0];
    for (const install of (installs || [])) {
      const p = resolveInstallPath(install);
      if (p) {
        candidates.push({ key, name, path: p, version: install.version || 'unknown' });
        break; // usa a primeira instalação válida
      }
    }
  }

  if (candidates.length === 0) {
    log.warn('Nenhum plugin com path válido encontrado no cache do Claude.');
    process.exit(0);
  }

  // 3. Mostrar lista
  log.section('Plugins disponíveis para sincronizar:');
  candidates.forEach(p => log.item(`${c.bold}${p.name}${c.reset} ${c.gray}(v${p.version})${c.reset}`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const proceed = await confirm(rl, `\nSincronizar todos os ${candidates.length} plugin(s) para o Antigravity?`);
    if (!proceed) {
      console.log('\nCancelado.\n');
      return;
    }

    // 4. Instalar cada plugin
    log.section('Instalando plugins no Antigravity...');
    let ok = 0;
    let failed = 0;

    for (const plugin of candidates) {
      const result = installPlugin(agy, plugin.path);
      if (result.ok) {
        log.ok(`${plugin.name}`);
        // mostra linhas relevantes do output (skills processadas)
        result.output.split('\n')
          .filter(l => l.includes('✔') || l.includes('skills') || l.includes('hooks'))
          .forEach(l => log.item(l.replace(/\x1b\[[0-9;]*m/g, '').trim()));
        ok++;
      } else {
        log.error(`${plugin.name}: ${result.output.split('\n')[0]}`);
        failed++;
      }
    }

    // 5. Resumo
    console.log(`\n${c.green}${c.bold}✅ Concluído!${c.reset}`);
    console.log(`   ${ok} plugin(s) instalado(s) com sucesso no Antigravity`);
    if (failed) console.log(`   ${c.yellow}${failed} plugin(s) com erro — verifique os logs acima${c.reset}`);
    console.log(`\n${c.gray}As skills já estão disponíveis na próxima sessão do Antigravity.${c.reset}\n`);

  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(`\n${c.red}Erro:${c.reset}`, err.message);
  process.exit(1);
});
