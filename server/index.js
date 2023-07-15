import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoute from "./routes/users.js";
import postRoute from "./routes/posts.js";
import { register } from "./controller/auth.js";
import { createPost } from "./controller/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Posts.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATION  */
// when use use "type" : "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
///////////////////////////////
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: "true" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: "true" }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
// when someone is going to upload a file or image to our website
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/*  ROUTES WITH FILE */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoute);
app.use("/posts", postRoute);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server is running on the port: ${PORT}`)
    );
    /* Manually injecting the data */
    //  User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((err) => console.log(`${err}: did not connect to the server`));
