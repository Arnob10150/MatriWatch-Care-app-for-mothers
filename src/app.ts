import express from "express";
import pinoHttp from "pino-http";

const app = express();

app.use(pinoHttp());

app.get("/", (_req, res) => {
  res.send("MatriWatch API is running");
});

export default app;
