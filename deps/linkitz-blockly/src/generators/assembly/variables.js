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

goog.provide('Blockly.Assembly.variables');

goog.require('Blockly.Assembly');

 // This should run first, during blockly.init.
 // it cycles through all blocks looking for variables_set indicating a user-defined variable
 // when a variable is set it is pushed to GSV or GLV lists.
 // If it is set to a var that has not been defined yet, it is pushed to undef_vars list.
 // Finally, cycle through undef_vars list trying to resolve var references, until none are left
 // or until no more can be removed which is a fail state
 // resolve variable refs handles var1 = var2 when var2 is used before it is defined
 // or var1 = var2 = var1 when there is a loop of assignments
 
 function resolve_var_refs(workspace, undef_vars_init){
  var undef_vars_prev = undef_vars_init; // save to check for loops later
  var blocks = workspace.getAllBlocks();
  var i2 = 0; // index into undefined_vars
  console.log("In resolve var refs, reviewing " + blocks.length + " blocks");
  // Iterate through every procedure defreturn block.
    for (var i = 0; i < blocks.length; i++) {
      console.log("for loop i = " + i);
      var current_block = blocks[i];
      console.log("in loop1, current_block is (" + i + ") " + current_block);
      // looking for procedure definitions
      if (current_block.type == 'procedures_defreturn') { //********** returns scalar or list?
        var procName = current_block.getFieldValue('NAME');
        //var procName2 = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
        //console.log("procName: " + procName + ", after getName: " + procName2);
        console.log("procName: " + procName);
        var returnBlock = current_block.getInputTargetBlock('RETURN');
        if (returnBlock) {
          var ldata; // placeholder for list data if it is a list
          var returnBlockType = current_block.getInputTargetBlock('RETURN').type;
          console.log("in loop1 getting proc_return_type of " + procName);
          console.log('returnBlock is ' + returnBlock + ", returnBlockType is " + returnBlockType);
            if (is_scalar(returnBlock)) {
              console.log('in loop1 returnBlock is scalar');
              proc_types[procName] = [0,9];
              console.log(procName +" returns a scalar");
              if (procName in proc_types) {
              console.log("added " + procName);
              } else {
              console.log ("didn't add " + procName);
            }
              // Find and remove procName from undef_vars list
                          i2 = undef_vars.indexOf("procName");
                          if (i2 != -1) {
                            undef_vars.splice(i2, 1);
                            }
                          undef_vars_next--;
              } else if (ldata = is_list(returnBlock)) { // ldata is being assigned the value of is_list; not a typo!
                console.log('in loop1 returnBlock is a list, ldata is ' + ldata);
                var llength = ldata[0];
                var lskip = ldata[1];
                console.log("in loop1 is_list returns llength = " + llength + " lskip = " + lskip);
                if (llength >= 1) {
                  console.log('returnBlock is list');
                  proc_types[procName] = [llength,lskip];
                  console.log(procName + " returns a list of length " + (llength * lskip));
                  if (procName in proc_types) {
                    console.log("added " + procName);
                      } else {
                        console.log ("didn't add " + procName);
                        }
                  // Find and remove procName from undef_vars list
                          i2 = undef_vars.indexOf("procName");
                          if (i2 != -1) {
                            undef_vars.splice(i2, 1);
                            }
                          undef_vars_next--;
                } /*else if (llength == 1) {
                    console.log('returnBlock is list');
                    proc_types[procName] = [1,9]; // **** dummy value, work on finding list length later
                    console.log(procName + " returns a list of unknown length");
                    // Find and remove procName from undef_vars list
                            i2 = undef_vars.indexOf("procName");
                            if (i2 != -1) {
                              undef_vars.splice(i2, 1);
                              }
                            undef_vars_next--;
                  }*/ else {
                    console.log("still working on " + procName);
                    }
                }
                 else {
                  console.log("in loop1 unknown if returnBlock is scalar or list");
                  // add procName to undef_vars list
                  i2 = undef_vars.indexOf("procName");
                    if (i2 == -1) { // if its not already in undef vars list 
                      undef_vars[undef_vars_next] = procName; // add to undef variables list
                      undef_vars_next++;  
                    }
                    console.log("here");
                 }
        } // end if (returnBlock)
      } // end if (blocks[i].type == 'procedures_defreturn')
             
      else if (current_block.type == 'variables_set') { //********** set to scalar or list?
          var varName = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
          console.log("in loop2 trying to variables_set " + varName);
          if (global_scalar_variables.indexOf(varName) >=0) {
            console.log("in loop2 found scalar in GSV");
            continue;
            } else if (varName in global_list_variables) {
              console.log("in loop2 found list in GLV");
              continue;
            } else { // NEW VARIABLE, add it to the correct variables list
              console.log("in loop2 new var " + varName);
              var targetBlock = current_block.getInputTargetBlock('VALUE');
              console.log("in loop2 targetBlock " + targetBlock);
              if (targetBlock) {
              var inputType = targetBlock.type;
              console.log("in resolve_var_refs:\nTarget Block is " + targetBlock + "\nvarName is " + varName + ", which is being assigned input of type " + inputType);
              
                switch (inputType) {
          
                  // ********* SCALARS *********  :
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
                  case "getbatterylevel":
                  case "getambientlight":
                    console.log("in loop2 found scalar by case");
                    addNewScalarVar(varName);
                    break;
                  
                  // ********* LISTS *********  
                  
                  case 'colour_picker':
                    console.log("in loop2 found list by case colour_picker");
                    addNewListVar(varName,3,1); // color always a list of length 3
                    break;
                  case 'getmotiondata':
                    console.log("in loop2 found list by case getmotiondata");
                    addNewListVar(varName,4,1); // getmotiondata returns MagLNK, a list of length 4
                    break;
                  case 'lists_create_n': // a list of n scalars
                    console.log("in loop2 found list by case lists_create_n");
                    var numItems = parseInt(targetBlock.getFieldValue('NUM_ITEMS')); 
                    //if (numItems == 0) {
                    //  numItems = 1; // can't have a list of length 0, in future should alert user
                    //}
                    //else if (numItems > 127) {
                    //    numItems = 127; // 127 max
                    //}
                    addNewListVar(varName, numItems, 1); 
                    break;
                  case 'lists_create_with':
                    console.log("in loop2 found list by case lists_create_with");
                    var temp = lists_create_with_lengthOf(targetBlock); // returns [number of items, item_length, total_length]
                    console.log("in resolve_var_refs, case lists_create_with " + targetBlock + " total items = " + temp[2] + " item length = " + temp[1]);
                    addNewListVar(varName, temp[0], temp[1]); 
                    break;
                                
                // ********* OTHER *********
                
                  case 'variables_get': // variable is assigned to another variable
                    console.log("in loop2, case is variables_get");
                    console.log(varName + " is assigned to a variable");
                      // get RHS variable name
                      // check if RHS is already defined -- if so, we know the type of varName
                      var RHSvar = targetBlock.getFieldValue('VAR');
                      console.log("RHS variable is " + RHSvar);
                      if (global_scalar_variables.indexOf(RHSvar) >= 0) { // RHSvar is defined as scalar
                        console.log("in loop2 found scalar RHS");
                        addNewScalarVar(varName);
                        // Find and remove varName from undef_vars list
                        i2 = undef_vars.indexOf("varName");
                        if (i2 != -1) {
                          undef_vars.splice(i2, 1);
                          }
                        undef_vars_next--;
                      } else if (RHSvar in global_list_variables) { //RHSvar is defined as a list
                        console.log("in loop2 found list RHS");
                        addNewListVar(varName, (global_list_variables[RHSvar][1] - 1), global_list_variables[RHSvar][2]);
                        // Find and remove varName from undef_vars list
                        i2 = undef_vars.indexOf("varName");
                        if (i2 != -1) {
                          undef_vars.splice(i2, 1);
                        }
                        undef_vars_next--;
                      } else { // varName is not defined yet
                          i2 = undef_vars.indexOf("varName");
                            if (i2 == -1) { // if its not already in undef vars list 
                              undef_vars[undef_vars_next] = varName; // add to undef variables list
                              undef_vars_next++;  
                            }
                        }
                    break;
                  
                  case "lists_getIndex_nonMut": // variable is assigned to a list item, could be scalar or list
                    // we have the var_name, need the list name
                    console.log("in lists_getIndex_nonMut, targetBlock is " + targetBlock);
                    var list_name2 = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
                    console.log("list_name2 = " + list_name2);
                    var list_elt_size = global_list_variables[list_name2][2];
                    if (list_elt_size > 1) {
                      addNewListVar(varName, list_elt_size, 1); // we only have lists of (lists of scalars) so skip here is 1
                    } 
                    else {
                      addNewScalarVar(varName);
                    }
                  break;
                
                  case 'procedures_callreturn': // variable is assigned to the return val of a function
                    console.log("in case procedures_callreturn, current_block = " + current_block + " trying to find scalar/list of " + varName + " where targetBlock = " + targetBlock + " inputType = " + inputType);
                    // var funcName0 = targetBlock.getFieldValue('NAME');
                    var funcName = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
                    // console.log("funcName: " + funcName + ", before getName called, was: "+ funcName0);
                    console.log("funcName: " + funcName);
                    if (funcName in proc_types) { // already found
                      console.log("found procedure " + funcName +  " in proc_types");
                        if (proc_types[funcName][0] == 0) {
                          addNewScalarVar(varName);
                          break;
                          }
                          else if (proc_types[funcName][0] >= 1) { 
                            console.log("procedure returns a list in resolve_variable_refs");
                            addNewListVar(varName, proc_types[funcName][0], proc_types[funcName][1]); //varName,num_items,skip
                          break;
                          }
                          else { // says it found it but it has not entry
                          console.log("error1 in resolve var refs");
                          return 0;
                          }
                      } else {  // we don't know return type of proc
                              i2 = undef_vars.indexOf("varName");
                              if (i2 == -1) { // if its not already in undef vars list 
                                undef_vars[undef_vars_next] = varName; // add to undef variables list
                                undef_vars_next++;  
                              }
                            }
                      break;
                  default:
                    console.log("reached switch default");
                    alert("unknown variable type in resolve_variable_refs");
                    return 0;
                } // end switch
              } // end if (targetBlock)
            } // end else { // new variable, add it to the correct variables list
            continue;
        } // end if (blocks[i].type == 'variables_set')
      else {
        console.log("not procedure_defreturn or variables_set");
        continue;
      }
    } // end for
    console.log("undef_vars.length = " + undef_vars.length + " undef_vars_prev = " + undef_vars_prev)
    if (undef_vars.length == 0) {
      // we win!
      return 1;
    } else if (undef_vars.length == undef_vars_prev) {
      // bad news, we have a loop situation
      return 0;
    } else {
      // go through all variables_set blocks again to try to resolve more references.
      // run the procedure thing
      console.log("try again");
      resolve_var_refs(workspace, undef_vars.length);
      }
 }
 
 // num_items is number of items in a list, skip is how many registers needed to store one list item
 // e.g. A scalar uses one register, a color uses 3 registers because it has 3 scalars. 
 // # of registers used to store list is ((len * skip) + 1) need extra 1 because we store the length in headaddr
 // returns a list [head_addr, register_used, skip]
 
 function addNewListVar(varName,num_items,skip) {
    var head = (glv_next - (num_items * skip)); //point to where we want to insert
    var Rused = ((num_items * skip) + 1);
    console.log("num_items = "+num_items+", skip = " +skip+", Rused = " +Rused+ ", head = "+head);
    if (head < gsv_next) {
     console.log("Error: Out of variable space in addNewListVar");
     return 0;
    }
    global_list_variables[varName]=[head,Rused,skip];
    glv_next = head - 1; // move pointer to next empty space down
    console.log("head = "+head+ " glv_next = "+glv_next);
    console.log(varName + " added to GLV with length " + Rused);
    // Find and remove varName from undef_vars list
    var i = undef_vars.indexOf("varName");
    if (i != -1) {
      undef_vars.splice(i, 1);
    }
    undef_vars_next--;
  }

