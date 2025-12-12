const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const http = require("http");
const { setupWebSocket } = require("./websocket");
const cors = require("cors");

const errorHandler = require("./middlewares/errorHandler");

const routes = require("./routes");
const morgan = require("morgan");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL_1,
  process.env.CLIENT_URL_2,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,

  })
);

app.use(helmet());

app.set("trust proxy", true);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());


app.use(xssClean());

app.use(hpp());

app.use(routes);

const server = http.createServer(app);

setupWebSocket(server);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
