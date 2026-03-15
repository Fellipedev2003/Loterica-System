const express = require("express");
const router = express.Router();

const boloesController = require("../controllers/boloesController");

router.get("/ativos", boloesController.listarBoloesAtivos);
module.exports = router;