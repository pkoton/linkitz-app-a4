
//in the simulator, components are at fixed locations
// so QueueNextComponentToLightUp = ['hub','led','usb','motion'];
var hub_port = 0; 
var led_port = 1;
var usb_port = 2;
var motion_port = 3;
var QueueNextComponentToLightUp = [0,1,2,3];

function Queue_move_to_front(queue, component) {
  if (queue[0] != component) { // if component is not already at the front
   // is it in the queue?
   var index = queue.indexOf(component);
   // if yes, splice it out 
   if (index > -1) {
    queue.splice(index, 1);
    }
    // put it on the front
    queue.unshift(component); 
  }
}

function Queue_move_to_end(queue,component) {
  if (queue[queue.length] != component) { // if component is not already at the end
   // is it in the queue?
   var index = queue.indexOf(component);
   // if yes, splice it out 
   if (index > -1) {
    queue.splice(index, 1);
    }
    // put it at the end 
     queue.push(component); 
  } 
}

function Queue_move_first_to_last(queue) {
   var item = queue.splice(0, 1);
  // put it at the end 
    queue.push(item);
    console.log("QueueNextComponentToLightUp " + queue);
  }

// calling this function changes QueueNextComponentToLightUp
Blockly.JavaScript['on_regular_event'] = function(block) {
  console.log("in on_regular_event");
  var code = Blockly.JavaScript.statementToCode(block, 'DO_THIS');
  Queue_move_to_front(QueueNextComponentToLightUp, hub_port);
  return code;
};

// calling this function changes QueueNextComponentToLightUp
Blockly.JavaScript['on_motion_trigger'] = function(block) {
  console.log("in on_motion_trigger");
  var code = Blockly.JavaScript.statementToCode(block, 'DO_THIS');
  Queue_move_to_front(QueueNextComponentToLightUp, motion_port);
  return code;
};

Blockly.JavaScript['flash_leds'] = function(block) {
  console.log("in flash_leds");
  input_block = block.getInputTargetBlock('COLOR');
  code = '';
  if (!input_block) {
    //console.log("in flash_leds 1");
    // *****  input is blank or null
     // select a color and component at random 
      var this_color = "#" + toHex(getRandomInt(0, 255)) + toHex(getRandomInt(0, 255)) + toHex(getRandomInt(0, 255));
      if (!this_color) {
        this_color = '#b9b9b9';
      }
      var this_part = getRandomInt(0, 4);
      switch (this_part) {
      case 0: //hub
        code = flash_hub_code(this_color);
        break;
      case 1: // led or top
        code = flash_port_1_code(this_color);
        break;
      case 2: // usb or right
        code = flash_port_2_code(this_color);
        break;
      case 3: // motion or left
        code = flash_port_3_code(this_color);
        break;
      default:
        this_color = '#b9b9b9';
        code = flash_hub_code(this_color);
        break;
      }
  }
  else if (input_block.type == 'colour_picker') {
    //console.log("in flash_leds 2");
      var this_color = Blockly.JavaScript.valueToCode(block, 'COLOR', Blockly.JavaScript.ORDER_NONE) || '#b9b9b9';
      //alert(this_color);
      var this_part = QueueNextComponentToLightUp[0];
      if (this_part == 0) {
      //case 0: //hub
        code = flash_hub_code(this_color);
      } else
      if (this_part ==  1) {
      //case 1: // led or top
        code = flash_port_1_code(this_color);
      }  else
      if (this_part ==  2) {
      //case 2: // usb or right
        code = flash_port_2_code(this_color);
      }  else
      if (this_part ==  3) {
      //case 3: // motion or left
        code = flash_port_3_code(this_color);
      }
      else {
      //default:
        code = flash_hub_code(this_color);
        }
    Queue_move_first_to_last(QueueNextComponentToLightUp);
    }
  else { // if we get here it is an error - flash red
      console.log("in flash_leds 3");
      this_color = '#ff0000';
        code = flash_hub_code(this_color);
    } 
  //console.log("here end");
  return code;
};

Blockly.JavaScript['colour_picker'] = function(block) {
  // Colour picker.
  var code = block.getFieldValue('COLOUR');
  return [code, Blockly.JavaScript.ORDER_NONE];
};

// led_attached returns 0 if the LED link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc 
// for tutorial level 1-2, it is always at port 1
// calling this function changes QueueNextComponentToLightUp

Blockly.JavaScript['led_attached'] = function(block) {
  Queue_move_to_front(QueueNextComponentToLightUp,parseInt(led_port, 2)); 
  return led_port;
}

// usb_attached returns 0 if the LED link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc 
// for tutorial level 1-2, it is always at port 2
// calling this function changes QueueNextComponentToLightUp

Blockly.JavaScript['usb_attached'] = function(block) {
  Queue_move_to_front(QueueNextComponentToLightUp,parseInt(usb_port, 2));
  return usb_port;
}

