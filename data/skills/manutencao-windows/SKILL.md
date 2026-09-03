---
name: manutencao-windows
description: Procedimento seguro de limpeza e atualização do Windows usando o catálogo NEXO, priorizando ações não-destrutivas e confirmação explícita para comandos destrutivos.
---

# Manutenção segura do Windows

## Quando usar
Objetivos de limpeza de disco, cache, atualização de apps ou desempenho.

## Passo a passo
1. **Diagnóstico primeiro (sempre não-destrutivo):**
   - `catalog_search {"q": "espaço em disco"}` → `verificar_espaco_em_disco`
   - `catalog_search {"q": "uso de ram"}` → `ver_uso_atual_de_ram`
2. **Prefira ações reversíveis:** `limpar_temp_usuario`, `esvaziar_lixeira`, `limpar_cache_dns`.
3. **Para todo comando marcado ⚠️DESTRUTIVO:**
   - explique o risco no Thought;
   - rode antes com `{"dry_run": true}`;
   - execute só com `{"confirm": true}` se o objetivo realmente exigir.
4. **Atualizações de apps:** `listar_atualizacoes_winget` → `atualizar_todos_winget`.
5. Ao concluir, salve o resumo do que foi feito com `memory_save`.

## Erros comuns
- `Get-WindowsUpdate` exige o módulo PSWindowsUpdate: instale com `instalar_modulo_pswindowsupdate` antes.
- Timeout normalmente é serviço ocupado (wuauserv): tente de novo ou investigue o processo.
