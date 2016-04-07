import * as model from "../model/model";
import {BaseLevel, Toolbox} from "../level";
import * as TooltipView from "../views/tooltip";
import * as asset from "asset";

// Goal: use loops to get all the iron and move back to the base
export class VacuumLevel3 extends BaseLevel {
    public modelWorld: model.World;
    public robot: model.Robot;
    public irons: model.Iron[];

    initialize() {
        super.initialize();

        this.missionTitle = "Vacuum 3";
        this.missionText = [
            "todo"
        ];

        this.toolbox = new Toolbox();
        this.toolbox.addControl("tell");
        this.toolbox.addControl("controls_repeat_ext");
        this.toolbox.addClass("Robot", asset.Robot.Basic, model.Robot, [
            model.Robot.prototype.moveForward,
            model.Robot.prototype.moveBackward,
            model.Robot.prototype.turnRight,
            model.Robot.prototype.mine,
        ]);
        this.toolbox.addObject("robot", "Robot");
        this.toolbox.addNumber();

        this.objectives = [
            {
                objective: "Collect 10 iron",
                completed: false,
                predicate: (level) => {
                    for (var iron of level.irons) {
                        if (!level.robot.holding(iron)) {
                            return false;
                        }
                    }
                    return true;
                }
            },
            {
                objective: `Move the robot [${asset.Robot.Basic}] back to base`,
                completed: false,
                predicate: (level) => {
                    return level.objectives[0].completed &&
                        level.robot.getX() === 1 && level.robot.getY() === 1;
                }
            },
        ];

        this.hierarchy = {
            name: "object",
            children: [
                {
                    name: "Robot",
                    children: [],
                    methods: ["moveForward", "turnRight", "mine", "moveBackward"],
                    userMethods: ["moveAndMine"],
                },
            ],
        };

        this.allTooltips = [
            [
                new TooltipView.Tooltip(TooltipView.Region.Workspace, "")
            ]
        ];
    }

    preload() {
        super.preload();

        this.game.load.tilemap("prototype", "assets/maps/prototype.json", null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image("tiles", "assets/tilesets/cave.png");
        this.game.load.image("robot", asset.Robot.Basic);
        this.game.load.image("iron", asset.Iron.Basic);
    }

    create() {
        super.create();

        let map = this.game.add.tilemap("prototype");
        map.addTilesetImage("cave", "tiles");
        let layer = map.createLayer(
            "Tile Layer 1", this.game.width, this.game.height, this.background);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.initWorld(map);

        this.robot = new model.Robot("robot", 1, 1, model.Direction.EAST,
                                     this.modelWorld, this.foreground, "robot");
        this.irons = [];
        for (var i = 0; i < 10; i++) {
            this.irons.push(new model.Iron("iron", 2, 2 + i,
                                   this.modelWorld, this.middle, "iron"));
        }

        this.modelWorld.log.recordInitEnd();
        this.program.instantiateGlobals(this.modelWorld, this.toolbox);
    }
}