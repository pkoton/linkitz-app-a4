
'use strict';

// this is an assembly language generator based on the blockly Dart generator

// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// flash LEDs takes either
// - a single color and calls flashRGB (color picker is special case of list)
// - a number which is treated as hue and calls flashHue
// - a list
// - a variable
// If no input, treats as Hue = 0 and calls flashHue R0

Blockly.Assembly['flash_leds'] = function(block) {
  var code = "; starting flash_leds\n";
  var flash_input = block.getInputTargetBlock('COLOR');
  if (flash_input && (flash_input.type == 'variables_get')) {
        var varName = Blockly.Assembly.variableDB_.getName(flash_input.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        var in_GSV1 = global_scalar_variables.indexOf(varName); // if in global_scalar_variable
          if (in_GSV1 >= 0) {
            //Hue is a scalar that varies from -127 to 127. Don't take the absolute value, that will make Drew really sad and make Linkitz not work
            //Drew is pretty sure this is the second time he's had to turn this off.
            code += "syscall flashHue R" + in_GSV1 + "\n"; // arg is in R+in_GSV
            return code;
          }
          else if (varName in global_list_variables) { // it's a list
            // leaves values onto stack
            var headaddr = global_list_variables[varName][0];
            var llen = global_list_variables[varName][1];
            numItems = llen - 1; 
            //console.log("7 in flash lists_create_with: llen =  " + llen + ", numItems = " + numItems);
            if (numItems == 0) {
              code += "push R0\nsyscall flashRGB\n";  // treat as flash null
              code += "; ending flash_leds\n";
              return code;
            }
            var topOfList = headaddr + llen - 1;
            // console.log("headaddr " + headaddr + " llen " + llen + " topOfList " + topOfList);
            for (var i = 0; i < numItems; i++) { 
              var temp = topOfList - i;
              code += "push R" + temp + "\n";
            }
            code += 'Set R1 ' + numItems + '\npush R1\n' + 'syscall flashRGB\n';
            return code;
            }
          else {
            console.log('in flash_leds: variable not defined');
            throw "FAIL1: undefined variable in flash_leds";       
          }
      }
  var flash_arg = Blockly.Assembly.valueToCode(block, 'COLOR', Blockly.Assembly.ORDER_NONE) || 'None';
  // console.log("in flash_leds: input is *" + flash_arg +'*');
  if (flash_arg == 'None' || flash_arg =='') {
    // *****  input is blank or null
    //alert('input is null');
    code += "push R0\nsyscall flashRGB\n";
    code += "; ending flash_leds\n";
    return code;
  }
  else {
    var targetBlock = block.getInputTargetBlock('COLOR');
    // console.log("1 in flash_leds: input is block type " + targetBlock.type);
    if (is_scalar(targetBlock)) { // ***** input is a scalar in R1
      code += flash_arg + 'syscall flashHue R1\n';//Hue is a signed variable and needs a domain that varies from [-127|-128,127] or from [0,255] Drew doesn't care which but if it's restricted by taking an absolute value he will spend hours debugging LED code
    } // ***** input is a list on stack, first element is list length
     else {
      // console.log("2 in flash_list: targetBlock.type " + targetBlock.type);
     switch (targetBlock.type) { 
      // we could previously treat these all list cases together because
      // we did not need to know list length at assembly generation time
      // now have to treat them individually in order to calculate space required
      case 'colour_picker':
      case 'get_motion_data':
        // console.log("3 in flash_list: targetBlock.type " + targetBlock.type);
        code += flash_arg + "syscall flashRGB\n";
        break;
      
      case 'lists_create_n':
         // console.log("4 in flash_list: targetBlock.type " + targetBlock.type);
      // lists_create_n block creates a list of all 0s 
        code += flash_arg + 'syscall flashRGB\n';  
        break;
    
      case 'lists_create_with': 
        // console.log("5 in flash_list: targetBlock.type " + targetBlock.type);
        var numItems = targetBlock.itemCount_; // this is just top level item number
        // console.log("in flash lists_create_with: numItems = " + numItems);
        code += flash_arg + "syscall flashRGB\n";
        break;
      
      // ***** Input could be either a scalar or a list
      case 'procedures_callreturn':
        var procName = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
        // console.log("in flash_leds: procedures_callreturn  on " + procName);
        // look up if proc retuns scalar or list
        if (proc_types[procName][0] == 0) { //returns a scalar, value is in R1
          code += flash_arg + 'syscall flashHue R1\n';
        } else if (proc_types[procName][0] >= 1) { // returns a list, list length + values on stack
          var numItems = list_length_from_sublist_desc(proc_types[procName][1]);
          if (numItems == 0) {
          code += flash_arg + 'push R0\nsyscall flashRGB\n';  // treat as flash zero
          code += "; ending flash_leds\n";
          return code;
          }
          code += flash_arg + "syscall flashRGB\n";
        } else {
            console.log('in flash_leds: procedure return value not defined');
            code += "FAIL2: undefined procedure return value in flash_leds\n";       
            }
        break;
      case 'lists_getIndex_nonMut':
        var list_name2 = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        if (global_list_variables[list_name2][2].length == 1) { // its a scalar, value in R1
          code += flash_arg + 'syscall flashHue R1\n';
          }
          else // it's a list, value on stack
          {
            var temp = global_list_variables[list_name2][2].slice(); // make a copy of list_desc
            temp.shift(); // remove first item; temp now describes the structure of each list item
            var list_elt_size = list_length_from_sublist_desc(temp);
            if (list_elt_size == 0) {
            code += 'push R0\nsyscall flashRGB\n';  // treat as flash zero
            code += "; ending flash_leds\n";
            return code;
            } else {
            code += flash_arg + "syscall flashRGB\n";
            }
          } // list element is another list
        break;
      default: // we don't know what it is
        console.log('in flash_leds: input of unknown type');
        code += "FAIL3: unrecognized input to flash_leds\n";
        break;
     } // end switch
    } // end else (input is not scalar)
  } // end else (input is not null)
  code += "; ending flash_leds\n";
  return code;
} // end flash_leds

Blockly.Assembly['led_attached'] = function(block) {
  var code = "; starting led_attached\n";
  var found = global_scalar_variables.indexOf('led_attached');
  if (found >= 0) { // it better be!
    code += 'set R2 '+ mask + '\nband3 R' + found +  ' R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no led attached, else 2 4 8 tells you where
    } else {
      code += 'Set R1 0\n'; // if you can't find led_attached in GSV, treat as no led attached
    }
  code += "; ending led_attached\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['usb_attached'] = function(block) {
  var code = "; starting usb_attached\n";
  var found = global_scalar_variables.indexOf('usb_attached');
  if (found >= 0) { // it better be!
    code += 'set R2 '+ mask + '\nband3 R' + found +  ' R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no usb attached, else 2 4 8 tells you where
    } else {
      code += 'Set R1 0\n'; // if you can't find usb_attached in GSV, treat as no usb attached
    }
  code += "; ending usb_attached\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************


Blockly.Assembly['on_motion_trigger'] = function(block) {
  var code = "; starting on_motion_trigger\n";
  var dothis = Blockly.Assembly.statementToCode(block, 'NAME');
  code += 'On_motion_trigger:\n' + dothis + 'syscall exit R0\n';
  code += "; ending on_motion_trigger\n";
  return code;
};

// Get Motion Data reads motion sensor
// it writes 4 values onto stack (M,x,y,z) and returns TRUE
// If no motion link is present, values are 0,0,0,0
// If more then one motion sensor is present, value is not defined
// future work: if assigning to a scalar, return M

Blockly.Assembly['get_motion_data'] = function(block) {
  var code = 'Syscall get_motion_data\n';// this puts motion data on the stack in order top{3,L,N,K,...} 3 is length of data
  return [code, Blockly.Assembly.ORDER_NONE];
};


Blockly.Assembly['motion_attached'] = function(block) {
  var code = "; starting motion_attached\n";
  var found = global_scalar_variables.indexOf('motion_attached');
  if (found >= 0) { // it better be!
    code += 'set R2 '+ mask + '\nband3 R' + found +  ' R2 R1\n'; // only look at the lower bits
    // the value in R1, if 0 then no motion attached, else 2 4 8 tells you where
    } else {
      code += 'Set R1 0\n'; // if you can't find motion_attached in GSV, treat as no motion attached
    }
  code += "; ending motion_attached\n";
  return [code, Blockly.Assembly.ORDER_NONE];
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
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_NONE);
  
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
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_NONE);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};

