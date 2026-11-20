const fs = require('fs');

const smallCapsMap = {
  a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
  A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'s',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'
};

function toSmallCaps(str) {
  if (!str) return '';
  return String(str).replace(/[A-Za-z]/g, c => smallCapsMap[c] || c);
}

function formatTokens(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  if (n >= 1_000_000) {
    const val = (n / 1_000_000).toFixed(1);
    return (val.endsWith('.0') ? val.slice(0, -2) : val) + 'ᴍ';
  }
  if (n >= 1_000) return Math.round(n / 1_000) + 'ᴋ';
  return String(Math.round(n));
}

function makeBar(pct, width = 4) {
  const p = Math.max(0, Math.min(100, pct || 0));
  const filled = Math.round((p / 100) * width);
  const empty = width - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

function formatModel(name) {
  if (!name) return toSmallCaps('Gemini 3.8 Flash (High)');
  return toSmallCaps(String(name).trim());
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

let input = '';
const timeout = setTimeout(() => {
  render({});
  process.exit(0);
}, 500);

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  clearTimeout(timeout);
  let data = {};
  try {
    if (input.trim()) data = JSON.parse(input);
  } catch (_) {}
  render(data);
});

function render(data) {
  const reset = '\x1b[0m';
  const dim = '\x1b[2m';
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const orange = '\x1b[38;5;208m';
  const magenta = '\x1b[35m';
  const white = '\x1b[37m';

  const termWidth = Number(data.terminal_width) || 80;
  const maxWidth = Math.max(40, termWidth - 4);

  // 1. Caveman badge
  let caveBadge = '';
  try {
    const pluginPath = 'C:\\Users\\sumit\\.gemini\\config\\plugins\\caveman';
    const configPath = 'C:\\Users\\sumit\\.gemini\\config\\config.json';
    let enabled = fs.existsSync(pluginPath);
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (cfg.plugins?.caveman?.enabled === false) enabled = false;
    }
    if (enabled) {
      caveBadge = `${orange}◈ ᴄᴀᴠᴇ${reset} `;
    }
  } catch (_) {}

  // 2. State & Model
  const state = data.agent_state || 'idle';
  const isBusy = (state === 'working' || state === 'thinking');
  const stateIcon = isBusy ? '⟳' : '●';
  const stateColor = isBusy ? yellow : green;
  const stateLabel = toSmallCaps(isBusy ? 'Busy' : 'Ready');
  const rawModel = data.model?.display_name || data.model?.id || 'Gemini 3.8 Flash (High)';
  const modelPart = `${stateColor}${stateIcon} ${stateLabel}${reset} ${cyan}⌘ ${formatModel(rawModel)}${reset}`;

  // 3. Git branch (compact small caps)
  let gitPart = '';
  const vcs = data.vcs || data.workspace?.vcs;
  if (vcs && vcs.branch) {
    const dirty = vcs.dirty ? '*' : '';
    gitPart = ` ${dim}│${reset} ${magenta}⎇ ${toSmallCaps(vcs.branch)}${dirty}${reset}`;
  }

  // 4. Tokens (deduplicated - show in/out only, no duplicate total)
  const cw = data.context_window || {};
  const totalTokens = cw.context_window_size || 1_000_000;
  const usedPct = cw.used_percentage != null
    ? Number(cw.used_percentage)
    : (cw.used_tokens ? (cw.used_tokens / totalTokens) * 100 : 0);
  const usedTokens = cw.used_tokens != null
    ? cw.used_tokens
    : Math.round((usedPct / 100) * totalTokens);

  let tokPart = '';
  const inTok = cw.total_input_tokens ?? data.tokens?.input ?? data.input_tokens;
  const outTok = cw.total_output_tokens ?? data.tokens?.output ?? data.output_tokens;
  if (inTok != null && outTok != null) {
    tokPart = ` ${dim}│${reset} ${yellow}↓${formatTokens(inTok)} ↑${formatTokens(outTok)}${reset}`;
  } else if (usedTokens) {
    tokPart = ` ${dim}│${reset} ${yellow}🪙 ${formatTokens(usedTokens)}${reset}`;
  }

  // 5. Context window bar (bar + percentage/limit, no repeated used count)
  const bar = makeBar(usedPct, 4);
  const pctStr = usedPct.toFixed(1) + '%';
  const ctxPart = ` ${dim}│${reset} ${dim}${bar}${reset} ${yellow}${pctStr}/${formatTokens(totalTokens)}${reset}`;

  // Assemble
  let line = `${caveBadge}${modelPart}${gitPart}${tokPart}${ctxPart}`;

  // Terminal width check: drop segments if too long to prevent wrapping
  if (stripAnsi(line).length > maxWidth && gitPart) {
    line = `${caveBadge}${modelPart}${tokPart}${ctxPart}`;
  }
  if (stripAnsi(line).length > maxWidth && tokPart) {
    line = `${caveBadge}${modelPart}${ctxPart}`;
  }

  // Write single line with explicit reset and newline
  process.stdout.write(line + reset + '\n');
}
