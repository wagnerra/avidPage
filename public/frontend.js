$(function () {
    "use strict";
  
    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
  
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    var initialMap = false;
  
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
  
    // if browser doesn't support WebSocket, just show
    // some notification and exit
    if (!window.WebSocket) {
      content.html($('<p>',
        { text:'Sorry, but your browser doesn\'t support WebSocket.'}
      ));
      input.hide();
      $('span').hide();
      return;
    }
  
    // open connection
    // TODO: Replace the hard-coded 8080 Server Port
    var connection = new WebSocket('ws://127.0.0.1:8080', 'echo-protocol');
  
    connection.onopen = function () {
      // first we want users to enter Robot Serial Number
      input.removeAttr('disabled');
      status.text('Command:');
    };
  
    connection.onerror = function (error) {
      // just in there were some problems with connection...
      content.html($('<p>', {
        text: 'Sorry, but there\'s some problem with your '
           + 'connection or the server is down.'
      }));
    };
  
    // incoming messages
    connection.onmessage = function (message) {
      // try to parse JSON message. Because we know that the server
      // always returns JSON this should work without any problem but
      // we should make sure that the massage is not chunked or
      // otherwise damaged.
      try {
        var json = JSON.parse(message.data);
      } catch (e) {
        console.log('Invalid JSON: ', message.data);
        return;
      }
      if (json.type === 'color') { 
        myColor = json.data;
        status.text(myName + ': ').css('color', myColor);
        input.removeAttr('disabled').focus();
        // from now user can start sending messages
      } else if (json.type === 'robot-data') { // robot data
         // let the user write another message
        input.removeAttr('disabled'); 
        if (json.data.type === 'robot-data') {
          draw_map(json.data)
        }
        else
        if (json.data.type === 'robot-clean') {
          if (json.data.status === 'CLEANING') {
            if (initialMap) {
               draw_clean(json.data)
            }
            addPanelMessage('blue', new Date(json.data.timestamp), 
                 'Cleaned Area = ' + (Math.trunc(100 * (json.data.cleaned / json.data.spacesToClean))) + '%')
          }
          else
          if (json.data.status === 'FINISHED') {
            addPanelMessage('red', new Date(json.data.timestamp), 
                 'FINISHED - Very Good Job. The floor is shining !!!')
          }
          else {
            addPanelMessage('black', new Date(json.data.timestamp), 
                 json.data.status)
          }
        }
        else {
          console.log('Hmm..., I\'ve never seen JSON like this:', json);
        }
      } else {
        console.log('Hmm..., I\'ve never seen JSON like this:', json);
      }
    };
  
    /**
     * Send message when user presses Enter key
     */
    input.keydown(function(e) {
      if (e.keyCode === 13) {
        var msg = $(this).val();
        if (!msg) {
          return;
        }
        // send the message as an ordinary text
        connection.send('WEB ' + msg);
        $(this).val('');
        // disable the input field to make the user wait until server
        // sends back response
        input.attr('disabled', 'disabled');
  
        // we know that the first message sent from a user their name
        if (myName === false) {
          myName = msg;
        }
        // draw();
      }
    });
  
    /**
     * This method is optional. If the server wasn't able to
     * respond to the in 3 seconds then show some error message 
     * to notify the user that something is wrong.
     */
    setInterval(function() {
      if (connection.readyState !== 1) {
        status.text('Error');
        input.attr('disabled', 'disabled').val(
            'Unable to communicate with the WebSocket server.');
      }
    }, 3000);
  
    function addPanelMessage(color, dt, message) {
      content.prepend('<p><span style="color:' + color + '">'
          + (dt.getHours() < 10 ? '0'
          + dt.getHours() : dt.getHours()) + ':'
          + (dt.getMinutes() < 10
            ? '0' + dt.getMinutes() : dt.getMinutes()) + ':' 
            + (dt.getSeconds() < 10
            ? '0' + dt.getSeconds() : dt.getSeconds())   
          + ': ' + message + '</span></p>');
    }

    function draw_clean(json) {
      var canvas = document.getElementById('canvas');
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        var grid = []
        grid = json.gridStatus

        var spaceHeight = Math.trunc(380 / json.lines)
        var spaceWeight = Math.trunc(380 / json.cols)

        var i = json.currentLine;
        var j = json.currentCol;

        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.moveTo(10 + j*spaceWeight, 10 + i*spaceHeight)
        ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight)
        ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight + spaceHeight)
        ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight + spaceHeight)
        ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight)
        ctx.fill();   
      }
    }

    function draw_map(json) {
      var canvas = document.getElementById('canvas');
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.clearRect(0, 0, 400, 400); // clear canvas
        ctx.stroke();

        var grid = []
        grid = json.gridStatus

        var spaceHeight = Math.trunc(380 / json.lines)
        var spaceWeight = Math.trunc(380 / json.cols)

        // Drawing the walls
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        for (var i=0; i < json.lines; i++) {
            for (var j=0; j < json.cols; j++) {
              if (grid[i][j] === 0) {
                  ctx.moveTo(10 + j*spaceWeight, 10 + i*spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight + spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight + spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight)
                  ctx.fill()
              }
            }
        }
        ctx.stroke();

        // Drawing spaces already cleaned
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        for (var i=0; i < json.lines; i++) {
            for (var j=0; j < json.cols; j++) {
              if (grid[i][j] === 2) {
                  ctx.moveTo(10 + j*spaceWeight, 10 + i*spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight + spaceWeight, 10 + i*spaceHeight + spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight + spaceHeight)
                  ctx.lineTo(10 + j*spaceWeight, 10 + i*spaceHeight)
                  ctx.fill()
              }
            }
        }
        ctx.stroke();
        initialMap = true;
      }
    }

  });
