import express from "express";

import bodyParser = require("body-parser");
import { tempData } from "./temp-data";

const app = express();

const PORT = 8888;

const PAGE_SIZE = 5;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("dev api status - up");
});

app.get("/api/match", (req, res) => {
  const page = req.query.page ;
  console.log(req.query.page)
  const paginatedData = tempData.slice(
    (Number(page) - 1) * PAGE_SIZE,
    Number(page) * PAGE_SIZE
  );

  res.send(paginatedData);
});

app.listen(PORT);
console.log("server running", PORT);
