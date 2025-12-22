import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { checkBattleResult } from "../handler/chemicalPlantBattle/checkCard";
import dotenv from "dotenv";
dotenv.config();

export const initServer = (server, db) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("No token");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        tim: decoded.tim,
      };

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Device connected:", socket.id);

    socket.on("join-game", async ({ game_session_id, pos_game_id }) => {
      const userId = socket.user.id;
      const [session] = await db.execute(
        "SELECT tim1_id, tim2_id FROM game_session WHERE id = ? && pos_game_id = ? && end_time IS NULL",
        [game_session_id, pos_game_id]
      );

      if (
        session.length === 0 ||
        ![session[0].tim1_id, session[0].tim2_id].includes(userId)
      ) {
        return socket.emit("error", "Tidak diperbolehkan untuk join game");
      }

      socket.join(`game_session_${game_session_id}`);
      socket.emit("joined", "Berhasil join game");
    });

    socket.on("get-cards", async ({ game_session_id, pos_game_id }) => {
      const [findGameSession] = await db.execute(
        "SELECT tim1_id, tim2_id FROM game_session WHERE id = ? && pos_game_id = ? && end_time IS NULL",
        [game_session_id, pos_game_id]
      );

      if (findGameSession.length === 0) {
        return socket.emit(
          "error",
          "Game session tidak ditemukan atau sudah berakhir!"
        );
      }
      const { tim1_id, tim2_id } = findGameSession[0];

      const [cards] = await db.execute(
        "SELECT asam_kuat, asam_lemah, netral, basa_kuat, asam_lemah FROM card WHERE user_id IN (?, ?)",
        [tim1_id, tim2_id]
      );

      if (cards === null) {
        return socket.emit("error", "Card tidak ditemukan!");
      }

      const cards1 = cards[0];
      const cards2 = cards[1];

      socket.emit("cards-data", {
        tim1: tim1_id,
        card_tim1: cards1,
        tim2: tim2_id,
        card_tim2: cards2,
      });
    });

    socket.on("selected-card", async ({ game_session_id, card_name }) => {
      const userId = socket.user.id;
      const allowedCards = [
        "asam_kuat",
        "asam_lemah",
        "netral",
        "basa_kuat",
        "basa_lemah",
      ];

      if (!allowedCards.includes(card_name)) {
        return socket.emit("error", "Kartu tidak valid");
      }

      const [cards] = await db.execute(
        "UPDATE card SET ? = ? - 1 WHERE user_id = ?",
        [card_name, card_name, userId]
      );

      await db.execute("UPDATE card SET selected = ? WHERE id = ?", [
        card_name,
        game_session_id,
      ]);

      const [selectedCards] = await db.execute(
        "SELECT selected FROM card where user_id IN (?, ?)",
        [tim1_id, tim2_id]
      );

      const cardTim1 = selectedCards[0];
      const cardTim2 = selectedCards[1];

      const result = checkBattleResult(cardTim1, cardTim2);

      if (result === "menang") {
      }

      socket.to(`game_session_${game_session_id}`).emit("enemy-selected", {
        userId,
      });

      socket.emit("card-selected", { success: true });
    });

    socket.on("disconnect", () => {
      console.log("Teams disconnected:", socket.id);
    });
  });

  return io;
};
