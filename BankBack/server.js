const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json())

const bodyParser = require('body-parser');
const routes = require('./rutas/routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));

routes(app);

app.listen('3306', () =>{
    console.log('Listening on port 3306');
})