function addNewScalarVar(varName) {
  if (gsv_next > glv_next) {
    alert("Error: Out of variable space in addNewScalarVar");
   return R0;
  }
  global_scalar_variables[gsv_next] = varName;
  console.log("in resolve_var_refs: GSV pointer now is " + gsv_next);
  gsv_next++; // point to next empty space
  // Find and remove varName from undef_vars list
  var i = undef_vars.indexOf("varName");
  if (i != -1) {
    undef_vars.splice(i, 1);
  }
  undef_vars_next--;
  }
 
 Blockly.Assembly['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  console.log("in variables_get: name is " + varName);
  var varName_undef = 1;
  var in_GSV = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
  if (in_GSV >= 0) {
    varName_undef = 0;
    var code = 'push R' + in_GSV + '\npop R1\n';  
  } else if (varName in global_list_variables) { // is it in global_list_variables [head,Rused,skip]
      varName_undef = 0;
      var code = '';
      var headaddr = global_list_variables[varName][0];
      var llen = global_list_variables[varName][1];
      if (global_list_variables[varName][2] > 1) {
        return(lists_getIndex_nonMut(block));
      }
      else {
        var topOfList = headaddr + llen - 1;
        console.log("headaddr " + headaddr + " llen " + llen + " topOfList " + topOfList);
        for (var i = 0; i < llen; i++) { //push values on stack
          code += ' push R' +  (topOfList - i) + '\n';
        }
      }
    }
  if (varName_undef) {                                                // variable value has not been set yet
   console.log('in variables_get: ' + varName + ' is undefined');
    var code = varName  + ' UNDEFINED\n';
  }
  return [code, Blockly.Assembly.ORDER_ATOMIC];
}


