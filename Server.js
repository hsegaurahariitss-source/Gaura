import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

const TWELVE_API_KEY = process.env.TWELVE_API_KEY;


app.get("/ihsg", async (req, res) => {
  try {
    const priceUrl = `https://api.twelvedata.com/time_series?symbol=JKSE&interval=1day&outputsize=7&apikey=${TWELVE_API_KEY}`;
    const priceRes = await fetch(priceUrl);
    const priceData = await priceRes.json();

    const prices = priceData.values?.map(d => parseFloat(d.close)).reverse();

    const rsiUrl = `https://api.twelvedata.com/rsi?symbol=JKSE&interval=1day&apikey=${TWELVE_API_KEY}`;
    const rsiRes = await fetch(rsiUrl);
    const rsiData = await rsiRes.json();

    const rsi = rsiData.values?.[0]?.rsi;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Kamu analis IHSG profesional."
          },
          {
            role: "user",
            content: `Data IHSG: ${prices}, RSI: ${rsi}. Berikan analisa lengkap.`
          }
        ]
      })
    });

    const aiData = await aiRes.json();

    res.json({
      prices,
      rsi,
      analysis: aiData.choices?.[0]?.message?.content
    });

  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(PORT, () => {
  console.log("Server jalan");
});
