# Ludo RAY
<img width="1918" height="903" alt="image" src="https://github.com/user-attachments/assets/52462475-23cd-4293-866d-7cb344560a56" />

Ludo Ray is a full‑stack multiplayer Ludo game built as a class project. It supports both Player‑vs‑Bot gameplay and real‑time multiplayer matches with up to 4 players per lobby and the ability to handle hundreds of concurrent users.

This project demonstrates complete end‑to‑end system development, including UI/UX design, backend APIs, real‑time communication, authentication, testing, and cloud deployment.

---
View live site https://ludo-ray.vercel.app/

## 🚀 Tech Stack

### **Frontend**

* **React** (Vite-based setup)
* **Clerk** for authentication
* **WebSockets** for real‑time updates
* **Figma** for UI/UX prototypes and design
* Hosted on **Vercel**

### **Backend**

* **Java Spring Boot**
* **PostgreSQL** using **Neon DB**
* **WebSocket gateway** for game synchronization
* Hosted on **Render** using **Docker**

---

## 🎮 Features

* **Player vs Bot** mode powered by server‑side logic
* **Multiplayer mode** (up to 4 players per lobby)
* **Scalable architecture** supporting hundreds of simultaneous users
* **Real‑time board updates** using WebSockets
* **Session & user management** via Clerk
* **Responsive and accessible UI**
* **Cloud‑native deployment** with CI/CD

---

## 🧪 Testing Coverage

This project includes thorough testing across multiple layers:

* **Unit Tests** (React components, Spring Boot services)
* **Integration Tests** (API endpoints, database interactions)
* **End-to-End (E2E) Tests** (complete gameplay flow)
* **Performance Tests** (load testing to ensure scalability)

---

## 🗂️ Project Structure

```
root
├── client/ (React app)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── tests/
│   └── ...
└── server/ (Spring Boot API)
    ├── src/main/java/
    ├── src/test/java/
    ├── Dockerfile
    └── ...
```

---

## ⚙️ Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/MeiRomney/Ludo.git
   ```

2. Navigate to the backend folder:

   ```bash
   cd server
   ```

3. Update the `.env` file with:

   * Neon DB connection URL
   * Clerk API keys
   * WebSocket configurations

4. Build and run with Docker:

   ```bash
   docker build -t ludo-ray-backend .
   docker run -p 8080:8080 ludo-ray-backend
   ```

---

## 🖥️ Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd client
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Add `.env` values for Clerk and backend API.
4. Run locally:

   ```bash
   npm run dev
   ```

---

## 🔌 Real‑Time Architecture

Ludo Ray uses WebSockets to:

* Maintain live game state
* Sync moves instantly across all players
* Send bot responses immediately
* Handle lobby updates and turn logic

This ensures fast, low‑latency gameplay even with many concurrent matches.

---

## 📐 Design Process

All screens were designed in **Figma**, covering:

* Home page
* Gameplay page
* Results page

The designs focus on clarity, accessibility, and smooth user interactions.

---

## ☁️ Deployment

* **Frontend** → Vercel
* **Backend** → Render (Docker container)
* **Database** → Neon PostgreSQL

Each deployment target has its own CI/CD pipeline for automated building and release.

---

## 📄 License

MIT License

---

## 🙌 Acknowledgments

Special thanks to Yaya Hamid Adam and Anas Mehmood Tariq for their valuable contributions to this project.

This project was created as a class project demonstrating full-stack development, scalable backend design, UI/UX principles, and comprehensive testing.
