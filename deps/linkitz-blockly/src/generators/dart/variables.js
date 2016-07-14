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
 * @fileoverview Generating Linkitz assembly code for variable blocks.
 * This is based on the Dart generator
 * written by @author fraser@google.com (Neil Fraser)
 * Modified by lyssa@linkitz.com (Lyssa Neel)
 */
'use strict';

goog.provide('Blockly.Dart.variables');

goog.require('Blockly.Dart');


Blockly.Dart['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  if (argument0.charAt(1) == '#') { // input is a single color in hex, convert to RGB
    var t1 = argument0.substr(2,2);
    var t2 = argument0.substr(4,2);
    var t3 = argument0.substr(6,2);
    // construct call to Flash,len len is 3 (just one rgb triplet)
    var code = 'Set ' + varName + ' 3\nSet ' + varName + '+1 ' + t1 + '\nSet ' + varName + '+2 ' + t2 + '\nSet ' + varName + '+3 ' + t3 + '\n';
  return code;
  };
}
 
