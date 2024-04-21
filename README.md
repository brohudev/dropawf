# Dropawf
### A Courier Project Full Stack Web App Project for COSC 3380 Database Systems

## Mini-world
Dropawf is a full-stack database web application project created to design and implement a database system for a courier service complete with shipping services, package tracking, product sales, reporting, and customer and employee management.

## Technologies Used
 - Frontend: React.js
 - Backend: Node.js
 - Database: MySQL
 - Authentification: JavaScript Cookies
 - Deployment: Azure. Cloudflare
 - Version control: Git, GitHub


## Running the Project:

In the project directory, you can run:

### `npm  run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The app takes in one environment variable that is defined as such:
```
REACT_APP_BASE_URL= “<HOST_URL>”
```
This indicates the base url to use for the backend server. it can be set to either `http://localhost:8080` or the url of the deployed backend. (this assumes that the backend is up and accepting packets when the website is run).

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run server:dev`

Launches the backend web server on [http://localhost:8080](http://localhost:8080).\
It takes in 5 `DB_` env parameters which are credentials for the SQL server that the development backend will connect to.\
You may define your own at will. they are:
```
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_DATABASE
```

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!