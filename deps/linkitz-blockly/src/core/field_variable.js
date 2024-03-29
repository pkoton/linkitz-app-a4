/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Variable input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Variables');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(varname, opt_validator) {
  Blockly.FieldVariable.superClass_.constructor.call(this,
      Blockly.FieldVariable.dropdownCreate, opt_validator);
  this.setValue(varname || '');
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Sets a new change handler for angle field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldVariable.prototype.setValidator = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the variable rename handler.
    wrappedHandler = function(value) {
      var v1 = handler.call(this, value);
      if (v1 === null) {
        var v2 = v1;
      } else {
        if (v1 === undefined) {
          v1 = value;
        }
        var v2 = Blockly.FieldVariable.dropdownChange.call(this, v1);
        if (v2 === undefined) {
          v2 = v1;
        }
      }
      return v2 === value ? undefined : v2;
    };
  } else {
    wrappedHandler = Blockly.FieldVariable.dropdownChange;
  }
  Blockly.FieldVariable.superClass_.setValidator.call(this, wrappedHandler);
};

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldVariable.prototype.init = function(block) {
  //if (this.sourceBlock_) {
  //  // Dropdown has already been initialized once.
  //  return;
  //}
  Blockly.FieldVariable.superClass_.init.call(this, block);
  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        block.isInFlyout ? block.workspace.targetWorkspace : block.workspace;
    this.setValue(Blockly.Variables.generateUniqueName(workspace));
  }
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the variable name.
 * @param {string} newValue New text.
 */
Blockly.FieldVariable.prototype.setValue = function(newValue) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  this.setText(newValue);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
    var variableList;
    var hideList = [];
    var j;
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    variableList =  Blockly.Variables.allVariables(this.sourceBlock_.workspace);
    // console.log("in sourceBlock, variableList: " + JSON.stringify(variableList));
    for (j = 0; j < variableList.length; j++) {
      // console.log("j = " + j + ", variable["+j+"] = " + variableList[j]);
      if (variableList[j].match(/\+/)) {
        // console.log("found 1 " + variableList[j]);
        hideList.push(variableList[j]);
        }
      }
      // console.log("in sourceBlock, hideList: " + JSON.stringify(hideList));
      for (j = 0; j < hideList.length; j++) {
        goog.array.remove(variableList, hideList[j]);
      }
      hideList=[];
      // console.log("after sourceBlock and remove, variableList: " + JSON.stringify(variableList));
    }
   else {
    variableList = [];
    // console.log("empty variableList");
    }
  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && variableList.indexOf(name) == -1) {
    variableList.push(name);
    // console.log("current var variableList: " + JSON.stringify(variableList));
  }
  variableList.sort(goog.string.caseInsensitiveCompare);
  variableList.push(Blockly.Msg.RENAME_VARIABLE);
  variableList.push(Blockly.Msg.NEW_VARIABLE);
  // console.log("final loop");
  for (j = 0; j < variableList.length; j++) {
      // console.log("j = " + j + ", variable[" +j+  "] = " + variableList[j]);
      if (variableList[j].match(/\+/)) {
        // console.log("final loop found " + variableList[j]);
        hideList.push(variableList[j]);
        }
      }
      // console.log("in final loop, hideList: " + JSON.stringify(hideList));
      for (j = 0; j < hideList.length; j++) {
        goog.array.remove(variableList, hideList[j]);
      }
      hideList=[];
  // console.log("after final loop and remove, variableList: " + JSON.stringify(variableList));
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
    options[x] = [variableList[x], variableList[x]];
  }
  // console.log("finally, options: " + JSON.stringify(options));
  return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing variable was chosen.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownChange = function(text) {
  var workspace = this.sourceBlock_.workspace;
  var newVarName = Blockly.Variables.generateUniqueName(workspace);

  function renameVariableCallback(newVar) {
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (!newVar ||
          newVar == Blockly.Msg.RENAME_VARIABLE ||
          newVar == Blockly.Msg.NEW_VARIABLE) {
        // Ok, not ALL names are legal...
        newVar = null;
        //Blockly.FieldVariable.dropdownCreate();
        return;
      }
      Blockly.Variables.renameVariable(oldVar, newVar, workspace);
      //Blockly.FieldVariable.dropdownCreate();
    }
  }

  function newVariableCallback(newVar) {
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (!newVar ||
          newVar == Blockly.Msg.RENAME_VARIABLE ||
          newVar == Blockly.Msg.NEW_VARIABLE) {
        // Ok, not ALL names are legal...
        newVar = null;
        //Blockly.FieldVariable.dropdownCreate();
        return;
      }
      Blockly.Variables.renameVariable(newVarName, newVar, workspace);
      //Blockly.FieldVariable.dropdownCreate();
    }
  }

  if (text == Blockly.Msg.RENAME_VARIABLE) {
    var oldVar = this.getText();
    Blockly.hideChaff();
    promptDialog('Rename Variable', Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', oldVar), oldVar, renameVariableCallback);
    return null;
  } else if (text == Blockly.Msg.NEW_VARIABLE) {
    Blockly.hideChaff();
    promptDialog('New Variable', Blockly.Msg.NEW_VARIABLE_TITLE, newVarName, newVariableCallback);
    //Blockly.FieldVariable.dropdownCreate();
    return newVarName;
  }
  return undefined;
};

function promptDialog(title, message, originalText, closeCallback) {
  title = title || "Prompt...";
  var returnValue = "";
//FIXME Drew's removing the weird threading stuff so this works everywhere
  if(typeof Q !== 'undefined'){
    var deferred = Q.defer();
    $('<div title="' + title + '">' +
                                      "<p>" + message + "</p>" +
                                      "<input type=\"text\" name=\"__prompt\" value=" + originalText + ">" +
                                      '</div>').dialog({
      modal: true,
      width: 400,
      position: {
        my: "center top",
        at: "center top",
        of: window
      },
      buttons: [{
        text: "OK",
        click: function () {
          returnValue = $("input:text").val();
          returnValue = returnValue && returnValue.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
          $(this).dialog("close");
        }
      }, {
        text: "Cancel",
        click: function () {
          $(this).dialog("close");
        }
      }],
      close: function (event, ui) {
        $(this).dialog("destroy").remove();
        if (deferred.promise.isPending()) {
          deferred.resolve(false);
        }
        closeCallback(returnValue);
      }
    });

    return deferred.promise;
  } else {
    //FIXME code to handle dropdown in webapp goes here...
  }
}
