const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");

const baseUrl = "https://www.dircealves.com.br/da/";

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

    const horoscopes = [];

    const article = $("article.post-details");
    article.find("p").each((i, element) => {
      const text = $(element).text().trim();
      if (
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
        const sign = text.split(" – ")[0];
        const description = text.split(" – ")[1];
        horoscopes.push({ sign, description });
      }
    });

    return horoscopes;
  } catch (error) {
    console.error(`Erro ao acessar a URL ${url}:`, error);
    return null;
  }
};

scrapeHoroscope().then((horoscopes) => {
  if (horoscopes) {
    console.log("Horóscopos de hoje:");
    horoscopes.forEach((horoscope) => {
      console.log(`${horoscope.sign}: ${horoscope.description}`);
    });
  } else {
    console.log("Não foi possível obter os horóscopos.");
  }
});
