import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`G9 server listening on port ${port}`);
});
