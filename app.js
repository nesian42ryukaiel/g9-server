import express from "express";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
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

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  if (debugmode) console.log("\n----------------\n");
  if (debugmode)
    console.log("Home request; the G9 server does not accept such command ;)");
  if (debugmode) console.log("\n----------------\n");
  res.send("Temporary page for home request; will be deleted later on");
});

app.get("/auth", function (req, res) {
  const hash = req.headers.authorization.substring(6);
  const tok = Base64.decode(hash);
  const idpwnm = tok.split(":");
  if (debugmode) console.log("\n----------------\n");
  if (debugmode) console.log("direct request for g9 membership");
  if (debugmode) console.log("\n--NOW PARSING---\n");
  if (debugmode) console.log(req.headers.authorization);
  if (debugmode) console.log(hash + " -> " + tok);
  if (debugmode) console.log("ID: " + idpwnm[0]);
  if (debugmode) console.log("PW: " + idpwnm[1]);
  if (debugmode) console.log("Name: " + idpwnm[2]);
  if (debugmode) console.log("\n----------------\n");
  let auth = [false, false, false];
  if (idpwnm[0] in memdata) {
    /* <-- Watch this point, it requires memdata! */
    if (debugmode) console.log(idpwnm[0] + " exists!");
    if (memdata[idpwnm[0]].pw === idpwnm[1]) {
      if (debugmode) console.log("Valid password!");
      auth[1] = true;
    } else {
      if (debugmode) console.log("Wrong password!");
    }
    if (memdata[idpwnm[0]].name === idpwnm[2]) {
      if (debugmode) console.log("Extant name!");
      auth[2] = true;
    } else {
      if (memdata[idpwnm[0]].name === "") {
        if (debugmode) console.log("Not checking for name");
      } else {
        if (debugmode) console.log("Unextant name!");
      }
    }
    auth[0] = true;
  } else {
    if (debugmode) console.log("Unextant ID!");
  }
  if (debugmode) console.log("\n----------------\n");
  res.json(auth);
});
app.get("/g9artdata.json", function (req, res) {
  if (debugmode) console.log("\n----------------\n");
  if (debugmode) console.log("direct request for g9 articles");
  if (debugmode) console.log("\n----------------\n");
  res.json(artdata); /* <-- Watch this point, it requires artdata! */
});
app.get("/image/:year/:month/:day/:name", (req, res, next) => {
  const fileYear = req.params.year;
  const fileMonth = req.params.month;
  const fileDay = req.params.day;
  const fileName = req.params.name;
  if (debugmode) console.log(`Proper image request for ${fileName}.`);
  res.sendFile(
    fileName,
    {
      root: path.join(__dirname, `./image/${fileYear}/${fileMonth}/${fileDay}`),
    },
    function (err) {
      if (err) {
        next(err);
      } else {
        if (debugmode) console.log(`Properly sent: ${fileName}`);
      }
    }
  );
});
app.get("/image/:name", (req, res, next) => {
  const fileName = req.params.name;
  if (debugmode)
    console.log(`Legacy: Primitive image request for ${fileName}.`);
  res.sendFile(
    fileName,
    { root: path.join(__dirname, "./image") },
    function (err) {
      if (err) {
        next(err);
      } else {
        if (debugmode) console.log(`Primitively sent: ${fileName}`);
      }
    }
  );
});

app.post("/auth", (req, res) => {
  if (debugmode) console.log("\n----------------\n");
  if (debugmode) console.log("\nNow registering a new member...\n");
  if (debugmode) console.log(req.body);
  if (debugmode) console.log("\n----------------\n");
  const newmemdata = Object.assign(memdata, req.body);
  if (debugmode) console.log(newmemdata);
  if (debugmode) console.log("\n----------------\n");
  fs.writeFileSync("./g9memdata.json", JSON.stringify(newmemdata));
  res.json(newmemdata);
});
app.post("/upload", upload.single("image"), function (req, res) {
  if (debugmode) console.log("\n----------------\n");
  if (debugmode) console.log(req.file);
  if (debugmode) console.log(req.body);
  if (debugmode) console.log("\n----------------\n");
  let uploadNextStep = true;
  let imagelink = "";
  if (uploadNextStep && (req.body.title === "" || req.body.writer === "")) {
    uploadNextStep = false;
  } else {
    imagelink += thisServer + "/" + req.file.path;
    if (debugmode) console.log(imagelink);
  }
  const newart = {
    id: Date.now(),
    image: imagelink,
    title: req.body.title,
    text: req.body.text,
    writer: req.body.writer,
  };
  const uploadRes = { success: uploadNextStep, article: newart };
  if (uploadNextStep) {
    if (debugmode) console.log(newart);
    artdata.push(newart);
    if (debugmode) console.log(artdata);
    fs.writeFileSync("./g9artdata.json", JSON.stringify(artdata));
  }
  res.send(uploadRes);
});

app.listen(port, () => {
  console.log("\n----------------\n");
  console.log(`G9 server app listening at http://localhost:${port}`);
  console.log("\n----------------\n");
});
