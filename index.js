import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import chemicalBattleRoutes from "./routes/chemicalBattleRoutes.js";

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

app.use("/chemical-battle", chemicalBattleRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
