# Backend CEG

REST API backend for the CEG event platform. It handles team registration and payment verification, login with JWT, the Rally Games (POS, ABN, Sort, Atomic, Question, CP Battle), and admin tools such as the leaderboard.

Built with **Node.js**, **Express 5**, and **MySQL**.

## Tech Stack

- [Express](https://expressjs.com/) 5 for routing and middleware
- [mysql2](https://www.npmjs.com/package/mysql2) connection pool
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) for login tokens
- [multer](https://www.npmjs.com/package/multer) for image uploads
- [cors](https://www.npmjs.com/package/cors) and [dotenv](https://www.npmjs.com/package/dotenv)
- [nodemon](https://www.npmjs.com/package/nodemon) for development

## Project Structure

```
Backend_CEG/
├── index.js              # App entry point (Express setup, route mounting)
├── config/
│   ├── database.js       # MySQL connection pool
│   └── checkToken.js     # JWT verification helper
├── handler/              # Request handlers, grouped by feature
│   ├── admin/            # Team list, team detail, payment verification, rally updates
│   ├── auth/             # Login and register
│   ├── penpos/           # POS game session endpoints
│   └── user/             # User info, leaderboard, POS, ABN, Sort, Atomic, Question, CP Battle
├── middleware/
│   └── uploadImage.js    # Multer config for JPG/PNG uploads (max 10 MB)
├── routes/               # Route definitions (authRoutes, penposRoutes, userRoutes, adminRoutes)
├── public/               # Static files; uploads are saved to public/uploads
├── images/               # Static images served at /images
└── vercel.json           # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A running MySQL server with the database schema for this project

### Installation

```bash
git clone <repository-url>
cd Backend_CEG
npm install
```

### Environment Variables

Create a `.env` file in the project root. It is ignored by Git.

```env
# Server
PORT=5000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT
JWT_SECRET=your_long_random_secret
```

| Variable      | Default     | Description                                  |
| ------------- | ----------- | -------------------------------------------- |
| `PORT`        | `5000`      | Port the server listens on                   |
| `DB_HOST`     | `localhost` | MySQL host                                   |
| `DB_PORT`     | `3306`      | MySQL port                                   |
| `DB_USER`     | none        | MySQL user                                   |
| `DB_PASSWORD` | none        | MySQL password                               |
| `DB_NAME`     | none        | MySQL database name                          |
| `JWT_SECRET`  | none        | Secret used to sign and verify JWT tokens    |

### Running the Server

```bash
# Development (auto-restart on changes)
npm run dev

# Production-style start
node index.js
```

When the server starts, it prints `Server berjalan di port <PORT>`. Open `http://localhost:5000/` to confirm it is running.

## Authentication

1. Call `POST /api/auth/login` with the team name and password.
2. The response includes a `token` that expires after 1 day.
3. Send the token on protected endpoints:

```http
Authorization: Bearer <token>
```

Protected handlers return `401` when the `Authorization` header is missing or does not start with `Bearer `.

## API Endpoints

All API routes are prefixed with `/api`. Static files are served at `/public` and `/images`.

### Health Check

| Method | Path | Description                  |
| ------ | ---- | ---------------------------- |
| GET    | `/`  | Returns a "server is running" message |

### Auth (`/api/auth`)

| Method | Path                             | Description                                   |
| ------ | -------------------------------- | --------------------------------------------- |
| POST   | `/api/auth/login`                | Log in with team name and password, returns a JWT |
| POST   | `/api/auth/register`             | Register a team. Accepts multipart form data with image files |
| GET    | `/api/auth/check-status-pendaftaran` | Check the registration status              |

### Admin (`/api/admin`)

| Method | Path                               | Description                          |
| ------ | ---------------------------------- | ------------------------------------ |
| GET    | `/api/admin/get-all-teams`         | List all teams                       |
| GET    | `/api/admin/get-team-detail/:teamId` | Get the details of one team        |
| PUT    | `/api/admin/verify-payment/:teamId` | Verify a team's payment. Accepts file uploads |
| GET    | `/api/admin/leaderboard`           | Get the leaderboard                  |

### User and Games (`/api/user`)

| Method | Path                                  | Description                       |
| ------ | ------------------------------------- | --------------------------------- |
| POST   | `/api/user/auth/register`             | Register (same handler as `/api/auth/register`) |
| GET    | `/api/user/get-user-info`             | Get the logged-in user's info     |
| GET    | `/api/user/check-status-pembayaran`   | Check payment status              |
| GET    | `/api/user/get-list-pos`              | List POS                          |
| PUT    | `/api/user/update-user-pos`           | Update the user's POS             |
| GET    | `/api/user/check-acc`                 | Check account                     |
| GET    | `/api/user/check-game-session`        | Check the current game session    |
| GET    | `/api/user/exit-waiting-room`         | Leave the waiting room            |
| POST   | `/api/user/abn/get-card`              | ABN: get card                     |
| POST   | `/api/user/abn/get-ready-card`        | ABN: get ready cards              |
| POST   | `/api/user/abn/get-selected-card`     | ABN: get selected card            |
| POST   | `/api/user/abn/check-ready-card`      | ABN: check ready card             |
| POST   | `/api/user/sort/get-sort-items`       | Sort game: get items              |
| POST   | `/api/user/sort/get-sort-answer`      | Sort game: get answer             |
| POST   | `/api/user/atomic/get-atomic-items`   | Atomic game: get items            |
| POST   | `/api/user/atomic/get-atomic-answer`  | Atomic game: get answer           |
| POST   | `/api/user/question/get-question`     | Question game: get question       |
| POST   | `/api/user/question/get-answer`       | Question game: get answer         |
| POST   | `/api/user/cpbattle/get-cp-tools`     | CP Battle: get tools              |
| POST   | `/api/user/cpbattle/get-cp-question`  | CP Battle: get question           |
| POST   | `/api/user/cpbattle/get-cp-answer`    | CP Battle: get answer             |

### POS Game (`/api/penpos`)

| Method | Path                           | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/api/penpos/get-pos`          | Get POS                           |
| GET    | `/api/penpos/check-penpos-session` | Check the POS session         |
| GET    | `/api/penpos/get-list-team`    | List teams                        |
| GET    | `/api/penpos/get-team-playing` | Get the team currently playing    |
| POST   | `/api/penpos/create-game-session` | Create a game session          |
| POST   | `/api/penpos/get-score`        | Get score                         |
| POST   | `/api/penpos/match-result`     | Submit a match result             |

Requests and responses for each endpoint are defined in the matching file under `handler/`.

### Errors

- Unknown routes return `404` with `{ "success": false, "message": "Endpoint tidak ditemukan" }`.
- Server errors return `500` with a message describing the error.

## File Uploads

Uploads use `multer` and are limited to **JPG/PNG** files of up to **10 MB**. Files are saved under `public/uploads/` in a subfolder based on the field name:

| Field name                                                 | Folder                      |
| ---------------------------------------------------------- | --------------------------- |
| `bukti_pembayaran`                                         | `pembayaran/`               |
| `pas_foto`                                                 | `member/pas_foto/`          |
| `kartu_pelajar`                                            | `member/kartu_pelajar/`     |
| `follow_ceg`                                               | `member/follow_ceg/`        |
| `follow_tk`                                                | `member/follow_tk/`         |
| Anything else                                              | `lainnya/`                  |

Uploaded files are reachable at `http://localhost:5000/public/uploads/<folder>/<filename>`.

## Deployment

The project includes `vercel.json`, which routes all requests to `index.js` using `@vercel/node`. To deploy, import the repository into Vercel and set the environment variables above in the project settings.

> **Note:** Vercel's filesystem is read-only except for temporary storage. Uploads saved to `public/uploads` will not persist there. Use external object storage (for example, S3 or Cloudinary) for production uploads.

## Scripts

| Script        | Command            | Description                          |
| ------------- | ------------------ | ------------------------------------ |
| `npm run dev` | `nodemon index.js` | Run the server with auto-restart     |
