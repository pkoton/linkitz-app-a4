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
 * @fileoverview Colour input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldColour');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorPicker');


/**
 * Class for a colour input field.
 * @param {string} colour The initial colour in '#rrggbb' format.
 * @param {Function=} opt_validator A function that is executed when a new
 *     colour is selected.  Its sole argument is the new colour value.  Its
 *     return value becomes the selected colour, unless it is undefined, in
 *     which case the new colour stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldColour = function(colour, opt_validator) {
  Blockly.FieldColour.superClass_.constructor.call(this, colour, opt_validator);
  this.setText(Blockly.Field.NBSP + Blockly.Field.NBSP + Blockly.Field.NBSP);
};
goog.inherits(Blockly.FieldColour, Blockly.Field);

/**
 * By default use the global constants for colours.
 * @type {Array.<string>}
 * @private
 */
Blockly.FieldColour.prototype.colours_ = null;

/**
 * By default use the global constants for columns.
 * @type {number}
 * @private
 */
Blockly.FieldColour.prototype.columns_ = 0;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldColour.prototype.init = function(block) {
  Blockly.FieldColour.superClass_.init.call(this, block);
  this.borderRect_.style['fillOpacity'] = 1;
  this.setValue(this.getValue());
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldColour.prototype.CURSOR = 'default';

/**
 * Close the colour picker if this input is being deleted.
 */
Blockly.FieldColour.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldColour.superClass_.dispose.call(this);
};

/**
 * Return the current colour.
 * @return {string} Current colour in '#rrggbb' format.
 */
Blockly.FieldColour.prototype.getValue = function() {
  return this.colour_;
};

/**
 * Set the colour.
 * @param {string} colour The new colour in '#rrggbb' format.
 */
Blockly.FieldColour.prototype.setValue = function(colour) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
      this.colour_ != colour) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.colour_, colour));
  }
  this.colour_ = colour;
  if (this.borderRect_) {
    this.borderRect_.style.fill = colour;
  }
};

/**
 * Get the text from this field.  Used when the block is collapsed.
 * @return {string} Current text.
 */
