import * as model from "model/model";
import {EditorContext, MAIN} from "model/editorcontext";
import {BaseLevel, Toolbox} from "level";
import * as TooltipView from "views/tooltip";
import * as python from "execution/python";
import * as asset from "asset";

// Just put the robot and action into the box?
// Reason: lots of scaffolding at first, break it down later?

export class FuncDefsLevel1 extends BaseLevel {
    public robot: model.Robot;
    public iron: model.Iron;

    initialize() {
        super.initialize();

        this.missionTitle = "Writing Left";

        this.missionText = ["You need to get your robot back to base! Start by writing and using a function to turn left."];

        this.toolbox = new Toolbox();
        this.toolbox.addControl("tell");
        let methods = this.toolbox.addClass("Robot", asset.Robot.Basic, model.Robot, [
            model.Robot.prototype.moveForward,
            model.Robot.prototype.turnRight,
        ]);
        this.toolbox.addObject("robot", "Robot");

        this.toolbox.addControl("controls_repeat_ext");
        this.toolbox.addNumber(0);

        this.objectives = [
            {
                objective: `Make the robot [${asset.Robot.Basic}] turn left.`,
                completed: false,
                predicate: (level) => {
                    return level.robot.orientation == model.Direction.EAST;
                }
            },
        ];

        this.allTooltips = [
            [
                new TooltipView.Tooltip(TooltipView.Region.Toolbox, "There's a turnLeft block, but it doesn't do anything yet."),
                new TooltipView.Tooltip(TooltipView.Region.Workspace,
                    "Check the object heirarchy to edit your robot's code!"),
            ],
        ];

        this.hierarchy = {
            name: "object",
            children: [
                {
                    name: "Robot",
                    children: [],
                    methods: ["moveForward", "turnRight"],
                    userMethods: ["turnLeft"],
                },
            ],
        };
    }

    preload() {
        super.preload();

        this.game.load.image("tiles", "assets/tilesets/cave2.png");
        this.game.load.tilemap("outside", "assets/maps/outside.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("robot", asset.Robot.Basic);
        this.game.load.image("iron", "assets/sprites/iron.png");
    }

    create() {
        // Create the world objects here.
        super.create();

        let map = this.game.add.tilemap("outside");
        map.addTilesetImage("cave2", "tiles");

        let layer = map.createLayer(
            "Tile Layer 1", this.game.width, this.game.height, this.background);

        let layer2 = map.createLayer(
            "Tile Layer 2", this.game.width, this.game.height, this.background);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.initWorld(map);
        this.robot = new model.Robot("robot", 2, 3, model.Direction.SOUTH,
                                     this.modelWorld, this.foreground, "robot");
        // this.iron = new model.Iron("iron", 5, 1,
        //                            this.modelWorld, this.middle, "iron");

        this.modelWorld.log.recordInitEnd();
        this.program.instantiateGlobals(this.modelWorld, this.toolbox);
    }

    // fallbackWorkspace(context: EditorContext): HTMLElement {
    //     if (context.className === MAIN) {
    //         return Blockly.Xml.textToDom(`<xml>${this.fallback.outerHTML}</xml>`);
    //     }
    //     return super.fallbackWorkspace(context);
    // }

    canUseCodeEditor(context: EditorContext): boolean {
        return context.className === "Robot" && context.method === "turnLeft";
    }
}