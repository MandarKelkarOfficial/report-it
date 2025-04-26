# Report-It- Field Reporting System. 

> A full-stack admin portal to **track user activity logs**, **manage reports**, and **monitor system usage** across your TalentSync platform. Built with ❤️ using **Vite+React**, **Node.js**, **MongoDB**, and **TailwindCSS**.

---

## 🚀 Features

- 🔒 **Authentication** — Secure login/signup with JWT tokens
- 🧠 **Role-based Access Control** — Separate flows for Admin and Users
- 📋 **Activity Logs** — Track login/logout, report submissions, etc.
- 🟢 **Real-time Online Status** — See which users are active right now
- 🌍 **IP Address and Device Info** — Logged automatically with each activity
- 🗂️ **Detailed User Reports** — Drill down into each user's history
- ⚡ **Fully Responsive UI** — Works on desktop, tablet, mobile

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Styling |
|:---------|:--------|:---------|:--------|
| Vite+React.js | Node.js + Express | MongoDB + Mongoose | TailwindCSS |

---

## 🧑‍💻 Local Setup Instructions

1. **Clone the repo:**

   ```bash
   git clone https://github.com/MandarKelkarOfficial/report-it.git
   cd report-it
   ```

2. **Frontend setup:**

   ```bash
   npm install
   npm run dev
   ```

   Runs on: `http://localhost:5173/`

3. **Backend setup:**

   ```bash
   cd backend
   npm install
   npm run start
   ```

   Runs on: `http://localhost:5000/`

4. **Environment Variables:**

   Create a `.env` file inside `/backend` folder:

   ```bash
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

5. **Ready to roll!** 🎸 Open your browser and login/signup to start managing users.

---

## 📸 Screenshots

| Dashboard | Activity Logs |
|:----------|:--------------|
| ![Dashboard](https://via.placeholder.com/600x300.png?text=Dashboard+Screenshot) | ![Logs](https://via.placeholder.com/600x300.png?text=Activity+Logs+Screenshot) |

---

## 📚 Folder Structure

```bash
report-it/
├── report-it/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── App.jsx
│   ├── tailwind.config.js
├── backend/
│   ├── models/
│   ├── server.js
```

---

## ⚡ Optimizations / TODOs

- [ ] Implement **WebSocket** for real-time user status (instead of polling)
- [ ] Add **Pagination** for logs if there are 1000+ records
- [ ] Enable **Admin Analytics** (charts for user growth, activity spikes)
- [ ] Deploy to **Vercel** (Frontend) and **Render** or **Railway** (Backend)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 🧹 Cleaning tip

If you ever feel like the frontend cache is acting funky during development:

```bash
rm -rf node_modules/.vite
npm run dev
```
(Trust me, it works like black magic.)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍🚀 Maddy's Note

_"Building software for **students and freshers** because nobody deserves to be ghosted by HR."_

---

#  
---

> **Would you like me to also generate a `LICENSE` file and a `.gitignore` for you if you want to really polish it before pushing to GitHub?** 🚀  
(*I can make them ready to copy-paste!*)