// Advanced: Sound with frequency - make a sound with provided FDV

Blockly.Assembly['sound_fdv'] = function(block) {
  var value_frequency = Blockly.Assembly.valueToCode(block, 'Frequency', Blockly.Assembly.ORDER_NONE);
  var value_duration = Blockly.Assembly.valueToCode(block, 'Duration', Blockly.Assembly.ORDER_NONE);
  var value_volume = Blockly.Assembly.valueToCode(block, 'Volume', Blockly.Assembly.ORDER_NONE);
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
  var value_messagename = Blockly.Assembly.valueToCode(block, 'MessageName', Blockly.Assembly.ORDER_NONE);
  var statements_name = Blockly.Assembly.statementToCode(block, 'NAME');
  var code = value_messagename + ' = ' + statements_name +'\n'; // statements name is just a string
  return code;
};

Blockly.Assembly['transmit2'] = function(block) {
  var value_targetid = Blockly.Assembly.valueToCode(block, 'targetid', Blockly.Assembly.ORDER_NONE) || 0;
  var value_message = Blockly.Assembly.valueToCode(block, 'message', Blockly.Assembly.ORDER_NONE);
  // var value_range = Blockly.Assembly.valueToCode(block, 'range', Blockly.Assembly.ORDER_NONE);
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
  var value_name = Blockly.Assembly.valueToCode(block, 'NAME', Blockly.Assembly.ORDER_NONE);
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
  var code = '; starting on_initialization\n';
  var dothis = Blockly.Assembly.statementToCode(block, 'NAME');
  console.log("In on_initialization, code is " + dothis + "Syscall exit R0");
  code += 'On_initialization:\n' + dothis + Blockly.Assembly.INDENT + 'syscall exit R0\n';
  code += '; ending on_initialization\n';
  return code;
};

