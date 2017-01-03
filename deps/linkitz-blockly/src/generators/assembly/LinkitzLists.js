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

goog.require('Blockly.Assembly');

Blockly.Assembly.addReservedWords('Math');

// list info stored in GLV[var_name] = [head_addr, register_used, skip]

Blockly.Assembly['lists_getIndex_nonMut'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Assembly.valueToCode(block, 'AT', Blockly.Assembly.ORDER_UNARY_PREFIX) || '1';
  var list_name = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VALUE'), Blockly.Variables.NAME_TYPE);
  console.log("got list name " + list_name);
  var list_first_elt_addr = global_list_variables[list_name][0] + 1;
  var list_len = global_list_variables[list_name][1] - 1;
  var list_elt_addr;
  if (Blockly.isNumber(at) && (at > list_len)) {
    console.log('in lists_getIndex_nonMut: index is out of range'); // set it to 1
    at = 1;
  }
  
    if (where == 'FIRST') {
        var code = 'Push R' + list_first_elt_addr + '\nPopR1\n';
        return [code, Blockly.Assembly.ORDER_NONE];
    } else if (where == 'LAST') {
        list_elt_addr = list_first_elt_addr + list_len;
        var code = 'Push R' + list_elt_addr + '\nPopR1\n';
        return [code, Blockly.Assembly.ORDER_NONE];
      } else if (where == 'FROM_START') {
        // Blockly uses one-based indicies.
                if (Blockly.isNumber(at)) { // otherwise it might be a var or statement?
                at = parseInt(at, 10);
                }
        list_elt_addr = list_first_elt_addr + at;     
        var code = 'Push R' + list_elt_addr + '\nPopR1\n';
        return [code, Blockly.Assembly.ORDER_NONE];
     } else if (where == 'FROM_END') {
        var list_last_elt_addr = list_first_elt_addr + list_len;
        list_elt_addr = list_last_elt_addr - at;
        var code = 'Push R' + list_elt_addr + '\nPopR1\n';
        return [code, Blockly.Assembly.ORDER_NONE];
      } 
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Assembly['lists_setIndex_nonMut'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var mode = 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Assembly.valueToCode(block, 'AT', Blockly.Assembly.ORDER_ADDITIVE) || '1';
  var value = Blockly.Assembly.valueToCode(block, 'TO', Blockly.Assembly.ORDER_ASSIGNMENT) || 'null';
  var list_name = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('VALUE'), Blockly.Variables.NAME_TYPE);
  console.log("got list name " + list_name);
  var list_first_elt_addr = global_list_variables[list_name][0] + 1;
  var list_len = global_list_variables[list_name][1] - 1;
  var list_elt_addr;
  if (Blockly.isNumber(at) && (at > list_len)) {
    console.log('in lists_getIndex_nonMut: index is out of range'); // set it to 1
    at = 1;
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


// this creates a list without setting any elements
// stack space was allocated during resolve var refs
// so just push n 0s onto the stack, plus the length

Blockly.Assembly['lists_create_n'] = function(block) { 
  console.log("in lists_create_n");
  var numItems = parseInt(block.getFieldValue('NUM_ITEMS')); 
  if (numItems == 0) {
    numItems = 1; // can't have a list of length 0, in future should alert user
  }
    else if (numItems > 127) {
      numItems = 127; // 127 max
    }
  console.log("numItems = " + numItems);
  var code = '';
  for (var i = 0; i < numItems; i++) {
    code += 'Push R0\n';
  }
  code += 'Push ' + numItems + '\n';
  return [code, Blockly.Assembly.ORDER_ATOMIC];
};

