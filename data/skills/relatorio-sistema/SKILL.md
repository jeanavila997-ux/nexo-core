---
name: relatorio-sistema
description: Coleta um retrato do estado do Windows (disco, RAM, processos, serviços, atualizações pendentes) e produz relatório Markdown usando apenas comandos não-destrutivos do catálogo.
---

# Relatório de estado do sistema

## Quando usar
"Como está a máquina?", "relatório do sistema", "o que está pesando agora".

## Sequência
1. Disco: `catalog_run {"id": "verificar_espaco_em_disco"}`
2. RAM: `catalog_run {"id": "ver_uso_atual_de_ram"}` e `catalog_run {"id": "listar_processos_por_uso_de_ram"}`
3. Processos por CPU: `catalog_run {"id": "listar_processos_ativos"}`
4. Serviços: `catalog_run {"id": "listar_servicos_em_execucao"}`
5. Atualizações pendentes: `catalog_run {"id": "listar_atualizacoes_winget"}`

## Formato da entrega
Markdown com seções `## Disco`, `## Memória`, `## Processos`, `## Serviços`, `## Atualizações`
e um bloco final `## Recomendações` com 3 ações concretas do catálogo.

## Regras
- Apenas comandos NÃO-destrutivos. Se um id falhar, descubra o correto com `catalog_search`.
