import express from "express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url"; // is this unnecessary?
import cors from "cors";
import multer from "multer";
import Base64 from "./plugins/Base64.js"; // nodemon seems to accept only if ".js" is appended...
const debugmode = true; // false in production
const app = express();
const corsOptions = {
  origin: ["http://localhost:9090"],
  credentials: true,
};
const __dirname = path.resolve();
const port = 3000;
const thisServer = `http://127.0.0.1:${port}`;
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
      if (debugmode) console.log("\n----------------\n");
      if (debugmode)
        console.log(
          "\ncreating new directory...\n" + "./image/" + varpath + "\n"
        );
      if (debugmode) console.log("\n----------------\n");
      fs.mkdirSync("./image/" + varpath, { recursive: true });
    }
    cb(null, "./image/" + varpath); // for some reason this doesn't work
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });
const artdata = JSON.parse(fs.readFileSync("./db/g9artdata.json", "utf8"));
const memdata = JSON.parse(fs.readFileSync("./db/g9memdata.json", "utf8"));

/**
 * code is under construction
 *
 * all routers are to be separated into module JS files
 */
