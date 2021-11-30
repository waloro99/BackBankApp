const express = require('express');
var cors = require('cors');

// MYSQL
const mysql = require('mysql')
const db = mysql.createConnection({
host: process.env.DATABASE_URL , // "",
user: process.env.DATABASE_USER , // "",
password: process.env.DATABASE_PASS , // "",
database: process.env.DATABASE_DB  // "" 
})

module.exports = db;

const app = express();
app.use(cors());
app.use(express.json())

const bodyParser = require('body-parser');
const routes = require('./rutas/routes');

db.on('open', () => {
    console.log('connected...') 
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));

routes(app);

app.listen('3306', () =>{
    console.log('Listening on port 3306');
})