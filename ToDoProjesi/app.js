'use strict';

var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
const session = require('express-session');

var app = express();

app.use(session({
    secret: 'todoprojesii',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

var middleware = require('./routes/middleware')(app);


app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/', routes);
app.set('port', process.env.PORT || 3000);


var server = app.listen(app.get('port'), function () {
    console.log('Server Baslatildi.')
});
