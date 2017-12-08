// blocklyframe.js

blocklyMessageHandlers = {
    setBlocklyXML: function setBlocklyXML(arg) {
        var xml = Blockly.Xml.textToDom(arg);
        Blockly.mainWorkspace.clear();
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
        //Blockly.mainWorkspace.zoomToFit();
        Blockly.mainWorkspace.zoomResetLinkitz();//in order for this to zoom meaningfully we have to calculate location of petals from xml file
    },
    setBlocklyHighlight: function setBlocklyHighlight (arg) {
        var blockId = arg;
        Blockly.mainWorkspace.traceOn(true);
        Blockly.mainWorkspace.highlightBlock(blockId);
    },
    clearBlocklyHighlight: function clearBlocklyHighlight (arg) {
        Blockly.mainWorkspace.traceOn(true);
        Blockly.mainWorkspace.highlightBlock(null);
    },
    generateBlocklyCode: function generateBlocklyCode (arg) {
        onBlocklyGenerate();
    }
}

function receiveMessage(event) {
    var eventData = event.data;
    var handlerMethod = blocklyMessageHandlers[eventData.method];
    var arg = eventData.arg;
    var exn = eventData.exceptn;

    if (handlerMethod) {
        handlerMethod(arg);
    }
}

function onBlocklyChanged() {
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    var xmlDump = Blockly.Xml.domToPrettyText(xml);
    window.parent.postMessage({method: 'onBlocklyChanged', arg: xmlDump}, '*');
}

function onBlocklyLoaded() {
    window.parent.postMessage({method: 'onBlocklyLoaded'}, '*');
}

function onBlocklyGenerate() {
    assembly_generator = true;
    var exn = null;
    try {
      var code = Blockly.Assembly.workspaceToCode(Blockly.mainWorkspace);
    }
    catch (ex) {
      exn = ex;
      console.error("Assembly code generator wasn't able to generate assembly from the code in your workspace. There may not be any lines of code there. If there is code it might be improperly structured. Try using an event block to enclose your code so the assembly code generator knows when to run it.");
    }
//    var code = "  On_motion_trigger:\n    Syscall Flash ([3, 255,0,0])\n\n  Syscall Return Null\n";
    window.parent.postMessage({method: 'onBlocklyGenerate', arg: code, exceptn: exn}, '*');
}

function injectLanguage() {
  // Inject language strings.
  document.title += ' ' + MSG['title'];

  var categories = ['Motion','LED','Hub','catLogic', 'catMath', 'catLists', 'catVariables', 'catFunctions'];
  for (var i = 0, cat; (cat = categories[i]); i++) {
    document.getElementById(cat).setAttribute('name', MSG[cat]);
  }
  var textVars = document.getElementsByClassName('textVar');
  for (var i = 0, textVar; (textVar = textVars[i]); i++) {
    textVar.textContent = MSG['textVariable'];
  }
  var listVars = document.getElementsByClassName('listVar');
  for (var i = 0, listVar; (listVar = listVars[i]); i++) {
    listVar.textContent = MSG['listVariable'];
  }
}

function init() {
    injectLanguage();
    Blockly.inject(document.body, 
      { 
        path: 'blockly/', 
        toolbox: document.getElementById('toolbox'),
        zoom: 
          { controls: true,
            wheel: true,
          },                                    
      })

    Blockly.mainWorkspace.addChangeListener(onBlocklyChanged);
//    Blockly.addChangeListener();
    window.addEventListener("message", receiveMessage, false);
    onBlocklyLoaded();
}
