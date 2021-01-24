import { ReconnectingEventSource } from "./index";

import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";

const aTestServer = (): Express => {
  const app = express();
  let clients: any[] = [];
  let nests: any[] = [];

  const eventsHandler = (req: any, res: any, next: any) => {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);

    res.write(JSON.stringify("{nests}"));
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res,
    };
    clients.push(newClient);
    req.on("close", () => {
      clients = clients.filter((c) => c.id !== clientId);
    });
  };
  // Iterate clients list and use write res object method to send new nest
  const sendEventsToAll = (newNest: any) => {
    clients.forEach((c) => c.res.write(JSON.stringify(nests)));
  };

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.get("/events", eventsHandler);

  return app;
};

const testServer = aTestServer();

const eventSource = new ReconnectingEventSource(`http://localhost:${testServer.settings.port}/events`);
