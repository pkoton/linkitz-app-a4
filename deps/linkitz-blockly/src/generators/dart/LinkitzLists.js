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
 * @fileoverview Generating Linkitz assembly code for non-mutable lists.
 * This is based on the Dart generator
 * written by @author fraser@google.com (Neil Fraser)
 * Modified by lyssa@linkitz.com (Lyssa Neel)
 */
'use strict';

goog.require('Blockly.Dart');

Blockly.Dart.addReservedWords('Math');

Blockly.Dart['lists_getIndex_nonMut'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(block, 'AT',
      Blockly.Dart.ORDER_UNARY_PREFIX) || '1';
  if (debug) {alert('(Blockly.isNumber(at)  = ' + Blockly.isNumber(at))};
  var list = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';

    if (where == 'FIRST') {
        var code = list + '.first';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
    } else if (where == 'LAST') {
        var code = list + '.last';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } else if (where == 'FROM_START') {
        // Blockly uses one-based indicies.
                if (Blockly.isNumber(at)) {
                  // If the index is a naked number, decrement it right now.
                at = parseInt(at, 10) - 1;
                } else {
                // If the index is dynamic, decrement it in code.
                      at += ' - 1';
                      }
          var code = list + '[' + at + ']';
          return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
     } else if (where == 'FROM_END') {
        var functionName = Blockly.Dart.provideFunction_(
            'lists_get_from_end',
            [ 'dynamic ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
                '(List myList, num x) {',
              '  x = myList.length - x;',
              '  return myList.removeAt(x);',
              '}']);
        code = functionName + '(' + list + ', ' + at + ')';
        return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
      } 
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Dart['lists_setIndex_nonMut'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_UNARY_POSTFIX) || '[]';
  var mode = 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Dart.valueToCode(block, 'AT',
      Blockly.Dart.ORDER_ADDITIVE) || '1';
  var value = Blockly.Dart.valueToCode(block, 'TO',
      Blockly.Dart.ORDER_ASSIGNMENT) || 'null';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  // Closure, which accesses and modifies 'list'.
  function cacheList() {
    if (list.match(/^\w+$/)) {
      return '';
    }
    var listVar = Blockly.Dart.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    var code = 'List ' + listVar + ' = ' + list + ';\n';
    list = listVar;
    return code;
  }
  if (where == 'FIRST') {
      return list + '[0] = ' + value + ';\n';
  } else if (where == 'LAST') {
      var code = cacheList();
      code += list + '[' + list + '.length - 1] = ' + value + ';\n';
      return code; 
  } else if (where == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at)) {
      // If the index is a naked number, decrement it right now.
      at = parseInt(at, 10) - 1;
    }
    return list + '[' + at + '] = ' + value + ';\n'; 
  } else if (where == 'FROM_END') {
    var code = cacheList();
      code += list + '[' + list + '.length - ' + at + '] = ' + value + ';\n';
      return code; 
  } 
  throw 'Unhandled combination (lists_setIndex).';
};


