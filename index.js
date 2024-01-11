const { rejects } = require("assert");
const fs = require("fs");
const http = require("http");
const { resolve } = require("path");

const readFile = (path) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)))
  );

const writeJsonFile = (path, jsonObj) =>
  new Promise((resolve, reject) =>
    fs.writeFile(path, JSON.stringify(jsonObj, null, 2), (err) =>
      err ? reject(err) : resolve(jsonObj)
    )
  );

const parseRequestBody = (request) =>
  new Promise((resolve, reject) => {
    let requestBodyChunks = [];
    request
      .on("data", (chunk) => requestBodyChunks.push(chunk))
      .on("end", () => {
        const body = JSON.parse(Buffer.concat(requestBodyChunks).toString());
        resolve(body);
      })
      .on("error", (err) => reject(err));
  });
// create a server
const server = http.createServer(function serverRequestHandler(
  request,
  response
) {
  console.log("doing file server stuff");
  if (request.url === "/api/messages" && request.method === "GET") {
    console.log("doing API stuff");
    readFile("./messages.json")
      .then((jsonString) => response.end(jsonString))
      .catch((err) => {
        console.log(err);
        const error = { success: false, error: "could not retrieve messages" };
        const errorJsonString = JSON.stringify(error);
        response.writeHead(500).end(errorJsonString);
      });
  } else if (request.url === "/api/messages" && request.method === "POST") {
    const messagesArray = readFile("./messages.json").then((jsonBuffer) =>
      JSON.parse(jsonBuffer.toString())
    );
    const messagesBody = parseRequestBody(request);
    Promise.all([messagesArray, messagesBody])
      .then(([localMessages, body]) => [...localMessages, body])
      .then((newMessagesArray) =>
        writeJsonFile("./messages.json", newMessagesArray)
      )
      .then((newMessagesArray) =>
        response.end(JSON.stringify(newMessagesArray))
      );
  } else {
    console.log("doing file server stuff");
    const filePath =
      request.url === "/"
        ? "./public/pages/index.html"
        : "./public" + request.url;
    readFile(filePath)
      .then((text) => {
        response.writeHead(200);
        response.end(text, "utf-8");
      })
      .catch((err) => {
        console.error(err);
        response.writeHead(301, { Location: `/pages/error.html` }).end();
      });
  }
});

const PORT = 3008;
server.listen(PORT, () => console.log("This is Server at PORT : " + PORT));
