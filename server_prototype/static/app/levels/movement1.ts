import * as model from "model/model";
import {EditorContext, MAIN} from "model/editorcontext";
import {BaseLevel, Toolbox} from "level";
import * as TooltipView from "views/tooltip";
import * as python from "execution/python";
import * as asset from "asset";

export class MovementLevel1 extends BaseLevel {
    public robot: model.Robot;

    private fallback: HTMLElement;

    initialize() {
        super.initialize();

        this.missionTitle = "Test Drive";

        this.toolbox = new Toolbox();
        this.toolbox.addControl("tell");
        let methods = this.toolbox.addClass("Robot", asset.Robot.Basic, model.Robot, [
            model.Robot.prototype.moveForward,
        ]);

        let object = this.toolbox.addObject("robot", "Robot");

        this.fallback = this.toolbox.addControl("tell", false, [], [
            ["OBJECT", object.cloneNode(true)],
            ["METHOD", methods[0].cloneNode(true)],
        ]);

        this.objectives = [
            {
                objective: `Move the robot [${asset.Robot.Basic}] forward`,
                completed: false,
                predicate: (level) => {
                    return level.robot.getX() === 2 && level.robot.getY() === 2;
                }
            },
        ];

        this.allTooltips = [
            [
                new TooltipView.Tooltip(TooltipView.Region.Controls,
                    "Load your code onto the robot and run it."),
                new TooltipView.Tooltip(TooltipView.Region.Workspace,
                    "A command has already been prepped for you!"),
            ],
        ];

        this.missionText = [
            "This is Mission Control! The volcano erupted in the middle of your mining trip!",
            "Test if your robot is still online by telling it to move forward."
        ];
    }

    preload() {
        super.preload();

        this.game.load.image("tiles", "assets/tilesets/cave2.png");
        this.game.load.tilemap("movement1", "assets/maps/movement1.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("robot", asset.Robot.Basic);
    }

    create() {
        // Create the world objects here.
        super.create();

        let map = this.game.add.tilemap("movement1");

        map.addTilesetImage("cave2", "tiles");

        let layer = map.createLayer(
            "Tile Layer 1", this.game.width, this.game.height, this.background);

        let layer2 = map.createLayer(
            "Tile Layer 2", this.game.width, this.game.height, this.background);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.initWorld(map);

        this.robot = new model.Robot("robot", 1, 2, model.Direction.EAST,
                                     this.modelWorld, this.foreground, "robot");

        this.modelWorld.log.recordInitEnd();
        this.program.instantiateGlobals(this.modelWorld, this.toolbox);
    }

    fallbackWorkspace(context: EditorContext): HTMLElement {
        if (context.className === MAIN) {
            return Blockly.Xml.textToDom(`<xml>${this.fallback.outerHTML}</xml>`);
        }
        return super.fallbackWorkspace(context);
    }
}
