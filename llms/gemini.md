# ♊ Gemini — Comandos e Prompts

## Gemini CLI
```bash
npm install -g @google/gemini-cli
gemini                    # sessão interativa
gemini -p "prompt"        # one-shot
```

## NotebookLM (workflow do lab)
- Transformar pesquisa em: infográfico, mapa mental, podcast/aula
- Ideal para converter material técnico em conteúdo educativo para leigos

## Prompts úteis
```
Compare este código com a documentação oficial mais recente e aponte APIs
descontinuadas.
```
```
Gere um mapa mental em markdown deste whitepaper de segurança.
```

## Ollama / modelos locais
```bash
ollama list
ollama run qwen2.5:7b
ollama pull deepseek-r1
```
