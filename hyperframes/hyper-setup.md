# ⚡ Hyperframes e Hyper — Setup

## Hyper Terminal (pc2)

Config em `~/.hyper.js`:
```js
module.exports = {
  config: {
    fontSize: 14,
    fontFamily: 'Cascadia Code, monospace',
    cursorShape: 'BEAM',
    shell: 'C:\\Windows\\System32\\wsl.exe',  // abre direto no WSL
  },
  plugins: [
    'hyperpower',      // efeitos de digitação
    'hyper-search',    // busca no buffer
    'hyper-pane',      // painéis
    'hyperborder',     // borda animada
  ],
};
```

## Integração com agentes
- Hyper como terminal host para Kimi Code CLI, Claude Code, Gemini CLI
- Painéis divididos: agente + logs + git

## Ideias de hyperframe do lab
- [ ] Frame de monitoramento: btop + tail de logs + agente
- [ ] Frame de recon: httpx ao vivo + relatório sendo gerado
