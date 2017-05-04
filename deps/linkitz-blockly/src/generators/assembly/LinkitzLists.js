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

// list info stored in GLV[var_name] = [head_addr, register_used, desc]

Blockly.Assembly['lists_length'] = function(block) {
  var code='';
  console.log("in lists_length");
  var targetBlock = block.getInputTargetBlock('VALUE');
  //console.log("target block is " + targetBlock);
  var inputType = targetBlock.type;
  //console.log("in lists_length, inputType is " + inputType);
  switch (inputType) { 
      case 'colour_picker':
      case 'get_motion_data':
        // console.log("in lists_length, length = 3");
        code += "set R1 3\n";
        break;
      case 'lists_create_n':
        // console.log("in lists_length, length = " + parseInt(targetBlock.getFieldValue('NUM_ITEMS')));
        code += "set R1 " + parseInt(targetBlock.getFieldValue('NUM_ITEMS')) + "\n";
        break;
      case 'lists_create_with':
      case 'array':
        // console.log("in lists_length, length = " + targetBlock.itemCount_);
        code += "set R1 " + targetBlock.itemCount_ + "\n";
        break;
      case 'procedures_callreturn':
        var procName = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
        console.log("in lists_length: procedures_callreturn " + procName);
        if (procName in proc_types) { // already figured out return type
          console.log(procName + " in proc_types");
          if (proc_types[procName][0] == 0) { //returns a scalar
            code += "set R1 1\n"; // pretend its a list of length 1
          } else if (!(proc_types[procName][0] == 0)) { // returns a list, get sublist_desc
            var top_level_length = proc_types[procName][2][0];
            console.log("in lists_length, top_level_len = " + top_level_length);
            code += "set R1 " + top_level_length + "\n";
          }
        }
        else {
          throw 'Can\'t get list length from procedure returned value';
        }
        break;   
      case 'variables_get':    
        var list_name = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        if (global_scalar_variables.indexOf(list_name) >=0) { //it's a scalar
          code += "set R1 1\n"; // pretend its a list of length 1
        }
        else if (list_name in global_list_variables) { // if in global_list_variables [head,Rused,desc]
          var llen = global_list_variables[list_name][2][0]
          code += "set R1 " + llen + "\n";
        } else {
          console.log("can't determine list length");
        }
        break;
      default:
        throw 'Can\'t get list length';  
    } 
  return [code, Blockly.Assembly.ORDER_NONE];
};

