import React, { useState } from 'react';
import Home from './pages/Home';
import FormValidacao from './components/FormValidacao';
import ListaDocumentos from './components/ListaDocumentos';

function App() {
  const [etapa, setEtapa] = useState('home'); // 'home' | 'form' | 'documentos'
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [documentos, setDocumentos] = useState([]);

  const handleSelecionarTipo = (tipo) => {
    setTipoDocumento(tipo);
    setEtapa('form');
  };

  const handleValidacaoSucesso = (dadosColaborador, docsEncontrados) => {
    setColaborador(dadosColaborador);
    setDocumentos(docsEncontrados);
    setEtapa('documentos');
  };

  const handleVoltarHome = () => {
    setEtapa('home');
    setTipoDocumento(null);
    setColaborador(null);
    setDocumentos([]);
  };

  const handleVoltarForm = () => {
    setEtapa('form');
    setColaborador(null);
    setDocumentos([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-900 font-bold text-xs">MRS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Portal do Colaborador</h1>
            <p className="text-blue-300 text-xs">MRS Logística</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {etapa === 'home' && (
          <Home onSelecionarTipo={handleSelecionarTipo} />
        )}
        {etapa === 'form' && (
          <FormValidacao
            tipoDocumento={tipoDocumento}
            onSucesso={handleValidacaoSucesso}
            onVoltar={handleVoltarHome}
          />
        )}
        {etapa === 'documentos' && (
          <ListaDocumentos
            colaborador={colaborador}
            documentos={documentos}
            tipoDocumento={tipoDocumento}
            onVoltar={handleVoltarForm}
            onVoltarHome={handleVoltarHome}
          />
        )}
      </main>

      <footer className="bg-blue-900 text-blue-300 text-center py-4 text-xs">
        &copy; {new Date().getFullYear()} MRS Logística &mdash; Portal do Colaborador
      </footer>
    </div>
  );
}

export default App;
