## Fluxo Desejável para a Usabilidade
[ Extrato A Importado ]
│
▼
[ Geração do Plano N ] ───► Salvo no Banco de Dados (Status: Ativo)
│
▼
( Usuário opera o negócio / finanças durante o mês )
│
▼
[ Extrato B Importado ] ───► Sistema aplica regras locais e limpa os dados
│
▼
[ Análise de Acurácia ] ───► IA confronta as metas do Plano N com os dados reais do Extrato B
│
▼
[ Relatório + Plano N+1] ──► IA gera métricas de desvio, arquiva Plano N e cria o Plano N+1

#### Passo 1: Persistência do Plano N
Quando o usuário envia o **Extrato A**, a IA analisa o cenário e gera o **Plano Estratégico N**. Este plano é salvo estruturalmente no banco de dados:
```json
{
  "id_plano": "plano_001",
  "versao": "N",
  "data_criacao": "2026-05-21T07:30:00Z",
  "status": "Ativo",
  "metas": [
    { "id": "meta_1", "descricao": "Reduzir gastos com ferramentas SaaS", "teto_maximo": 1500.00 },
    { "id": "meta_2", "descricao": "Manter custo de marketing abaixo de", "teto_maximo": 5000.00 }
  ]
}

Passo 2: O Novo Upload (Extrato B)
Após o período de movimentação, o usuário realiza o upload do Extrato B. O sistema valida, limpa e registra as transações reais no banco de dados.

Passo 3: O Cálculo de Acurácia da Execução
Antes de gerar um novo plano, o backend busca o último plano que estava com o status "Ativo" (Plano N). O sistema compila os dados agregados do período real (Extrato B) e envia um prompt estruturado para a IA:

"Estes eram os objetivos definidos no Plano N. Estas são as transações reais consolidadas no período B. Realize o confronto dos dados."

Passo 4: O Relatório e Instrução de Desvios
A IA processa o cruzamento e gera um veredito baseado em evidências numéricas:

Métrica de Acurácia Geral: Ex: 82% de conformidade com o plano.

Alertas de Desvio: "Você não cumpriu a meta_2 (Marketing). O plano previa um teto de R$ 5.000,00, mas os lançamentos do Extrato B evidenciam um gasto total de R$ 5.750,00 (desvio de 15%)."

Ação: O Plano N muda de status para "Concluído/Arquivado" e o relatório de acurácia fica permanentemente atrelado a ele. Em seguida, a IA gera o Plano N+1 com base nas novas necessidades do saldo atual.

4. Nova Interface do Bloco do Plano Estratégico
Para suportar essa arquitetura persistente, o componente visual na Dashboard (/) precisa deixar de ser um bloco estático de texto e passar a operar com abas de controle de estado:

Aba 1: Plano Ativo (Foco em Execução)

Apresenta o plano atual estruturado em cartões ou checklist.

Mostra barras de progresso dinâmicas integrando os lançamentos do mês atual com os tetos recomendados pela IA.

Aba 2: Histórico de Planos e Evolução

Exibe uma linha do tempo (Timeline) ou menu colapsável (Accordion) listando os planos anteriores: Plano N-1, Plano N-2.

Ao clicar em um plano passado, o usuário visualiza o Relatório de Acurácia gerado naquela época, permitindo auditar o próprio comportamento financeiro ao longo dos meses.
"""

Salvar o conteúdo como arquivo markdown
file_name = "plano_implementacao_ia.md"
with open(file_name, "w", encoding="utf-8") as f:
f.write(markdown_content)

print(f"File {file_name} successfully created.")

O seu arquivo Markdown (.md) com o plano detalhado de implementação foi gerado com sucesso. Ele foi estruturado para servir de documentação limpa e direta para o seu projeto, separando a lógica determinística da inteligência artificial.

Seu arquivo MD (Markdown) está pronto
[file-tag: code-generated-file-0-1779359563793831098]

### Principais pontos incluídos no arquivo:
1. **Mapeamento de Rotas (UX):** Unificação e centralização das chamadas de IA na raiz (`/`) e redefinição da rota `user-space` para poupar o consumo desnecessário de tokens.
2. **Pipeline de Importação OFX:** Lógica backend para verificação de duplicidade (via Hash/Metadados), aplicação de regras estáticas de categorização criadas pelo usuário e interface com data de upload e exclusão em cascata.
3. **Loop de Feedback da IA:** Arquitetura lógica dividida em etapas cronológicas detalhadas (Plano N $\rightarrow$ Extrato B $\rightarrow$ Análise de Acurácia $\rightarrow$ Geração do Plano N+1).
4. **Interface da Dashboard:** Separação do bloco do Plano Estratégico em abas dinâmicas ("Plano Ativo" e "Histórico de Planos/Acurácia").