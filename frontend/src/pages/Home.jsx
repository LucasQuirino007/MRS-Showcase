import React from 'react';

const opcoes = [
  {
    id: 'IR',
    titulo: 'Informe de Rendimentos',
    descricao:
      'Acesse seus informes anuais de rendimentos para declaração do Imposto de Renda (anos 2024 e 2025).',
    icone: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  },
  {
    id: 'BOLETO',
    titulo: 'Boleto do Plano de Saúde',
    descricao:
      'Consulte e baixe os boletos mensais do seu plano de saúde corporativo.',
    icone: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    )
  }
];

function Home({ onSelecionarTipo }) {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao Portal do Colaborador</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Selecione o tipo de documento que deseja acessar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {opcoes.map((opcao) => (
          <button
            key={opcao.id}
            onClick={() => onSelecionarTipo(opcao.id)}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:shadow-md hover:border-blue-400 transition-all duration-200 group"
          >
            <div className="mb-4">{opcao.icone}</div>
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 mb-2">
              {opcao.titulo}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{opcao.descricao}</p>
            <div className="mt-5 flex items-center gap-1 text-blue-600 text-sm font-medium">
              Acessar
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
