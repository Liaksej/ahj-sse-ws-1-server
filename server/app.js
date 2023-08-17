const Koa = require("koa");
const cors = require("@koa/cors");
const UserResponse = require("./modules/UserResponse");
const WS = require("ws");
const http = require("http");

const app = new Koa();
app.use(cors());

app.use(async (ctx, next) => {
  if (ctx.request.method !== "OPTIONS") {
    await next();

    return;
  }

  ctx.response.set("Access-Control-Allow-Origin", "*");

  ctx.response.set(
    "Access-Control-Allow-Methods",
    "DELETE, PUT, PATCH, GET, POST",
  );

  ctx.response.status = 204;
});

const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server,
});

let users = [];
const chat = ["Hello from WebSocket server!"];

wsServer.on("connection", (ws) => {
  ws.on("message", (event) => {
    const data = JSON.parse(event);
    switch (data.type) {
      case "new-user":
        if (!users.includes(data.username)) {
          users.push(data.username);

          ws.send(
            JSON.stringify(new UserResponse("allowed", data.username, users)),
          );
          Array.from(wsServer.clients)
            .filter((client) => client.readyState === WS.OPEN)
            .forEach((client) => {
              client.send(
                JSON.stringify(
                  new UserResponse("incoming-user", data.username),
                ),
              );
            });

          ws.send(JSON.stringify({ type: "message", chat: chat }));
        } else {
          ws.send(JSON.stringify(new UserResponse("denied", data.username)));
        }
        break;
      case "outgoing-user":
        if (users.includes(data.username)) {
          users = users.filter((user) => {
            return user !== data.username;
          });
        }
        Array.from(wsServer.clients)
          .filter((client) => client.readyState === WS.OPEN)
          .forEach((client) => {
            client.send(
              JSON.stringify(new UserResponse("outgoing-user", data.username)),
            );
          });
        break;
      case "message":
        if (data) {
          chat.push(data.message);
          const eventData = JSON.stringify({
            type: "message",
            chat: [data.message],
          });
          Array.from(wsServer.clients)
            .filter((client) => client.readyState === WS.OPEN)
            .forEach((client) => {
              client.send(eventData);
            });
        }
        break;
      default:
        console.log("404");
        break;
    }
  });
});

server.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});

app.listen(8082);
