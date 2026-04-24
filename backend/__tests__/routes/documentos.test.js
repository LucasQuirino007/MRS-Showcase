const request = require('supertest');
const express = require('express');
const fs = require('fs');

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('uuid', () => ({ v4: jest.fn() }));

jest.mock('../../data/colaboradores', () => [
  {
    matricula: '001234',
    cpf: '12345678909',
    dataNascimento: '1985-03-15',
    dataAdmissao: '2010-06-01',
    nome: 'João Silva'
  }
]);

// ─── Constantes ───────────────────────────────────────────────────────────────

const FIXED_TOKEN = 'fixed-test-token-uuid-1234-abcd';
const VALID_CPF = '12345678909';
const INVALID_CPF = '99999999999';

// ─── Setup do app ─────────────────────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid');
const documentosRoute = require('../../routes/documentos');

/**
 * Cria instância do Express com o mock de res.download para evitar
 * leitura real do sistema de arquivos durante os testes de download.
 */
function createApp() {
  const app = express();
  app.use(express.json());

  // Intercepta res.download antes que a rota o invoque
  app.use((req, res, next) => {
    res.download = jest.fn((_filePath, cb) => {
      res.status(200).send('PDF content mock');
      if (typeof cb === 'function') cb();
    });
    next();
  });

  app.use('/api', documentosRoute);
  return app;
}

// ─── Suite: GET /api/documentos/:cpf ─────────────────────────────────────────

