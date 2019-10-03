'use strict'

// Handle SIGINT interrupt produced by Ctrl+C
if (process.platform === "win32") {
    let rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.on("SIGINT", function rl_sigint() {
        process.emit("SIGINT")
    })
}

//graceful shutdown
process.on("SIGINT", function process_sigint() {
    process.exit()
})

// dhcpd-leases parser and filewatcher
var fs = require('fs');
// leases file parser
var dhcpdleases = require('dhcpd-leases');

// we need this 
const http = require('http');
const express = require('express');
var expressWs = require('express-ws');
const app = express();

// listen on 8080
//const server = app.listen(8080, () => {
//   console.log(`Express running → PORT ${server.address().port}`);
//  });

var port = 80;
var server = http.createServer(app);
var expressWs = expressWs(app, server);

var hostpath = "127.0.0.1";
var clientpath = 'ws://' + hostpath + '/client';
console.log('setting up insecure serving http://' + hostpath + '/, and ' + clientpath);

//set our views
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.static('public'));
app.set(__dirname + '/views');

try {
    server.listen(port, function () {
        console.log('server listening at ' + hostpath);
    });
} catch (e) {
    console.log('error attempting to start server: ' + e);
}

/**
 *
 * Establish a websocket connection to any web client
 *
 */
app.ws('/client', function (ws, req) {
    ws.fromRoute = 'client';
    console.log('client route opened');

    ws.on('message', function (message) {
        console.log('client route received message: ' + message + ' from web client');
    });

    try { ws.send('Connection established!'); }
    catch (e) { }

    var s = fs.readFileSync('dhcpd.leases', 'utf-8');
    // json object of leases file
    var data = dhcpdleases(s);
    try { ws.send(JSON.stringify(data)); }
        catch (e) { }

    ws.on('close', () => console.log('client disconnected'));
    ws.on('error', () => console.log('something is amiss with the client'));
});

// set root to render index.pug
app.get('/', function (req, res) {
    res.render('index.pug', { clientpath: clientpath });
});

function clientBroadcast(data) {
    expressWs.getWss().clients.forEach(function (ws) {
        if (ws.readyState === 1 && ws.fromRoute == 'client') {
            ws.send(JSON.stringify(data));
        }
    });
}

function updateList() {



}

// 404. Any page that does not have a route
app.get('*', function (req, res) {
    res.status(404).send('Oops');
});


function noop() { }

