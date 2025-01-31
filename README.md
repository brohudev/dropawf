# 📦 Dropawf  

A full-stack courier service web application designed for **COSC 3380: Database Systems**. Dropawf provides package tracking, shipping services, product sales, reporting, and customer/employee management.  

## 🚀 Tech Stack  
- **Frontend:** React.js  
- **Backend:** Node.js  
- **Database:** MySQL  
- **Authentication:** JavaScript Cookies  
- **Deployment:** Azure, Cloudflare  
- **Version Control:** Git, GitHub  

## 🛠️ Setup & Installation  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/your-username/dropawf.git
cd dropawf
```

### 2️⃣ Install Dependencies  
```sh
npm install
```

### 3️⃣ Environment Variables  
Create a `.env` file and define the necessary variables:  

#### Frontend  
```sh
REACT_APP_BASE_URL="<HOST_URL>"
```
Set `<HOST_URL>` to either `http://localhost:8080` (for local development) or your deployed backend URL.  

#### Backend  
```sh
DB_HOST=<your-db-host>
DB_PORT=<your-db-port>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_DATABASE=<your-db-name>
```

### 4️⃣ Running the Project  

#### Start the Frontend  
```sh
npm run start
```
- Runs the app in development mode.  
- Open [http://localhost:3000](http://localhost:3000) in your browser.  

#### Start the Backend  
```sh
npm run server:dev
```
- Runs the backend server on `http://localhost:8080`.  
- Ensure your database is up and accepting connections.  

#### Build for Production  
```sh
npm run build
```
- Creates an optimized production build in the `build/` directory.  

## 📜 License  
This project is licensed under the [MIT License](LICENSE).
