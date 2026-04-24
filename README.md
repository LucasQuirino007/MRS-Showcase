# Portal do Colaborador — MRS Showcase

Aplicação demonstrativa do Portal do Colaborador MRS, permitindo acesso a **Informes de Rendimentos** e **Boletos do Plano de Saúde** mediante validação de dados cadastrais.

## Estrutura do Projeto

```
MRS Showcase/
├── backend/          # Node.js + Express (porta 3001)
│   ├── data/         # Dados mockados dos colaboradores
│   ├── routes/       # Endpoints da API
│   └── storage/      # Simulação do Azure Blob Storage
│       ├── IR/
│       │   ├── 2024/
│       │   └── 2025/
│       └── BOLETOS/
│           └── 2025/01/
└── frontend/         # React + Vite (porta 3000)
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Como Rodar

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Servidor disponível em `http://localhost:3001`

### 2. Frontend

Abra um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em `http://localhost:3000`

## Dados de Teste

| Matrícula | CPF            | Data de Nascimento | Data de Admissão | Nome            |
|-----------|----------------|--------------------|------------------|-----------------|
| 001234    | 123.456.789-09 | 1985-03-15         | 2010-06-01       | João Silva      |
| 002345    | 987.654.321-00 | 1990-07-22         | 2015-01-10       | Maria Santos    |
| 003456    | 111.222.333-44 | 1978-11-08         | 2005-08-20       | Carlos Oliveira |
| 004567    | 444.555.666-77 | 1995-02-14         | 2020-03-01       | Ana Rodrigues   |
| 005678    | 777.888.999-11 | 1982-09-30         | 2008-11-15       | Pedro Costa     |

## Endpoints da API

| Método | Rota                          | Descrição                                        |
|--------|-------------------------------|--------------------------------------------------|
| POST   | `/api/validar-colaborador`    | Valida identidade por matrícula, CPF e datas     |
| GET    | `/api/documentos/:cpf?tipo=`  | Retorna lista de documentos (`IR` ou `BOLETO`)   |
| GET    | `/api/download?sv=...&sig=`   | Download do arquivo via token temporário (SAS)   |

## Simulação de SAS Token (Azure Blob Storage)

O endpoint `/api/download` simula o comportamento de um **Azure Blob Storage SAS Token**:

- Cada documento recebe um UUID único como `sig` na URL
- Os tokens expiram em **30 minutos**
- Tokens inválidos ou expirados retornam `401 Unauthorized`

## Tecnologias

**Backend:** Node.js · Express · UUID · CORS  
**Frontend:** React 18 · Vite · Tailwind CSS
