# 🚀 Smart Resume Builder (AI-Powered)

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack, AI-integrated web application designed to help users build, refine, and export professional resumes. Built with the MERN stack (MongoDB, Express, React, Node.js) and powered by Google's Gemini AI, this platform acts as both a secure personal data vault and an intelligent career consultant.

### 🔗 **[Live Demo: Try the Smart Resume Builder Here](https://smart-resume-builder-b-sharana-basavas-projects.vercel.app/)**

---

## ✨ Core Features

* **🔒 Secure User Authentication:** JSON Web Token (JWT) based authentication system with `bcryptjs` password hashing. Each user gets a private, encrypted vault for their resume data.
* **🤖 AI Copilot (Google Gemini):** An integrated, context-aware chatbot that reads the user's live resume data and provides real-time, tailored advice on phrasing, skill summarization, and impact metrics.
* **⚡ Real-Time Live Preview:** A responsive 50/50 split-screen design. Form inputs instantly update a professionally formatted, print-ready document on the screen.
* **☁️ Persistent Cloud Storage:** Seamless integration with MongoDB Atlas ensures users can log out, return later, and pick up exactly where they left off.
* **📄 One-Click PDF Export:** Utilizes `html-to-image` and `jsPDF` to render the DOM elements into a high-fidelity, downloadable PDF document.
* **🌙 Dynamic Theme Toggling:** Built-in Light/Dark mode support for optimal user experience.

---

## 🛠️ Technical Architecture

### Frontend (Client-Side)
* **Framework:** React.js (via Vite for optimized build speeds)
* **Styling:** Tailwind CSS / Native CSS
* **State Management:** React Hooks (`useState`, `useEffect`)
* **Deployment:** Vercel

### Backend (Server-Side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB Atlas (NoSQL)
* **ODM:** Mongoose
* **Security:** `jsonwebtoken` (JWT), `bcryptjs`, `cors`
* **Deployment:** Render

### AI Integration
* **Model:** Google Gemini 2.5 Flash
* **Implementation:** `@google/generative-ai` SDK
* **Functionality:** Receives stringified JSON payloads of the user's current frontend state to provide context-specific career consulting.

---

## 👨‍💻 About the Developer

**B. Sharana Basava**
*Electronics and Communication Engineering (ECE) | Full-Stack Developer*

Bridging the gap between hardware architecture and scalable web applications. Experienced in developing full-stack MERN environments, Python programming, and IoT hardware integrations. 

📫 **Let's Connect:**
* **Email:** [bsharan20066@gmail.com](mailto:b.sharanabasava2006@gmail.com)
* **LinkedIn:** [B Sharana Basava](https://www.linkedin.com/in/b-sharanabasava/) 
* **GitHub:** [@Sharanx77](https://github.com/Sharanx77)