Blockly.Assembly['on_regular_event'] = function(block) {
  var code = "; starting on_regular_event\n";
  var dothis = Blockly.Assembly.statementToCode(block, 'DO_THIS');
  code += 'on_regular_event:\n' + dothis + Blockly.Assembly.INDENT + 'syscall exit R0\n';
  code += "; ending on_regular_event\n";
  return code;
};

// Advanced: return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good
// return 0 is an error

Blockly.Assembly['get_battery_level'] = function(block) {
  var code = "; starting get_battery_level\n";
  var found = global_scalar_variables.indexOf('batterylevel');
  if (found >= 0) { // it better be!
    code += 'Push R' + found + '\nPop R1\n'; // put current battery reading into R1
    } else {
      code += 'Set R1 0\n'; // put 0 into R1
    }
  code += "; ending get_battery_level\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};

// Advanced: returns a reading from the ambient light sensor in the hub

Blockly.Assembly['get_ambient_light'] = function(block) {
  var code = "; starting get_ambient_light\n";
  var found = global_scalar_variables.indexOf('ambientlight');
  if (found >= 0) { // it better be!
    code += 'Push R' + found + '\nPop R1\n'; // put current ambient light reading into R1
    } else { 
      code += 'Set R1 0\n'; // put 0 into R1 
    }
  code += "; ending get_ambient_light\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};


Blockly.Assembly['set_regular_event_delay'] = function(block) {
  var code = "; starting set_regular_event_delay\n";
  var argument0 = block.getInputTargetBlock('PERIOD');
  if (!argument0) {
    // console.log("here RES1");
    code += 'Syscall SET_REG_EVENT_SPEED R0\n';
    code += "; ending set_regular_event_delay\n";
    return code;
    }
    else {
      if (is_scalar(argument0) || (get_list_desc (argument0, [])[1].length == 0)) { // and arg1 is scalar
      // console.log("here RES2");
      var argument0 = Blockly.Assembly.valueToCode(block, 'PERIOD', Blockly.Assembly.ORDER_NONE);
      var splitArg = argument0.split(" ",3); // separate the result into 3 words
      var argNum = parseInt(splitArg[2]); // check the number
      if (argNum > 127) {
          argument0 = 'Set R1 127\n';
          } //pin between 127 max
        else if (argNum < -127)
        {
          argument0 = 'Set R1 -127\n'; // and -127 min
        }
      }
      else { //it's not scalar
        // console.log("here RES3");
        throw 'input to Set Regular Event Delay block can\'t be a list';
      }
      code += argument0 + 'Syscall SET_REG_EVENT_SPEED R1\n'; //finds it's argument in R1
      code += "; ending set_regular_event_delay\n";
      return code;
    }
};

Blockly.Assembly['roster_event_two'] = function(block) {
  var dropdown_link3 = block.getFieldValue('Link3');
  var dropdown_link2 = block.getFieldValue('Link2');
  var dropdown_link1 = block.getFieldValue('Link1');
  var statements_script = Blockly.Assembly.statementToCode(block, 'Script');
  // TODO: Assemble  into code variable.
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
  var value_id = Blockly.Assembly.valueToCode(block, 'ID', Blockly.Assembly.ORDER_NONE);
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
  var value_delay_in_ms = Blockly.Assembly.valueToCode(block, 'delay_in_ms', Blockly.Assembly.ORDER_NONE);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  return code;
};


// check what type of message is being sent

Blockly.Assembly['check_type'] = function(block) {
  var dropdown_different_messages = block.getFieldValue('different messages');
  var value_message = Blockly.Assembly.valueToCode(block, 'message', Blockly.Assembly.ORDER_NONE);
  // TODO: Assemble Dart into code variable.
  var code = '...';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Assembly.ORDER_NONE];
};



// ******************* Loops

Blockly.Assembly['controls_while'] = function(block) {
  // Do while loop.
  var code = "; starting controls_while\n";
  var this_count = ifCount++;
  var argument0 = Blockly.Assembly.valueToCode(block, 'TEST', Blockly.Assembly.ORDER_NONE) || 'False';
  code += 'WHILE_label_' + this_count + ': \n' + argument0;
  code += 'BTR1SNZ \n; skip next instruction if R1 is non-zero\n'; 
  code += 'GOTO endWHILE_label_' + this_count + '\n';
  var branch = Blockly.Assembly.statementToCode(block, 'DO');
  // console.log("DO statement is *" + branch + "*\n");
  if (branch) {
  branch = Blockly.Assembly.addLoopTrap(branch, block.id) || Blockly.Assembly.PASS;
  }
  code += branch + '\nGOTO ' + 'WHILE_label_' + this_count + '\n endWHILE_label_' + this_count + ':\n';
  code += "; ending controls_while\n";
  return code;
};