Blockly.Assembly['lists_getIndex_nonMut'] = function(block) {
  // Get element at index.
  console.log("in lists_getIndex_nonMut");
  var code = '';
  var mode = 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list_name = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  if (global_scalar_variables.indexOf(list_name) >=0) {
      console.log("selected variable is a scalar!");
      return [code, Blockly.Assembly.ORDER_NONE];
      }
  var list_head_addr = global_list_variables[list_name][0];
  var list_first_elt_addr = global_list_variables[list_name][0] + 1;
  var list_len = global_list_variables[list_name][1] - 1;
  var list_last_elt_addr = list_head_addr + list_len;
  if (global_list_variables[list_name][2].length == 1) {
    var list_elt_size = 1;
    } else
    {var temp = global_list_variables[list_name][2].slice(); // make a copy of list_desc
    temp.shift(); // remove first item; temp now describes the structure of each list item
    var list_elt_size = list_length_from_sublist_desc(temp);
    }
  var list_num_items = global_list_variables[list_name][2][0];
  console.log("in lists_getIndex_nonMut, list_first_elt_addr = " +list_first_elt_addr+ "\n");
  console.log("in lists_getIndex_nonMut, list_len = " + list_len+ ", list_elt_size = " + list_elt_size);
  var list_elt_addr;
  
  
    if (where == 'FIRST') {
      if (list_elt_size ==1) {
        code += 'Push R' + list_first_elt_addr + '\nPop R1\n';
      } else {
        for (var i = list_elt_size - 1; i >= 0; i--) {
        list_elt_addr = list_first_elt_addr + i;
        code += 'Push R' + list_elt_addr + '\n';
        }
        code += 'set R1 ' + list_elt_size +"\npush R1\n";
      }
        return [code, Blockly.Assembly.ORDER_NONE];     
    } // end FIRST
    else if (where == 'LAST') {
        if (list_elt_size ==1) {
        code += 'Push R' + list_last_elt_addr + '\nPop R1\n';
      } else {
        for (var i = 0; i < list_elt_size; i++) {
        var list_elt_addr = list_last_elt_addr - i;
        code += 'Push R' + list_elt_addr + '\n';
        }
        code += 'set R1 ' + list_elt_size +"\npush R1\n";
      }
        return [code, Blockly.Assembly.ORDER_NONE];     
    } //end LAST
    else if (where == 'FROM_START') { // Blockly uses one-based indicies
        var at2 = Blockly.Assembly.valueToCode(block, 'AT',Blockly.Assembly.ORDER_NONE) || '1';
        console.log("AT2 is "+ at2);
        code += at2; // result in R1
         // calculate this: (at2 * list_elt_size)
         code += "set R2 " + list_elt_size + "\n";
         code += "Mul R1 R2 R1\n"; // R1 holds the starting offset. the first thing to be pushed=last item elt
         //code += "push R1\npush R1"; //save it for bounds check, and for GETO call         
         //   // Bounds check - make sure we are not looking past end of list!
         //   //add list head address plus offset, compare with list last elt address
         //code += "set R1 " + list_head_addr + "\npop R2\nAdd R1 R2 R1\n"; // R1 now holds address of last req element
         // code += "set R2 " + list_last_elt_addr + "\n";
         // code += "cpmle R1 R2 R1\n"; // R1 will hold 1 if req item is not reading past last item
         // code += "BTR1SNZ\n"; //skip the next instruction if we are good to go 
         // code += "GOTO BOUNDS_ERR" + bounds_label;  // jump to error handler
         //  // the following code executed if bounds OK
         // code += 'pop R1\n'; // restore starting offset to R1
         if (list_elt_size ==1) {
          code += 'GETO R' + list_head_addr + ' R1 R1\n';
          }
        else {
         var save_temp = gsv_next; //*** ******check to make sure this is not hitting glv_next
          if (save_temp > glv_next) {
            throw 'out of register space (lists_getIndex)';
          }
          gsv_next += 1;
          code += "set R2 -1\n";
         for (var i = 0; i < list_elt_size; i++) {
          code += 'GETO R' + list_head_addr + ' R1 R' + save_temp + '\n';
          code += 'Push R'+ save_temp + '\n';
          code += 'Add R1 R2 R1\n'; // calculate next offset
          }
          code += 'set R1 ' + list_elt_size +"\npush R1\n";
        }
        //code += 'GOTO END' + bounds_label + '\n';
        //code += 'BOUNDS_ERR' + bounds_label + ':\n';
        //// code for handling bounds error goes here
        //code += 'END' + bounds_label + ':\n';
         gsv_next -= 1;
         return [code, Blockly.Assembly.ORDER_NONE];
    } // end FROM_START
     else if (where == 'FROM_END') {
      var at1 = block.getInputTargetBlock('AT') || '1';
        var at = at1.toString();
        console.log("AT is "+ at);
        var at2 = Blockly.Assembly.valueToCode(block, 'AT',Blockly.Assembly.ORDER_NONE) || '1';
        console.log("AT2 is "+ at2);
        code += at2; // result in R1
        // calculate this: (list_num_items - (at2 - 1)) * list_elt_size
        code += "set R2 1\nSUB R1 R2 R2\n"; // (at2- 1) in R2
        code += "set R1 " + list_num_items + "\n";
        code += "SUB R1 R2 R1\n"; // (list_num_items - (at2 - 1)) in R1
        code += "set R2 " + list_elt_size + "\n";
        code += "MUL R2 R1 R1\n"; //((list_num_items - (at2 - 1)) * list_elt_size) in R1
        // R1 now holds the starting offset ( the last element of the requested item)
        if (list_elt_size ==1) {
          code += 'GETO R' + list_head_addr + ' R1 R1\n';
          }
        else {
         var save_temp = gsv_next; //*** ******check to make sure this is not hitting glv_next
          if (save_temp > glv_next) {
            throw 'out of register space (lists_getIndex)';
          }
          gsv_next += 1;
          code += "set R2 -1\n";
         for (var i = 0; i < list_elt_size; i++) {
          code += 'GETO R' + list_head_addr + ' R1 R' + save_temp + '\n';
          code += 'Push R'+ save_temp + '\n';
          code += 'Add R1 R2 R1\n'; // calculate next offset
          }
          code += 'set R1 ' + list_elt_size +"\npush R1\n";
        }
       gsv_next -= 1; 
        return [code, Blockly.Assembly.ORDER_NONE];
    } //end FROM_END 
  throw 'Unhandled combination (lists_getIndex).';
};

