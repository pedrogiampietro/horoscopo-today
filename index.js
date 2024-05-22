const express = require("express");
const app = express();
const horoscopeRoutes = require("./src/routes/horoscope.routes");
const { executeJob } = require("./src/utils/scrapper");
const cron = require("node-cron");

app.use(express.json());

app.use("/api/horoscopes", horoscopeRoutes);

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Executando scraping dos horóscopos...");
    executeJob();
    console.log("Scraping concluído.");
  } catch (error) {
    console.error("Erro ao executar scraping dos horóscopos:", error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
