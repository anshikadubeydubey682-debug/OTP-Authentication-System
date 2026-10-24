# Full-Stack OTP Authentication System (Spring Boot + React)

A premium, production-ready OTP Authentication System implementing secure registration, mobile-based login, and JWT-protected dashboard.

## ✨ Features
- **Modern UI/UX**: Built with React, Tailwind CSS, and Lucide icons for a premium feel.
- **Secure Registration**: Name and 10-digit mobile number validation.
- **OTP Gateway**: Integrated with **2Factor.in** for real-world SMS delivery (AUTOGEN & VERIFY flow).
- **JWT Security**: Secure session management using JSON Web Tokens.
- **Protected Routes**: Dashboard accessible only to authenticated users.
- **Frontend/Backend Separation**: Clean architecture with a dedicated API service layer.
- **Device Fingerprinting**: Enhanced security to prevent session hijacking.

---

## 🚀 Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.x**
- **Spring Security** (JWT-based)
- **Spring Data JPA** (MySQL Hibernate)
- **Lombok** for clean models
- **2Factor.in SDK/API** for SMS

### Frontend
- **React.js** (Vite-powered)
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

---

## 🛠️ Installation & Setup

### 1. Backend Setup
1. Open the project in your favorite IDE (IntelliJ/VS Code).
2. Configure your MySQL database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/your_db_name
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   
   # Add your 2Factor API Key for real SMS
   twofactor.api.key=YOUR_2FACTOR_API_KEY
   ```
3. Run the backend:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on port `8081`.*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Update `.env` file:
   ```env
   VITE_API_URL=http://localhost:8081/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (Name + Mobile) |
| POST | `/api/auth/send-otp` | Request OTP (using 2Factor AUTOGEN) |
| POST | `/api/auth/verify-otp` | Verify OTP (using 2Factor VERIFY) and get JWT |
| GET | `/api/auth/me` | Fetch logged-in user details (Protected) |

---

## 📂 Project Structure
```text
├── src/main/java           # Spring Boot Source Code
├── src/main/resources      # Config & application.properties
├── frontend/               # React Vite Project
│   ├── src/pages           # Login, Register, Verify, Dashboard
│   ├── src/services        # Axios & API Logic
│   └── src/components      # Reusable Components (PrivateRoute)
└── pom.xml                 # Maven Dependencies
```

---

## 👤 Author
Developed by **Anshika Dubey**
