const http = require('http');
const app = require ('./src/app');

http.createServer(app.callback()).listen(3000);
