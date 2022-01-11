import express from "express";
import bodyParser from "body-parser";

import router from "./api/routes";

const app: express.Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

export default app;
