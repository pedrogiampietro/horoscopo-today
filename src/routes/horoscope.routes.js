const express = require("express");
const router = express.Router();
const { getHoroscopes } = require("../services/horoscopeService");

router.get("/", async (req, res) => {
  try {
    const horoscopes = await getHoroscopes();
    res.json(horoscopes);
  } catch (error) {
    console.error("Erro ao buscar horóscopos:", error.message);
    res.status(500).json({ error: "Erro ao buscar horóscopos" });
  }
});

module.exports = router;
