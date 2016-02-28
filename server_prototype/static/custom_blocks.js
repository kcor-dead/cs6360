'use strict';

goog.provide('Blockly.Blocks.oop');

goog.require('Blockly.Blocks');

Blockly.Blocks["method"] = {
    init: function() {
        this.setColour(260);
        this.setOutput(true, "method");
        this.setInputsInline(true);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["turn left", "turnLeft"],
                ["move forward", "moveForward"],
                ["self destruct", "selfDestruct"],
            ]), "METHOD_NAME");
    },
};

Blockly.Blocks["tell"] = {
    init: function() {
        this.jsonInit({
            "id": "tell",
            "message0": "tell %1 %2 to %3 %4",
            "args0": [
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_value",
                    "name": "OBJECT"
                },
                {
                    "type": "input_dummy"
                },
                {
                    "type": "input_value",
                    "name": "METHOD",
                    "check": "method",
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": 120,
            "tooltip": "",
            "helpUrl": "http://www.example.com/"
        });
    },
}