Blockly.Assembly['variables_set'] = function(block) {
  // Variable setter
  var argument0 = Blockly.Assembly.valueToCode(block, 'VALUE', Blockly.Assembly.ORDER_NONE); // used to be ORDER_ASSIGNMENT
  if (!argument0) {
    // *****  input is null
    console.log('input is empty, skipping');
    var code = '';
    return code;
  }
  else {
    var targetBlock = block.getInputTargetBlock('VALUE');
    if (targetBlock) {
      var inputType = targetBlock.type;
      var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
      console.log("in variables_set: input is of type " + inputType + ", varName is " + varName + ", value is " + argument0);
      // console.log("in variables_set: GLV is " + JSON.stringify(global_list_variables));
      var found = global_scalar_variables.indexOf(varName);
      if (found >= 0) { // setting a scalar, value is in R1
        console.log("in variables_set, scalar variable " + varName + " defined at R" + found);
        var code =  argument0 +'Push R1\nPop R' + found + '\n';
        return code;
      }
      else if (varName in global_list_variables) { // setting a list, values and length are on the stack
        console.log("in variables_set (2): global_list_variables[varName] is " + global_list_variables[varName] + " global_list_variables[varName][0] is " + global_list_variables[varName][0]);
        found = global_list_variables[varName][0]; //headaddr
        var list_len = global_list_variables[varName][1];
        var pops = argument0 + 'Pop R' + found + '\n'; // don't need length, we already have it  pop it into R that holds length
        console.log("in variables_set, list variable " + varName + " defined at R" + found);
        for (var i = 1; i < list_len; i++) {
         pops = pops + 'Pop R' + (found + i) + '\n';
        }
        var code = pops;
        return code;
        }
        else {
        // ************* else if its a  non-color-picker list, where is input ??? *************
         console.log("in variables_set, " + varName + " not found"); 
          var code = varName  + ' UNDEFINED\n';
          return code;
        }
    }
  }
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
 
 // these are blocks that we know return a scalar variable
 
 function is_scalar (block) {
  var blocktype = block.type;
    console.log("in function is_scalar: block is " + block + ", blocktype = " + blocktype);
    var res = 0;
    switch (blocktype) {
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
        res = 1;
        break;
      case "variables_get":
        var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE) || '';
        console.log("checking for " + varName + " in GSV");
          var in_GSV = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
          console.log("index of " + varName + " is " + in_GSV);
          if (in_GSV >= 0) {res = 1;}
        break;
      default:
        res = 0;
        break;
    }
    return(res);
 }

 function is_list (block) { // returns [number of items, item_length]
  var blocktype = block.type;
    console.log("in function is_list blocktype = " + blocktype);
    var res = 0;
    switch (blocktype) {
      case "colour_picker":
        res = [3,1];
        break;
      case 'getmotiondata':
        res = [4,1];
        break;
      case "variables_get":
        var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        console.log("checking for " + varName + " in GLV");
        //if (varName in global_list_variables) { // is it in global_list_variables
        //  res = [(global_list_variables[varName][1] - 1),global_list_variables[varName][2]); // length of the list
        //}
        break; 
      case 'lists_create_n':
        var numItems = parseInt(block.getFieldValue('NUM_ITEMS'));
        if (numItems) {
          if (numItems == 0) {
            numItems = 1; // can't have a list of length 0, in future should alert user
          }
          else if (numItems > 127) {
            numItems = 127;
            } // 127 max
          res = [numItems,1];
          } else {
            console.log("error in is_list:lists_create_n");
          }
        break;
      case 'lists_create_with':
        var temp = lists_create_with_lengthOf(block);
        console.log("in is_list, number of items = " + temp[0] + ", item_length = " + temp[1] + " total_length = "+ temp[2]);
        res = [temp[0], temp[1]];
        break;
      case 'array': // general array treated as a list of list of length 1 scalar
        res = [block.itemCount_, 1];
        break;
      default:
        res = [0,0];
        break;
    }
    return(res);
 }
 
