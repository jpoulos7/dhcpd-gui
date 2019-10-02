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
// read the leases file 
var s = fs.readFileSync('dhcpd.leases', 'utf-8');
// json object of leases file
var data = dhcpdleases(s);
//console.log(data);

// we need this 
const express = require('express');
const app = express();

// listen on 8080
const server = app.listen(8080, () => {
    console.log(`Express running → PORT ${server.address().port}`);
  });

//set our views
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.static('public'));
app.set(__dirname + '/views');

// set root to render index.pug
app.get('/', function (req, res) {
    res.render('index.pug', { leases: data });
});

// 404. Any page that does not have a route
app.get('*', function (req, res) {
    res.status(404).send('Oops');
});



