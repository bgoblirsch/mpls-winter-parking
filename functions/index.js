const functions = require('firebase-functions');
const http = require("http");
const admin = require('firebase-admin');
admin.initializeApp();

const host = "www2.minneapolismn.gov"
const path = "/snow/index.htm"

const options = {
  hostname: host,
  port: 80,
  path: path,
  method: "GET",
  headers: {
    "Content-Type": "text/html"
  }
};

var result = "";
var text = "";
let status = "";

const req0 = http.request(options, (res0) =>
  {
    res0.setEncoding("utf8");
    res0.on("data", (d) => {
      result += String(d);
    });
    res0.on("end", () => {
      text = result;
      let indexStart = text.indexOf("<h3>");
      indexStart += 4;
      let indexEnd = text.indexOf("</h3>");
      status = text.substring(indexStart, indexEnd);
    })
  }).on("error", (e) => {
    const err = "Got error:"+e.message;
    res0.send(err);
});

req0.write("body");

exports.getStatus = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  let date = new Date();
  let hours = date.getHours();
  // jan == 0
  let m = date.getMonth() + 1;
  let day = date.getDate();
  // account for UTC -> CST (CST is 6 hours behind UTC)
  if (hours < 6):
    day -= 1;
  // MM-DD-YYYY format
  let dateText = m + '-' + date.getDate() + '-' + date.getFullYear();
  console.log({dateText});

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    // write to firebase realtime
    const writeResult = await admin.firestore().collection("status").doc(dateText).set({ status: status });
    console.log("status: " + status);
    res.send(status);
  }
})
