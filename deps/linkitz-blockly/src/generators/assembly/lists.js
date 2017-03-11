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

goog.provide('Blockly.Assembly.lists');

goog.require('Blockly.Assembly');


Blockly.Assembly.addReservedWords('Math');

Blockly.Assembly['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  // List values are created, and left, on stack
  var code = '; starting lists_create_with\n';
  var itemNum1 = block.itemCount_;
  if (block.id in blockid_return_value_desc) { // we already have a full description of this block
    var list_info = blockid_return_value_desc[block.id];
    console.log("list_info  from blockid_return_value_desc = " +  JSON.stringify(list_info));
    var temp = list_info.slice(); // make a copy of list_info
    temp.shift(); // remove first item; temp now describes the structure of each list item
    var sublist_length = list_length_from_sublist_desc(temp); // we are adding itemNum1 items of length sublist_length
  } else {
  var list_info = get_list_desc(block, []);
  var temp0= list_info[1];
  var temp = temp0.slice();
  temp.shift();
  console.log("temp = " + JSON.stringify(temp));
   var sublist_length = list_length_from_sublist_desc(temp);
  }
  var total_length = list_length_from_sublist_desc(list_info);
  console.log("in lists_create_with, must create structure of " + itemNum1 + " items each of which is  " + JSON.stringify(temp));
  if (temp.length == 0) { // [] where i is integer means we are creating with scalars
    // we need the special case here because, unlike lists, scalars do not leave value on stack, need to push it
    console.log("lists_create_with: list of scalars");
    for (var m = (itemNum1 - 1); m >= 0; m--) { 
      var itemCode = Blockly.Assembly.valueToCode(block, 'ADD' + m, Blockly.Assembly.ORDER_NONE);
      if (itemCode) {
        code += itemCode +'Push R1\n'; 
      } else {
        code += 'Push R0\n';
      }
    }
    code += "Set R1 " + itemNum1 + '\nPush R1\n';
  }  
  else
  { // create the assembly code for list of lists 
    console.log("lists_create_with: list of lists");
    for (var m = (itemNum1 - 1); m >= 0; m--) { // for each list-of-lists item,in reverse order so first item ends up on TOS
      //console.log("on list element #" + m);
      var itemCode = Blockly.Assembly.valueToCode(block, 'ADD' + m, Blockly.Assembly.ORDER_NONE);
      console.log("itemCode = " + itemCode);
      if (itemCode) {
        if (is_scalar(block.getInputTargetBlock('ADD' + m))) {
          code += itemCode +'Push R1\n';
        } else
        {
          code += itemCode +'Pop R0\n'; // that POP gets rid of sublist length
        }
      } else {
        for (var mm = 0; mm < sublist_length; mm++) {
          code += 'Push R0\n';
          } 
        }
      }
      code += "Set R1 " + (itemNum1 * sublist_length) + '\nPush R1\n';
  }
  code += '; ending lists_create_with\n';
  return [code, Blockly.Assembly.ORDER_NONE];
};