// motion_attached returns 0 if the LED link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc 
// for tutorial level 1-2, it is always at port 3
// calling this function changes QueueNextComponentToLightUp
Blockly.JavaScript['motion_attached'] = function(block) {
  Queue_move_to_front(QueueNextComponentToLightUp,parseInt(motion_port, 2));
  return motion_port;
}

function flash_hub_code(this_color){ // returns code to flash hub the specified hex color
  console.log("flash_hub_code " + this_color);
    var code = '';
    code += 'var canvas = document.getElementById(\'canvas0\');';
    code += 'if (canvas.getContext) {';
      code += 'var ctx = canvas.getContext(\'2d\');';
      code += 'var gradient = ctx.createRadialGradient(175,130,100,175, 130,0);';
      code += 'gradient.addColorStop(0,\"' + this_color+ '\");';
      code += 'gradient.addColorStop(1,\"#ffffff\");';
      code += 'ctx.fillStyle = gradient;';
      code += 'ctx.beginPath();';
      code += 'ctx.moveTo(125, 100);';
      code += 'ctx.lineTo(225, 100);';
      code += 'ctx.lineTo(175, 187);';
      code += 'ctx.lineTo(125, 100);';
      code += 'ctx.fill();';
      code += 'setTimeout(lkz.draw, flash_time);}';
  return code;
}

function flash_port_1_code(this_color){ // returns code to flash top petal the specified hex color
  console.log("flash_port_1_code " + this_color);
    var code = '';
    code += 'var canvas = document.getElementById(\'canvas0\');';
    code += 'if (canvas.getContext) {';
    code += 'var ctx = canvas.getContext(\'2d\');';
        code += 'var gradient = ctx.createRadialGradient(175,75,90,175,75,0);';
        code += 'gradient.addColorStop(0,\"' + this_color+ '\");';
        code += 'gradient.addColorStop(1,\"#ffffff\");';
        code += 'ctx.fillStyle = gradient;';
        code += 'var x = 175;'; // x coordinate
        code += 'var y = 98;'; // y coordinate
        code += 'var radius = 48;'; // Arc radius
        code += 'var startAngle = 0;'; // Starting point on circle
        code += 'var endAngle = Math.PI;'; // End point on circle
        code += 'var anticlockwise = true;'; // clockwise or anticlockwise    
        code += 'ctx.beginPath();';
        code += 'ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);';
        code += 'ctx.fill();';
        code += 'setTimeout(lkz.draw, flash_time);}';
        return code;
}

function flash_port_2_code(this_color){ // returns code to flash right petal the specified hex color
  var code = '';
  code += 'var canvas = document.getElementById(\'canvas0\');';
    code += 'if (canvas.getContext) {';
    code += 'var ctx = canvas.getContext(\'2d\');';
    code += 'var gradient = ctx.createRadialGradient(220,160,100,220,160,0);';
        code += 'gradient.addColorStop(0,\"' + this_color+ '\");';
        code += 'gradient.addColorStop(1,\"#ffffff\");';
        code += 'ctx.fillStyle = gradient;';
        code += 'var x = 202;'; // x coordinate
        code += 'var y = 145;'; // y coordinate
        code += 'var radius = 50;'; // Arc radius
        code += 'var startAngle = (2 *Math.PI)/3;'; // Starting point on circle
        code += 'var endAngle = (5 * Math.PI)/3;'; // End point on circle
        code += 'var anticlockwise = true;'; // clockwise or anticlockwise    
        code += 'ctx.beginPath();';
        code += 'ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);';
        code += 'ctx.fill();';
        code += 'setTimeout(lkz.draw, flash_time);}';
  return code;
}

function flash_port_3_code(this_color){ // returns code to flash left petal the specified hex color
  var code = '';
  code += 'var canvas = document.getElementById(\'canvas0\');';
    code += 'if (canvas.getContext) {';
    code += 'var ctx = canvas.getContext(\'2d\');';
    code += 'var gradient = ctx.createRadialGradient(130,143,100,130,143,0);';
        code += 'gradient.addColorStop(0,\"' + this_color+ '\");';
        code += 'gradient.addColorStop(1,\"#ffffff\");';
        code += 'ctx.fillStyle = gradient;';
        code += 'var x = 148;'; // x coordinate
        code += 'var y = 145;'; // y coordinate
        code += 'var radius = 50;'; // Arc radius
        code += 'var startAngle = (4 *Math.PI)/3;'; // Starting point on circle
        code += 'var endAngle = Math.PI/3;'; // End point on circle
        code += 'var anticlockwise = true;'; // clockwise or anticlockwise    
        code += 'ctx.beginPath();';
        code += 'ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);';
        code += 'ctx.fill();';
        code += 'setTimeout(lkz.draw, flash_time);}';
  return code;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function toHex(n) {
 n = parseInt(n,10);
 if (isNaN(n)) return "00";
 n = Math.max(0,Math.min(n,255));
 return "0123456789ABCDEF".charAt((n-n%16)/16)
      + "0123456789ABCDEF".charAt(n%16);
}