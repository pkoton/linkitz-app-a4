
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

Blockly.Assembly['flash_leds'] = function(block) {
  var flash_arg = Blockly.Assembly.valueToCode(block, 'COLOR', Blockly.Assembly.ORDER_ATOMIC) ;
  if (debug) {alert("in flash_leds: input is *" + flash_arg +'*')};
  if (flash_arg == 'None' || flash_arg =='') { // input is blank or null
    //alert('input is null');
    var code = 'Push R0\nsyscall flashRGB\n'; 
  }
  else {
    var targetBlock = block.getInputTargetBlock('COLOR');
     if (debug) {alert("in flash_leds: input is block type " + targetBlock.type)};
     switch (targetBlock.type) {
      case 'math_number': // these all return a scalar, leaving the value in R1
      case "math_arithmetic":
      case "math_single":
      case "math_binary":
      case "math_random_int":
      case "led_attached":
      case "usb_attached":
      case "motion_attached":
      case "logic_compare":
      case "logic_operation":
      case "lists_length":
      case "math_on_list":
      case "lists_getIndex_nonMut": // Drew said just return a scalar and we can fix later - 11/27/2016
      case "getbatterylevel":
      case "getambientlight":
        var code = flash_arg + 'syscall flashHue R1' +  '\n';
        break;
      
      // Flash(getmotiondata) length 4 on stack, uses XYZ discards M
      // Flash(len 3) (one color) flashes most recently used petal specified color
      // Flash(len 12) (four colors) flashes hub, petal 1, petal 2 and petal 3 the specified colors in that order
      // Flash(len 24) allows granular control of which LEDs on the petals are used to express a color 
      case 'colour_picker':
      case 'getmotiondata':
      case 'array':
      case 'lists_create_n':
      case 'lists_create_with':
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

Blockly.Assembly['led_attached'] = function(block) {
  var found = global_scalar_variables.indexOf('led_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no led attached, else 2 4 8 tells you where
    } else {
      var code = 'Set R1 0\n'; // if you can't find led_attached in GSV, treat as no led attached
    }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['usb_attached'] = function(block) {
  var found = global_scalar_variables.indexOf('usb_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no usb attached, else 2 4 8 tells you where
    } else {
      var code = 'Set R1 0\n'; // if you can't find usb_attached in GSV, treat as no usb attached
    }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************


Blockly.Assembly['on_motion_trigger'] = function(block) {
  var dothis = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = 'On_motion_trigger:\n' + dothis + 'syscall exit R0\n';
  return code;
};

// Get Motion Data reads motion sensor
// it writes 4 values onto stack (M,x,y,z) and returns TRUE
// If no motion link is present, values are 0,0,0,0
// If more then one motion sensor is present, value is not defined
// future work: if assigning to a scalar, return M

Blockly.Assembly['getmotiondata'] = function(block) {
  var code = 'GETMOTIONDATA\n';// this puts motion data on the stack in order top{4,M,L,N,K,...} 4 is length of data
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

Blockly.Assembly['motion_attached'] = function(block) {
  var found = global_scalar_variables.indexOf('motion_attached');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\nset R2 '+ mask + '\n& R1 R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no motion attached, else 2 4 8 tells you where
    } else {
      var code = 'Set R1 0\n'; // if you can't find motion_attached in GSV, treat as no motion attached
    }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

// Advanced: Set Motion Trigger - POSTPONED

Blockly.Assembly['setmotiontrigger'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

// **************************************************************************************************
// MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE
// **************************************************************************************************

Blockly.Assembly['on_microphone_trigger'] = function(block) {
  var statements_name = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = 'On_microphone_trigger:\n' + statements_name + '\n' + 'syscall exit R0\n';
  return code;
};

// Advanced:

Blockly.Assembly['getmicdata'] = function(block) {
  var code = 'GETMICDATA\n'; // format TBD
  return code;
};

// Advanced: POSTPONED

Blockly.Assembly['set_mic_threshold'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

//Blockly.Assembly['read_sound_levels'] = function(block) {
//  // TODO: Assemble Dart into code variable.
//  var code = '...';
//  // TODO: Change ORDER_NONE to the correct strength.
//  return [code, Blockly.Assembly.ORDER_NONE];
//};


// **************************************************************************************************
// SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER
// **************************************************************************************************

// POSTPONED

// Call for speaker to play a sound file

Blockly.Assembly['speaker_play_sound'] = function(block) {
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_ATOMIC);
  
  // TODO: Assemble Dart into code variable.
  var code = 'syscall Play_sound' + value_name + '\n';
  return code;
};

// Use a pre-defined sound

Blockly.Assembly['sound_from_file'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// Advanced: Play data stream - Play a list of samples as it is being received 

Blockly.Assembly['playdatastream'] = function(block) {
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

// Advanced: Sound with frequency - make a sound with provided FDV

Blockly.Assembly['sound_fdv'] = function(block) {
  var value_frequency = Blockly.Assembly.valueToCode(block, 'Frequency', Blockly.Assembly.ORDER_ATOMIC);
  var value_duration = Blockly.Assembly.valueToCode(block, 'Duration', Blockly.Assembly.ORDER_ATOMIC);
  var value_volume = Blockly.Assembly.valueToCode(block, 'Volume', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// **************************************************************************************************
// RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO
// **************************************************************************************************

Blockly.Assembly['radio_onreceive'] = function(block) {
  var statements_name = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = 'Radio_onreceive:\n' + statements_name + '\n' + 'syscall return R0\n';
  return code;
};

Blockly.Assembly['createmessage'] = function(block) {
  var value_messagename = Blockly.Assembly.valueToCode(block, 'MessageName', Blockly.Assembly.ORDER_ATOMIC);
  var statements_name = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = value_messagename + ' = ' + statements_name +'\n'; // statements name is just a string
  return code;
};

Blockly.Assembly['transmit2'] = function(block) {
  var value_targetid = Blockly.Assembly.valueToCode(block, 'targetid', Blockly.Assembly.ORDER_ATOMIC) || 0;
  var value_message = Blockly.Assembly.valueToCode(block, 'message', Blockly.Assembly.ORDER_ATOMIC);
  // var value_range = Blockly.Assembly.valueToCode(block, 'range', Blockly.Assembly.ORDER_ATOMIC);
  var code = 'syscall Transmit' + value_targetid + ', ' + value_message +'\n';
  return code;
};

// Advanced: Read and return range estimate from radio

Blockly.Assembly['radiogetrange'] = function(block) {
  var code = 'GetRadioRange()\n';
  return code;
};

// Advanced: Get Radio Data returns the most recently received radio message as a list with the sender,  message and range
// If no radio is present, it returns the empty list

Blockly.Assembly['getradiodata'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// Advanced: getidfromradio returns the ID stored in the attached radio petal as an integer. If not radio petal is attached, returns -1

Blockly.Assembly['getidfromradio'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// Advanced:

Blockly.Assembly['setradioeventtrigger'] = function(block) {
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

Blockly.Assembly['getidfromradioatport'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

Blockly.Assembly['on_initialization'] = function(block) {
  var dothis = Blockly.Assembly.statementToCode(block, 'NAME');
  if (debug) {alert("In on_initialization, code is " + dothis + "Syscall exit R0")};
  var code = 'On_initialization:\n' + dothis + Blockly.Assembly.INDENT + 'syscall exit R0\n';;
  return code;
};

Blockly.Assembly['on_regular_event'] = function(block) {
  var dothis = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = 'OnRegularEvent:\n' + dothis + Blockly.Assembly.INDENT + 'syscall exit R0\n';
  return code;
};

// Advanced: return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good
// return 0 is an error

Blockly.Assembly['getbatterylevel'] = function(block) {
  var found = global_scalar_variables.indexOf('batterylevel');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\n'; // put current battery reading into R1
    } else {
      var code = 'Set R1 0\n'; // put 0 into R1
    }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

// Advanced: returns a reading from the ambient light sensor in the hub

Blockly.Assembly['getambientlight'] = function(block) {
  var found = global_scalar_variables.indexOf('ambientlight');
  if (found >= 0) { // it better be!
    var code = 'Push R' + found + '\nPop R1\n'; // put current ambient light reading into R1
    } else { 
      var code = 'Set R1 0\n'; // put 0 into R1 
    }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};


Blockly.Assembly['RegularEventSpeed'] = function(block) {
  var argument0 = Blockly.Assembly.valueToCode(block, 'PERIOD', Blockly.Assembly.ORDER_ASSIGNMENT);
  if (!argument0) {argument0 = 'Set R1 0\n';}
  var splitArg = argument0.split(" ",3); // separate the result into 3 words
  var argNum = parseInt(splitArg[2]); // check the number
  if (argNum > 127) {argument0 = 'Set R1 127\n';} //pin between 127 max
    else if (argNum < -127) {argument0 = 'Set R1 -127\n';} // and -127 min
  var code = argument0 + 'Syscall SET_REG_EVENT_SPEED R1\n'; //finds it's argument in R1
  return code;
};


Blockly.Assembly['roster_event_two'] = function(block) {
  var dropdown_link3 = block.getFieldValue('Link3');
  var dropdown_link2 = block.getFieldValue('Link2');
  var dropdown_link1 = block.getFieldValue('Link1');
  var statements_script = Blockly.Assembly.statementToCode(block, 'Script');
  // TODO: Assemble Dart into code variable.
  var linkRoster =[]
  // TODO: append non 'None' values to this list
  var priority= 4-length(linkRoster)
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return code;
};

Blockly.Assembly['connection_event'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  var statements_script = Blockly.Assembly.statementToCode(block, 'script');
  // TODO: Assemble Dart into code variable.
  var code = 'pass  // execute this script once when this link is plugged in';
  return code;
};

// getmyid returns a number that is the ID of this hub

Blockly.Assembly['getmyid'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

// writeidtoradio writes this hub's ID to the radio petal. see below for alternate version write_this_idtoradio

Blockly.Assembly['writeidtoradio'] = function(block) {
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

// alternate version write_this_idtoradio takes a number as input and writes that number to the attached radio petal
// dangerous because it allows user to spoof being a different user, but might be useful for forwarding  in a mesh network

Blockly.Assembly['write_this_idtoradio'] = function(block) {
  var value_id = Blockly.Assembly.valueToCode(block, 'ID', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

Blockly.Assembly['initialize'] = function(block) {
  var statements_name = Blockly.Assembly.statementToCode(block, 'NAME');
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};


Blockly.Assembly['delay'] = function(block) {
  var value_delay_in_ms = Blockly.Assembly.valueToCode(block, 'delay_in_ms', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};


// check what type of message is being sent

Blockly.Assembly['check_type'] = function(block) {
  var dropdown_different_messages = block.getFieldValue('different messages');
  var value_message = Blockly.Assembly.valueToCode(block, 'message', Blockly.Assembly.ORDER_ATOMIC);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};

//******************* LIST GENERATORS

Blockly.Assembly['lists_create_n'] = function(block) {
  if (debug) {alert("in lists_create_n")};
  var code = ';; lists_create_n space allocated\n';
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};


// ******************* Loops

Blockly.Assembly['controls_while'] = function(block) {
  // Do while loop.
  ifCount++;
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEST', Blockly.Assembly.ORDER_NONE) || 'False';
  var code = 'while_label_' + ifCount + ':\n' + argument0;
  code += 'BTR1SNZ \n GOTO end_label_' + ifCount + '\n';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  branch = Blockly.Assembly.addLoopTrap(branch, block.id) ||
      Blockly.Assembly.PASS;
  code += branch + 'GOTO ' + 'while_label_' + ifCount + '\n end_label_' + ifCount + ':\n';
  return code;
};