# Sistema de Alerta e Prevenção de Evasão Escolar

Plataforma desenvolvida para auxiliar coordenadores e gestores escolares no monitoramento e prevenção da evasão de alunos. O sistema gera alertas automatizados com base em métricas como número de faltas, desempenho acadêmico (notas) e dificuldades apontadas pelos estudantes.

## Tecnologias Utilizadas

- Backend: Node.js, Express, TypeScript
- Banco de Dados: PostgreSQL
- Hospedagem: Render
- Frontend: Estrutura reservada

## Funcionalidades Principais

O fluxo do sistema atende diretamente ao caminho do gestor escolar:

- Autenticação: Login restrito para coordenadores e gestão.
- Acompanhamento de Alunos: Visualização da base de alunos matriculados e seus respectivos status.
- Inserção de Dados: Cadastro de novas métricas de avaliação, faltas e relatos de dificuldades.
- Painel de Alertas: Classificação dos alunos em três estágios:
  - Regular: Dentro dos padrões de frequência e notas.
  - Em Suspeita: Queda de rendimento inicial ou aumento de faltas.
  - Em Risco: Dificuldades críticas associadas a faltas excessivas ou notas baixas.

## Estrutura do Repositório

- /frontend: Diretório reservado para a futura implementação da interface do usuário.
- /backend: Contém a API em Express/TypeScript, organizada em controladores, modelos e rotas.
- /database: Contém os scripts SQL para criação do esquema e tabelas no PostgreSQL.

## Como Executar Localmente

1. Clone o repositório:
 ```bash
 git clone <url-do-repositorio>

```

2. Na raiz do projeto, instale as dependências:
```bash
npm install
```


3. Configure o banco de dados:
* Certifique-se de ter o PostgreSQL rodando localmente.
* Execute o script localizado em `database/schema.sql` para criar as tabelas necessárias.
* Configure as variáveis de ambiente com as credenciais do seu banco de dados.


4. Inicie o servidor em ambiente de desenvolvimento, a partir da raiz:
```bash
npm run dev

```


Acesse `http://localhost:3000/login` no navegador para visualizar e testar o fluxo de telas provisórias do backend.

```

```
