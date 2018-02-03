
/*This is a file for the Linkitz API blocks.*/

'use strict';

// ************************************************************************************************** 
// **************************************************************************************************


// **************************************************************************************************
// LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED  LED
// **************************************************************************************************

// led_attached returns 0 if the LED link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc 
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#oogcwh

Blockly.Blocks['led_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("LED Attached?");
    this.setOutput(true, "Number");
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// usb_attached returns 0 if the usb link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['usb_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("USB Attached?");
    this.setOutput(true, "Number");
    this.setColour("#FF6A13");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Flash LEDs takes a one color or a list of 1 or more colors and flashes the attached LEDs using the
// pseudo-LRU algorithm
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#4vqrqb

Blockly.Blocks['flash_leds'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Flash"));
  //  this.appendDummyInput()
  //      .appendField("Flash LEDs")
  //      .appendField("color");
    this.appendValueInput("COLOR")
        .setCheck(['Colour', "Array", "Number"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.setColour(290,0.674,0.75);
    this.setColour('#873299');
    this.setTooltip('Use this block to make your Linkitz light up');
    this.setHelpUrl('http://www.example.com/');
  }
};


// Light the LED connected to lowest number port in specified color
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#4zjhai flor Flash LED 1

Blockly.Blocks['ledoutput1'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 1")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#cc0000"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to lowest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};



Blockly.Blocks['ledoutput2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 2")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#00cc00"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to next highest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Light the LED connected to highest number port in specified color

Blockly.Blocks['ledoutput3'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Flash LED 3")
        .appendField("color")
        .appendField(new Blockly.FieldColour("#0000cc"), "NAME");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "LEDLink"));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Light the LED connected to highest number port in specified color');
    this.setHelpUrl('http://www.example.com/');
  }
};

// lights up a random series of LEDs anywhere on the Linkitz - not used