Blockly.Assembly['lists_setIndex_nonMut'] = function(block) {
  // Set element at index.
  var code = '; starting lists_setIndex_nonMut\n';
  var mode = 'SET';
  console.log("in lists_setIndex_nonMut");
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  console.log("WHERE = " + where);
  var list_name = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  console.log("list name is " + list_name);
  if (global_scalar_variables.indexOf(list_name) >=0) {
      console.log("selected variable is a scalar!");
      code += "; ending lists_setIndex_nonMut\n";
      return [code, Blockly.Assembly.ORDER_NONE];
      }
  var list_head_addr = global_list_variables[list_name][0];
  var list_first_elt_addr = global_list_variables[list_name][0] + 1;
  var list_len = global_list_variables[list_name][1] - 1;
  if (global_list_variables[list_name][2].length == 1) {
    var list_elt_size = 1;
    } else
    {var temp = global_list_variables[list_name][2].slice(); // make a copy of list_desc
    temp.shift(); // remove first item; temp now describes the structure of each list item
    var list_elt_size = list_length_from_sublist_desc(temp);
    }
  var list_num_items = global_list_variables[list_name][2][0];
  console.log("in lists_setIndex_nonMut, list_first_elt_addr = " +list_first_elt_addr+ "\n");
  console.log("in lists_setIndex_nonMut, list_len = " + list_len+ ", list_elt_size = " + list_elt_size);
  var list_elt_addr;
  console.log("here");
  
  if (where == 'FIRST') {
    var value = Blockly.Assembly.valueToCode(block, 'TO', Blockly.Assembly.ORDER_NONE) || 'null';
    console.log("value = " + value); // value is in R1 or on stack
    if (list_elt_size ==1) { // value is in R1
      code += value + 'Push R1\nPop R' + list_first_elt_addr + '\n';
    }
    else { //value is on stack, including the TOS = length which we don't need
      code += value + "Pop R0\n"; // get rid of length
      for (var i = 0; i < list_elt_size; i++) {
        list_elt_addr = list_first_elt_addr + i;
        code += 'pop R' + list_elt_addr + '\n';
      }
    }
    code += "; ending lists_setIndex_nonMut\n";
    return code;  
  } //end FIRST
  else if (where == 'LAST') {
    var list_last_elt_addr = list_head_addr + list_len; // last elt of last item
    var value = Blockly.Assembly.valueToCode(block, 'TO', Blockly.Assembly.ORDER_NONE) || 'null';
    console.log("value = " + value); // value is in R1 or on stack
    if (list_elt_size ==1) { // value is in R1
      code += value + 'Push R1\nPop R' + list_last_elt_addr + '\n';
    }
    else { //value is on stack, including the TOS = length which we don't need
      code += value + "Pop R0\n"; // get rid of length
      for (var i = list_elt_size - 1; i >= 0; i--) {
        var list_elt_addr = list_last_elt_addr - i;
        code += "pop R" + list_elt_addr + "\n";
      }
    }
    code += "; ending lists_setIndex_nonMut\n";
    return code;  
  } // end LAST
  else if (where == 'FROM_START') {
    var at = Blockly.Assembly.valueToCode(block, 'AT',Blockly.Assembly.ORDER_NONE) || '1';
    console.log("AT is "+ at);
    // index of req item is now in R1, calculate pointer to [start of] item
    code += at + "set R2 1\nSub R1 R2 R1\nset R2 " +  list_elt_size + "\nMul R1 R2 R1\n Set R2 1\n Add R1 R2 R2\n";
    // R2 now has offset from head of list to req item
    var save_offset = gsv_next; //*** ******check to make sure this is not hitting glv_next
    if (save_offset > glv_next) {
    throw 'out of register space (lists_setIndex)';
    }
    gsv_next += 1;
    code += "push R2\npop R" + save_offset + "\n";
    var value = Blockly.Assembly.valueToCode(block, 'TO', Blockly.Assembly.ORDER_NONE) || 'null';
    console.log("value = " + value); // value is in R1 or on stack
    if (list_elt_size ==1) { // value is in R1
      code += value + 'SETO R' + list_head_addr + ' R' + save_offset + ' R1\n';
    }
    else { // value is on stack starting with list length which we don't need
      code += value + "Pop R0\n"; // get rid of length
      code += "set R" + gsv_next + " 1\n"; //
      for (var i = 0; i < list_elt_size; i++) {
        code += "Pop R1\n"
        code += 'SETO R' + list_head_addr + ' R' + save_offset + ' R1\n';
        code += 'Add R' + save_offset + ' R' + gsv_next + ' R' + save_offset + '\n'; // calculate next offset
      }
    }
  gsv_next -= 1;
  code += "; ending lists_setIndex_nonMut\n";
  return code;   
  } // end FROM_START
  else if (where == 'FROM_END') {
    //first convert FROM_END to FROM_START
    code += "set R1 " + list_num_items +"\nSet R2 1\nAdd R1 R2 R2\n"
    var at = Blockly.Assembly.valueToCode(block, 'AT',Blockly.Assembly.ORDER_NONE) || '1';
    console.log("AT is "+ at);
    // index of req item is now in R1, calculate pointer to [start of] item
    code += at + "SUB R2 R1 R1\n"; // R1 now holds index FROM_START, calculate pointer to [start of] item
    code += "set R2 1\nSub R1 R2 R1\nset R2 " +  list_elt_size + "\nMul R1 R2 R1\n Set R2 1\n Add R1 R2 R2\n";
    // R2 now has offset from head of list to req item
    var save_offset = gsv_next; //*** ******check to make sure this is not hitting glv_next
    if (save_offset > glv_next) {
    throw 'out of register space (lists_setIndex)';
    }
    gsv_next += 1;
    code += "push R2\npop R" + save_offset + "\n";
    var value = Blockly.Assembly.valueToCode(block, 'TO', Blockly.Assembly.ORDER_NONE) || 'null';
    console.log("value = " + value); // value is in R1 or on stack
    if (list_elt_size ==1) { // value is in R1
      code += value + 'SETO R' + list_head_addr + ' R' + save_offset + ' R1\n';
    }
    else { // value is on stack starting with list length which we don't need
      code += value + "Pop R0\n"; // get rid of length
      code += "set R" + gsv_next + " 1\n"; //
      for (var i = 0; i < list_elt_size; i++) {
        code += "Pop R1\n"
        code += 'SETO R' + list_head_addr + ' R' + save_offset + ' R1\n';
        code += 'Add R" + save_offset + " R' + gsv_next + ' R' + save_offset + '\n'; // calculate next offset
      }
    }
    gsv_next -= 1;
    code += "; ending lists_setIndex_nonMut\n";
    return code;  
  } //end FROM_END
  throw 'Unhandled combination (lists_setIndex)';
};


// this creates a list without setting any elements
// stack space was allocated during resolve var refs
// so just push n 0s onto the stack, plus the length

Blockly.Assembly['lists_create_n'] = function(block) { 
  console.log("in lists_create_n");
  var code = '; starting lists_create_n\n';
  if (block.id in blockid_return_value_desc) {
    console.log("have block.id");
    var list_desc = blockid_return_value_desc[block.id];
    var pushes = list_length_from_sublist_desc(list_desc);
    console.log("pushes = " + pushes);
    for (var i = 0; i < pushes; i++) {
      console.log("on list element #" + i);
      code += 'Push R0\n';
    }
    code += 'Set R1 ' + pushes + '\nPush R1\n';
  } else
  {
    console.log("don't have block.id");
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
      console.log("on list element #" + i);
      code += 'Push R0\n';
    }
    code += 'Set R1 ' + numItems + '\nPush R1\n';
  }
  code += "; ending lists_create_n\n";
  return [code, Blockly.Assembly.ORDER_NONE];
};

