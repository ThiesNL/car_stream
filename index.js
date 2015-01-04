var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');

var five = require("johnny-five");
var os = require("os");
var board = new five.Board();
var localConfig = require('../config/config.json');
var forward, backwards, left, right, led, led_13;

var spawn = require('child_process').spawn;
var proc;

app.use(express.static(__dirname + '/'));

app.use('/', express.static(path.join(__dirname, 'stream')));


app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var sockets = {};
board.on("ready", function () {

      // Johnny- five
        forward = new five.Led(
          localConfig.local.forward);
        forward.off();

        backwards = new five.Led(
          localConfig.local.backwards);
        backwards.off();

        left = new five.Led(
          localConfig.local.left);
        left.off();

        right = new five.Led(
          localConfig.local.right);
        right.off();

        led = new five.Led(
          localConfig.local.led);
        led.off();

        led_13 = new five.Led(
          localConfig.local.led_13);
        led_13.on();

    io.on('connection', function(socket) {
    // io.sockets.on("connection", function (socket) {


      sockets[socket.id] = socket;
      console.log("Total clients connected : ", Object.keys(sockets).length);

      socket.on('disconnect', function() {
        delete sockets[socket.id];

        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
          app.set('watchingFile', false);
          if (proc) proc.kill();
          fs.unwatchFile('./stream/image_stream.jpg');
        }
      });

      socket.on('start-stream', function() {
        startStreaming(io);
      });

      // 
        socket.on('forwardOn', function(data){
          forward.on();
          console.log("forwardOn");
        });

        socket.on('forwardOff', function(data){
          forward.off();
          console.log("forwardOff");
        });

        socket.on('backwardsOn', function(data){
          backwards.on();
          console.log("backwardsOn");
        });

        socket.on('backwardsOff', function(data){
          backwards.off();
          console.log("backwardsOff");
        });


        socket.on('leftOn', function(data){
          left.on();
          console.log("leftOn");
        });

        socket.on('leftOff', function(data){
          left.off();
          console.log("leftOff");
        });

        socket.on('rightOn', function(data){
          right.on();
          console.log("rightOn");
        });

        socket.on('rightOff', function(data){
          right.off();
          console.log("rightOff");
        });
        socket.on('ledOn', function(data){
            led.on();
            console.log("ledOn");
        });
        socket.on('ledOff', function(data){
            led.off();
            console.log("ledOff");
        });

        // 

    });

    http.listen(3000, function() {
      console.log('listening on *:3000');
      led.blink(500);
    });



    function stopStreaming() {
      if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./stream/image_stream.jpg');
      }
    }

    function startStreaming(io) {

      if (app.get('watchingFile')) {
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        console.log("photo_1")
        return;
      }

      // var args = ["-w", "320", "-h", "240", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
      // proc = spawn('raspistill', args);

      console.log('Watching for changes...');
      

      app.set('watchingFile', true);

      // fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
      //   io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
      //   console.log("photo_2")
      // })
      setInterval(function(){
      var args = ["-w", "320", "-h", "240", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "50"];
      proc = spawn('raspistill', args);
        io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
        
      }, 100);


    }

  });
