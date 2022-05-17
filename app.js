import express from "express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import Base64 from "./plugins/Base64.js"; // nodemon seems to accept only if ".js" is appended...
const app = express();
const corsOptions = {
  origin: ["http://localhost:9090"],
  credentials: true,
};
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
const upload = multer({ storage: storage });
// const artdata = JSON.parse(fs.readFileSync("./g9artdata.json", "utf8"));
// const memdata = JSON.parse(fs.readFileSync("./g9memdata.json", "utf8"));

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  console.log("\n----------------\n");
  console.log("Home request; the G9 server does not accept such command ;)");
  console.log("\n----------------\n");
  res.send("Temporary page for home request; will be deleted later on");
});

// app.get("/auth", function (req, res) {
//   const hash = req.headers.authorization.substring(6);
//   const tok = b64.Base64.decode(hash);
//   const idpwnm = tok.split(":");
//   console.log("\n----------------\n");
//   console.log("direct request for g9 membership");
//   console.log("\n--NOW PARSING---\n");
//   console.log(req.headers.authorization);
//   console.log(hash + " -> " + tok);
//   console.log("ID: " + idpwnm[0]);
//   console.log("PW: " + idpwnm[1]);
//   console.log("Name: " + idpwnm[2]);
//   console.log("\n----------------\n");
//   let auth = [false, false, false];
//   if (idpwnm[0] in memdata) { /* <-- Watch this point, it requires memdata! */
//     console.log(idpwnm[0] + " exists!");
//     if (memdata[idpwnm[0]].pw === idpwnm[1]) {
//       console.log("Valid password!");
//       auth[1] = true;
//     } else {
//       console.log("Wrong password!");
//     }
//     if (memdata[idpwnm[0]].name === idpwnm[2]) {
//       console.log("Extant name!");
//       auth[2] = true;
//     } else {
//       if (memdata[idpwnm[0]].name === "") {
//         console.log("Not checking for name");
//       } else {
//         console.log("Unextant name!");
//       }
//     }
//     auth[0] = true;
//   } else {
//     console.log("Unextant ID!");
//   }
//   console.log("\n----------------\n");
//   res.json(auth);
// });
// app.get("/g9artdata.json", function (req, res) {
//   console.log("\n----------------\n");
//   console.log("direct request for g9 articles");
//   console.log("\n----------------\n");
//   res.json(artdata); /* <-- Watch this point, it requires artdata! */
// });
app.get("/image/:year/:month/:day/:name", (req, res, next) => {
  const fileYear = req.params.year;
  const fileMonth = req.params.month;
  const fileDay = req.params.day;
  const fileName = req.params.name;
  console.log(`Proper image request for ${fileName}.`);
  res.sendFile(
    fileName,
    {
      root: path.join(__dirname, `./image/${fileYear}/${fileMonth}/${fileDay}`),
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        console.log(`Properly sent: ${fileName}`);
      }
    }
  );
});
app.get("/image/:name", (req, res, next) => {
  const fileName = req.params.name;
  console.log(`Legacy: Primitive image request for ${fileName}.`);
  res.sendFile(
    fileName,
    { root: path.join(__dirname, "./image") },
    function (err) {
      if (err) {
        next(err);
      } else {
        console.log(`Primitively sent: ${fileName}`);
      }
    }
  );
});

app.listen(port, () => {
  console.log("\n----------------\n");
  console.log(`G9 server app listening at http://localhost:${port}`);
  console.log("\n----------------\n");
});