Blockly.FieldColour.prototype.getText = function() {
  var colour = this.colour_;
  // Try to use #rgb format if possible, rather than #rrggbb.
  var m = colour.match(/^#(.)\1(.)\2(.)\3$/);
  if (m) {
    colour = '#' + m[1] + m[2] + m[3];
  }
  return colour;
};

/**
 * An array of colour strings for the palette.
 * See bottom of this page for the default:
 * http://docs.closure-library.googlecode.com/git/closure_goog_ui_colorpicker.js.source.html
 * @type {!Array.<string>}
 */
// Blockly.FieldColour.COLOURS = goog.ui.ColorPicker.SIMPLE_GRID_COLORS;
//Blockly.FieldColour.COLOURS = ['#E81A4B', '#FF7245', '#ffe600',  '#009245', '#00989a', '#1329c3', '#873299', '#DEDFE0', '#ff6aa2', '#ffa31d', '#fff267', '#33cc66', '#66d9ff','#0083CA','#9862e6','#FFFFFF'];
//Blockly.FieldColour.COLOURS = ['#FF0000', '#FF7245', '#ffe600',  '#00FF00', '#00989a', '#1329c3', '#873299', '#DEDFE0', '#ff6aa2', '#ffa31d', '#fff267', '#33cc66', '#66d9ff','#0000ff','#9862e6','#FFFFFF'];
//                                red, brand v pure      arbitrary yellow       arbitrarycyan          
//                                           arbitrary pink?         pure v brand green     arbitrary blue
//Blockly.FieldColour.COLOURS =   ['#FF0000', '#F37C8D', '#FF9903', '#FFE900', '#33CC66', '#00FF00', '#009245', '#3CC6AF', '#0083CA', '#0000FF', '#873299', '#FFFFFF'];
                                //pure red   main pink  toy orange            toy lightgreen        toy darkgreen                    pure blue  toy purple
                                //                                 toy yellow            pure green            main cyan  toy blue                         pure white
//above but folded to make it work with 6cols
Blockly.FieldColour.COLOURS =   ['#FF0000', '#FF9903', '#33CC66', '#00FF00', '#0083CA', '#873299', '#F37C8D',  '#FFE900', '#009245', '#3CC6AF', '#0000FF', '#FFFFFF'];
                                //pure red   toy orange toy lightgreen        toy blue   toy purple main pink   toy yellow toy dark green        pure blue  pure white
                                //                                 pure green                                                         main cyan
/**
 * Number of columns in the palette.
 */
Blockly.FieldColour.COLUMNS = 6;

/**
 * Set a custom colour grid for this field.
 * @param {Array.<string>} colours Array of colours for this block,
 *     or null to use default (Blockly.FieldColour.COLOURS).
 * @return {!Blockly.FieldColour} Returns itself (for method chaining).
 */
Blockly.FieldColour.prototype.setColours = function(colours) {
  this.colours_ = colours;
  return this;
};

/**
 * Set a custom grid size for this field.
 * @param {number} columns Number of columns for this block,
 *     or 0 to use default (Blockly.FieldColour.COLUMNS).
 * @return {!Blockly.FieldColour} Returns itself (for method chaining).
 */
Blockly.FieldColour.prototype.setColumns = function(columns) {
  this.columns_ = columns;
  return this;
};

/**
 * Create a palette under the colour field.
 * @private
 */
Blockly.FieldColour.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
      Blockly.FieldColour.widgetDispose_);
  // Create the palette using Closure.
  var picker = new goog.ui.ColorPicker();
  picker.setSize(this.columns_ || Blockly.FieldColour.COLUMNS);
  picker.setColors(this.colours_ || Blockly.FieldColour.COLOURS);

  // Position the palette to line up with the field.
  // Record windowSize and scrollOffset before adding the palette.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = this.getAbsoluteXY_();
  var borderBBox = this.getScaledBBox_();
  var div = Blockly.WidgetDiv.DIV;
  picker.render(div);
  picker.setSelectedColor(this.getValue());
  // Record paletteSize after adding the palette.
  var paletteSize = goog.style.getSize(picker.getElement());

  // Flip the palette vertically if off the bottom.
  if (xy.y + paletteSize.height + borderBBox.height >=
      windowSize.height + scrollOffset.y) {
    xy.y -= paletteSize.height - 1;
  } else {
    xy.y += borderBBox.height - 1;
  }
  if (this.sourceBlock_.RTL) {
    xy.x += borderBBox.width;
    xy.x -= paletteSize.width;
    // Don't go offscreen left.
    if (xy.x < scrollOffset.x) {
      xy.x = scrollOffset.x;
    }
  } else {
    // Don't go offscreen right.
    if (xy.x > windowSize.width + scrollOffset.x - paletteSize.width) {
      xy.x = windowSize.width + scrollOffset.x - paletteSize.width;
    }
  }
  Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
                             this.sourceBlock_.RTL);

  // Configure event handler.
  var thisField = this;
  Blockly.FieldColour.changeEventKey_ = goog.events.listen(picker,
      goog.ui.ColorPicker.EventType.CHANGE,
      function(event) {
        var colour = event.target.getSelectedColor() || '#000000';
        Blockly.WidgetDiv.hide();
        if (thisField.sourceBlock_ && thisField.validator_) {
          // Call any validation function, and allow it to override.
          var override = thisField.validator_(colour);
          if (override !== undefined) {
            colour = override;
          }
        }
        if (colour !== null) {
          thisField.sourceBlock_.setShadow(false);
          thisField.setValue(colour);
        }
      });
};

/**
 * Hide the colour palette.
 * @private
 */
Blockly.FieldColour.widgetDispose_ = function() {
  if (Blockly.FieldColour.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldColour.changeEventKey_);
  }
};
