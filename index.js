require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const { createClient } = require("@supabase/supabase-js");
const cron = require("node-cron");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = process.env.BASE_URL;

const getFormattedDate = () => {
  const date = moment().format("YYYY/MM/DD");
  const day = moment().format("DD");
  const month = moment().format("MM");
  const year = moment().format("YYYY");
  return `${year}/${month}/${day}/horoscopo-do-dia-${day}-${month}-${year}`;
};

const scrapeHoroscope = async () => {
  const url = baseUrl + getFormattedDate();
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let whoWasBornToday = "";
    let alert = "";
    let horoscopes = "";

    const article = $("article.post-details");
    let captureHoroscopes = false;

    article.find("p").each((i, element) => {
      const text = $(element).text().trim();

      if (text.startsWith("Quem nasceu hoje")) {
        whoWasBornToday = `${text}\n${$(element).next("p").text().trim()}`;
      } else if (text.startsWith("Alerta")) {
        alert = `${text}\n${$(element).next("p").text().trim()}`;
      } else if (
        text.startsWith("Áries") ||
        text.startsWith("Touro") ||
        text.startsWith("Gêmeos") ||
        text.startsWith("Câncer") ||
        text.startsWith("Leão") ||
        text.startsWith("Virgem") ||
        text.startsWith("Libra") ||
        text.startsWith("Escorpião") ||
        text.startsWith("Sagitário") ||
        text.startsWith("Capricórnio") ||
        text.startsWith("Aquário") ||
        text.startsWith("Peixes")
      ) {
        captureHoroscopes = true;
        horoscopes += `${text}\n`;
      } else if (captureHoroscopes) {
        horoscopes += `${text}\n`;
      }
    });

    return { whoWasBornToday, alert, horoscopes };
  } catch (error) {
    console.error(`Erro ao acessar a URL ${url}:`, error);
    return null;
  }
};

const saveToSupabase = async ({ whoWasBornToday, alert, horoscopes }) => {
  const date = moment().format("YYYY-MM-DD");
  const text = `${whoWasBornToday}\n\n${alert}\n\n${horoscopes}`;

  const { data, error } = await supabase
    .from("horoscopes")
    .insert([{ date, text }]);

  if (error) {
    console.error("Erro ao inserir dados no Supabase:", error);
  } else {
    console.log("Dados inseridos com sucesso:", data);
  }
};

const executeJob = async () => {
  const result = await scrapeHoroscope();
  if (result) {
    const { whoWasBornToday, alert, horoscopes } = result;

    console.log("Horóscopos de hoje:");
    console.log(whoWasBornToday);
    console.log(alert);
    console.log(horoscopes);

    saveToSupabase(result);
  } else {
    console.log("Não foi possível obter os horóscopos.");
  }
};

// Agendar o cron job para executar todos os dias às 09:00 AM
cron.schedule("0 9 * * *", () => {
  console.log("Executando job diário de scraping às 09:00 AM");
  executeJob();
});

// Para execução manual
if (process.env.RUN_ON_START === "true") {
  executeJob();
}
