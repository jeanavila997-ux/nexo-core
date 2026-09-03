# IMPLEMENT.md

Log de decisões e desvios durante a execução (append-only).

## 2026-09-03

1. **Zero dependências npm** — MCP implementado à mão (JSON-RPC 2.0 over newline-delimited stdio + HTTP POST stateless); ZIP/XLSX lido com `node:zlib` + regex XML. Motivo: portabilidade total e superfície de auditoria mínima.
2. **Catálogo = 451 comandos** (não 452): a planilha tem 452 linhas incluindo o cabeçalho. 107 destrutivos. IDs duplicados causam erro na conversão (validado).
3. **dry_run ANTES do gate**: o primeiro design validava a política antes do dry_run; um teste falhou e a revisão mudou o design — pré-visualizar não executa nada, então é seguro mesmo para destrutivos (e é exatamente o fluxo que a skill manutencao-windows recomenda).
4. **ReAct em texto puro em vez de tool-calling nativo**: gemma4:e2b-it-qat via /api/chat; compatível com qualquer modelo. Parser tolerante (cercas de código, JSON inválido → `{value}`).
5. **Bottleneck real: CPU**. `ollama ps` → 100% CPU, ~6 tok/s. Primeiro teste ao vivo abortou em 120s de timeout. Correções: timeout 300s (`NEXO_LLM_TIMEOUT`), `num_ctx=8192`, e principalmente `num_predict=220` + pensamentos de máx. 2 frases. Resultado: loop caiu de ~100s/passo para ~15-40s/passo.
6. **Sinônimos de argumentos** nas tools (`q|query|busca|termos`; `objective|objetivo`): modelos pequenos chutavam `{"query": ...}` contra o schema `{"q": ...}`.
7. **Cheat-sheet de Action Input** no system prompt + categorias do catálogo injetadas: o modelo passou a buscar em português e a usar ids corretos.
8. **Busca com fallback OR**: "memória livre disco" não casava nada (exigia todos os termos). Agora: se nada casa com TODOS, aceita QUALQUER termo (ranqueado). Teste ao vivo passou de 8 passos frustrados para 3 passos com resposta correta.
9. **Integração chat-ia sem fork**: aproveitei o cliente MCP existente; só tornei o timeout configurável (`requestTimeoutMs`) e registrei o nexo em `env/mcp-servers.json`. O gate de destrutivos do NEXO é a camada autoritativa; `requiresConfirmation` do registry do chat-ia permanece false para tools MCP (dupla confirmação seria redundante — o NEXO responde isError com instrução de confirmação).
10. **write tool do harness falha no drive E:** (EISDIR em link temporário) — todos os arquivos criados via pwsh `Set-Content`; edições pontuais via edit tool (funciona após leitura).
