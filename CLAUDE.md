# ceara-website — CLAUDE.md

> Instruções pra agentes Claude Code que trabalham neste projeto.
> Este arquivo é carregado automaticamente em toda sessão.

**Setor:** Software

## 1. Memory Core (Marco E — ATIVO)

Este projeto está conectado ao **Memory Core** (Postgres+pgvector) via MCP.

**Ferramentas disponíveis** (após reiniciar Claude Code):
- `memory_bootstrap` — pacote completo pra iniciar trabalho (canonical + facts + decisions + pendencies)
- `memory_search` — busca híbrida (cosine + TF-IDF)
- `memory_record_event` — append-only event com secret-scrubber automático
- `memory_write_fact` — fato atômico versionado com dedupe + audit
- `memory_get_decisions` / `memory_get_pending` / `memory_canonical_render` — leituras específicas
- `memory_add_relation` / `memory_get_neighbors` — grafo entidade↔entidade
- `memory_register_artifact` — commits/URLs/files com proveniência
- `memory_audit_history` / `memory_list_conflicts` — observabilidade

**HTTP REST** (alternativa): `http://127.0.0.1:7474` com Bearer token em `~/.esteira-agentes/runtime/memory-server-token`.

**Cliente Python**: `from esteira_memory import MemoryClient; mem = MemoryClient()`.

## 2. Boot sequence ao iniciar sessão

1. Identifique o que está sendo pedido em UMA frase.
2. Carregue o contexto do projeto:
   ```
   memory_bootstrap({ project_slug: "<slug>", task_query: "<tema>" })
   ```
3. Apresente o que encontrou em até 3 linhas.
4. Só então comece a trabalhar.

## 2.1 ANTES DE QUALQUER ALTERAÇÃO — checklist obrigatório

**Nunca** abra o código pra "entender de novo" o que já está na Mente. Antes de QUALQUER
`Edit`, `Write`, `NotebookEdit` ou comando de escrita, consulte a Mente sobre **três
dimensões** (o hook `pre-tool-use` BLOQUEIA writes sem consulta fresca <30min):

1. **Estado atual do projeto** — onde está hoje, quais decisões valem agora:
   ```
   memory_canonical_render({ project_slug: "<slug>" })
   memory_get_decisions({ project_slug: "<slug>", min_priority: 7 })
   ```
2. **Resumo da última sessão** — o que foi feito por último, o que ficou em aberto:
   ```
   memory_search({ project_slug: "<slug>", query: "última sessão <área-tocada>", top_k: 5 })
   memory_get_pending({ project_slug: "<slug>" })
   ```
3. **Modificações similares** — alguém já mexeu nessa área? Que padrão usou?
   ```
   memory_search({ project_slug: "<slug>", query: "<arquivo/módulo/símbolo a tocar>", top_k: 8 })
   ```

Se essas três consultas não foram feitas na sessão, o hook **bloqueia** a primeira
escrita com `rag_not_consulted_before_write`. Bash/Task ainda têm warn-warn-block —
mas Edit/Write batem na trave imediatamente. Isso é deliberado: re-análise de código
para "entender" o que já foi documentado é exatamente o desperdício a evitar.

## 3. Anotação contínua (REGRA DE OURO)

**TODA decisão técnica, convenção, restrição, gotcha, Q&A** vai pro RAG **no momento em que acontece**.
Não espere o fim da sessão.

```
memory_record_event({ source_type: "scribe_deposit", source_agent: "<seu-nome>",
                       project_slug: "<slug>", raw_text: "<descrição>",
                       payload: { category: "decision", title: "..." } })
```

Para fatos atômicos (1 frase = 1 fato):
```
memory_write_fact({ project_slug: "<slug>", fact_type: "decided",
                     subject_type: "project", subject_slug: "<slug>",
                     statement: "<frase>", confidence: 0.9 })
```

## 4. O que NÃO fazer

- Não esperar o "fim" pra anotar — anote no momento.
- Não chamar SQL direto — sempre via memory_*/rag-write/scribe.
- **Marco E**: NÃO fazer DELETE em `memory_canonical_audit` (append-only).
- **Marco E**: NÃO alterar `statement` de fact existente — use `supersedes`.
- **Marco E**: NÃO bypassar secret-scrubber em `record_event`.

## 5. Slash commands disponíveis

- `/buscar-contexto "pergunta"` — busca híbrida
- `/implementar <descrição>` — fluxo completo de UoW (TDD + git)
- `/corrigir-bug <descrição>` — fix com pendency linkada
- `/retro` — análise retrospectiva
- `/rag-status` — métricas do RAG
- `/rag-backup` — backup manual

---

*Gerado por `esteira-v3 init` em 2026-05-21.*
*Edite livremente — re-init não sobrescreve este arquivo.*
