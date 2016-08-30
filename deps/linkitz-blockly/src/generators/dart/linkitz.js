
'use strict';

// this is pseudo-assembly language generator using the Dart framework
// Currently all it does it print out the name of the block 

// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// flash LEDs takes either
// - a single color and calls flashRGB
// - a number which is treated as hue and calls flashHue
// If no input, treats as Hue = 0

Blockly.Dart['flash_leds'] = function(block) {
  var value_color = Blockly.Dart.valueToCode(block, 'COLOR', Blockly.Dart.ORDER_ATOMIC) ;
  alert("in flash_leds: input is *" + value_color +'*');
  
 
  if (value_color == 'None' || value_color =='') { // input is blank or null
    //alert('input is null');
    var code = 'syscall flashHue R0 \n'; 
  }
  
  else {
    var targetBlock = block.getInputTargetBlock('COLOR');
     alert("in flash_leds: input is block type " + targetBlock.type);
     
   if (targetBlock.type == 'math_number' ) { // input is any single decimal number
    //alert('got a number');
     var code = value_color + 'syscall flashHue R1' +  '\n';
    return code;
  
    } else if (targetBlock.type == 'colour_picker') {
      var code = value_color + 'syscall flashRBGptr R1' +  '\n';
      
      } else if ((targetBlock.type == 'variables_get' )) { // it's  a variable
      var varName = targetBlock.getFieldValue('VAR');
      alert("in flash_leds: variables_get varName is " +varName);
      
      if (global_scalar_variables.indexOf(varName) >= 0) { // it's a scalar variable
        var code = value_color + 'syscall flashHue R1' +  '\n';
        } else if (find_in_GLV(varName) >= 0) {
            var code = value_color + 'syscall flashRBGptr R1' +  '\n';
        } else {
          alert('in flash_leds: variable not defined');
          var code = "FAIL1 at flash_leds\n";       
        }
      } // end if variables_get
      
    else {// we don't know what it is
      alert('in flash_leds: input of unknown type');
      var code = "FAIL2 at flash_leds\n"; 
      }
  }
  return code;
}

// convert a hexidecimal color string to 0..255 R,G,B, remember that first char is ' and second char is #
// example input: '#ff00cc'

function hexToRGB (hex){
    var r = parseInt(hex.substr(2,2),16);
    var g = parseInt(hex.substr(4,2),16);
    var b = parseInt(hex.substr(6,2),16);
    return [r,g,b];
}

// convert (h,s,v) to [r,g,b]

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

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************


Blockly.Dart['onmotiontrigger'] = function(block) {
  var dothis = Blockly.Dart.statementToCode(block, 'NAME');
  var code = 'On_motion_trigger:\n' + dothis + '\n' + 'syscall exit R0\n';
  return code;
};

// Advanced: Get Motion Data reads motion sensor
// What does it do? 
//     1? return a list (magnitude, x,y,z)
//     2? set a global variable and return TRUE
// If no motion link is present, returns an empty list
// If more then one motion sensor is present ...?

Blockly.Dart['getmotiondata'] = function(block) {
  var code = '[' + getMotionData() + ']\n';
  return code;
};

// Advanced: Set Motion Trigger - POSTPONED