Blockly.Blocks['sparkle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Sparkle LEDs"));
    this.appendDummyInput()
        .appendField("Sparkle");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('Lights up a random series of LEDs anywhere on the Linkitz');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#9wxp3p
// Passing in a single color lights up a random LED somewhere on the Linkitz that color
// Passing a list of colors will light a set of lights indexed by petal type (in terms of recentness of use) and then by priority. 

Blockly.Blocks['ledoutput'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("LED Output");
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_4.2_Sparkle.png", 50, 50, "Light LED"));
    this.appendValueInput("NAME")
        .setCheck(['Colour', "Array"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// MOTION  MOTION  MOTION  MOTION  MOTION  MOTION  MOTION MOTION  MOTION  MOTION  MOTION
// **************************************************************************************************

Blockly.Blocks['on_motion_trigger'] = {
  init: function() {
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_1_Motion.png", 50, 50, "On Motion Trigger"));
    
    this.appendStatementInput("DO_THIS")
        .setCheck(null);
    this.setInputsInline(true);
    this.setColour('#0083CC');
    this.setTooltip('Use this to define response to motion input');
    this.setHelpUrl('http://www.example.com/');
  }
};

// motion_attached returns 0 if the motion link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['motion_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Motion Attached?");
    this.setOutput(true, "Number");
    this.setColour('#0083CC');
    this.setTooltip('Returns 0 if motion link is not attached, else 2,4,8 indicating which port(s) motion link(s) are on');
    this.setHelpUrl('http://www.example.com/');
  }
};



// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#6tyi6z (change setColour value)
// Reads motion sensor and pushes a list (magnitude, x,y,z) onto the stack
// If no motion link is present, returns (0,0,0,0)
// If more then one motion sensor is present, behavior is undefined

Blockly.Blocks['get_motion_data'] = {
  init: function() {
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.1_DataMove.png", 40, 40, "Get Motion Data"));
    this.appendDummyInput()
        .appendField(" Get Motion Data");
    this.setOutput(true, "Array");
    this.setColour('#0083CC');
    this.setTooltip('Reads motion sensor and returns the list (X, Y, Z)');
    this.setHelpUrl('http://www.example.com/');
  }
};



// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#2mndvz (change setCoulour value)


Blockly.Blocks['setmotiontrigger'] = {
  init: function() {
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_1_Motion.png", 50, 50, "Get_motion_data"));
    this.appendDummyInput()
        .appendField("Set Motion Trigger");
    this.appendValueInput("NAME")
        .setCheck(["Number", "Array"]);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#0083CA');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['math_binary'] = {
  /**
   * Block for basic binary operator.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [['&','BITWISE_AND'],
         ['|','BITWISE_OR'],
         ['^','BITWISE_XOR']];
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage("../../images/LZ_Icons_binary.png",50,50,"*"));
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'BITWISE_AND':Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_BITWISE_AND,
        'BITWISE_OR':Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_BITWISE_OR,
        'BITWISE_XOR':Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_BITWISE_XOR
      };
      return TOOLTIPS[mode];
    });
  }
};

// **************************************************************************************************
// MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE MICROPHONE
// **************************************************************************************************

Blockly.Blocks['get_mic_data'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.3_DataMic.png", 40, 40, "GetMicData"));
    this.appendDummyInput()
        .appendField("Get Mic Data");
    this.setOutput(true, "Array");
    this.setColour('#E81A4B');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// mic_attached returns 0 if the microphone link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['mic_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Microphone Attached?");
    this.setOutput(true, "Number");
    this.setColour('#E81A4B');
    this.setTooltip('Returns 0 if microphone link is not attached, else 2,4,8 indicating which port(s) motion link(s) are on');
    this.setHelpUrl('http://www.example.com/');
  }
};

//Blockly.Blocks['on_mic_event'] = {
//  init: function() {
//    this.setHelpUrl('http://www.example.com/');
//    this.setColour('#E81A4B');
//    this.appendDummyInput()
//        .appendField("On Mic Trigger");
//    this.appendValueInput("event typye")
//        .setCheck("Number")
//        .appendField("When")
//        .appendField(new Blockly.FieldDropdown([["Amplitude", "Amplitude"], ["Pitch", "Pitch"], ["Frequency", "Frequency"]]), "NAME")
//        .appendField(" is above:");
//    this.appendStatementInput("Do")
//        .setCheck("null")
//        .appendField("Do:");
//    this.setTooltip('');
//  }
//};

//Blockly.Blocks['read_sound_levels'] = {
//  init: function() {
//    this.setHelpUrl('http://www.example.com/');
//    this.setColour('#FF9903');
//    this.appendDummyInput()
//        .appendField("Read Sound Levels");
//    this.setOutput(true, "Array");
//    this.setTooltip('');
//  }
//};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#56jkef

//Blockly.Blocks['getmicdata'] = {
//  init: function() {
//    this.appendDummyInput()
//        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.3_DataMic.png", 40, 40, "GetMicData"));
//    this.appendDummyInput()
//        .appendField("Get Mic Data");
//    this.setOutput(true, "Array");
//    this.setColour('#E81A4B');
//    this.setTooltip('');
//    this.setHelpUrl('http://www.example.com/');
//  }
//};
//
//Blockly.Blocks['set_mic_threshold'] = {
//  init: function() {
//    this.appendDummyInput()
//        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_3_Mic.png", 50, 50, "GetMicData"));
//    this.appendDummyInput()
//        .appendField("Set Mic Threshold");
//    this.appendValueInput("NAME")
//        .setCheck(["Number", "Array"]);	
//    this.setInputsInline(true);
//    this.setPreviousStatement(true);
//    this.setNextStatement(true);
//    this.setColour('#E81A4B');
//    this.setTooltip('');
//    this.setHelpUrl('http://www.example.com/');
//  }
//};

// **************************************************************************************************
// SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER SPEAKER
// **************************************************************************************************



// Play a list of samples as it is being received or recorded. 

Blockly.Blocks['speaker_play_data'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2_Speaker.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Play data stream");
    this.appendValueInput("NAME")
        .setCheck("Array");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Call for speaker to play a sound file
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#g7vr8s

Blockly.Blocks['speaker_play_sound'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2_Speaker.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Play sound");
    this.appendValueInput("NAME")
        .setCheck("Valid_sound_block");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// speaker_attached returns 0 if the speaker link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['speaker_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Speaker Attached?");
    this.setOutput(true, "Number");
    this.setColour('#33CC66');
    this.setTooltip('Returns 0 if speaker link is not attached, else 2,4,8 indicating which port(s) motion link(s) are on');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO  RADIO
// **********************************

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#5dn67n
Blockly.Blocks['radio_transmit'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.3_RadioTransmit.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Transmit ");
    this.appendValueInput("MESSAGE")
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([["color","color"], ["sound","sound"], ["data","data"]]), "NAME");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#873299');
 this.setTooltip("");
 this.setHelpUrl("");
  }
};


Blockly.Blocks['radio_on_receive_color'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Radio On Receive Color");
    this.appendStatementInput("NAME");
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['radio_on_receive_sound'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Radio On Receive Sound");
    this.appendStatementInput("NAME");
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Blocks['radio_on_receive_data'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Radio On Receive Data");
    this.appendStatementInput("NAME");
    this.setNextStatement(true);
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#uqwvsv
// Returns the most recently received radio message as a list with the sender,  message [and range -- not yet]
// If no radio is present, it returns the empty list

Blockly.Blocks['get_radio_data'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_15.2_DataFriend.png", 40, 40, "Get Radio Data"));
    this.appendDummyInput()
        .appendField("Get Radio Data");
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setColour('#873299');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// radio_attached returns 0 if the radio link is not attached and non-zero otherwise, the value indicting which port(s)
// 2 = port1, 4 = port2, 8 = port3, 10 = port1 and port3 etc

Blockly.Blocks['radio_attached'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Radio Attached?");
    this.setOutput(true, "Number");
    this.setColour('#873299');
    this.setTooltip('Returns 0 if radio link is not attached, else 2,4,8 indicating which port(s) motion link(s) are on');
    this.setHelpUrl('http://www.example.com/');
  }
};

// getidfromradio returns the ID stored in the attached radio petal as an integer. If not radio petal is attached, returns -1

//Blockly.Blocks['getidfromradio'] = {
//  init: function() {
//    this.appendDummyInput()
//        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
//    this.appendDummyInput()
//        .appendField("Get ID from radio");
//    this.setOutput(true);
//    this.setColour('#FF9903');
//    this.setTooltip('');
//    this.setHelpUrl('http://www.example.com/');
//  }
//};
//
//Blockly.Blocks['getidfromradioatport'] = {
//  init: function() {
//    this.appendDummyInput()
//        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
//    this.appendDummyInput()
//        .appendField("Get ID from radio");
//    this.appendValueInput("port");
//    this.setInputsInline(true);
//    this.setOutput(true);
//    this.setColour('#FF9903');
//    this.setTooltip('');
//    this.setHelpUrl('http://www.example.com/');
//  }
//};


// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#xvonmp

Blockly.Blocks['transmit2'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.3_RadioTransmit.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Transmit");
    this.appendValueInput("Target")
        .setCheck(["String", "Array"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("To");
    this.appendValueInput("Message")
        .setCheck("String")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Message");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#zsxq2k

Blockly.Blocks['createmessage'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.2_CreateAMessage.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Create a message");
    this.appendValueInput("MessageName")
        .setCheck("String")
        .appendField("Name this message");
    this.appendStatementInput("NAME");
    this.setOutput(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['check_type'] = {
  init: function() {
    this.appendValueInput("message")
        .setCheck("String")
        .appendField("Check if inputted message is")
        .appendField(new Blockly.FieldDropdown([["Output a microphone signal", "requestForMicrophone"], ["Output a motion signal", "requestForMotion"], ["Motion signal", "motion signal"], ["Microphone signal", "microphone signal"], ["LED signal", "LED signal"], ["Speaker signal", "speaker signal"], ["Secret message", "secret message"], ["Nothing", "Nothing"]]), "different messages");
    this.setOutput(true, "Boolean");
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};



// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#rzpveq

Blockly.Blocks['setradioeventtrigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Set Radio Event Trigger");
    this.appendValueInput("NAME")
        .setCheck("Array");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Read and return range estimate from radio
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#avt2iz

Blockly.Blocks['radiogetrange'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_5.1_RadioOnReceive.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get Radio Range");
    this.setOutput(true, "Number");
    this.setColour('#FF9903');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// **************************************************************************************************
// HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  HUB  
// **************************************************************************************************

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#v4hgbw

Blockly.Blocks['set_regular_event_delay'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/timer_icon.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Set");
    this.setInputsInline(true);
   this.appendValueInput("PERIOD")
        .setCheck("Number");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('Set the time delay between regular events. Range is 0 (1 ms) - 36 (256 s)');
    this.setHelpUrl('http://www.example.com/');
  }
};



Blockly.Blocks['on_regular_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/timer_icon.png", 50, 50, "on_regular_event"));
    this.setInputsInline(true);
    this.appendStatementInput("DO_THIS");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['initialize'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Initialize");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['on_initialization'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("On Start");
    this.setInputsInline(true);
    this.appendStatementInput("NAME");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// This block returns a reading from the ambient light sensor in the hub
Blockly.Blocks['get_ambient_light'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/ambient.png", 50, 50, "*"));
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
// return the battery "life" or "health" -- however that is defined -- as an integer from 1= very bad to 10 = very good

Blockly.Blocks['get_battery_level'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/battery.png", 50, 50, "*"));
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// NOT USED
// the ROSTER is a list of links connected to the hub. it is represented by a 3-tuple where position in the list
// corrresponds to port number and the link type is repsented by an integer
// 1=LED, 2=Motion, 3=Mic, 4=Spkr, 5=Radio, 0=no link connected at this position
// example: hub with LED at port2 and motion at port3 returns (0,1,2)

Blockly.Blocks['getroster'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField(" Get roster");
    this.setOutput(true, "Array");
    this.setColour('#FFCE00');
    this.setTooltip('return a list of link types connected to the hub, by position');
    this.setHelpUrl('http://www.example.com/');
  }
};

// getmyid returns a number that is the ID of this hub

Blockly.Blocks['getmyid'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Get my ID ");
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// writeidtoradio writes this hub's ID to the radio petal. see below for alternate version write_this_idtoradio

Blockly.Blocks['writeidtoradio'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Write my ID to radio petal");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// alternate version write_this_idtoradio takes a number as input and writes that number to the attached radio petal
// dangerous because it allows user to spoof being a different user, but might be useful for forwarding  in a mesh network

Blockly.Blocks['write_this_idtoradio'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Write this ID to radio petal");
    this.appendValueInput("ID")
        .setCheck("Number");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


//Single connection event-- I imagine these being ONE TIME executions-- for continual execution, use the roster

Blockly.Blocks['connection_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.setHelpUrl('http://www.example.com/');
    this.setColour('#FF9903');
    this.appendDummyInput()
        .appendField("Connect Event")
        .appendField(new Blockly.FieldDropdown([["none", "None"], ["Motion", "Motion"], ["LED", "LED"], ["Friend", "Friend"], ["Mic", "Mic"], ["Speaker", "Speaker"]]), "Link");
    this.appendStatementInput("script");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setTooltip('');
  }
};

// MISCELLANEOUS

Blockly.Blocks['delay'] = {
  init: function() {
    //this.appendDummyInput()
    //    .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_6_Hub.png", 50, 50, "*"));
    this.appendDummyInput()
        .appendField("Delay ");
    this.appendValueInput("delay_in_ms")
        .setCheck("Number");
    this.appendDummyInput()
        .appendField("ms");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour('#FFCE00');
    this.setTooltip('Delay by the specified number of ms (1000 ms = 1 sec)');
    this.setHelpUrl('http://www.example.com/');
  }
};




//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//Lyssa's sound and radio blocks
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

// radio event
// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#evprcb

Blockly.Blocks['radio_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("On Radio Event");
    this.appendDummyInput()
    .appendField(new Blockly.FieldImage("../../images/radio_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#FF9903');
    this.appendValueInput("NAME")
        .appendField(new Blockly.FieldDropdown([["Msg_Color", "MSG_COLOR"], ["Msg_Sound", "MSG_SOUND"], ["Msg_Blank", "MSG_BLANK"]]), "NAME");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Create your own sound. Could be combined or put in a loop to make more complex sounds
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#jg6c8w

Blockly.Blocks['sound_fdv'] = {
  init: function() {
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_2.2_SoundBlock.png", 50, 50, "GetSpeakerData"));
    this.appendDummyInput()
        .appendField("Sound with");
    this.appendValueInput("Frequency")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Frequency");
    this.appendValueInput("Duration")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Duration");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Volume");
    this.setOutput(true);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Use a pre-defined sound
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#yzekjn

Blockly.Blocks['sound_from_file'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["beep", "BEEP"], ["whoohoo", "WOOHOO"], ["uhoh", "UHOH"], ["hi", "HI"]]), "NAME");
    this.setOutput(true, null);
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Use sound in from mic, out through speaker (requires and intermediate cache of sound_in to a file)
// Link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#2ixsvm

Blockly.Blocks['sound_from_mic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sound from microphone");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.appendDummyInput()
        .appendField("With filter");
    this.appendValueInput("NAME")
        .appendField(new Blockly.FieldDropdown([["None", "FILTER_NONE"], ["Like_a_duck", "FILTER_ADD_NOISE"], ["Squeaky", "FILTER_HIGH_SHIFT"], ["Scary", "FILTER_LOW_SHIFT"]]), "FILTER_OPTIONS");
    this.setInputsInline(false);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// Play a user defined sound that a user records from the mic. It gets saved in a file. requires filename.
// this example shows three options. not sure if we want more.
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#z4xtfp


Blockly.Blocks['sound_user_defined_from_mic'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("My_sound");
    this.appendValueInput("Sound__userdefined_filename")
        .setCheck("Array")
        .appendField(new Blockly.FieldDropdown([["myfile1", "USER_DEFINED_SOUND1"], ["myfile2", "USER_DEFINED_SOUND2"], ["myfile3", "USER_DEFINED_SOUND3"]]), "My sound files");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.setInputsInline(false);
    this.setOutput(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#33CC66');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// on microphone trigger
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#sogot8
Blockly.Blocks['on_microphone_trigger'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/LZ_Icons_31032016_3.1_OnMicTrigger.png", 50, 50, "On Mic Trigger"));
    this.appendDummyInput()
        .appendField("On Microphone Trigger");
    this.appendStatementInput("NAME");
    this.setInputsInline(false);
    this.setColour('#E81A4B');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// On microphone trigger, user may convert sound (PITCH) to color (HUE) with POWER (brightness)=VOLUME.
// 20150727 LN: I envision that incoming sound is stored in a LIFO buffer.
// 20150727 LN: I'm unclear on the role of bandwidth in this caluclation (as a user visible paramenter)
// link: https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#mf254a

Blockly.Blocks['sound_convert_pitch_to_hue'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Sound_to_Colored_Light");
    this.appendValueInput("Pitch")
        .setCheck("Number")
        .appendField("Pitch");
    this.appendValueInput("Bandwidth")
        .setCheck("Number")
        .appendField("Bandwidth ???");
    this.appendValueInput("Volume")
        .setCheck("Number")
        .appendField("Volume");
    this.appendValueInput("Audio_buffer")
        .setCheck("Valid_sound_block")
        .appendField("Filename");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("../../images/mic_icon2.png", 22, 18, "GetMicData"));
    this.setColour('#E81A4B');;
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

//---------------------------------------------------



