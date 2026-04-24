import React, { useState } from 'react';
import { validarColaborador, buscarDocumentos } from '../services/api';

const titulos = {
  IR: 'Informe de Rendimentos',
  BOLETO: 'Boleto do Plano de Saúde'
};

function formatarCPF(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function FormValidacao({ tipoDocumento, onSucesso, onVoltar }) {
  const [form, setForm] = useState({
    matricula: '',
    cpf: '',
    dataNascimento: '',
    dataAdmissao: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErro(null);
    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatarCPF(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await validarColaborador(form);
      const { documentos } = await buscarDocumentos(resultado.cpf, tipoDocumento);
      onSucesso(resultado, documentos);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        {/* Cabeçalho */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-sm mb-5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>

          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {titulos[tipoDocumento]}
          </span>
          <h2 className="text-xl font-bold text-slate-800">Validação de Identidade</h2>
          <p className="text-slate-500 text-sm mt-1">
            Preencha seus dados cadastrais para acessar os documentos.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              name="matricula"
              value={form.matricula}
              onChange={handleChange}
              placeholder="Ex: 001234"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
              inputMode="numeric"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data de Admissão
            </label>
            <input
              type="date"
              name="dataAdmissao"
              value={form.dataAdmissao}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-red-700 text-sm">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Validando...
              </span>
            ) : (
              'Enviar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormValidacao;
