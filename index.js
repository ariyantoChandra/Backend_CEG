/*/import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "IZINNNN",
  });
});

app.use("/auth", authRoutes);

app.listen(() => {
  console.log(`Run at http://localhost:5000`);
});
*/
// BACKEND/index.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors()); 

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server Backend Ready!",
  });
});

// Ini berarti url loginnya jadi: http://localhost:5000/auth/login
app.use("/auth", authRoutes); 

// PERBAIKAN: Masukkan variable PORT ke dalam listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
