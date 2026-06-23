#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');

const HOME = process.env.HOME || process.env.USERPROFILE;
const CLAUDE_PLUGINS_JSON = path.join(HOME, '.claude', 'plugins', 'installed_plugins.json');

// Marketplaces conhecidos — estrutura: { url, pluginsDir }
// pluginsDir: subdiretório onde ficam os plugins (null = raiz do repo)
const KNOWN_MARKETPLACES = [
  {
    id:         'claude-plugins-official',
    label:      'Anthropic — plugins oficiais do Claude Code',
    url:        'https://github.com/anthropics/claude-plugins-official.git',
    pluginsDir: 'plugins',
  },
  {
    id:         'anthropic-agent-skills',
    label:      'Anthropic — skills da comunidade',
    url:        'https://github.com/anthropics/skills.git',
    pluginsDir: null,
  },
];

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
  const fallback = path.join(HOME, '.antigravity', 'antigravity', 'bin', 'agy');
  if (fs.existsSync(fallback)) return fallback;
  return null;
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

function printInstallResult(name, result) {
  if (result.ok) {
    log.ok(name);
    result.output.split('\n')
      .filter(l => l.includes('✔') || l.includes('skills') || l.includes('hooks') || l.includes('commands'))
      .forEach(l => log.item(l.replace(/\x1b\[[0-9;]*m/g, '').trim()));
  } else {
    log.error(`${name}: ${result.output.split('\n')[0]}`);
  }
}

// ============================================================
// MODO A — Claude instalado: usa cache local
// ============================================================

function readClaudePlugins() {
  if (!fs.existsSync(CLAUDE_PLUGINS_JSON)) return null;
  try { return JSON.parse(fs.readFileSync(CLAUDE_PLUGINS_JSON, 'utf8')); }
  catch { return null; }
}

async function modeFromClaudeCache(agy, rl) {
  const data = readClaudePlugins();
  if (!data) return false;

  const plugins = data.plugins || {};
  const candidates = [];
  for (const [key, installs] of Object.entries(plugins)) {
    const name = key.split('@')[0];
    for (const install of (installs || [])) {
      const p = install.installPath;
      if (p && fs.existsSync(p)) {
        candidates.push({ name, path: p, version: install.version || 'unknown' });
        break;
      }
    }
  }

  if (candidates.length === 0) return false;

  log.info(`Claude Code detectado — ${candidates.length} plugin(s) no cache local.`);
  log.section('Plugins disponíveis:');
  candidates.forEach(p => log.item(`${c.bold}${p.name}${c.reset} ${c.gray}(v${p.version})${c.reset}`));

  const proceed = await confirm(rl, `\nInstalar todos os ${candidates.length} plugin(s) no Antigravity?`);
  if (!proceed) { console.log('\nCancelado.\n'); return true; }

  log.section('Instalando...');
  let ok = 0, failed = 0;
  for (const plugin of candidates) {
    const result = installPlugin(agy, plugin.path);
    printInstallResult(plugin.name, result);
    result.ok ? ok++ : failed++;
  }

  printSummary(ok, failed);
  return true;
}

// ============================================================
// MODO B — Sem Claude: clona marketplace e instala
// ============================================================

function detectGit() {
  try { execSync('which git', { encoding: 'utf8' }); return true; }
  catch { return false; }
}

function cloneRepo(url, dest) {
  log.info(`Clonando ${c.gray}${url}${c.reset}...`);
  const result = spawnSync('git', ['clone', '--depth', '1', '--quiet', url, dest], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `git clone falhou com status ${result.status}`);
  }
}

function listPluginDirs(baseDir, pluginsSubdir) {
  const dir = pluginsSubdir ? path.join(baseDir, pluginsSubdir) : baseDir;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => {
      const p = path.join(dir, name);
      return fs.statSync(p).isDirectory() && !name.startsWith('.');
    })
    .map(name => ({ name, path: path.join(dir, name) }));
}

