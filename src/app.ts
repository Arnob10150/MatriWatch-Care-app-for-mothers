import express from "express";
import * as pinoHttpModule from "pino-http";

const pinoHttp = (pinoHttpModule as unknown as { default?: Function }).default
  ? (pinoHttpModule as unknown as { default: (...args: any[]) => any }).default
  : (pinoHttpModule as unknown as (...args: any[]) => any);

const app = express();

app.use(pinoHttp());

app.get("/", (_req, res) => {
  res.send("MatriWatch API is running");
});

export default app;
