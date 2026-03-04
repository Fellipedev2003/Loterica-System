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
    console.error(error);
    res.status(500).json({ error: "Erro ao criar bolão" });
  }
});