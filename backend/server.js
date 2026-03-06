const pool = require("./db");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor Rodando");
});

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});

app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao conectar no banco"});
    }
});
app.post("/boloes", async (req, res) => {
  try {
    const { titulo, valor_cota, total_cotas, data_sorteio } = req.body;

    const query = `
      INSERT INTO boloes 
      (titulo, valor_cota, total_cotas, cotas_vendidas, data_sorteio, status)
      VALUES ($1, $2, $3, 0, $4, 'ATIVO')
      RETURNING *
    `;

    const values = [titulo, valor_cota, total_cotas, data_sorteio];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);

  } catch (error) {

    if (error.code === "23505") {
      return res.status(400).json({
        error: "Já existe um bolão com esse título"
      });
    }
    console.error(error);
    res.status(500).json({ error: "Erro ao criar bolão" });
  }
});
app.post("/boloes/:id/comprar", async (req, res) => {
  try {
    const { id } = req.params;
    //buscar o bolão 
    const bolaoresult = await pool.query(
      "SELECT * FROM boloes WHERE id = $1",
      [id]
    );

    if (bolaoresult.rows.length === 0) {
      return res.status(404).json({ error: "Bolão não encontrado" });
    }

    const bolao = bolaoresult.rows[0];

    //verificar se ja esta encerrrando
    if (bolao.status === "ENCERRANDO") {
      return res.status(400).json({ error: "Bolão já encerrado"});
    }

    //atualizar cotas vendidas
    const updateResult = await pool.query(
      `UPDATE boloes
      SET cotas_vendidas = cotas_vendidas + 1
      WHERE id = $1
      AND cotas_vendidas < total_cotas
      RETURNING*
      `,
      [id]
    );

    const bolaoAtualizado = updateResult.rows[0];

    // se atingiu o limite , encerrar
    if (bolaoAtualizado.cotas_vendidas >= bolaoAtualizado.total_cotas) {
      await pool.query(
        "UPDATE boloes SET status = 'ENCERRADO' WHERE id = $1",
        [id]
      );
      bolaoAtualizado.status = "ENCERRADO";
    }
    
    res.json(bolaoAtualizado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error:"Erro ao comprar cota"});
  }
});
app.get("/boloes/ativos", async (req, res) => {
  // melhorias no sistema de rota (agora melhorada)
  try {
    const result = await pool.query(
    `
    SELECT 
      id,
      titulo,
      valor_cota,
      cotas_vendidas,
      (total_cotas - cotas_vendidas) AS cotas_restantes,
      ROUND((cotas_vendidas::decimal / total_cotas) * 100, 2) AS porcentagem_preenchida,
      data_sorteio
      FROM boloes
      WHERE status = 'ATIVO'
      ORDER BY data_sorteio ASC
      `
    );
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar bolões ativos"});
  }
});