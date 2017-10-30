/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Dart for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Assembly.colour');

goog.require('Blockly.Assembly');

// Rather than 0...255 Linkitz colors got from 0...127
// 0 is off, 127 is 100%
// this is handled in the functions that write a value into a register of stack
// using helper function lkzify

function lkzify(num) {

    if (num <= 0) {
        return 0;
        }
    else {
		var gamma = 2;
		var rangein = 255;
		var rangeout = 127;
		var A=rangeout/Math.pow(rangein,gamma);
        num = A*Math.pow(num,gamma);
        return num;
    }
}

// convert a hexidecimal color string to 0..255 R,G,B, remember that first char is #
// example input: #ff00cc

function hexToRGB (hex){
    var r = parseInt(hex.substr(1,2),16);
    var g = parseInt(hex.substr(3,2),16);
    var b = parseInt(hex.substr(5,2),16);
    return [r,g,b];
}

function adjustForR7Brightness(colorRGB){
	var gamma = 2;
	var rangein = 255;
	var rangeout = 127;
	colorRGB = [lkzify(colorRGB[0]),
				lkzify(colorRGB[1]),
				lkzify(colorRGB[2])]
	//green LEDs are too dim, we have to compensate
	//screen color 255,230,0 should map to 93,127
	//lkzify will map it to 255^gamma*rangeOut/rangeIn^gamma

	var greenScaling = 127/93*lkzify(255)/lkzify(230);
	console.log("greenScaling constant is: "+greenScaling);
	if(Math.floor(greenScaling*colorRGB[1])<=127){
		console.log("green is scaled here and fits");
		colorRGB=[Math.floor(colorRGB[0]),
				  Math.floor(colorRGB[1]*greenScaling),
				  Math.floor(colorRGB[2])]; 
	} else {
		console.log("green must be scaled down to fit, so all values are similarly scaled")
		colorRGB=[Math.floor(colorRGB[0]*127/(colorRGB[1]*greenScaling)),
				  127,
				  Math.floor(colorRGB[2]*127/(colorRGB[1]*greenScaling))];
	}
	return colorRGB;
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

Blockly.Assembly.addReservedWords('Math');

Blockly.Assembly['colour_picker'] = function(block) {
  // Colour picker.
  var code = "; starting colour_picker.\n";
  var value_color = block.getFieldValue('COLOUR'); // getFieldValue('COLOUR') returns the color as a hex string no quotes
  code += ";using color "+value_color+"\n";
  var colorRGB = hexToRGB (value_color);
  colorRGB=adjustForR7Brightness(colorRGB);
  code += ";adjusted to "+colorRGB+"\n";
  var Rcode, Gcode, Bcode;
  var R = colorRGB[0];
  if (R == 0) {
        Rcode = 'Push R0\n';}
        else {
            Rcode = 'Set R1 ' + R + '\nPush R1\n'; // 
        }
  var G = colorRGB[1];
  if (G == 0) {
        Gcode = 'Push R0\n';}
        else {
            Gcode = 'Set R1 ' + G + '\nPush R1\n'; // 
        }
  var B = colorRGB[2];
  if (B == 0) {
        Bcode = 'Push R0\n';}
        else {
            Bcode = 'Set R1 ' + B + '\nPush R1\n'; // 
        }
    // push so stack is in this order top{3,R,G,B,...}
    code += Bcode + Gcode + Rcode + 'Set R1 3' + '\nPush R1\n'; // add length of color list =3
  code += "; ending colour_picker\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};

// all the following need to have the numbers lkzify'd before using
Blockly.Assembly['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Assembly.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Assembly.provideFunction_(
      'colour_random',
      [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  String hex = \'0123456789abcdef\';',
        '  var rnd = new Math.Random();',
        '  return \'#${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
        '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
        '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\';',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Assembly.valueToCode(block, 'RED',
      Blockly.Assembly.ORDER_NONE) || 0;
  var green = Blockly.Assembly.valueToCode(block, 'GREEN',
      Blockly.Assembly.ORDER_NONE) || 0;
  var blue = Blockly.Assembly.valueToCode(block, 'BLUE',
      Blockly.Assembly.ORDER_NONE) || 0;

  Blockly.Assembly.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Assembly.provideFunction_(
      'colour_rgb',
      [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
          '(num r, num g, num b) {',
        '  num rn = (Math.max(Math.min(r, 1), 0) * 255).round();',
        '  String rs = rn.toInt().toRadixString(16);',
        '  rs = \'0$rs\';',
        '  rs = rs.substring(rs.length - 2);',
        '  num gn = (Math.max(Math.min(g, 1), 0) * 255).round();',
        '  String gs = gn.toInt().toRadixString(16);',
        '  gs = \'0$gs\';',
        '  gs = gs.substring(gs.length - 2);',
        '  num bn = (Math.max(Math.min(b, 1), 0) * 255).round();',
        '  String bs = bn.toInt().toRadixString(16);',
        '  bs = \'0$bs\';',
        '  bs = bs.substring(bs.length - 2);',
        '  return \'#$rs$gs$bs\';',
        '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Assembly.valueToCode(block, 'COLOUR1',
      Blockly.Assembly.ORDER_NONE) || '\'#000000\'';
  var c2 = Blockly.Assembly.valueToCode(block, 'COLOUR2',
      Blockly.Assembly.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Assembly.valueToCode(block, 'RATIO',
      Blockly.Assembly.ORDER_NONE) || 0.5;

  Blockly.Assembly.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Assembly.provideFunction_(
      'colour_blend',
      [ 'String ' + Blockly.Assembly.FUNCTION_NAME_PLACEHOLDER_ +
          '(String c1, String c2, num ratio) {',
        '  ratio = Math.max(Math.min(ratio, 1), 0);',
        '  int r1 = int.parse(\'0x${c1.substring(1, 3)}\');',
        '  int g1 = int.parse(\'0x${c1.substring(3, 5)}\');',
        '  int b1 = int.parse(\'0x${c1.substring(5, 7)}\');',
        '  int r2 = int.parse(\'0x${c2.substring(1, 3)}\');',
        '  int g2 = int.parse(\'0x${c2.substring(3, 5)}\');',
        '  int b2 = int.parse(\'0x${c2.substring(5, 7)}\');',
        '  num rn = (r1 * (1 - ratio) + r2 * ratio).round();',
        '  String rs = rn.toInt().toRadixString(16);',
        '  num gn = (g1 * (1 - ratio) + g2 * ratio).round();',
        '  String gs = gn.toInt().toRadixString(16);',
        '  num bn = (b1 * (1 - ratio) + b2 * ratio).round();',
        '  String bs = bn.toInt().toRadixString(16);',
        '  rs = \'0$rs\';',
        '  rs = rs.substring(rs.length - 2);',
        '  gs = \'0$gs\';',
        '  gs = gs.substring(gs.length - 2);',
        '  bs = \'0$bs\';',
        '  bs = bs.substring(bs.length - 2);',
        '  return \'#$rs$gs$bs\';',
        '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.Assembly.ORDER_NONE];
};
