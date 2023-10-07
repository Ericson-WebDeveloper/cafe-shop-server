import express, { Application } from "express";
import http from "http";
import { env } from "./config/environment";
import { serverApplication } from "./server";
import { connectDb } from "./config/data/db";
import * as dotenv from "dotenv";
dotenv.config(); //{ path: __dirname + '/.env' }

const app: Application = express();

const server = http.createServer(serverApplication(app));

const runApplication = async () => {
  try {
    if (
      process.env.NODE_ENV == "development" ||
      process.env.NODE_ENV == "DEV" ||
      process.env.NODE_ENV == "PROD" ||
      process.env.NODE_ENV == "production"
    ) {
        await connectDb();
    }
    server.listen(process.env.PORT, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
      );
    });
  } catch (error: any) {
    await runApplication();
  }
};

runApplication();
export default server;