describe('GET /api/documentos/:cpf', () => {
  let app;
  let existsSyncSpy;

  beforeEach(() => {
    uuidv4.mockReturnValue(FIXED_TOKEN);
    app = createApp();
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Validação do parâmetro `tipo` ────────────────────────────────────────

  describe('validação do parâmetro tipo', () => {
    it('deve retornar 400 quando o parâmetro tipo não é informado', async () => {
      // Arrange
      const url = `/api/documentos/${VALID_CPF}`;

      // Act
      const res = await request(app).get(url);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Parâmetro tipo inválido. Use IR ou BOLETO');
    });

    it('deve retornar 400 quando o parâmetro tipo é inválido', async () => {
      // Arrange
      const url = `/api/documentos/${VALID_CPF}?tipo=XPTO`;

      // Act
      const res = await request(app).get(url);

      // Assert
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Parâmetro tipo inválido. Use IR ou BOLETO');
    });

    it.each([['IR'], ['BOLETO']])(
      'deve aceitar tipo=%s como válido (não retorna 400)',
      async (tipo) => {
        // Arrange
        existsSyncSpy.mockReturnValue(false);

        // Act
        const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=${tipo}`);

        // Assert — 400 NÃO deve ocorrer (pode ser 404 por falta de arquivo)
        expect(res.status).not.toBe(400);
      }
    );
  });

  // ── Validação do colaborador ─────────────────────────────────────────────

  describe('validação do colaborador', () => {
    it('deve retornar 404 quando o CPF não está cadastrado', async () => {
      // Arrange
      const url = `/api/documentos/${INVALID_CPF}?tipo=IR`;

      // Act
      const res = await request(app).get(url);

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Colaborador não encontrado');
    });

    it('não deve verificar arquivos quando o CPF é inválido', async () => {
      // Arrange
      const url = `/api/documentos/${INVALID_CPF}?tipo=IR`;

      // Act
      await request(app).get(url);

      // Assert — existsSync nunca deve ser chamado para CPF inválido
      expect(existsSyncSpy).not.toHaveBeenCalled();
    });
  });

  // ── Informes de Rendimentos (IR) ─────────────────────────────────────────

  describe('tipo=IR', () => {
    it('deve retornar 200 com 2 informes quando arquivos de 2024 e 2025 existem', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documentos).toHaveLength(2);
    });

    it('deve retornar informes dos anos 2024 e 2025', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      const anos = res.body.documentos.map((d) => d.ano);
      expect(anos).toContain('2024');
      expect(anos).toContain('2025');
    });

    it('deve retornar apenas o informe existente quando somente 2024 está disponível', async () => {
      // Arrange — primeiro existsSync (2024) retorna true, segundo (2025) retorna false
      existsSyncSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.documentos).toHaveLength(1);
      expect(res.body.documentos[0].ano).toBe('2024');
    });

    it('deve retornar 404 quando nenhum informe está disponível', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(false);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Documento não localizado');
    });

    it('cada documento deve conter os campos obrigatórios', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      for (const doc of res.body.documentos) {
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('nome');
        expect(doc).toHaveProperty('tipo', 'IR');
        expect(doc).toHaveProperty('ano');
        expect(doc).toHaveProperty('fileName');
        expect(doc).toHaveProperty('url');
        expect(doc).toHaveProperty('expiresAt');
      }
    });

    it('a URL do documento deve simular um SAS token com o UUID gerado', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      for (const doc of res.body.documentos) {
        expect(doc.url).toContain(`sig=${FIXED_TOKEN}`);
        expect(doc.url).toContain('sv=');
        expect(doc.url).toContain('se=');
      }
    });

    it('o nome do arquivo deve seguir o padrão INF_<ANO>_<CPF>.pdf', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      for (const doc of res.body.documentos) {
        expect(doc.fileName).toMatch(/^INF_\d{4}_\d+\.pdf$/);
        expect(doc.fileName).toContain(VALID_CPF);
      }
    });

    it('expiresAt deve ser uma data ISO válida no futuro', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);
      const before = new Date();

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);

      // Assert
      for (const doc of res.body.documentos) {
        const expiry = new Date(doc.expiresAt);
        expect(expiry.toISOString()).toBe(doc.expiresAt);
        expect(expiry.getTime()).toBeGreaterThan(before.getTime());
      }
    });
  });

  // ── Boletos do Plano de Saúde (BOLETO) ──────────────────────────────────

  describe('tipo=BOLETO', () => {
    it('deve retornar 200 com 1 boleto quando o arquivo de janeiro/2025 existe', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=BOLETO`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documentos).toHaveLength(1);
      expect(res.body.documentos[0].tipo).toBe('BOLETO');
    });

    it('deve retornar 404 quando nenhum boleto está disponível', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(false);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=BOLETO`);

      // Assert
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Documento não localizado');
    });

    it('o nome do arquivo deve seguir o padrão BLT_<MES>_<ANO>_<CPF>.pdf', async () => {
      // Arrange
      existsSyncSpy.mockReturnValue(true);

      // Act
      const res = await request(app).get(`/api/documentos/${VALID_CPF}?tipo=BOLETO`);

      // Assert
      expect(res.body.documentos[0].fileName).toMatch(/^BLT_\d{2}_\d{4}_\d+\.pdf$/);
      expect(res.body.documentos[0].fileName).toContain(VALID_CPF);
    });
  });
});

// ─── Suite: GET /api/download ─────────────────────────────────────────────────

describe('GET /api/download', () => {
  let app;
  let existsSyncSpy;

  beforeEach(() => {
    uuidv4.mockReturnValue(FIXED_TOKEN);
    app = createApp();
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper: gera um token válido no tokenStore fazendo uma chamada
   * real ao endpoint /documentos com existsSync mockado para true.
   */
  async function gerarTokenValido() {
    existsSyncSpy.mockReturnValue(true);
    await request(app).get(`/api/documentos/${VALID_CPF}?tipo=IR`);
  }

  // ── Token ausente ou inválido ────────────────────────────────────────────

  it('deve retornar 400 quando o parâmetro sig não é informado', async () => {
    // Act
    const res = await request(app).get('/api/download');

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token não fornecido');
  });

  it('deve retornar 401 quando o token não existe no store', async () => {
    // Act
    const res = await request(app).get('/api/download?sig=token-que-nao-existe');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido');
  });

  // ── Token expirado ───────────────────────────────────────────────────────

  it('deve retornar 401 quando o token está expirado', async () => {
    // Arrange — gera o token com expiração real
    await gerarTokenValido();

    // Avança o Date para 31 minutos no futuro
    const RealDate = global.Date;
    const futureTimestamp = RealDate.now() + 31 * 60 * 1000;

    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(futureTimestamp);
        else super(...args);
      }
      static now() {
        return futureTimestamp;
      }
    }

    global.Date = MockDate;

    try {
      // Act
      const res = await request(app).get(`/api/download?sig=${FIXED_TOKEN}`);

      // Assert
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token expirado');
    } finally {
      global.Date = RealDate;
    }
  });

  it('deve remover o token do store após expiração', async () => {
    // Arrange
    await gerarTokenValido();

    const RealDate = global.Date;
    const futureTimestamp = RealDate.now() + 31 * 60 * 1000;

    class MockDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(futureTimestamp);
        else super(...args);
      }
      static now() {
        return futureTimestamp;
      }
    }

    global.Date = MockDate;

    try {
      // Act — primeira chamada expira e remove o token
      await request(app).get(`/api/download?sig=${FIXED_TOKEN}`);

      // Act — segunda chamada com o mesmo token (agora removido)
      const res = await request(app).get(`/api/download?sig=${FIXED_TOKEN}`);

      // Assert — deve ser 401 "inválido", não "expirado"
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token inválido');
    } finally {
      global.Date = RealDate;
    }
  });

  // ── Arquivo não encontrado ───────────────────────────────────────────────

  it('deve retornar 404 quando o arquivo não existe no storage', async () => {
    // Arrange — token criado com arquivo "existente", depois arquivo some
    await gerarTokenValido();
    existsSyncSpy.mockReturnValue(false);

    // Act
    const res = await request(app).get(`/api/download?sig=${FIXED_TOKEN}`);

    // Assert
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Arquivo não encontrado');
  });

  // ── Download bem-sucedido ────────────────────────────────────────────────

  it('deve retornar 200 e chamar res.download quando o token é válido', async () => {
    // Arrange
    await gerarTokenValido();
    existsSyncSpy.mockReturnValue(true);

    // Act
    const res = await request(app).get(`/api/download?sig=${FIXED_TOKEN}`);

    // Assert
    expect(res.status).toBe(200);
  });

  it('deve passar o caminho correto do arquivo para res.download', async () => {
    // Arrange
    await gerarTokenValido();
    existsSyncSpy.mockReturnValue(true);

    let downloadedPath = null;
    const appWithSpy = express();
    appWithSpy.use(express.json());
    appWithSpy.use((req, res, next) => {
      res.download = jest.fn((filePath) => {
        downloadedPath = filePath;
        res.status(200).send('ok');
      });
      next();
    });
    appWithSpy.use('/api', documentosRoute);

    // Act
    await request(appWithSpy).get(`/api/download?sig=${FIXED_TOKEN}`);

    // Assert
    expect(downloadedPath).toContain(VALID_CPF);
    expect(downloadedPath).toMatch(/\.pdf$/);
  });
});
