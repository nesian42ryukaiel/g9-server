import express from "express";
import cors from "cors";
import multer from "multer";
import Base64 from "./plugins/Base64.js"; // nodemon seems to accept only if ".js" is appended...
const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const varpath = `${year}/${(month < 10 ? "0" : "") + month}/${
      (day < 10 ? "0" : "") + day
    }/`;
    if (!fs.existsSync("./image/" + varpath)) {
      console.log("\n----------------\n");
      console.log(
        "\ncreating new directory...\n" + "./image/" + varpath + "\n"
      );
      console.log("\n----------------\n");
      fs.mkdirSync("./image/" + varpath, { recursive: true });
    }
    cb(null, "./image/" + varpath); // for some reason this doesn't work
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

app.get("/", (req, res) => {
  console.log("\n----------------\n");
  console.log("Home request; the G9 server does not accept such command ;)");
  console.log("\n----------------\n");
  res.send("Temporary page for home request; will be deleted later on");
});

app.listen(port, () => {
  console.log("\n----------------\n");
  console.log(`G9 server app listening at http://localhost:${port}`);
  console.log("\n----------------\n");
});
