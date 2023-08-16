const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
// const Ticket = require("./modules/Ticket");
const WS = require("ws");
const http = require("http");

// const tickets = [];
// const ticketsFull = [];

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

app.use(bodyParser());
// app.use(async (ctx, next) => {
//   const { method, id } = ctx.request.query;
//   next();
//   try {
//     switch (method) {
//       case "allTickets":
//         ctx.body = tickets;
//         break;
//       case "ticketById":
//         ctx.status = 200;
//         ctx.body = ticketsFull.find((ticket) => ticket.id === id);
//         break;
//       case "editTicket":
//         if (ctx.request.body) {
//           let editedTicket = tickets.find((ticket) => {
//             return ticket.id === id;
//           });
//           let editedTicketFull = ticketsFull.find((ticketFull) => {
//             return ticketFull.id === id;
//           });
//           if (editedTicket) {
//             if (editedTicket.name !== ctx.request.body.name) {
//               editedTicket.name = ctx.request.body.name;
//               editedTicketFull.name = ctx.request.body.name;
//             }
//             if (editedTicketFull.description !== ctx.request.body.description) {
//               editedTicketFull.description = ctx.request.body.description;
//             }
//           }
//           ctx.status = 200;
//           ctx.body = tickets;
//         } else {
//           ctx.status = 400;
//           ctx.body = "Отсутствует тело запроса";
//         }
//         break;
//       case "changeStatus":
//         if (ctx.request.body) {
//           let editedTicket = tickets.find((ticket) => {
//             return ticket.id === id;
//           });
//           let editedTicketFull = ticketsFull.find((ticketFull) => {
//             return ticketFull.id === id;
//           });
//           if (editedTicket) {
//             if (editedTicket.status !== ctx.request.body.status) {
//               editedTicket.status = ctx.request.body.status;
//               editedTicketFull.status = ctx.request.body.status;
//             }
//           }
//           ctx.status = 200;
//           ctx.body = editedTicket;
//         } else {
//           ctx.status = 400;
//           ctx.body = "Отсутствует тело запроса";
//         }
//         break;
//       case "createTicket":
//         if (ctx.request.body) {
//           let newTicket = new Ticket(
//             ctx.request.body.name,
//             ctx.request.body.status,
//           );
//           let newTicketFull = newTicket.createTicketFull(
//             ctx.request.body.description,
//           );
//           tickets.push(newTicket);
//           ticketsFull.push(newTicketFull);
//           ctx.status = 201;
//           ctx.body = tickets;
//         } else {
//           ctx.status = 400;
//           ctx.body = "Отсутствует тело запроса";
//         }
//         break;
//       case "deleteTicketById":
//         if (ctx.request.body) {
//           tickets.splice(
//             tickets.findIndex((ticket) => ticket.id === id),
//             1,
//           );
//           ticketsFull.splice(
//             ticketsFull.findIndex((ticket) => ticket.id === id),
//             1,
//           );
//           ctx.status = 200;
//           ctx.body = tickets;
//         } else {
//           ctx.status = 400;
//           ctx.body = "Отсутствует тело запроса";
//         }
//         break;
//       default:
//         ctx.status = 404;
//         return;
//     }
//   } catch (err) {
//     console.error(err);
//     ctx.status = err.status || 500;
//     ctx.body = err.message;
//   }
// });

const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server,
});

const chat = ["Hello from WebSocket server!"];

wsServer.on("connection", (ws) => {
  ws.on("message", (event) => {
    chat.push(`${event}`);
    const eventData = JSON.stringify({ chat: [`${event}`] });
    Array.from(wsServer.clients)
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => {
        client.send(eventData);
      });
  });
  ws.send(JSON.stringify({ chat }));
});

server.listen(8081, () => {
  console.log("Server is running on http://localhost:8081");
});

app.listen(8082);
