const PORT = process.env.PORT || 3000;
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const mongoose = require('mongoose');
const funcs = require('./functions.js')

const uri = process.env.MONGOLAB_URI;

console.log(uri);
mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
  .then(() => console.log('DB Connected!'))
  .catch(err => {
    console.log('DB Connection Error: ' + err.message);
  });

var MoistureModel = require('./models/moistureModel');
var Configmodel = require('./models/configModel');

const server = http.createServer();
const sensorCon = new WebSocket.Server({ noServer: true });
const clientCon = new WebSocket.Server({ noServer: true });
const calibrationCon = new WebSocket.Server({ noServer: true });

//Připojení od senzoru, podle ID senzoru uloži data do databáze
sensorCon.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    const array = data.split(':');
    const moisture = new MoistureModel({ sensorID: array[0], moisture: array[1] });
    moisture.save().then(err => console.log(err));
  });
});

//Připojení od telefonu, podle ID senzoru odpoví poslední hodnotou vlhkosti
clientCon.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    funcs.findLatestRecord(parseInt(data)).then(result => {
      ws.send(result);
    })
  });
});

//Připojení od telefonu pro calibraci, podle posledního čísla ve zprávě
//aktualizuje hodnotu do konfigurační databáze s příslušným označením (WET/DRY)
calibrationCon.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    const array = data.split(':');
    switch (array[2]) {
      case "10":
        Configmodel.updateOne({ sensorID: array[0] }, {
          dry: array[1],
        }, function (err, docs) {
          if (err) {
            console.log(err)
          }
        });
        break;

      case "11":
        Configmodel.updateOne({ sensorID: array[0] }, {
          wet: array[1],
        }, function (err, docs) {
          if (err) {
            console.log(err)
          }
        });
        break;
    }
  });
});

//Routuje různe URL na jednotlivé připojení, *Mohl by se přidat router*
server.on('upgrade', function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/sensor') {
    sensorCon.handleUpgrade(request, socket, head, function done(ws) {
      sensorCon.emit('connection', ws, request);
    });
  } else if (pathname === '/client') {
    clientCon.handleUpgrade(request, socket, head, function done(ws) {
      clientCon.emit('connection', ws, request);
    });
  } else if (pathname === '/calibration') {
    calibrationCon.handleUpgrade(request, socket, head, function done(ws) {
      calibrationCon.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT);