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
 
 Blockly.Assembly['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  console.log("in variables_get: name is " + varName);
  var in_GSV = global_scalar_variables.indexOf(varName); // if in global_scalar_variables, put in R1
  if (in_GSV >= 0) {
    var code = 'push R' + in_GSV + '\npop R1\n';
    return [code, Blockly.Assembly.ORDER_ATOMIC];
  } else if (varName in global_list_variables) { // if in global_list_variables [head,Rused,desc], put on stack
      var code = '';
      var headaddr = global_list_variables[varName][0];
      var llen = global_list_variables[varName][1];
      var topOfList = headaddr + llen - 1;
        console.log("headaddr " + headaddr + " llen " + llen + " topOfList " + topOfList);
        for (var i = 0; i < llen; i++) { //push values on stack
          code += ' push R' +  (topOfList - i) + '\n';
        }
      return [code, Blockly.Assembly.ORDER_ATOMIC];
    }
    else {
  add_varname_to_undef_vars_list(varName);
  } 
}

Blockly.Assembly['variables_set'] = function(block) {
  // Variable setter
  
  // *** need to add code to ensure we are not trying to set a scalar to a list and V.V.

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
 
 

 /**
 * @fileoverview This code calculates the register space required to
 * store Blockly program variables in the Linkitz mocroprocessor
 * written by @author lyssa@linkitz.com (Lyssa Neel)
 */
 

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
  console.log("undef_vars_prev " + undef_vars_prev);
  var blocks = workspace.getAllBlocks();
  var i2 = 0; // index into undefined_vars
  console.log("In resolve var refs, reviewing " + blocks.length + " blocks");
  // Iterate through every procedure defreturn block.
    for (var i = 0; i < blocks.length; i++) {
      console.log("for loop i = " + i);
      var current_block = blocks[i];
      console.log("in loop1, current_block is (" + i + ") " + current_block);
  // ****************  looking for procedure definitions
      if (current_block.type == 'procedures_defreturn') { //********** returns scalar or list?
        var procName = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);              
        console.log("procName: " + procName);
        if (procName in proc_types) { // already figured out return type
          continue; // move to next block
        } else
        {
          var returnBlock = current_block.getInputTargetBlock('RETURN');
          if (returnBlock) {
            var ldata; // placeholder for list data if it is a list
            var returnBlockType = current_block.getInputTargetBlock('RETURN').type;
            console.log("in loop1 getting proc_return_type of " + procName);
            console.log('returnBlock is ' + returnBlock + ", returnBlockType is " + returnBlockType);
              if (is_scalar(returnBlock)) {
                console.log('in loop1 returnBlock is scalar');
                proc_types[procName] = [0,0];
                console.log(procName +" returns a scalar");
                if (procName in proc_types) {
                  console.log("added " + procName + " proc_types: " + JSON.stringify(proc_types));
                  }
                  else {
                    console.log("didn't add " + procName);
                  }
                // Find and remove procName from undef_vars list
                console.log("deleting " + procName + " from unknown_lists " + JSON.stringify(unknown_lists));
                delete unknown_lists[procName];
                console.log("unknown_lists now  " + JSON.stringify(unknown_lists));
                // Find and remove procName from undef_vars list
                console.log("deleting " + procName + " from undef_vars "+ undef_vars);
                del_varname_from_undef_vars_list(procName);
                console.log("undef_vars now " + undef_vars);
                } // end if (is_scalar(returnBlock))
                else if (ldata = get_list_desc(returnBlock,[], -1)) {  // ldata is being assigned the value of get_list_desc; not a typo!
                  console.log('in loop1 returnBlock is a list, ldata is ' + ldata); 
                  if (ldata[0] == 1) {   // we are getting back a fully specified list
                    console.log('returnBlock is list');
                    proc_types[procName] = ldata;  // 1=returns a list, with list desc
                    console.log(procName + " returns a list  " + ldata[1]); // 
                    if (procName in proc_types) {
                      console.log("added " + procName);
                        } else {
                          console.log("didn't add " + procName);
                          }
                    // Find and remove procName from undef_vars list
                      del_varname_from_undef_vars_list(procName);
                      delete unknown_lists[varName];
                  } else {
                      console.log("still working on " + procName);
                      add_varname_to_undef_vars_list(procName);
                      }
                  }
                   else {
                    console.log("in loop1 unknown if returnBlock is scalar or list");
                    // add procName to undef_vars list
                    add_varname_to_undef_vars_list(procName);
                   }
          } // end if (returnBlock)
      } // end else
    } // end if (blocks[i].type == 'procedures_defreturn')
      
//****************************** VARIABLES_SET
             
      else if (current_block.type == 'variables_set') { //********** set to scalar or list?
          var varName = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
          console.log("in loop2 trying to variables_set " + varName);
          var targetBlock = current_block.getInputTargetBlock('VALUE');
          if (targetBlock) {
            var inputType = targetBlock.type;
            console.log("in resolve_var_refs:\nTarget Block is " + targetBlock  + ", which is of type " + inputType);
          }
          if (global_scalar_variables.indexOf(varName) >=0) { // have to make sure it is being set to a scalar again
            console.log("in loop2 found scalar in GSV");
            var check = get_list_desc(current_block.getInputTargetBlock('VALUE'),[]);
            console.log(check);
            if ((check[0] == 1) && (check[1].length > 0)) {
                console.log("in loop2 variables_set, scalar var being reassigned to list");
                throw 'scalar var reassigned to list';
              }
            continue;
            } else if (varName in global_list_variables) { 
              console.log("in loop2 found list in GLV");
              if (is_scalar(current_block.getInputTargetBlock('VALUE'))) {
                console.log("in loop2 variables_set, list var being reassigned to scalar");
                throw 'list var reassigned to scalar';
              }
              continue;
            } else { // NEW VARIABLE, add it to the correct variables list
              console.log("in loop2 new var " + varName);
              var targetBlock = current_block.getInputTargetBlock('VALUE');
              console.log("in loop2 targetBlock " + targetBlock);
              if (targetBlock) {
              var inputType = targetBlock.type;
              console.log("in resolve_var_refs:\nTarget Block is " + targetBlock + "\nvarName is " + varName + ", which is being assigned input of type " + inputType);
              
                if (is_scalar(targetBlock)) {
                  //case "math_number": 
                  //case "math_arithmetic":
                  //case "math_magnitudee":
                  //case "math_binary":
                  //case "math_random_int":
                  //case "led_attached":
                  //case "usb_attached":
                  //case "motion_attached":
                  //case "logic_compare":
                  //case "logic_operation":
                  //case "lists_length":
                  //case "math_on_list":
                  //case "getbatterylevel":
                  //case "getambientlight":
                    console.log("in loop2 found scalar by case");
                    addNewScalarVar(varName);
                }
                  // ********* LISTS *********
                  else {
                    switch (inputType) {
                  // ********* "EASY" LISTS where LIST LENGTH is known and list can be added immediately *********

                    case 'colour_picker':
                    case 'getmotiondata':
                      console.log("in loop2 found list by case colour_picker");
                      addNewListVar(varName,3,[3]); // color always a list of length 3 of scalars, getmotiondata returns LNK, a list of 3 scalars
                      blockid_return_value_desc[targetBlock.id] = [3];
                      break;
                    
                    // ********* "HARD" LISTS *********
                    
                    case 'lists_create_n': // ************* a list of n scalars OR lists **********
                      // this just adds varName to unknown vars list and unknown_lists because space req is not fully specified
                      console.log("in loop2 found list by case lists_create_n");
                      var numItems = parseInt(targetBlock.getFieldValue('NUM_ITEMS'));
                      add_listvar_to_unknown_lists(varName, [numItems]); // add list var to unknown_lists
                      add_varname_to_undef_vars_list(varName);
                      break;
                    
                    case 'lists_create_with': // ************* COULD BE scalars OR lists **********
                      console.log("in loop2 found list by case lists_create_with");
                      var temp = get_list_desc(targetBlock, [], -1); // returns -1/0/1 sublist_desc
                      console.log("in resolve_var_refs, case lists_create_with " + targetBlock + " returns = " + temp);
                      if (temp[0] ==1) { // fully specified
                        addNewListVar(varName, list_length_from_sublist_desc(temp[1]), temp[1]);
                        blockid_to_list_desc(targetBlock, temp[1]);
                        
                      }
                      else
                      {
                        add_listvar_to_unknown_lists(varName, temp[1]); // add list var to unknown_lists
                        add_varname_to_undef_vars_list(varName);
                      }
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
                        } else if (RHSvar in global_list_variables) { //RHSvar is defined as a list
                          console.log("in loop2 found list RHS");
                          addNewListVar(varName, (global_list_variables[RHSvar][1] - 1), global_list_variables[RHSvar][2]);
                          blockid_to_list_desc(targetBlock,global_list_variables[RHSvar][2]);
                        } else
                        { // varName is not defined yet
                          add_varname_to_undef_vars_list(varName);  
                        }
                      break;
                    
                    case "lists_getIndex_nonMut": // variable is assigned to a list item, could be scalar or list
                      // we have the var_name, need the list name
                      console.log("in lists_getIndex_nonMut, targetBlock is " + targetBlock);
                      var list_name2 = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
                      console.log("list_name2 = " + list_name2);
                      if (global_scalar_variables.indexOf(list_name2) >=0) { //if trying to assign to a known scalar
                        console.log("trying to select index of a scalar!");
                        console.log("error2 in resolve var refs");
                        return 0;
                      }
                      else if (list_name2 in global_list_variables) { // if assigning to a known list, get list_desc
                              var list_name2_desc = global_list_variables[list_name2][2];
                              if (list_name2_desc.length > 1) { // if descr length is > 1 its a list of lists, get the sublist
                              var temp = global_list_variables[list_name2][2].slice(); // make a copy of list_desc
                              temp.shift(); // remove first item; temp now describes the structure of each list item
                              var list_elt_size = list_length_from_sublist_desc(temp);
                              addNewListVar(varName, list_elt_size, temp);
                              blockid_to_list_desc(targetBlock, temp);
                          } 
                          else { // if desc length is 0 or 1 it is a scalar
                            addNewScalarVar(varName);
                          }
                      }
                      else { // we don't know what this is, put on unknown vars list
                        // varName is not defined yet
                          add_varname_to_undef_vars_list(varName);
                      }
                    break;
                  
                    case 'procedures_callreturn': // variable is assigned to the return val of a function
                      console.log("in case procedures_callreturn, current_block = " + current_block + " trying to find scalar/list of " + varName + " where targetBlock = " + targetBlock + " inputType = " + inputType);
                      // var funcName0 = targetBlock.getFieldValue('NAME');
                      var funcName = Blockly.Assembly.variableDB_.getName(targetBlock.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
                      // console.log("funcName: " + funcName + ", before getName called, was: "+ funcName0);
                      console.log("funcName: " + funcName);
                      if (funcName in proc_types) { // already found and it is known scalar or fully spec'd list
                        console.log("found procedure " + funcName +  " in proc_types");
                          if (proc_types[funcName][0] == 0) {
                            addNewScalarVar(varName);
                            break;
                            }
                            else if (proc_types[funcName][0] == 1) { 
                              console.log("procedure returns a list in resolve_variable_refs");
                              addNewListVar(varName, list_length_from_sublist_desc(proc_types[funcName][1]), proc_types[funcName][1]); //varName,num_items,desc
                              blockid_to_list_desc(targetBlock,proc_types[funcName][1]);
                            break;
                            }
                        } else
                        {  // we don't know return type of proc
                          add_varname_to_undef_vars_list(varName);  
                        }
                        break;
                    default:
                      console.log("reached switch default");
                      alert("unknown variable type for variables_set in resolve_variable_refs");
                      return 0;
                  } // end switch
                } // end if variable set is not scalar
              } // end if (targetBlock)
            } // end else { // new variable, add it to the correct variables list
            continue;
        } // end if (blocks[i].type == 'variables_set')
        else
        
  //****************************** LISTS_SET_INDEX
        
        if (current_block.type == 'lists_setIndex_nonMut') { // this can be used to help fully specify a list
          var list_name = Blockly.Assembly.variableDB_.getName(current_block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
          console.log("in lists_setIndex_nonMut, list name is " + list_name);
          if (list_name in unknown_lists) { // if we have seen this list variable before, get its info
            var list_desc = unknown_lists[list_name];
          } else
          if (list_name in global_list_variables) {
            // list is already fully specified = no problem just move to next block,
            continue; //just go on to next block
          } else
          { // or we are trying to set an element of a list we haven't seen the creation of yet, can't do that
            continue; //just go on to next block 
          }
          console.log("list is known unknown with");
          var set_to_value = current_block.getInputTargetBlock('TO'); // why is it not getting this block
          if (set_to_value) {
              var set_to_value_type = set_to_value.type;
              console.log(set_to_value + " " + set_to_value_type );
          } else
          { // block was called with no input, just skip it
              continue;
          }
          if (is_scalar(set_to_value)) {             
            // we're at the end of a nested list --> can't be any more nesting!
            console.log("scalar");
            addNewListVar(list_name, list_length_from_sublist_desc(list_desc), list_desc);
            blockid_to_list_desc(targetBlock,  list_desc);
            }  // end if (is_scalar(set_to_value_type))
          else {                                              // we're adding an unknown or a List to a list
            // There is a sublist_desc here in the form [a1, a2, ..., an] and we are adding MORE list info to it      
              console.log("another list");
              switch (set_to_value_type) {
              // ********* "EASY" value types where LIST is a known list of scalars, we're done *********
                case 'colour_picker':
                  console.log("in loop4 lists_setIndex_nonMut - found list by case colour_picker");
                  list_desc.push(3); // color always a list of length 3 of scalars --> done!
                  var total_len = list_length_from_sublist_desc(list_desc);
                  addNewListVar(list_name,total_len,list_desc);
                  blockid_to_list_desc(targetBlock, list_desc);
                  break;
              
                case 'getmotiondata':
                  console.log("in loop4 lists_setIndex_nonMut - found list by case colour_picker");
                  list_desc.push(4); // motion always a list of length 4 of scalars --> done!
                  var total_len = list_length_from_sublist_desc(list_desc);
                  addNewListVar(list_name,total_len,list_desc);
                  blockid_to_list_desc(targetBlock,  list_desc);
                  break;
                  
                // ********* "HARD" LISTS *********
                
                case 'lists_create_n': // list item is being assigned to another list of length n, no other info **********
                  console.log("in loop4 lists_setIndex_nonMut - found list by case lists_create_n");
                  var numItems = parseInt(set_to_value.getFieldValue('NUM_ITEMS'));
                  list_desc.push(numItems); // add another value onto list_desc
                  unknown_lists[list_name] = list_desc;
                  break;
              
                case 'lists_create_with': // list item is being assigned to another list, scalars OR lists **********
                  console.log("in loop4 lists_setIndex_nonMut - found list by case lists_create_with");
                  var temp = get_list_desc(set_to_value,[]); // returns [-1/0/1, desc]
                  console.log("get_lists_desc of lists_create_with returns " + temp);
                  if (temp[0] == 1) { // list fully spec'd, we're done
                    var first_elt = list_desc.shift(); // get first element
                    temp[1].splice(0,0,first_elt);
                    var total_len = list_length_from_sublist_desc(temp[1]);
                    addNewListVar(list_name,total_len,temp[1]);
                    blockid_to_list_desc(targetBlock, temp[1]);
                  } else
                  { // there's more work to do, save what we have learned (if anything - result might be *less* info)
                    if (temp[1].length > (list_desc.length -1)) { // list_desc here is only partial, 2nd element of list_desc could be filled out
                      var first_elt = list_desc.shift(); // get first element
                      temp[1].splice(0,0,first_elt);
                      console.log("splice2 yields " + temp[1]);
                    unknown_lists[list_name] = temp[1];
                    }
                  }
                  break;
                              
              // ********* OTHER *********
              
                case 'variables_get': // list item is being assigned to a variable
                  console.log("in loop4, case is variables_get");
                    // get RHS variable name
                    // check if RHS is already defined -- if so, we know the type of variable
                    var RHSvar = set_to_value.getFieldValue('VAR');
                    console.log("RHS variable is " + RHSvar);
                    if (global_scalar_variables.indexOf(RHSvar) >= 0) { // scalar variable --> done!
                      console.log("in loop4 lists_setIndex_nonMut - found scalar RHS");
                      addNewListVar(list_name, list_length_from_sublist_desc(list_desc), list_desc);
                      blockid_to_list_desc(targetBlock,  list_desc);
                    } else if (RHSvar in global_list_variables) { //RHSvar is defined as a fully-defined list --> done!
                      console.log("in loop4 lists_setIndex_nonMut - found list RHS");
                      list_desc = list_desc.concat(next_sublist);
                      addNewListVar(list_name, list_length_from_sublist_desc(list_desc), list_desc);
                      blockid_to_list_desc(targetBlock, list_desc);
                    } // else there is no info yet
                  break;
                
                case "lists_getIndex_nonMut": // list item is assigned to another list item, which could be scalar or list
                  // we have the var_name, need the list name
                  console.log("in lists_getIndex_nonMut, set_to_value is " + set_to_value);
                  var list_name3 = Blockly.Assembly.variableDB_.getName(set_to_value.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
                  console.log("list_name3 = " + list_name3);
                  if (global_scalar_variables.indexOf(list_name3) >=0) {
                    console.log("trying to select index of a scalar!");
                    console.log("error4 in resolve var refs");
                    return 0;
                  } else
                    if (list_name3 in global_list_variables) { // it is a fully-defined list
                      list_desc = list_desc.concat(global_list_variables[list_name3][1]); // add the descr of an element
                      addNewListVar(varName,list_length_from_sublist_desc(list_desc),list_desc);
                      blockid_to_list_desc(targetBlock,  list_desc);
                    } 
                      // else there is no info yet
                break;
                case 'procedures_callreturn': // list item is assigned to the return val of a function
                  console.log("in case procedures_callreturn, current_block = " + current_block + " trying to find scalar/list of " + varName + " where targetBlock = " + targetBlock + " set_to_value_type = " + set_to_value_type);
                  // var funcName0 = targetBlock.getFieldValue('NAME');
                  var funcName = Blockly.Assembly.variableDB_.getName(set_to_value.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
                  // console.log("funcName: " + funcName + ", before getName called, was: "+ funcName0);
                  console.log("funcName: " + funcName);
                  if (funcName in proc_types) { // already found
                    console.log("found procedure " + funcName +  " in proc_types");
                      if (proc_types[funcName][0] == 0) {     // list item is assigned to a scalar
                          addNewListVar(varName,list_length_from_sublist_desc(list_desc),list_desc);
                          blockid_to_list_desc(targetBlock, list_desc);
                        break;
                        }
                      else if (proc_types[funcName][0] == 1) {  // list item is assigned to another list, we get list_desc?
                        console.log("procedure returns a list in resolve_variable_refs 2");
                        list_desc = list_desc.concat(proc_types[funcName][1]);
                        addNewListVar(varName, proc_types[funcName][0], proc_types[funcName][1]); //varName,num_items,desc
                        blockid_to_list_desc(targetBlock, list_desc);
                      }
                      // else we don't know return type of proc, can't do aything
                  }
                  break; 
                default:
                  console.log("reached switch default");
                  alert("unknown variable type for lists_setIndex_nonMut in resolve_variable_refs");
                  return 0;
                break;
              } // end switch
          } // end we're adding List to a list
        } //if (current_block.type == 'lists_setIndex_nonMut')
      else {
        console.log("not procedure_defreturn or variables_set or lists_setIndex_nonMut");
        continue;
      }
    } // end for
    console.log("undef_vars.length = " + undef_vars.length); // maybe also have to check unknown_lists.length = 0???
    if (undef_vars.length == 0) {
      // we win!
      return 1;
    } else if (sim_arrays(undef_vars, undef_vars_prev)) {
      // bad news, we have a loop situation
      console.log("can't resolve variable references");
      throw 'can\'t resolve variable references';
    } else {
      // go through all variables_set blocks again to try to resolve more references.
      // run the procedure thing
      console.log("try again");
      resolve_var_refs(workspace, undef_vars);
      }
 }
 
 // addNewListVar allocates register space for a new list value
 // num_items is number of items in a list, desc is a descruption of the list structure
 // e.g. A scalar uses one register, a color uses 3 registers because it has 3 scalars. 
 // # of registers used to store list is (total_len + 1) : need extra 1 because we store the length in headaddr
 // returns a list [head_addr, register_used, sublist_desc]
 // sublist_desc is simply [n] if the items are scalar
 // otherwise it's a list containing the item length of the sublists.
 // depth of sublist nesting = length of sublist_desc list
 // this will only be called when the list is fully specified
 
 function addNewListVar(varName,num_items,desc) {
  console.log("In addNewListVar" + JSON.stringify(desc));
  if (!desc || (desc=='[]')) {
    console.log("No list data...ignoring");
  } else
  if ((desc.length == 1) || ((desc.length ==2) && (desc[1]==1))) { // adding a list of scalars/list of 1 scalar elts
      var head = (glv_next - num_items); //point to where we want to insert
      var Rused = (num_items + 1);
      console.log("num_items = "+num_items+", desc = " +desc+", Rused = " +Rused+ ", head = "+head);
  } else
  if ((typeof desc) == "object"){ // adding a list of lists, possibly nested
    var total_sublist_len = list_length_from_sublist_desc(desc);
    var head = (glv_next - total_sublist_len); //point to where we want to insert
    var Rused = (total_sublist_len + 1);
  }
  else {
    console.log("unknown desc type in addNewListVar");
    throw 'unknown desc type in addNewListVar';
  }
  if (head < gsv_next) {
    throw 'out of register space in addNewListVar';
  }
    global_list_variables[varName]=[head,Rused,desc];
    glv_next = head - 1; // move pointer to next empty space down
    console.log("head = "+head+ " glv_next = "+glv_next);
    console.log(varName + " added to GLV with length " + Rused);
    // ****** clean up ******
    // remove var_name from unknown_lists (if it was there)
    console.log("deleting " + varName + " from unknown_lists " + JSON.stringify(unknown_lists));
    delete unknown_lists[varName];
    console.log("unknown_lists now  " + JSON.stringify(unknown_lists));
    // Find and remove varName from undef_vars list
    console.log("deleting " + varName + " from undef_vars "+ undef_vars);
    del_varname_from_undef_vars_list(varName);
    console.log("undef_vars now " + undef_vars);
  }

// addNewScalarVar allocates register space for a new scalar value

function addNewScalarVar(varName) {
  if (gsv_next > glv_next) {
    throw 'out of register space in addNewScalarVar';
  }
  global_scalar_variables[gsv_next] = varName;
  console.log("in resolve_var_refs: GSV pointer now is " + gsv_next);
  gsv_next++; // point to next empty space
  // ****** clean up ******
  // Find and remove varName from undef_vars list
  del_varname_from_undef_vars_list(varName);
  console.log("undef_vars now " + undef_vars);
  delete unknown_lists[varName];
  console.log("unknown_lists now  " + JSON.stringify(unknown_lists));
    
  }
  
  // these are blocks that we know return a scalar variable
 
 function is_scalar (block) {
  if ((block.id in blockid_return_value_desc) && (blockid_return_value_desc[block.id].length == 0)) {
    return 1;
  } else
  {
  var blocktype = block.type;
    console.log("in function is_scalar: block is " + block + ", blocktype = " + blocktype);
    var res = 0;
    switch (blocktype) {
      case "math_number": // falls through to next
      case "math_arithmetic":
      case "math_magnitude":
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
        res = 1;
        blockid_return_value_desc[block.id] = [];
        break;
      case "variables_get":
        var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE) || '';
        console.log("checking for " + varName + " in GSV");
          var in_GSV = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
          console.log("index of " + varName + " is " + in_GSV);
          if (in_GSV >= 0) {
            res = 1;
            blockid_return_value_desc[block.id] = [];
            }
        break;
      case "procedures_callreturn":
        var funcName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
        if ((funcName in proc_types) && (proc_types[funcName][0] == 0)) { // already found
          res = 1;
          blockid_return_value_desc[block.id] = [];
        }
        break;
      default:
        res = 0;
        break;
    }
    return(res);
  }
 }

 function get_list_desc (block, desc) { // returns [-1/0/1, sublist_desc]
  // -1 if structure is not completely determined, 0 if it is a scalar, 1 if it is completely described list 
  // initially called with desc = []
  if (block.id in blockid_return_value_desc) {
    console.log("in get_list_desc, found " + block + " with desc " + blockid_return_value_desc[block.id]);
    full_spec = 1;
    return [1, desc.concat(blockid_return_value_desc[block.id])];
  } else {
  var blocktype = block.type;
  var full_spec = -1;
    console.log(">>>>  entering function get_list_desc blocktype = " + blocktype + " called with desc = " + desc);
    var res = desc;
    if (is_scalar(block)) { // this is to stop the recursive call
      full_spec = 1;
      blockid_return_value_desc[block.id] = [];
      return [1,res];
    } else 
    {
      console.log(">>>> in get_list_desc switch");
      switch (blocktype) {
       case "colour_picker":
       case 'getmotiondata':
         res.push(3); //[3]
         full_spec = 1;
         blockid_return_value_desc[block.id] = [3];
         return [full_spec,res];
         break;
       
       case "variables_get": // could be a scalar or a list
         var varName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
         var in_GSV = global_scalar_variables.indexOf(varName); // is it in global_scalar_variables
           if (in_GSV >= 0) {
             console.log(varName + " is in GSV");
             full_spec = 1;
             blockid_return_value_desc[block.id] = [];
             return [full_spec, res];
             }
           else if (varName in global_list_variables)
           { // is it in global_list_variables
             console.log(varName + " is in GLV");
             res = res.concat(global_list_variables[varName][2]); //  sublist_desc
             full_spec = 1;
             blockid_to_list_desc(block, global_list_variables[varName][2]);
             return [full_spec,res];
           }
           else
           { // if not in GSV or GLV we don't have final info, add it unknown_lists
           add_listvar_to_unknown_lists(varName, res);   
           return [full_spec,res];
           }
         break;
       case "procedures_callreturn":
         var funcName = Blockly.Assembly.variableDB_.getName(block.getFieldValue('NAME'),Blockly.Procedures.NAME_TYPE);
         if (funcName in proc_types) { // we have seen this procedure already
           if (proc_types[funcName][0] == 1) { // procedure retuns a fully spec'd list
             res = res.concat(proc_types[funcName][1]); //  sublist_desc
             full_spec = 1;
             blockid_to_list_desc(block,proc_types[funcName][1]);
             return [full_spec,res];
           }
           else if (proc_types[funcName][0] == 0) { // procedure retuns a scalar
             full_spec = 1;
             blockid_return_value_desc[block.id] = [];
             return [full_spec,res];
           }
         }
           else
           { // if not in proclist or if proclist is -1, we don't have final info, add it unknown_lists
             return [full_spec,res];
           }
         break;
       case 'lists_create_n': // this is a case where we can't go further to determine structure
       // UNLESS ITS IN blockid_to_list_desc
             var numItems = parseInt(block.getFieldValue('NUM_ITEMS'));
             if (numItems == 0) {
               numItems = 1; // can't have a list of length 0, in future should use number field with limits
             }
             else if (numItems > 127) {
               numItems = 127;
               } // 127 max
             res.push(numItems); 
             return [full_spec,res];
         break;
       case 'lists_create_with':
         var itemNum1 = block.itemCount_;
         console.log(itemNum1);
         res.push(itemNum1);
         console.log(">>>>> Current return value from get_list_descr: lists_create_with is " + res);
         var nth_item;
         for (var n = 0; n < itemNum1; n++) {
           nth_item = block.getInputTargetBlock('ADD' + n);
             console.log("in get_list_desc: " + n + "th item is " + nth_item);
             if (!nth_item) { // nth item is blank);
               continue;
             }
             else if (is_scalar(nth_item)) {
               full_spec = 1;
               blockid_to_list_desc(block, res);
               return [full_spec,res];
               break;
             }
             else {
               return(get_list_desc(nth_item, res)); 
             }
         }
         break;
       case 'array': // general array treated as a list of list of length 1 scalar
         res.push(block.itemCount_);
         full_spec = 1;
         blockid_return_value_desc[block.id] = [itemCount_];
         return [full_spec,res];
         break;
       default:
         return [full_spec, res];
         break;
     } // end switch(blocktype)
   } // end else
  console.log(" >>>>>> full_spec =  " + full_spec + ", res = " + res);
  return [full_spec, res];
  } // end if found blockid_return_value_desc[block.id]
 } // end function get_list_desc
 
 
function sim_arrays(a,b){ // returns TRUE if arrays contain the same elements, indifferent to order, assume no dup elt.
  console.log("undef_vars " + a + ", undef_vars_prev " + b);
  var i;
  if (a.length !== b.length) {
    return false;
  }
  for(i=0; i<a.length; i++){
    if (b.indexOf(a[i]) < 0) {
      return false;
    }
  }
  for(i=0; i<b.length; i++){
    if (a.indexOf(b[i]) < 0) {
      return false;
    }
  }
return true;
}

function add_listvar_to_unknown_lists(varName, desc) {
  console.log("in add_listvar_to_unknown_lists varName " + varName + " desc " + desc + " length " + desc.length);
  console.log("unknown_lists = " + JSON.stringify(unknown_lists));
  if (varName in unknown_lists) { // already there, only add if new info
    var list_desc = unknown_lists[varName];
    console.log("Found " + varName + " in unknown_lists with value" + list_desc + " length " + list_desc.length);
    if (desc.length > list_desc.length) {
      console.log("adding " + desc);
      list_desc = desc;
      unknown_lists[varName] = list_desc;
    }
  }
    else
    {
      console.log("adding " + varName + " " + desc);
      unknown_lists[varName] = desc;
      console.log("unknown_lists now = " + JSON.stringify(unknown_lists));
    }
}

function list_length_from_sublist_desc(desc) {
  console.log("in list_length_from_sublist_desc desc = " +JSON.stringify(desc)+ " desc.length = " + desc.length);
  var total_len = 1;
      for (var k = 0; k < desc.length; k++) {
          total_len *= desc[k];
      }
  console.log("in list_length_from_sublist_desc total length = " + total_len);    
  return total_len;
}

function add_varname_to_undef_vars_list(varName) {
  var i3 = undef_vars.indexOf(varName);
  if (i3 == -1) { // if its not already in undef vars list 
    undef_vars.push(varName); // add to undef variables list  
    }
}

function del_varname_from_undef_vars_list(varName) {
  var i4 = undef_vars.indexOf(varName);
    console.log
    if (i4 != -1) {
      undef_vars.splice(i4, 1);
    }
}


// *** might be some useful error-checking code in the following that should be incorporated in get_list_desc etc 
 
//function lists_create_with_lengthOf (block) {
//  // find the length of a list created with the block lists_create_with
//  // took out check for all items same length & same type, assume first item is type
//  // returns sublist_desc
//  var itemNum1 = block.itemCount_;
//  console.log("in lists_create_with_lengthOf, itemNum1 is " + itemNum1);
//  var sublist_desc = []; // this is the return value
//  var item_length = -1;
//  var total_length = 0;
//  var list_of_scalars = 0; // set to 1 if items are scalar
//  var list_of_lists = 0; // set to 1 if item are lists
//  var nth_item;
//  for (var n = 0; n < itemNum1; n++) { // make sure all items are the same type and if lists that they are same length
//      nth_item = block.getInputTargetBlock('ADD' + n);
//      console.log("in lists_create_with_lengthOf: " + n + "th item is " + nth_item);
//      if (!nth_item) {
//        console.log(n + "th item is blank");
//        continue;
//      }
//      else if (is_scalar(nth_item)) {
//        sublist_desc = sublist_desc.push(nth_item);
//        return(sublist_desc);
//      }
//      else if (nth_item.type) {
//        sublist_desc = sublist_desc.push(nth_item);
//        return(sublist_desc);
//      }
//      else if (ldata = get_list_desc(nth_item)) {  // ldata holds a sublist_desc or null
//          if (item_length == -1) {
//            var sublist_length = (get_list_desc(nth_item))[0]; // first time, calcuate item_length
//            var sublist_item_length = (get_list_desc(nth_item))[1];
//            item_length = sublist_length * sublist_item_length;
//            console.log("in lists_create_with_lengthOf, " + n + "th item is list, item length is " + item_length);
//          } else { // subsequent items, make sure items are same length
//              var this_length = (get_list_desc(nth_item))[0];
//              var this_item_length = (get_list_desc(nth_item))[1];
//              if ((this_length * this_item_length) != item_length) {
//                console.log = "ERROR: Can't mix lists of different lengths\n";
//                return [total_length, item_length];
//              }
//            }  
//            list_of_lists = 1;
//        }
//      } 
//    item_length = Math.abs(item_length); // scalar and lists of (lists of length 1)
//    total_length = itemNum1 * item_length;
//    console.log("in lists_create_with_lengthOf, itemNum1 = " + itemNum1 + ", item_length =" + item_length + ", total_length = " + total_length);
//    return [itemNum1, item_length, total_length];
//}

//function lists_create_with_lengthOf (block) {
//  // find the length of a list created with the block lists_create_with
//  // lists can't mix types (scalar/list) and lists-of-lists must all be same length
//  // OLD: returns [number of items, item_length, total_length]
//  // NEW: returns sublist_desc
//  var itemNum1 = block.itemCount_;
//  console.log("in lists_create_with_lengthOf, itemNum1 is " + itemNum1);
//  var item_length = -1;
//  var total_length = 0;
//  var list_of_scalars = 0; // set to 1 if items are scalar
//  var list_of_lists = 0; // set to 1 if item are lists
//  var nth_item;
//  for (var n = 0; n < itemNum1; n++) { // make sure all items are the same type and if lists that they are same length
//      nth_item = block.getInputTargetBlock('ADD' + n);
//      console.log("in lists_create_with_lengthOf: " + n + "th item is " + nth_item);
//      if (!nth_item) {
//        console.log(n + "th item is blank");
//        continue;
//      }
//      else if (is_scalar(nth_item)) {
//        if (list_of_lists ==1) {
//          console.log = "ERROR: Can't mix types in list\n";
//          return [total_length, item_length];
//        }
//        else {
//        console.log(n + "th item is scalar");
//        list_of_scalars = 1;
//        }
//      }
//      else if (get_list_desc(nth_item)) {
//        if (list_of_scalars ==1) {
//          console.log = "ERROR: Can't mix types in list\n";
//          return [total_length, item_length];
//        }
//        else {
//          if (item_length == -1) {
//            var sublist_length = (get_list_desc(nth_item))[0]; // first time, calcuate item_length
//            var sublist_item_length = (get_list_desc(nth_item))[1];
//            item_length = sublist_length * sublist_item_length;
//            console.log("in lists_create_with_lengthOf, " + n + "th item is list, item length is " + item_length);
//          } else { // subsequent items, make sure items are same length
//              var this_length = (get_list_desc(nth_item))[0];
//              var this_item_length = (get_list_desc(nth_item))[1];
//              if ((this_length * this_item_length) != item_length) {
//                console.log = "ERROR: Can't mix lists of different lengths\n";
//                return [total_length, item_length];
//              }
//            }  
//            list_of_lists = 1;
//        }
//      } else { // not list or scalar or blank - impossible!
//        console.log("Can't tell length of lists_create_with in lists_create_with_lengthOf");
//        return [total_length, item_length];
//        }
//      }
//    item_length = Math.abs(item_length); // scalar and lists of (lists of length 1)
//    total_length = itemNum1 * item_length;
//    console.log("in lists_create_with_lengthOf, itemNum1 = " + itemNum1 + ", item_length =" + item_length + ", total_length = " + total_length);
//    return [itemNum1, item_length, total_length];
//}

//function lists_create_n_lengthOf (block) {
//  // find the length of a list created with the block lists_create_n
//  // lists can't mix types (scalar/list) and lists-of-lists must all be same length
//  // returns [total_length, sublist_desc]
//  var numItems = parseInt(block.getFieldValue('NUM_ITEMS'));
//  console.log("in lists_create_with_lengthOf, numItems is " + numItems);
//  unknown_lists[varName]=[numItems]; // add list var to unknown_lists
//  var i2 = undef_vars.indexOf("varName"); // Also add to undef variables list
//  if (i2 == -1) { // if its not already in undef vars list 
//    undef_vars[undef_vars_next] = varName; 
//    undef_vars_next++;  
//  }
//}

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
 
function blockid_to_list_desc(block, desc) {
 blockid_return_value_desc[block.id] = desc;
 console.log("blockid_return_value_desc = " + JSON.stringify(blockid_return_value_desc));
 propagate_structure(block, desc);
}
 
 // propagate_structure shares info about a list's structure with its sublists
// called when list structure is fully defined

function propagate_structure(block, desc){
   var subl_desc = desc.slice(); // make a copy
   var itemNum1 = subl_desc.shift(); // remove first element which is descr of parent block
   console.log("in propagate_structure, block is " + block + ", itemNum1 is " + itemNum1 + ",subl_desc = " + subl_desc);
   if (subl_desc.length > 0) {
    for (var m = 0; m <  itemNum1; m++) { // for each element in block
       console.log("in propagate_structure, on list element #" + m);
       var targetBlock = block.getInputTargetBlock('ADD' + m);
       if (targetBlock) {
         console.log("in propagate_structure, targetBlock = " + targetBlock);
         blockid_to_list_desc(targetBlock, subl_desc);
         propagate_structure(targetBlock, subl_desc);
       }
    }
  }
}