const db = require("../config/db") ; 
async function listarBoloesAtivos(req, res) {

    try {

        const resultado = await db.query(`
            SELECT
            id,
            titulo,
            valor_cota,
            total_cotas,
            cotas_vendidas,
            (total_cotas - cotas_vendidas) AS cotas_restantes,
            ROUND((cotas_vendidas * 100.0 / total_cotas), 2) AS porcentagem_preenchida,
            data_sorteio
            FROM boloes 
            WHERE status = 'ATIVO'
            ORDER BY data_sorteio ASC
            `);
            res.json(resultado.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar bolões"});

    }
    
}
module.exports = {
    listarBoloesAtivos
};