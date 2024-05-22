const { supabase } = require("../config/supabase");

const getHoroscopes = async () => {
  try {
    const { data: horoscopes, error } = await supabase
      .from("horoscopes")
      .select("date, text");
    if (error) {
      throw error;
    }
    return horoscopes;
  } catch (error) {
    throw error;
  }
};

module.exports = { getHoroscopes };
