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


 // This should run first, during blockly.init.
 // it cycles through all blocks looking for variable_set, when a variable is set it is pushed to GSV
 // or GLV lists. If it is set to a var that has not been defined yet, it is pushed to undef_vars list.
 // Finally, cycle through undef_vars list trying to resolve var references, until none are left
 // or until no more can be removed which is a fail state
 // resolve variable refs handles var1 = var2 when var2 is used before it is defined
 // or var1 = var2 = var1 when there is a loop of assignments
 
 function resolve_var_refs(workspace, undef_vars_count){
  var blocks = workspace.getAllBlocks();
  if (debug) {alert("in resolve var refs")};
  // Iterate through every block.
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].type == 'variables_set') {
        var current_block = blocks[i];
        var varName = Blockly.Dart.variableDB_.getName(current_block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        if (debug) {alert(varName)};
        if (global_scalar_variables.indexOf(varName) >=0) {
          if (debug) {alert("found scalar")};
          continue;
          } else if (varName in global_list_variables) {
            if (debug) {alert("found list")};
            continue;
          } else { // NEW VARIABLE, add it to the correct variables list
            if (debug) {alert("new var")};
            var targetBlock = current_block.getInputTargetBlock('VALUE');
            var inputType = targetBlock.type;
            if (debug) {
              var assigned_value = Blockly.Dart.valueToCode(targetBlock, 'VALUE', Blockly.Dart.ORDER_ASSIGNMENT) || '0';
              alert("in resolve_var_refs:\nTarget Block is " + targetBlock + "\nvarName is " + varName + " is being assigned input of type " + inputType + " with value " + assigned_value);
            }
            switch (inputType) {
  
              // ********* SCALARS *********  
              
              case "math_number": // falls through to next
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
                addNewScalarVar(varName);
                break;
              
              // ********* LISTS *********  
              
              case 'colour_picker': 
                addNewListVar(varName,3); // color always a list of length 3
                break;
              case 'lists_create_n':
                var l1 = targetBlock.getInputTargetBlock("NUM_ITEMS");
                var l2 = parseInt(l1.getFieldValue("NUM"));
                if (debug){  alert("in lists_create_n " + targetBlock + " NUM_ITEMS is " + l2)};
                addNewListVar(varName, l2);
                break;
              case 'lists_create_with':
                var l1 = parseInt(targetBlock.itemCount_);
                if (debug){  alert("in lists_create_with " + targetBlock + " itemCount_ is " + l1)};
                addNewListVar(varName, l1);
                break;
              case 'getmotiondata':
                addNewListVar(varName,4); // getmotiondata returns MagLNK, a list of length 4
                break;
              case 'Array':
                
                break;
              case 'variables_get':
                  if (debug) {alert(varName + " is assigned to a variable")};
                  // get RHS variable name
                  // check if RHS is already defined -- if so, we know the type of varName
                  var RHSvar = targetBlock.getFieldValue('VAR');
                  alert("RHS variable is " + RHSvar);
                  if (global_scalar_variables.indexOf(RHSvar) >= 0) { // RHSvar is defined as scalar
                    addNewScalarVar(varName);
                    gsv_next++;
                    // Find and remove varName from undef_vars list
                    var i = undef_vars.indexOf("varName");
                    if (i != -1) {
                      undef_vars.splice(i, 1);
                      }
                    undef_vars_next--;
                  } else if (RHSvar in global_list_variables) { //RHSvar is defined as a list
                    addNewListVar(varName, global_list_variables[RHSvar][1]);
                    // Find and remove varName from undef_vars list
                    var i = undef_vars.indexOf("varName");
                    if (i != -1) {
                      undef_vars.splice(i, 1);
                      }
                    undef_vars_next--;
                    } else { // varName is a forward reference
                      undef_vars[undef_vars_next] = varName;
                      undef_vars_next++;
                    }
                break;
              default:
                alert("unknown variable type in resolve_variable_refs");
                return 0;
            } // end switch
          } // end else { // new variable, add it to the correct variables list
      } // end if (blocks[i].type == 'variables_set')
    } // end for
    if (undef_vars.length == 0) {
      // we win!
      return 1;
    } else if (undef_vars_count == undef_vars.length) {
      // bad news, we have a loop situation
      return 0;
    } else {
      // go through all variable_set blocks again to try to resolve more references.
      resolve_var_refs(workspace, undef_vars.length);
      }
 }
 
 function addNewListVar(varName,len) {
    var bottom = glv_next - len; //point to where we want to insert
    if (debug) {alert("len = "+len+" bottom = "+bottom)};
    if (bottom < gsv_next) {
     alert("Error: Out of variable space in addNewListVar");
     return0;
    }
    global_list_variables[varName]=[bottom,(len + 1)];
    glv_next = bottom - 1; // move pointer to next space down
    if (debug) {alert("bottom = "+bottom+ " glv_next = "+glv_next)};
    if (debug) {alert(varName + " added to GLV with length " + (len + 1))};
  }

