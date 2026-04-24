const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const colaboradores = require('../data/colaboradores');

// Armazenamento em memória de tokens temporários (simulação de SAS Token do Azure)
const tokenStore = new Map();

function gerarTokenTemporario(filePath) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  tokenStore.set(token, { filePath, expiresAt });
  return { token, expiresAt };
}

function getDocumentos(cpf, tipo) {
  const storageBase = path.join(__dirname, '..', 'storage');
  const documentos = [];

  if (tipo === 'IR') {
    const anos = ['2024', '2025'];
    for (const ano of anos) {
      const fileName = `INF_${ano}_${cpf}.pdf`;
      const filePath = path.join(storageBase, 'IR', ano, fileName);
      if (fs.existsSync(filePath)) {
        const { token, expiresAt } = gerarTokenTemporario(filePath);
        documentos.push({
          id: `IR_${ano}_${cpf}`,
          nome: `Informe de Rendimentos ${ano}`,
          tipo: 'IR',
          ano,
          fileName,
          // Simula URL de Azure Blob Storage com SAS Token
          url: `http://localhost:3001/api/download?sv=2023-01-01&se=${encodeURIComponent(expiresAt.toISOString())}&sr=b&sp=r&sig=${token}`,
          expiresAt: expiresAt.toISOString()
        });
      }
    }
  } else if (tipo === 'BOLETO') {
    const periodos = [
      { ano: '2025', mes: '01', nomeMes: 'Janeiro/2025' }
    ];
    for (const { ano, mes, nomeMes } of periodos) {
      const fileName = `BLT_${mes}_${ano}_${cpf}.pdf`;
      const filePath = path.join(storageBase, 'BOLETOS', ano, mes, fileName);
      if (fs.existsSync(filePath)) {
        const { token, expiresAt } = gerarTokenTemporario(filePath);
        documentos.push({
          id: `BOLETO_${ano}_${mes}_${cpf}`,
          nome: `Boleto do Plano de Saúde — ${nomeMes}`,
          tipo: 'BOLETO',
          ano,
          mes,
          fileName,
          url: `http://localhost:3001/api/download?sv=2023-01-01&se=${encodeURIComponent(expiresAt.toISOString())}&sr=b&sp=r&sig=${token}`,
          expiresAt: expiresAt.toISOString()
        });
      }
    }
  }

  return documentos;
}

router.get('/documentos/:cpf', (req, res) => {
  const { cpf } = req.params;
  const { tipo } = req.query;

  if (!tipo || !['IR', 'BOLETO'].includes(tipo)) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetro tipo inválido. Use IR ou BOLETO'
    });
  }

  const colaborador = colaboradores.find((c) => c.cpf === cpf);
  if (!colaborador) {
    return res.status(404).json({
      success: false,
      message: 'Colaborador não encontrado'
    });
  }

  const documentos = getDocumentos(cpf, tipo);

  if (documentos.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Documento não localizado'
    });
  }

  return res.json({ success: true, documentos });
});

// Endpoint de download com validação de token (simula acesso via SAS Token)
router.get('/download', (req, res) => {
  const { sig: token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token não fornecido' });
  }

  const tokenData = tokenStore.get(token);

  if (!tokenData) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  if (new Date() > tokenData.expiresAt) {
    tokenStore.delete(token);
    return res.status(401).json({ message: 'Token expirado' });
  }

  if (!fs.existsSync(tokenData.filePath)) {
    return res.status(404).json({ message: 'Arquivo não encontrado' });
  }

  res.download(tokenData.filePath);
});

module.exports = router;
