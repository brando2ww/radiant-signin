

## Gerar Templates Demo para João Farias

Inserir 12 templates de tarefas operacionais típicas de restaurante, distribuídos nos 3 turnos padrão, para o usuário João Farias (`d0019cb8-f5a4-4e75-8bc4-4de8079afa69`).

### Templates a criar

| Turno | Tarefa | Responsável | Foto |
|-------|--------|-------------|------|
| **Abertura** | Ligar fogões e fornos | Cozinheiro | Não |
| **Abertura** | Verificar temperatura das geladeiras | Cozinheiro | Sim |
| **Abertura** | Limpar e higienizar bancadas | Auxiliar | Não |
| **Abertura** | Conferir estoque do dia | Estoquista | Não |
| **Tarde** | Repor descartáveis (copos, guardanapos) | Garçom | Não |
| **Tarde** | Limpar banheiros | Auxiliar | Sim |
| **Tarde** | Conferir validades dos insumos | Cozinheiro | Não |
| **Tarde** | Organizar área de atendimento | Garçom | Não |
| **Fechamento** | Desligar fogões e fornos | Cozinheiro | Não |
| **Fechamento** | Limpar cozinha completa | Auxiliar | Sim |
| **Fechamento** | Fechar e conferir caixa | Caixa | Não |
| **Fechamento** | Verificar portas e janelas | Gerente | Não |

### Mudança

| Arquivo | Ação |
|---------|------|
| SQL direto (migration) | INSERT 12 rows em `operational_task_templates` |

