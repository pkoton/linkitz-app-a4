// This file has lots of code for blocks not being used in alpha release of product //
// Archived April 6, 2015 //

'use strict';

// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// // Flash LEDs takes a single color or a list of 1 or more colors, or a number or a list of numbers, 
// and flashes the attached LEDs according to recentness of use.
// If no input, it lights up random LEDs.  Behavior of numbers mod 3 /= 0  are undefined.

Blockly.Python['flash_leds'] = function(block) {
    // valueToCode returns the color/colorlist as a string in single quotes
    // format '#FFFFFF' single color or ['#ff0000', '#009900', '#3333ff'] color list
    // if no color is attached this will flash random colors 
  var value_color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC) ;
  var code = '';
  if (value_color == 'None') {
    code = 'systemFlash()\n';
  }
  else if (value_color.charAt(1) == '#') { // input is a single color in hex, convert to RGB
    var value_color_rgb = hexToRGB(value_color);
    // construct call to Flash(char len, char colorVals[len]), len is 3 (just one rgb triplet)
    code = 'systemFlash([3, ' + value_color_rgb + '])\n';
  }
  else if (value_color.match(/^[0-9\.]+$/)) { // input is any single positive decimal number
    var newcolor = HSVtoRGB(value_color, 0.91 , 0.86); // construct an RBG color using input as H, Linkitz S, Linkitz V
    newcolor.unshift(3);
    code = 'systemFlash(' + newcolor + ')\n'; 
  }
  else if (value_color.charAt(0) == '[') { // input is a string representing a list 
    // separate the items
    var colornum = 0; // we need to count how many items are represented in the list
    var arrayRGB = new Array();
    var value_color_items = value_color.slice(1, value_color.length-1); // remove brackets around string colorlist
    var value_color_array = value_color_items.split(", "); // that space after the comma is important
    for (var i in value_color_array) {
      var item = value_color_array[i];
      if (item != 'None') { // skip blanks in any list
        if (item.charAt(1) == '#') {
          var colorhex = item; // convert '#AABBCC' to [r,g,b]
          arrayRGB = arrayRGB.concat(hexToRGB(colorhex)); // add the triplet to list of colors
          colornum +=3;
        }
        else if (item.match(/^[0-9\.]+$/)) { // convert any positive number to 0-255 and add to list
          arrayRGB.push(item % 255);
          colornum +=1;
        }
        else {
          arrayRGB.push(0); // rando stuff just add a zero
          colornum +=1;
        }
      }
    }
    // construct call to Flash(char len, char colorVals[len])
    if (colornum == 0) {
      code = 'systemFlash()\n';
      }
    else {
    code = 'systemFlash(' + colornum + ',' + arrayRGB + ')\n';
    }
  }
  else {// null input - tell hub to light up random lights
    code = 'systemFlash()\n';
  }
  return code;
};

// THIS IS NOT CURRENTLY BEING USED
// Flash LEDs takes a single color or a list of 1 or more colors, or a list of numbers, and flashes the attached LEDs
// according to recentness of use.
// Note: Blockly colours are represented as strings of the form "#rrggbb" where "rr", "gg", and "bb"
// represent the red, green, and blue components, respectively, in the hexadecimal range 00 to ff.
// the leading # is included

// what if the list is not a list of colors? catch error
/*
Blockly.Python['flash_leds'] = function(block) {
    // valueToCode returns the color/colorlist as a string in single quotes
    // format '#FFFFFF' single color or ['#ff0000', '#009900', '#3333ff'] color list
    // if no color is attached this will flash random colors 
  var value_color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC) ;
  if (value_color.charAt(1) == '#') {
    // if it's a single color, convert to decimal
    var value_color_rgb = hexToRGB(value_color);
    // construct call to Flash(char len, char colorVals[len]), len is 3 (just one rgb triplet)
    var code = 'Flash(3, ' + value_color_rgb + ')\n';
    }
  else if (value_color.charAt(0) == '[') {
    // if it is a string representing a colorlist
    // separate the colors
    var colornum = 0; // we need to count how many colors are in the list
    var arrayRGB = new Array();
    var value_color_items = value_color.slice(1, value_color.length-1); // remove brackets around string colorlist
    var value_color_array = value_color_items.split(", "); // that space after the comma is important
    for (var i in value_color_array) {
      colornum +=1;
      if (value_color_array[i]== 'None') {
        value_color_array[i]= '#000000'
      }
      var colorhex = value_color_array[i]; // convert '#AABBCC' to [r,g,b]
      arrayRGB = arrayRGB.concat(hexToRGB(colorhex)); // add the triplet to list of colors
    }
    // construct call to Flash(char len, char colorVals[len])
    var code = 'Flash(' + colornum*3 + ',' + arrayRGB + ')\n';
  }
  else // tell hub to light up random lights
    var code = 'Flash([24';
    for (var i =1; i < 25; i++) {
      // code = code + '\'random()\', ';
      code = code + ', random()';
    }
    code = code + '])\n'
  return code;
};
*/

