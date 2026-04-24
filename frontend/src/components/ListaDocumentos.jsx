import React, { useState, useMemo } from 'react';

const titulos = {
  IR: 'Informes de Rendimentos',
  BOLETO: 'Boletos do Plano de Saúde'
};

function formatarExpiracao(isoString) {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function ListaDocumentos({ colaborador, documentos, tipoDocumento, onVoltar, onVoltarHome }) {
  const [anoSelecionado, setAnoSelecionado] = useState('');

  const anosDisponiveis = useMemo(() => {
    if (tipoDocumento !== 'IR') return [];
    return [...new Set(documentos.map((d) => d.ano))].sort((a, b) => b - a);
  }, [documentos, tipoDocumento]);

  const documentosFiltrados = useMemo(() => {
    if (tipoDocumento !== 'IR' || !anoSelecionado) return documentos;
    return documentos.filter((d) => String(d.ano) === anoSelecionado);
  }, [documentos, tipoDocumento, anoSelecionado]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {/* Navegação */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <button
            type="button"
            onClick={onVoltarHome}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Início
          </button>
        </div>

        {/* Banner de sucesso */}
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-green-800 font-semibold text-sm">Identidade confirmada</p>
            <p className="text-green-600 text-sm">Bem-vindo(a), {colaborador?.nome}</p>
          </div>
        </div>

        {/* Título e filtro de ano */}
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{titulos[tipoDocumento]}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {documentosFiltrados.length} documento(s) disponível(is)
            </p>
          </div>

          {tipoDocumento === 'IR' && anosDisponiveis.length > 1 && (
            <div className="flex-shrink-0">
              <label htmlFor="filtro-ano" className="block text-xs font-medium text-slate-600 mb-1">
                Filtrar por ano
              </label>
              <select
                id="filtro-ano"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Todos</option>
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        <div className="space-y-3">
          {documentosFiltrados.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{doc.nome}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Link expira às {formatarExpiracao(doc.expiresAt)}
                  </p>
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors whitespace-nowrap ml-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Baixar
              </a>
            </div>
          ))}
        </div>

        {/* Aviso de expiração */}
        <div className="mt-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-700 text-xs">
            Os links de acesso são temporários e expiram em <strong>30 minutos</strong> por questão de segurança.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ListaDocumentos;
