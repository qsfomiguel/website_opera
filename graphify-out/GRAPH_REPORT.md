# Graph Report - .  (2026-09-03)

## Corpus Check
- Corpus is ~1,954 words - fits in a single context window. You may not need a graph.

## Summary
- 21 nodes · 26 edges · 4 communities
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.91)
- Token cost: 52,477 input · 0 output

## Community Hubs (Navigation)
- Work Grid — Other Projects
- Page Templates & Data Lists
- Vendas Novas / Palacete Cross-Refs
- Piscinas do Mar (Featured Project)

## God Nodes (most connected - your core abstractions)
1. `projects Data List` - 10 edges
2. `Main Page Component (DCLogic)` - 4 edges
3. `selectedWork Data List` - 4 edges
4. `Project Detail Page Component (DCLogic)` - 4 edges
5. `Work Page Component (DCLogic)` - 4 edges
6. `Piscinas do Mar (Main selectedWork entry)` - 3 edges
7. `Piscinas do Mar Project Detail Page` - 3 edges
8. `Piscinas do Mar (Work projects entry)` - 3 edges
9. `Complexo Escolar de Vendas Novas (Main selectedWork entry)` - 2 edges
10. `Reabilitação do Palacete (Main selectedWork entry)` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Main Page Component (DCLogic)` --semantically_similar_to--> `Project Detail Page Component (DCLogic)`  [INFERRED] [semantically similar]
  Main.dc.html → ProjectDetail.dc.html
- `Main Page Component (DCLogic)` --semantically_similar_to--> `Work Page Component (DCLogic)`  [INFERRED] [semantically similar]
  Main.dc.html → Work.dc.html
- `Work Page Component (DCLogic)` --semantically_similar_to--> `Project Detail Page Component (DCLogic)`  [INFERRED] [semantically similar]
  Work.dc.html → ProjectDetail.dc.html
- `Piscinas do Mar (Main selectedWork entry)` --shares_data_with--> `Piscinas do Mar Project Detail Page`  [INFERRED]
  Main.dc.html → ProjectDetail.dc.html
- `Piscinas do Mar (Main selectedWork entry)` --shares_data_with--> `Piscinas do Mar (Work projects entry)`  [INFERRED]
  Main.dc.html → Work.dc.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared DCLogic Component Template Pattern** — main_dc_component, projectdetail_dc_component, work_dc_component [INFERRED 0.85]
- **Piscinas do Mar Project Entity Across Site** — main_dc_piscinas_do_mar, work_dc_piscinas_do_mar, projectdetail_dc_piscinas_do_mar [INFERRED 0.95]

## Communities (4 total, 0 thin omitted)

### Community 0 - "Work Grid — Other Projects"
Cohesion: 0.29
Nodes (7): Escola Sttau Monteiro (Work projects entry), Habitação Municipal de Benavente (Work projects entry), Habitação — Tercena (Work projects entry), Parque Arqueológico da Quinta do Almaraz (Work projects entry), Pavilhão Desportivo — Campo de Ourique (Work projects entry), projects Data List, Unidade de Saúde de Telheiras (Work projects entry)

### Community 1 - "Page Templates & Data Lists"
Cohesion: 0.40
Nodes (6): Main Page Component (DCLogic), facts Data List, Project Detail Page Component (DCLogic), gallery Data List, Work Page Component (DCLogic), tags Data List (filter categories)

### Community 2 - "Vendas Novas / Palacete Cross-Refs"
Cohesion: 0.40
Nodes (5): Complexo Escolar de Vendas Novas (Main selectedWork entry), Reabilitação do Palacete (Main selectedWork entry), selectedWork Data List, Complexo Escolar de Vendas Novas (Work projects entry), Reabilitação do Palacete (Work projects entry)

### Community 3 - "Piscinas do Mar (Featured Project)"
Cohesion: 1.00
Nodes (3): Piscinas do Mar (Main selectedWork entry), Piscinas do Mar Project Detail Page, Piscinas do Mar (Work projects entry)

## Knowledge Gaps
- **9 isolated node(s):** `facts Data List`, `gallery Data List`, `tags Data List (filter categories)`, `Habitação Municipal de Benavente (Work projects entry)`, `Unidade de Saúde de Telheiras (Work projects entry)` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `projects Data List` connect `Work Grid — Other Projects` to `Page Templates & Data Lists`, `Vendas Novas / Palacete Cross-Refs`, `Piscinas do Mar (Featured Project)`?**
  _High betweenness centrality (0.644) - this node is a cross-community bridge._
- **Why does `Work Page Component (DCLogic)` connect `Page Templates & Data Lists` to `Work Grid — Other Projects`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Why does `Main Page Component (DCLogic)` connect `Page Templates & Data Lists` to `Vendas Novas / Palacete Cross-Refs`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Main Page Component (DCLogic)` (e.g. with `Project Detail Page Component (DCLogic)` and `Work Page Component (DCLogic)`) actually correct?**
  _`Main Page Component (DCLogic)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Project Detail Page Component (DCLogic)` (e.g. with `Main Page Component (DCLogic)` and `Work Page Component (DCLogic)`) actually correct?**
  _`Project Detail Page Component (DCLogic)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Work Page Component (DCLogic)` (e.g. with `Main Page Component (DCLogic)` and `Project Detail Page Component (DCLogic)`) actually correct?**
  _`Work Page Component (DCLogic)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `facts Data List`, `gallery Data List`, `tags Data List (filter categories)` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._