// convert a hexidecimal color string to 0..255 R,G,B, remember that first char is a ' and second char is a #
// example input: '#ff00cc

function hexToRGB (hex){
    var r = parseInt(hex.substr(2,2),16);
    var g = parseInt(hex.substr(4,2),16);
    var b = parseInt(hex.substr(6,2),16);
    return [r,g,b];
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    var normH = (h % 360)/360; 
    i = Math.floor(normH * 6);
    f = normH * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);
    return [r,g,b];
}

// Sparkle lights up a random series of 6 LEDs anywhere on the Linkitz in random colors.

Blockly.Python['sparkle'] = function(block) {
  var arrayRGB = new Array(); //new array to hold the colors
  // generate random colors
  for (var i=0; i <18; i++) {
    // create a random number between 0 and 255
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    arrayRGB.push(r,g,b);
    }
  var code = 'Flash(18, ' + arrayRGB + ')\n';
  return code;
};

// Advanced: LED Output - Passing in a single color lights up a random LED somewhere on the Linkitz that color
// Passing a list of colors will light a set of lights indexed by petal type (in terms of recentness of use) and then by priority.
// POSTPONED

Blockly.Python['ledoutput'] = function(block) {
  var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// Light the LED connected to next highest number port in specified color

Blockly.JavaScript['ledoutput1'] = function(block) {
  var colour_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.JavaScript['ledoutput2'] = function(block) {
  var colour_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.JavaScript['ledoutput3'] = function(block) {
  var colour_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************


Blockly.Python['onmotiontrigger'] = function(block) {
  var dothis = Blockly.Python.statementToCode(block, 'NAME');
  var code = 'on_motion_trigger ():\n' + dothis;
  return code;
};

// Advanced: Get Motion Data reads motion sensor
// What does it do? 
//     1? return a list (magnitude, x,y,z)
//     2? set a global variable and return TRUE
// If no motion link is present, returns an empty list
// If more then one motion sensor is present ...?

Blockly.Python['get_motion_data'] = function(block) {
  var code = '[' + get_motion_data() + ']\n';
  return code;
};

// Advanced: Set Motion Trigger - POSTPONED

Blockly.Python['setmotiontrigger'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// **************************************************************************************************
// MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE
// **************************************************************************************************

Blockly.Python['on_microphone_trigger'] = function(block) {
  var statements_name = Blockly.Python.statementToCode(block, 'NAME');
  var code = 'OnMicrophoneTrigger():' + statements_name + '\n';
  return code;
};

// Advanced:

Blockly.Python['getmicdata'] = function(block) {
  var code = 'GetMicData()\n';
  return code;
};

// Advanced: POSTPONED

Blockly.Python['set_mic_threshold'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.JavaScript['read_sound_levels'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


// **************************************************************************************************
// SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER
// **************************************************************************************************

// POSTPONED

// Call for speaker to play a sound file

Blockly.Python['speaker_play_sound'] = function(block) {
  var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
  
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// Use a pre-defined sound

Blockly.Python['sound_from_file'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble Python into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// Advanced: Play data stream - Play a list of samples as it is being received 

Blockly.Python['playdatastream'] = function(block) {
  var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// Advanced: Sound with frequency - make a sound with provided FDV

Blockly.Python['sound_fdv'] = function(block) {
  var value_frequency = Blockly.Python.valueToCode(block, 'Frequency', Blockly.Python.ORDER_ATOMIC);
  var value_duration = Blockly.Python.valueToCode(block, 'Duration', Blockly.Python.ORDER_ATOMIC);
  var value_volume = Blockly.Python.valueToCode(block, 'Volume', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// **************************************************************************************************
// RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO
// **************************************************************************************************

Blockly.Python['radio_onreceive'] = function(block) {
  var statements_name = Blockly.Python.statementToCode(block, 'NAME');
  var code = 'radio_onreceive():\n' + statements_name + '\n';
  return code;
};

Blockly.Python['createmessage'] = function(block) {
  var value_messagename = Blockly.Python.valueToCode(block, 'MessageName', Blockly.Python.ORDER_ATOMIC);
  var statements_name = Blockly.Python.statementToCode(block, 'NAME');
  var code = value_messagename + ' = ' + statements_name +'\n'; // statements name is just a string
  return code;
};

Blockly.Python['transmit2'] = function(block) {
  var value_targetid = Blockly.Python.valueToCode(block, 'targetid', Blockly.Python.ORDER_ATOMIC) || 0;
  var value_message = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  // var value_range = Blockly.Python.valueToCode(block, 'range', Blockly.Python.ORDER_ATOMIC);
  var code = 'Transmit(' + value_targetid + ', ' + value_message +')\n';
  return code;
};

// Advanced: Read and return range estimate from radio

Blockly.Python['radiogetrange'] = function(block) {
  var code = 'GetRadioRange()\n';
  return code;
};

// Advanced: Get Radio Data returns the most recently received radio message as a list with the sender,  message and range
// If no radio is present, it returns the empty list

Blockly.Python['getradiodata'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// Advanced: getidfromradio returns the ID stored in the attached radio petal as an integer. If not radio petal is attached, returns -1

Blockly.Python['getidfromradio'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// Advanced:

Blockly.Python['setradioeventtrigger'] = function(block) {
  var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.JavaScript['getidfromradioatport'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

Blockly.Python['on_initialization'] = function(block) {
  var dothis = Blockly.Python.statementToCode(block, 'NAME');
  var code = 'on_initialization ():\n' + dothis;
  return code;
};

Blockly.Python['on_regular_event'] = function(block) {
  var statements_name = Blockly.Python.statementToCode(block, 'NAME');
  var dothis = Blockly.Python.statementToCode(block, 'NAME');
  var code = 'on_regular_event ():\n' + dothis;
  return code;
};

// Advanced: return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good

Blockly.Python['get_battery_level'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// Advanced: returns a reading from the ambient light sensor in the hub

Blockly.Python['get_ambient_light'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// the ROSTER is a list of links connected to the hub. it is represented by a 3-tuple where position in the list
// corrresponds to port number and the link type is repsented by an integer
// 1=LED, 2=Motion, 3=Mic, 4=Spkr, 5=Radio, 0=no link connected at this position
// example: hub with LED at port2 and motion at port3 returns (0,1,2)

Blockly.Python['getroster'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.JavaScript['roster_event']= function(block) {
  var value_linkroster = Blockly.JavaScript.valueToCode(block, 'LinkRoster', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_script = Blockly.JavaScript.statementToCode(block, 'Script');
  // var priority = 4-length(value_linkroster);
  // TODO: Assemble JavaScript into code variable.
  var code = 'pass // When this list matches the one updated by the hub, use the set of event handlers in statements_script';
  return code;
};

Blockly.JavaScript['roster_list'] = function(block) {
  var value_link1 = Blockly.JavaScript.valueToCode(block, 'Link1', Blockly.JavaScript.ORDER_ATOMIC);
  var value_link2 = Blockly.JavaScript.valueToCode(block, 'Link2', Blockly.JavaScript.ORDER_ATOMIC);
  var value_link3 = Blockly.JavaScript.valueToCode(block, 'Link3', Blockly.JavaScript.ORDER_ATOMIC);
  var statements_rostercode = Blockly.JavaScript.statementToCode(block, 'Rostercode');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['roster_event_two'] = function(block) {
  var dropdown_link3 = block.getFieldValue('Link3');
  var dropdown_link2 = block.getFieldValue('Link2');
  var dropdown_link1 = block.getFieldValue('Link1');
  var statements_script = Blockly.JavaScript.statementToCode(block, 'Script');
  // TODO: Assemble JavaScript into code variable.
  var linkRoster =[]
  // TODO: append non 'None' values to this list
  var priority= 4-length(linkRoster)
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.JavaScript['connection_event'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var statements_script = Blockly.JavaScript.statementToCode(block, 'script');
  // TODO: Assemble JavaScript into code variable.
  var code = 'pass  // execute this script once when this link is plugged in';
  return code;
};

// getmyid returns a number that is the ID of this hub

Blockly.Python['getmyid'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

// writeidtoradio writes this hub's ID to the radio petal. see below for alternate version write_this_idtoradio

Blockly.Python['writeidtoradio'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// alternate version write_this_idtoradio takes a number as input and writes that number to the attached radio petal
// dangerous because it allows user to spoof being a different user, but might be useful for forwarding  in a mesh network

Blockly.Python['write_this_idtoradio'] = function(block) {
  var value_id = Blockly.Python.valueToCode(block, 'ID', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Python['initialize'] = function(block) {
  var statements_name = Blockly.Python.statementToCode(block, 'NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};


Blockly.Python['delay'] = function(block) {
  var value_delay_in_ms = Blockly.Python.valueToCode(block, 'delay_in_ms', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Python['setregularlyscheduledeventperiod'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// check what type of message is being sent

Blockly.Python['check_type'] = function(block) {
  var dropdown_different_messages = block.getFieldValue('different messages');
  var value_message = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

//******************* LIST GENERATORS

Blockly.Python['lists_create_n'] = function(block) {
  var value_num_items = Blockly.Python.valueToCode(block, 'NUM_ITEMS', Blockly.Python.ORDER_ATOMIC);
  var code = new Array(value_num_items);
  for (var n = 0; n < value_num_items; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_create_6'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(6);
  for (var n = 0; n < 6; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_create_9'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(9);
  for (var n = 0; n < 9; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_create_12'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(12);
  for (var n = 0; n < 12; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_create_24'] = function(block) {
  // Create a list with any number of elements of any type.
  var code = new Array(24);
  for (var n = 0; n < 24; n++) {
    code[n] = Blockly.Python.valueToCode(block, 'ADD' + n,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['lists_getIndex_nonMut'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Python.valueToCode(block, 'AT',
      Blockly.Python.ORDER_UNARY_SIGN) || '1';
  var list = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '[0]';
      return [code, Blockly.Python.ORDER_MEMBER];
    } else {
      var code = list + '.pop(0)';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '[-1]';
      return [code, Blockly.Python.ORDER_MEMBER];
    } else {
      var code = list + '.pop()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at = 'int(' + at + ' - 1)';
    }
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Python.ORDER_MEMBER];
    } else {
      var code = list + '.pop(' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list + '[-' + at + ']';
      return [code, Blockly.Python.ORDER_MEMBER];
    } else {
      var code = list + '.pop(-' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'RANDOM') {
    Blockly.Python.definitions_['import_random'] = 'import random';
    if (mode == 'GET') {
      code = 'random.choice(' + list + ')';
      return [code, Blockly.Python.ORDER_FUNCTION_CALL];
    } else {
      var functionName = Blockly.Python.provideFunction_(
          'lists_remove_random_item',
          ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(myList):',
           '  x = int(random.random() * len(myList))',
           '  return myList.pop(x)']);
      code = functionName + '(' + list + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Python.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  }
  throw 'Unhandled combination (lists_getIndex_nonMut).';
};

Blockly.Python['lists_setIndex_nonMut'] = function(block) {
  // Set element at index.
  var list = Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Python.valueToCode(block, 'AT',
      Blockly.Python.ORDER_NONE) || '1';
  var value = Blockly.Python.valueToCode(block, 'TO',
      Blockly.Python.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Python.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = listVar + ' = ' + list + '\n';
    list = listVar;
    return code;
  }
  if (where == 'FIRST') {
      return list + '[0] = ' + value + '\n';
  } else if (where == 'LAST') {
     return list + '[-1] = ' + value + '\n';
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at = 'int(' + at + ' - 1)';
    }
    return list + '[' + at + '] = ' + value + '\n';
  } else if (where == 'FROM_END') {
    return list + '[-' + at + '] = ' + value + '\n';
  } else if (where == 'RANDOM') {
    Blockly.Python.definitions_['import_random'] = 'import random';
    var code = cacheList();
    var xVar = Blockly.Python.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += xVar + ' = int(random.random() * len(' + list + '))\n';
    code += list + '[' + xVar + '] = ' + value + '\n';
    return code;
  }
  throw 'Unhandled combination (lists_setIndex_nonMut).';
};

// ******************* Loops

Blockly.Python['controls_while'] = function(block) {
  // Do while loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Python.valueToCode(block, 'BOOL',
      until ? Blockly.Python.ORDER_LOGICAL_NOT :
      Blockly.Python.ORDER_NONE) || 'False';
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block.id) ||
      Blockly.Python.PASS;
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ':\n' + branch;
};