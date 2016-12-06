
'use strict';

// this is pseudo-assembly language generator using the Dart framework
// Currently all it does it print out the name of the block 

// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// flash LEDs takes either
// - a single color and calls flashRGB (color picker is special case of list)
// - a number which is treated as hue and calls flashHue
// - a list
// - a variable
// If no input, treats as Hue = 0 and calls flashHue

Blockly.Dart['flash_leds'] = function(block) {
  var flash_arg = Blockly.Dart.valueToCode(block, 'COLOR', Blockly.Dart.ORDER_ATOMIC) ;
  if (debug) {alert("in flash_leds: input is *" + flash_arg +'*')};
  if (flash_arg == 'None' || flash_arg =='') { // input is blank or null
    //alert('input is null');
    var code = 'Push R0\nsyscall flashRGB\n'; 
  }
  else {
    var targetBlock = block.getInputTargetBlock('COLOR');
     if (debug) {alert("in flash_leds: input is block type " + targetBlock.type)};
     switch (targetBlock.type) {
      case 'math_number': //value is in R1
        var code = flash_arg + 'syscall flashHue R1' +  '\n';
        break;
      
      // Flash(getmotiondata) length 4 on stack, uses XYZ discards M
      // Flash(len 3) (one color) flashes most recently used petal specified color
      // Flash(len 12) (four colors) flashes hub, petal 1, petal 2 and petal 3 the specified colors in that order
      // Flash(len 24) allows granular control of which LEDs on the petals are used to express a color 
      case 'colour_picker':
      case 'getmotiondata':
      case 'array':
        var code = flash_arg + 'syscall flashRGB' +  '\n'; 
        break;
      case 'variables_get':
        var varName = targetBlock.getFieldValue('VAR');
        if (debug) {alert("in flash_leds: variables_get varName is " +varName)};
        if (global_scalar_variables.indexOf(varName) >= 0) { // it's a scalar variable
          var code = flash_arg + 'syscall flashHue R1' +  '\n'; // value is put in R1
          }
          else if (varName in global_list_variables) { // it's a list, pointer is in R1
            // but we need the colors on the stack; push the colors onto stack
            var headaddr = global_list_variables[varName][0];
            var list_len = global_list_variables[varName][1];
            var pushes = '';
            for (var i = 1; i < list_len; i++) { //*******make sure not backwards
              pushes = pushes + 'Push R' + (headaddr + i) + '\n';
              }
            pushes = pushes + 'Set R1 ' + (list_len - 1) + '\nPush R1\n';
            var code = pushes + 'syscall flashRGB' +  '\n';
            }
              else {
                if (debug) {alert('in flash_leds: variable not defined')};
                var code = "FAIL1 at flash_leds\n";       
                }
        break;
      default: // we don't know what it is
        if (debug) {alert('in flash_leds: input of unknown type')};
        var code = "FAIL2 at flash_leds\n";
        break;
     }
  }
  return code;
}

Blockly.Dart['led_attached'] = function(block) {
  alert("found 1");
  var found = global_scalar_variables.indexOf('led_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no led attached, else 2 4 8 tells you where
    return [code, Blockly.Dart.ORDER_ATOMIC];
    }
};

Blockly.Dart['usb_attached'] = function(block) {
  var found = global_scalar_variables.indexOf('usb_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no led attached, else 2 4 8 tells you where
    return [code, Blockly.Dart.ORDER_ATOMIC];
    }
};



// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************


Blockly.Dart['onmotiontrigger'] = function(block) {
  var dothis = Blockly.Dart.statementToCode(block, 'NAME');
  var code = 'On_motion_trigger:\n' + dothis + 'syscall exit R0\n';
  return code;
};

// Get Motion Data reads motion sensor
// it writes 4 values onto stack (M,x,y,z) and returns TRUE
// If no motion link is present, values are 0,0,0,0
// If more then one motion sensor is present, value is not defined
// future work: if assigning to a scalar, return M

Blockly.Dart['getmotiondata'] = function(block) {
  var code = 'GETMOTIONDATA\n';// this puts motion data on the stack in order top{4,M,L,N,K,...} 4 is length of data
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['motion_attached'] = function(block) {
  var found = global_scalar_variables.indexOf('motion_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no led attached, else 2 4 8 tells you where
    return [code, Blockly.Dart.ORDER_ATOMIC];
    }
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
  var code = 'GETMICDATA\n'; // format TBD
  return code;
};

// Advanced: POSTPONED

Blockly.Dart['set_mic_threshold'] = function(block) {
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

Blockly.JavaScript['getidfromradioatport'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

Blockly.Dart['on_initialization'] = function(block) {
  var dothis = Blockly.Dart.statementToCode(block, 'NAME');
  if (debug) {alert("In on_initialization, code is " + dothis + "Syscall exit R0")};
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
  var code = 'GETBATTERYLEVEL\n'; // format just like getmotionattached but no masking
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

// Advanced: returns a reading from the ambient light sensor in the hub

Blockly.Dart['getambientlight'] = function(block) {
  var code = 'GETAMBIENTLIGHT\n'; // format format just like getmotionattached but no masking
  return [code, Blockly.Dart.ORDER_ATOMIC];
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

Blockly.Dart['RegularEventSpeed'] = function(block) {
  var argument0 = Blockly.Dart.valueToCode(block, 'PERIOD', Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  if (argument0 > 255) {
    alert("max value for speed is 255");
    code = 'Error in RegularEventSpeed\n;'
    return code;
  } else {
    var code = argument0 + '\nSyscall SET_REG_EVENT_SPEED R1\n'; //finds it's argument in R1
    return code;
  }
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
  ifCount++;
  var argument0 = Blockly.Dart.valueToCode(block, 'TEST', Blockly.Dart.ORDER_NONE) || 'False';
  var code = 'while_label_' + ifCount + ':\n' + argument0;
  code += 'BTR1SNZ \n GOTO end_label_' + ifCount + '\n';
  var branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block.id) ||
      Blockly.Dart.PASS;
  code += branch + 'GOTO ' + 'while_label_' + ifCount + '\n end_label_' + ifCount + ':\n';
  return code;
};