function lists_create_with_lengthOf (block) {
  // find the length of a list created with the block lists_create_with
  // lists can't mix types (scalar/list) and lists-of-lists must all be same length
  // returns [number of items, item_length, total_length]
  var itemNum1 = block.itemCount_;
  console.log("in lists_create_with_lengthOf, itemNum1 is " + itemNum1);
  var item_length = -1;
  var total_length = 0;
  var list_of_scalars = 0; // set to 1 if items are scalar
  var list_of_lists = 0; // set to 1 if item are lists
  var nth_item;
  for (var n = 0; n < itemNum1; n++) { // make sure all items are the same type and if lists that they are same length
      nth_item = block.getInputTargetBlock('ADD' + n);
      console.log("in lists_create_with_lengthOf: " + n + "th item is " + nth_item);
      if (!nth_item) {
        console.log(n + "th item is blank");
        continue;
      }
      else if (is_scalar(nth_item)) {
        if (list_of_lists ==1) {
          console.log = "ERROR: Can't mix types in list\n";
          return [total_length, item_length];
        }
        else {
        console.log(n + "th item is scalar");
        list_of_scalars = 1;
        }
      }
      else if (is_list(nth_item)) {
        if (list_of_scalars ==1) {
          console.log = "ERROR: Can't mix types in list\n";
          return [total_length, item_length];
        }
        else {
          if (item_length == -1) {
            var sublist_length = (is_list(nth_item))[0]; // first time, calcuate item_length
            var sublist_item_length = (is_list(nth_item))[1];
            item_length = sublist_length * sublist_item_length;
            console.log("in lists_create_with_lengthOf, " + n + "th item is list, item length is " + item_length);
          } else { // subsequent items, make sure items are same length
              var this_length = (is_list(nth_item))[0];
              var this_item_length = (is_list(nth_item))[1];
              if ((this_length * this_item_length) != item_length) {
                console.log = "ERROR: Can't mix lists of different lengths\n";
                return [total_length, item_length];
              }
            }  
            list_of_lists = 1;
        }
      } else { // not list or scalar???
        console.log("Can't tell length of lists_create_with in lists_create_with_lengthOf");
        return [total_length, item_length];
        }
      }
    item_length = Math.abs(item_length); // scalar and lists of (lists of length 1)
    total_length = itemNum1 * item_length;
    console.log("in lists_create_with_lengthOf, itemNum1 = " + itemNum1 + ", item_length =" + item_length + ", total_length = " + total_length);
    return [itemNum1, item_length, total_length];
}