async function modeFromMarketplace(agy, rl) {
  if (!detectGit()) {
    log.error('git não encontrado. É necessário para clonar os marketplaces.');
    process.exit(1);
  }

  log.section('Marketplaces disponíveis:');
  KNOWN_MARKETPLACES.forEach((mp, i) =>
    console.log(`   ${c.bold}${i + 1}${c.reset}. ${mp.label}`)
  );
  console.log(`   ${c.bold}${KNOWN_MARKETPLACES.length + 1}${c.reset}. Instalar todos`);

  const answer = await ask(rl, `\nEscolha [1-${KNOWN_MARKETPLACES.length + 1}]: `);
  const choice = parseInt(answer.trim(), 10);

  let selected = [];
  if (choice === KNOWN_MARKETPLACES.length + 1) {
    selected = KNOWN_MARKETPLACES;
  } else if (choice >= 1 && choice <= KNOWN_MARKETPLACES.length) {
    selected = [KNOWN_MARKETPLACES[choice - 1]];
  } else {
    log.warn('Opção inválida. Cancelado.');
    return;
  }

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-skills-'));
  let ok = 0, failed = 0;

  try {
    for (const mp of selected) {
      const cloneDir = path.join(tmpBase, mp.id);

      try {
        cloneRepo(mp.url, cloneDir);
      } catch (err) {
        log.error(`Falha ao clonar ${mp.id}: ${err.message}`);
        failed++;
        continue;
      }

      const plugins = listPluginDirs(cloneDir, mp.pluginsDir);
      if (plugins.length === 0) {
        log.warn(`Nenhum plugin encontrado em ${mp.id}`);
        continue;
      }

      log.section(`Plugins em ${c.bold}${mp.label}${c.reset} (${plugins.length}):`);
      plugins.forEach(p => log.item(p.name));

      const installAll = await confirm(rl, `\nInstalar todos os ${plugins.length} plugin(s) de ${mp.id}?`);

      let toInstall = plugins;
      if (!installAll) {
        const input = await ask(rl, 'Digite os nomes separados por vírgula (ou Enter para cancelar): ');
        if (!input.trim()) { log.warn(`${mp.id} ignorado.`); continue; }
        const names = input.split(',').map(s => s.trim()).filter(Boolean);
        toInstall = plugins.filter(p => names.includes(p.name));
        if (toInstall.length === 0) { log.warn('Nenhum plugin válido selecionado.'); continue; }
      }

      log.section(`Instalando de ${mp.id}...`);
      for (const plugin of toInstall) {
        const result = installPlugin(agy, plugin.path);
        printInstallResult(plugin.name, result);
        result.ok ? ok++ : failed++;
      }
    }
  } finally {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }

  printSummary(ok, failed);
}

// ============================================================
// Helpers
// ============================================================

function printSummary(ok, failed) {
  console.log(`\n${c.green}${c.bold}✅ Concluído!${c.reset}`);
  console.log(`   ${ok} plugin(s) instalado(s) no Antigravity`);
  if (failed) console.log(`   ${c.yellow}${failed} plugin(s) com erro — verifique os logs acima${c.reset}`);
  console.log(`\n${c.gray}As skills já estão disponíveis na próxima sessão do Antigravity.${c.reset}\n`);
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log(`\n${c.bold}${c.cyan}sync-skills${c.reset} — instala plugins no Antigravity\n`);

  const agy = detectAgy();
  if (!agy) {
    log.error('Antigravity (agy) não encontrado. Instale o Antigravity e tente novamente.');
    process.exit(1);
  }
  log.info(`agy: ${c.gray}${agy}${c.reset}`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // Tenta o modo com cache do Claude primeiro
    const usedClaudeCache = await modeFromClaudeCache(agy, rl);
    if (usedClaudeCache) return;

    // Fallback: modo sem Claude
    log.warn('Claude Code não detectado — usando download direto do marketplace.');
    await modeFromMarketplace(agy, rl);
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(`\n${c.red}Erro:${c.reset}`, err.message);
  process.exit(1);
});
