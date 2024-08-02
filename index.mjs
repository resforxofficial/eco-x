import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
dotenv.config();

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySetting: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
  generationConfig: { responseMimeType: "application/json" },
});

const port = 3000;
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, ".", "html")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, ".", "html", "index.html"));
});

app.get("/eco_games", (req, res) => {
  res.sendFile(path.join(__dirname, ".", "html", "ecogame.html"));
});

app.post("/ask", async (req, res) => {
  /** @type {string} */
  const question = req.body.question;

  try {
    const prompt = `When answering, don't answer in a format, just answer in sentences in plain text. But please do it in Korean and give a little more explanation.`;

    const result = model.generateContent([prompt, question]);
    const response = (await result).response;
    const ans = JSON.parse(response.text());

    const answer = ans[Object.keys(ans)[0]];

    // console.log(response, answer);

    res.json({ answer });
  } catch (e) {
    console.error(String(e));
    res.status(500).json({ error: "failed" });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
