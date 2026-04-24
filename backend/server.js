const express = require('express');
const cors = require('cors');

const validarRoute = require('./routes/validar');
const documentosRoute = require('./routes/documentos');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', validarRoute);
app.use('/api', documentosRoute);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor MRS rodando na porta ${PORT}`);
});
