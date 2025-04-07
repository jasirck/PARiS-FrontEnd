# PARiS Tours and Travels - Frontend

Welcome to the **PARiS Tours and Travels** frontend repository! This is the React-based client side of the PARiS Travel booking platform, providing users with an interactive and seamless experience to explore and book holidays, resorts, flights, and more.

## 🌍 Live Demo

> https://www.paristoursandtravels.in/

---

## 🚀 Features

- 🏖️ Browse and book **Holiday Packages** and **Resorts**
- ✈️ **Flight search and booking** interface
- 💬 **Real-time Chat** support with admins using WebSockets
- 🔐 Authentication (Login / Signup)
- 🧾 View Booking History and Status
- 📆 Date selection with calendar
- 💸 Dynamic pricing and guest count logic
- 📱 Fully responsive design using **Tailwind CSS**
- 🔄 Smooth navigation with **React Router**

---

## 🛠️ Tech Stack

- **React.js**
- **Vite** (for fast build and dev environment)
- **Redux Toolkit** (for state management)
- **Tailwind CSS** (for styling)
- **Socket.IO Client** (real-time messaging)
- **Cloudinary for media upload
- **Axios** (for API requests)
- ** Payment Integration Support (Stripe)
- **React Icons** (for iconography)

---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jasirck/PARiS-FrontEnd.git
   cd PARiS-FrontEnd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
├── public/                     # Static assets
├── src/
│   ├── Components/
│   │   ├── Admin/              # Admin views
│   │   ├── Home/               # Home, Auth, Menu, Profile
│   │   ├── legal/              # PrivacyPolicy, TermsOfService, etc.
│   │   ├── Base.jsx
│   │   ├── PaymentForm.jsx
│   │   └── PaymentResult.jsx
│   ├── Toolkit/
│   │   └── Slice/              # Redux slices
│   ├── hooks/                 # Custom hooks (e.g., useWebSocket)
│   ├── utils/                 # Api.js, cloudinaryUtils.js, services/
│   ├── Chat.jsx
│   ├── VisaNotificationComponent.jsx
│   ├── App.jsx
│   └── main.jsx
├── index.css
├── index.html
├── .gitignore
├── eslint.config.js
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── package.json
├── package-lock.json
└── README.md
```

---


## 👨‍💻 Author

**Muhammed Jasir CK**  
Python Full Stack Developer  
📫 [LinkedIn](www.linkedin.com/in/muhammed-jasir-ck-561912307) | [GitHub](https://github.com/jasirck/)

---