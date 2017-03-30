#!/usr/bin/env node
"use strict";

/* eslint-disable no-console */

const express = require("express");
const http = require("http");
const serveStatic = require("serve-static");
const morgan = require("morgan");
const ArgumentParser = require("argparse").ArgumentParser;

const parser = new ArgumentParser({
  addHelp: true,
  description: "Starts a server to run the in-browser tests for wed." });

parser.addArgument(["-v", "--verbose"], {
  help: "Run verbosely.",
  action: "storeTrue",
});

parser.addArgument(["address"], {
  nargs: "?",
});

const args = parser.parseArgs();
const verbose = args.verbose;
const address = args.address;
let ip;
let port;
if (address) {
  const parts = address.split(":");
  ip = parts[0];
  port = parts[1];
}

const cwd = process.cwd();
const app = express();

// This is the crucial bit in this server. Module d is arbitrarily delayed.
app.use((req, res, next) => {
  if (req.path === "/d.js") {
    setTimeout(next, 3000);
    return;
  }
  next();
});
app.use(serveStatic(cwd));

if (verbose) {
  const logFile = process.stdout;
  app.use(morgan("combined", { stream: logFile }));
}

function runserver() {
  if (!ip) {
    const server = http.createServer(app).listen();
    ip = "0.0.0.0";
    port = server.address().port;
    app.set("port", port);
  }
  else {
    app.listen(port, ip);
  }
}

runserver();

//  LocalWords:  url querystring ajax txt json
