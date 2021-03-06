declare var Sk: any;
import * as model from "model/model";
import * as level from "level";

/**
 * An instance of a Skulpt interpreter.
 */
export class Interpreter {
    // code that is run before the player's program is executed
    // for example, class definitions go here
    private _initCode: string;

    // the world that this interpreter updates
    private _world: model.World;

    constructor(level: level.BaseLevel, world: model.World) {
        this._world = world;

        // Set up Python output to go to the console (for debugging needs)
        Sk.configure({output: (arg: any) => {
            console.log(arg);
        }});

        /**
         * Executes a method call with an object (identified by id) in this
         * interpreter's world. Called by interpreted python code.
         */
        Sk.builtins.methodCall = new Sk.builtin.func(
            function(id: number, methodName: string, args: any[]) {
                id = Sk.ffi.remapToJs(id);
                methodName = Sk.ffi.remapToJs(methodName);
                args = Sk.ffi.remapToJs(args);

                var obj: any = world.getObjectByID(id);

                let method = obj[methodName];
                if (typeof method === "undefined") {
                    throw `I don't know how to ${methodName}!\nMake sure this method is from my class or a superclass.`;
                }
                let result = method.apply(obj, args);
                if (typeof result === "number") {
                    let pyValue = Sk.ffi.remapToPy(result);
                    return pyValue;
                }
            }
        );

        let ctr = 0;
        /**
         * Executes a constructor call for an object given a class
         * name. Called by interpreted Python code.
         */
        Sk.builtins.constructorCall = new Sk.builtin.func(
            (className: any) => {
                className = Sk.ffi.remapToJs(className);
                let obj = level.instantiateObject(className, `USERCREATED_${className}_${ctr}`);
                if (obj === null) {
                    throw `Can't create a ${className}! There's already one at base.`;
                }
                obj.getPhaserObject().alpha = 0.0;
                this._world.log.recordInitialized(obj);
                ctr++;

                return Sk.ffi.remapToPy(obj.getID());
            }
        );

        Sk.builtins.log = new Sk.builtin.func((message: any) => {
            let m = Sk.ffi.remapToJs(message) || message;
            console.log(m);
        });

        /**
         * Records the end of a block in the world's log. Called by python
         * code that is injected during the code generation phase.
         */
        Sk.builtins.recordBlockEnd = new Sk.builtin.func(function(blockID: any) {
            blockID = Sk.ffi.remapToJs(blockID);
            world.log.recordBlockEnd(blockID);
        });

        Sk.builtins.recordBlockBegin = new Sk.builtin.func(function(blockID: any) {
            blockID = Sk.ffi.remapToJs(blockID);
            world.log.recordBlockBegin(blockID);
        });
    }

    /**
     * Run the player's program to generate a diff log for
     * this interpreter's world
     */
    run(program: string) {
        console.log("Running", program);
        return Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, program, true);
        });
    }
}
