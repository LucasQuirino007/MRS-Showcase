const API_BASE = '/api';

export async function validarColaborador(dados) {
  const response = await fetch(`${API_BASE}/validar-colaborador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao validar colaborador');
  }

  return data;
}

export async function buscarDocumentos(cpf, tipo, ano) {
  const params = new URLSearchParams({ tipo });
  if (ano) params.set('ano', ano);
  const response = await fetch(`${API_BASE}/documentos/${cpf}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Documento não localizado');
  }

  return data;
}