Blockly.Dart['setmotiontrigger'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// **************************************************************************************************
// MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE
// **************************************************************************************************

Blockly.Dart['on_microphone_trigger'] = function(block) {
  var statements_name = Blockly.Dart.statementToCode(block, 'NAME');
  var code = 'On_microphone_trigger:\n' + statements_name + '\n' + 'syscall exit R0\n';
  return code;
};

// Advanced:

Blockly.Dart['getmicdata'] = function(block) {
  var code = 'GetMicData()\n';
  return code;
};

// Advanced: POSTPONED

Blockly.Dart['set_mic_threshold'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Dart['read_sound_levels'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};


// **************************************************************************************************
// SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER
// **************************************************************************************************

// POSTPONED

// Call for speaker to play a sound file

Blockly.Dart['speaker_play_sound'] = function(block) {
  var value_name = Blockly.Dart.valueToCode(block, 'NAME', Blockly.Dart.ORDER_ATOMIC);
  
  // TODO: Assemble JavaScript into code variable.
  var code = 'syscall Play_sound' + value_name + '\n';
  return code;
};

// Use a pre-defined sound

Blockly.Dart['sound_from_file'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// Advanced: Play data stream - Play a list of samples as it is being received 

Blockly.Dart['playdatastream'] = function(block) {
  var value_name = Blockly.Dart.valueToCode(block, 'NAME', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// Advanced: Sound with frequency - make a sound with provided FDV

Blockly.Dart['sound_fdv'] = function(block) {
  var value_frequency = Blockly.Dart.valueToCode(block, 'Frequency', Blockly.Dart.ORDER_ATOMIC);
  var value_duration = Blockly.Dart.valueToCode(block, 'Duration', Blockly.Dart.ORDER_ATOMIC);
  var value_volume = Blockly.Dart.valueToCode(block, 'Volume', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// **************************************************************************************************
// RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO
// **************************************************************************************************

Blockly.Dart['radio_onreceive'] = function(block) {
  var statements_name = Blockly.Dart.statementToCode(block, 'NAME');
  var code = 'Radio_onreceive:\n' + statements_name + '\n' + 'syscall return R0\n';
  return code;
};

Blockly.Dart['createmessage'] = function(block) {
  var value_messagename = Blockly.Dart.valueToCode(block, 'MessageName', Blockly.Dart.ORDER_ATOMIC);
  var statements_name = Blockly.Dart.statementToCode(block, 'NAME');
  var code = value_messagename + ' = ' + statements_name +'\n'; // statements name is just a string
  return code;
};

Blockly.Dart['transmit2'] = function(block) {
  var value_targetid = Blockly.Dart.valueToCode(block, 'targetid', Blockly.Dart.ORDER_ATOMIC) || 0;
  var value_message = Blockly.Dart.valueToCode(block, 'message', Blockly.Dart.ORDER_ATOMIC);
  // var value_range = Blockly.Dart.valueToCode(block, 'range', Blockly.Dart.ORDER_ATOMIC);
  var code = 'syscall Transmit' + value_targetid + ', ' + value_message +'\n';
  return code;
};

// Advanced: Read and return range estimate from radio

Blockly.Dart['radiogetrange'] = function(block) {
  var code = 'GetRadioRange()\n';
  return code;
};

// Advanced: Get Radio Data returns the most recently received radio message as a list with the sender,  message and range
// If no radio is present, it returns the empty list

Blockly.Dart['getradiodata'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// Advanced: getidfromradio returns the ID stored in the attached radio petal as an integer. If not radio petal is attached, returns -1

Blockly.Dart['getidfromradio'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// Advanced:

Blockly.Dart['setradioeventtrigger'] = function(block) {
  var value_name = Blockly.Dart.valueToCode(block, 'NAME', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Dart['getidfromradioatport'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

Blockly.Dart['on_initialization'] = function(block) {
  var dothis = Blockly.Dart.statementToCode(block, 'NAME');
  alert("In on_initialization, code is " + dothis + "Syscall exit R0");
  var code = 'On_initialization:\n' + dothis + Blockly.Dart.INDENT + 'syscall exit R0\n';;
  return code;
};

Blockly.Dart['on_regular_event'] = function(block) {
  var dothis = Blockly.Dart.statementToCode(block, 'NAME');
  var code = 'OnRegularEvent:\n' + dothis + Blockly.Dart.INDENT + 'syscall exit R0\n';
  return code;
};

// Advanced: return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good

Blockly.Dart['getbatterylevel'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// Advanced: returns a reading from the ambient light sensor in the hub

Blockly.Dart['getambientlight'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// the ROSTER is a list of links connected to the hub. it is represented by a 3-tuple where position in the list
// corrresponds to port number and the link type is repsented by an integer
// 1=LED, 2=Motion, 3=Mic, 4=Spkr, 5=Radio, 0=no link connected at this position
// example: hub with LED at port2 and motion at port3 returns (0,1,2)

Blockly.Dart['getroster'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

Blockly.Dart['roster_event']= function(block) {
  var value_linkroster = Blockly.Dart.valueToCode(block, 'LinkRoster', Blockly.Dart.ORDER_ATOMIC);
  var statements_script = Blockly.Dart.statementToCode(block, 'Script');
  // var priority = 4-length(value_linkroster);
  // TODO: Assemble JavaScript into code variable.
  var code = 'pass // When this list matches the one updated by the hub, use the set of event handlers in statements_script';
  return code;
};

Blockly.Dart['roster_list'] = function(block) {
  var value_link1 = Blockly.Dart.valueToCode(block, 'Link1', Blockly.Dart.ORDER_ATOMIC);
  var value_link2 = Blockly.Dart.valueToCode(block, 'Link2', Blockly.Dart.ORDER_ATOMIC);
  var value_link3 = Blockly.Dart.valueToCode(block, 'Link3', Blockly.Dart.ORDER_ATOMIC);
  var statements_rostercode = Blockly.Dart.statementToCode(block, 'Rostercode');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

Blockly.Dart['roster_event_two'] = function(block) {
  var dropdown_link3 = block.getFieldValue('Link3');
  var dropdown_link2 = block.getFieldValue('Link2');
  var dropdown_link1 = block.getFieldValue('Link1');
  var statements_script = Blockly.Dart.statementToCode(block, 'Script');
  // TODO: Assemble JavaScript into code variable.
  var linkRoster =[]
  // TODO: append non 'None' values to this list
  var priority= 4-length(linkRoster)
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.Dart['connection_event'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var statements_script = Blockly.Dart.statementToCode(block, 'script');
  // TODO: Assemble JavaScript into code variable.
  var code = 'pass  // execute this script once when this link is plugged in';
  return code;
};

// getmyid returns a number that is the ID of this hub

Blockly.Dart['getmyid'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

// writeidtoradio writes this hub's ID to the radio petal. see below for alternate version write_this_idtoradio

Blockly.Dart['writeidtoradio'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// alternate version write_this_idtoradio takes a number as input and writes that number to the attached radio petal
// dangerous because it allows user to spoof being a different user, but might be useful for forwarding  in a mesh network

Blockly.Dart['write_this_idtoradio'] = function(block) {
  var value_id = Blockly.Dart.valueToCode(block, 'ID', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Dart['initialize'] = function(block) {
  var statements_name = Blockly.Dart.statementToCode(block, 'NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};


Blockly.Dart['delay'] = function(block) {
  var value_delay_in_ms = Blockly.Dart.valueToCode(block, 'delay_in_ms', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

Blockly.Dart['setregularlyscheduledeventperiod'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  return code;
};

// check what type of message is being sent

Blockly.Dart['check_type'] = function(block) {
  var dropdown_different_messages = block.getFieldValue('different messages');
  var value_message = Blockly.Dart.valueToCode(block, 'message', Blockly.Dart.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Dart.ORDER_NONE];
};

//******************* LIST GENERATORS

Blockly.Dart['lists_create_n'] = function(block) {
  var value_num_items = Blockly.Dart.valueToCode(block, 'NUM_ITEMS', Blockly.Dart.ORDER_ATOMIC);
  var code = new Array(value_num_items);
  for (var n = 0; n < value_num_items; n++) {
    code[n] = Blockly.Dart.valueToCode(block, 'ADD' + n,
        Blockly.Dart.ORDER_NONE) || 'None';
  }
  code = '[' + code.join(', ') + ']';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['lists_getIndex_nonMut'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(block, 'AT',
      Blockly.Dart.ORDER_UNARY_SIGN) || '1';
  var list = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_MEMBER) || '[]';

  if (where == 'FIRST') {
    if (mode == 'GET') {
      var code = list + '[0]';
      return [code, Blockly.Dart.ORDER_MEMBER];
    } else {
      var code = list + '.pop(0)';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'LAST') {
    if (mode == 'GET') {
      var code = list + '[-1]';
      return [code, Blockly.Dart.ORDER_MEMBER];
    } else {
      var code = list + '.pop()';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
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
      return [code, Blockly.Dart.ORDER_MEMBER];
    } else {
      var code = list + '.pop(' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'FROM_END') {
    if (mode == 'GET') {
      var code = list + '[-' + at + ']';
      return [code, Blockly.Dart.ORDER_MEMBER];
    } else {
      var code = list + '.pop(-' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  } else if (where == 'RANDOM') {
    Blockly.Dart.definitions_['import_random'] = 'import random';
    if (mode == 'GET') {
      code = 'random.choice(' + list + ')';
      return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
    } else {
      var functionName = Blockly.Dart.provideFunction_(
          'lists_remove_random_item',
          ['def ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ + '(myList):',
           '  x = int(random.random() * len(myList))',
           '  return myList.pop(x)']);
      code = functionName + '(' + list + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Dart.ORDER_FUNCTION_CALL];
      } else if (mode == 'REMOVE') {
        return code + '\n';
      }
    }
  }
  throw 'Unhandled combination (lists_getIndex_nonMut).';
};

Blockly.Dart['lists_setIndex_nonMut'] = function(block) {
  // Set element at index.
  var list = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_MEMBER) || '[]';
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(block, 'AT',
      Blockly.Dart.ORDER_NONE) || '1';
  var value = Blockly.Dart.valueToCode(block, 'TO',
      Blockly.Dart.ORDER_NONE) || 'None';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Dart.variableDB_.getDistinctName(
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
    Blockly.Dart.definitions_['import_random'] = 'import random';
    var code = cacheList();
    var xVar = Blockly.Dart.variableDB_.getDistinctName(
        'tmp_x', Blockly.Variables.NAME_TYPE);
    code += xVar + ' = int(random.random() * len(' + list + '))\n';
    code += list + '[' + xVar + '] = ' + value + '\n';
    return code;
  }
  throw 'Unhandled combination (lists_setIndex_nonMut).';
};

// ******************* Loops

Blockly.Dart['controls_while'] = function(block) {
  // Do while loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Dart.valueToCode(block, 'BOOL',
      until ? Blockly.Dart.ORDER_LOGICAL_NOT :
      Blockly.Dart.ORDER_NONE) || 'False';
  var branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block.id) ||
      Blockly.Dart.PASS;
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ':\n' + branch;
};
