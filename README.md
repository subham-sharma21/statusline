# statusline

Compact, deduplicated status line for Google Antigravity CLI and terminal workflows.

## Preview

```text
◈ ᴄᴀᴠᴇ ⟳ ʙᴜsʏ ⌘ ɢᴇᴍɪɴɪ 3.8 ғʟᴀsʜ (ʜɪɢʜ) │ ⎇ ғᴇᴀᴛ/ɢᴀᴍᴇ │ ↓200ᴋ ↑84ᴋ │ ▓░░░ 28.4%/1ᴍ
```

When idle without git branch:

```text
◈ ᴄᴀᴠᴇ ● ʀᴇᴀᴅʏ ⌘ ɢᴇᴍɪɴɪ 3.8 ғʟᴀsʜ (ʜɪɢʜ) │ ↓86ᴋ ↑28ᴋ │ ░░░░ 8.2%/1ᴍ
```

## Features

- **Small 1-cell glyphs**: Replaces wide 2-column emojis with clean Unicode monospace symbols (`◈`, `⟳`, `●`, `⌘`, `⎇`, `↓`, `↑`).
- **Zero data duplication**: Input and output tokens are listed once (`↓in ↑out`), omitting redundant sums and repeated context token counts.
- **Full model identity**: Renders full model string (`ɢᴇᴍɪɴɪ 3.8 ғʟᴀsʜ (ʜɪɢʜ)`) formatted in small-caps.
- **Context window bar**: 4-segment visual progress bar (`▓░░░`) with usage percentage and limit (`28.4%/1ᴍ`).
- **Dynamic git branch**: Detects current repository branch automatically.

## Installation

### For Antigravity CLI

Add to your `~/.gemini/antigravity-cli/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node C:\\Users\\sumit\\statusline\\token-statusline.js",
    "enabled": true
  }
}
```

## License

MIT