function addNewScalarVar(varName) {
  if (gsv_next > glv_next) {
    alert("Error: Out of variable space in addNewScalarVar");
   return0;
  }
  global_scalar_variables[gsv_next] = varName;
  if (debug) {alert("in resolve_var_refs: GSV pointer now is " + gsv_next)};
  gsv_next++; // point to next empty space
  }
 
 Blockly.Dart['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  if (debug) {alert("in variables_get: name is " + varName)};
  var varName_undef = 1;
  var is_scalar = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
  if (is_scalar >= 0) {
    varName_undef = 0;
    var code = 'push R' + is_scalar + '\npop R1\n';  
  } else if (varName in global_list_variables) { // is it in global_list_variables
      varName_undef = 0;
      var code = 'push R' + global_list_variables[varName][0] + '\npop R1\n';
      }
  if (varName_undef) {                                                // variable value has not been set yet
    alert('in variables_get: ' + varName + ' is undefined');
    var code = varName  + ' UNDEFINED\n';
  }
  return [code, Blockly.Dart.ORDER_ATOMIC];
}

Blockly.Dart['variables_set'] = function(block) {
  // Variable setter
  var argument0 = Blockly.Dart.valueToCode(block, 'VALUE', Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  var targetBlock = block.getInputTargetBlock('VALUE');
  var inputType = targetBlock.type;
  var varName = Blockly.Dart.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  if (debug) {alert("in variables_set: input is of type " + inputType + ", varName is " + varName + ", value is " + argument0)};
  if (debug) {alert("GLV is " + JSON.stringify(global_list_variables));}
  var found = global_scalar_variables.indexOf(varName);
  if (found >= 0) { // setting a scalar, value is in R1
    if (debug) {alert("in variables_set, scalar variable " + varName + " defined at R" + found)};
    var code =  argument0 +'Push R1\nPop R' + found + '\n';
    return code;
    }
  if (varName in global_list_variables) { // setting a list, values are on the stack
    if (debug) {alert("in variables_set (2): global_list_variables[varName] is " + global_list_variables[varName] + " global_list_variables[varName][0] is " + global_list_variables[varName][0]);}
    found = global_list_variables[varName][0]; //headaddr
    var list_len = global_list_variables[varName][1];
    var pops = argument0 + 'Pop R' + found + '\n'; // don't need length, we already have it  pop it into R that holds length
    if (debug) {alert("in variables_set, list variable " + varName + " defined at R" + found)};
    for (var i = 1; i < list_len; i++) {
     pops = pops + 'Pop R' + (found + i) + '\n';
    }
    var code = pops;
    return code;
  }
// ************* else if its a  non-color-picker list, where is input ??? *************
  alert("in variables_set, " + varName + " not found"); 
  var code = varName  + ' UNDEFINED\n';
  return code;
}
 
 // copy a list of length l from one set of l registers to another set of l registers using push/pop
 function list_copy(old_ptr, new_ptr, l) {
    var local_code = '';
    // you don't need to copy the address pointer (lowest register)
    // it will already have been set in and is non-mutable
    for (var i = 0; i < l; i++) {
     local_code = local_code + "Push R" + old_ptr + "\n Pop R" + new_ptr + "\n";
     global_list_variables[new_ptr] = global_list_variables[old_ptr];
     old_ptr++;
     new_ptr++;
    }
    return local_code;
 }
 
 // copy a list of length l from one set of l registers to another set of l registers using rcopy
 function list_rcopy(old_ptr, new_ptr, l) {
    var local_code = '';
    for (var i = 0; i < l; i++) {
     local_code = local_code + "rcopy R" + new_ptr + " R" + old_ptr + "\n";
     global_list_variables[new_ptr] = global_list_variables[old_ptr];
     old_ptr++;
     new_ptr++;
    }
    return local_code;
 }
 
 // pretty print the contents of a multidimensional array
 function mdarray_pp(a){
  var contents = '';
  for (var i=0; i < a.length; i++) {
    if (a[i] && Array.isArray(a[i])) {
      contents = contents + "[" + a[i].join(",") + "] ";
      }
    else if (typeof a[i] != 'undefined') {
      contents = contents + a[i] + ",";
      }
      else {
      contents += "."
     }
  }
  return(contents);
 }
 
 

 
 