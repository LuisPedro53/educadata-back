const { poolPromise } = require("../db.js");
const sql = require("mssql");

async function getAlunos(filter) {
  try {
    const pool = await poolPromise;

    if (!pool) {
      throw new Error("Erro: pool é undefined");
    }

    let query = "SELECT * FROM ALUNOS WHERE 1=1";
    const parameters = {};

    if (filter.nmAluno) {
      query += " AND nmAluno = @nmAluno";
      parameters.nmAluno = filter.nmAluno;
    }
    if (filter.cpfAluno) {
      query += " AND cpfAluno = @cpfAluno";
      parameters.cpfAluno = filter.cpfAluno;
    }
    if (filter.emailAluno) {
      query += " AND emailAluno = @emailAluno";
      parameters.emailAluno = filter.emailAluno;
    }

    const request = pool.request();
    for (const [key, value] of Object.entries(parameters)) {
      request.input(key, sql.VarChar, value);
    }

    const result = await request.query(query);

    if (!result || !result.recordset) {
      throw new Error("Nenhum resultado encontrado na consulta");
    }

    return result.recordset;
  } catch (err) {
    console.error("Erro ao obter alunos", err);
    throw err;
  }
}

async function createAluno(aluno) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nmAluno", sql.VarChar, aluno.nmAluno)
      .input("cpfAluno", sql.VarChar, aluno.cpfAluno)
      .input("emailAluno", sql.VarChar, aluno.emailAluno)
      .query(
        "INSERT INTO Alunos (nmAluno, cpfAluno, emailAluno) VALUES (@nmAluno, @cpfAluno, @emailAluno)"
      );

    const queryResult = await pool
      .request()
      .query("SELECT TOP 1 * FROM Alunos ORDER BY cdAluno DESC");

    return queryResult.recordset[0];
  } catch (err) {
    console.error("Erro ao criar aluno", err.message);
    throw new Error("Falha ao criar aluno: " + err.message);
  }
}

module.exports = { getAlunos, createAluno };