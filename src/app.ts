import express = require("express");
const pinoHttp = require("pino-http");

const app = express();

app.use(pinoHttp());

app.get("/", (_req, res) => {
  res.send("MatriWatch API is running");
});

export default app;
