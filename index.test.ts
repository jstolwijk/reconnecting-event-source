import { ReconnectingEventSource } from "./index";

import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import SseStream from "ssestream";

const aTestServer = (): Express => {
  const app = express();

  const eventsHandler = (req: any, res: any, next: any) => {
    const sse = new SseStream(req);
    sse.pipe(res);

    const message = {
      data: "hello\nworld",
    };
    sse.write(message);
  };

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.get("/events", eventsHandler);

  return app;
};

const testServer = aTestServer();

const eventSource = new ReconnectingEventSource(`http://localhost:${testServer.settings.port}/events`);
