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

goog.provide('Blockly.Dart.colour');

goog.require('Blockly.Dart');

// convert a hexidecimal color string to 0..255 R,G,B, remember that first char is #
// example input: #ff00cc

function hexToRGB (hex){
    var r = parseInt(hex.substr(1,2),16);
    var g = parseInt(hex.substr(3,2),16);
    var b = parseInt(hex.substr(5,2),16);
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

Blockly.Dart.addReservedWords('Math');

Blockly.Dart['colour_picker'] = function(block) {
  // Colour picker.
  var value_color = block.getFieldValue('COLOUR'); // getFieldValue('COLOUR') returns the color as a hex string no quotes
  var colorRGB = hexToRGB (value_color);
    var t1 = colorRGB[0];
    var t2 = colorRGB[1];
    var t3 = colorRGB[2];
    var code =
      'Set R' + (global_list_variables[scratchColor][0] + 1) + ' ' +  t1 + '\n' + 
      'Set R' + (global_list_variables[scratchColor][0] + 2)  + ' ' + t2 + '\n' +
      'Set R' + (global_list_variables[scratchColor][0] + 3)  + ' ' + t3 + '\n' +
      'Set R1 '+ global_list_variables[scratchColor][0]  + '\n';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_random',
      [ 'String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  String hex = \'0123456789abcdef\';',
        '  var rnd = new Math.Random();',
        '  return \'#${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
        '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
        '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\';',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Dart.valueToCode(block, 'RED',
      Blockly.Dart.ORDER_NONE) || 0;
  var green = Blockly.Dart.valueToCode(block, 'GREEN',
      Blockly.Dart.ORDER_NONE) || 0;
  var blue = Blockly.Dart.valueToCode(block, 'BLUE',
      Blockly.Dart.ORDER_NONE) || 0;

  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_rgb',
      [ 'String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
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
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Dart.valueToCode(block, 'COLOUR1',
      Blockly.Dart.ORDER_NONE) || '\'#000000\'';
  var c2 = Blockly.Dart.valueToCode(block, 'COLOUR2',
      Blockly.Dart.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Dart.valueToCode(block, 'RATIO',
      Blockly.Dart.ORDER_NONE) || 0.5;

  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_blend',
      [ 'String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
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
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};
