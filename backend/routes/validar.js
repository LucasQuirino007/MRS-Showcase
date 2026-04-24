const express = require('express');
const router = express.Router();
const colaboradores = require('../data/colaboradores');

router.post('/validar-colaborador', (req, res) => {
  const { matricula, cpf, dataNascimento, dataAdmissao } = req.body;

  if (!matricula || !cpf || !dataNascimento || !dataAdmissao) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }

  const cpfLimpo = String(cpf).replace(/\D/g, '');

  const colaborador = colaboradores.find(
    (c) =>
      c.matricula === String(matricula).trim() &&
      c.cpf === cpfLimpo &&
      c.dataNascimento === dataNascimento &&
      c.dataAdmissao === dataAdmissao
  );

  if (colaborador) {
    return res.json({
      success: true,
      nome: colaborador.nome,
      cpf: colaborador.cpf
    });
  }

  return res.status(404).json({
    success: false,
    message: 'Pessoa não localizada'
  });
});

module.exports = router;
