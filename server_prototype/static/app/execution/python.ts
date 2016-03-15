declare var Sk: any;
import * as model from "../model/model";

const PROXY_CLASS = `
class JSProxyClass(object):
    def __init__(self, jsid):
        self.jsid = jsid

    def __getattr__(self, attribute):
        return self._proxy(attribute)

    def _proxy(self, attribute):
        jsid = self.jsid
        def _proxy(*args):
            methodCall(jsid, attribute, args)
        return _proxy
`

/**
 * An instance of a Skulpt interpreter.
 */
export class Interpreter {
    // code that is run before the player's program is executed
    // for example, class definitions go here
    private _initCode: string;

    // the world that this interpreter updates
    private _world: model.World;

    constructor(initCode: string, world: model.World) {
        this._world = world;

        var recordBlockEndDef = 'def recordBlockEnd(block_id=None):\n\tjsRecordBlockEnd(block_id)\n'
        this._initCode = PROXY_CLASS + recordBlockEndDef + initCode;

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
                // TODO: catch and throw (in Python) any exceptions
                obj[methodName].apply(obj, args);
            }
        );

        /**
         * Records the end of a block in the world's log. Called by python
         * code that is injected during the code generation phase.
         */
        Sk.builtins.jsRecordBlockEnd = new Sk.builtin.func(function(blockID: any) {
            blockID = Sk.ffi.remapToJs(blockID);
            world.log.recordBlockEnd(blockID);
        });
    }

    /**
     * A method for initializing objects that exist at the start of the level.
     */
    instantiateObject(varName: string, className: string, id: number) {
        var line = '\n' + varName + ' = JSProxyClass(' + id + ')';
        this._initCode = this._initCode + line;
    }

    /**
     * Run the player's program to generate a diff log for
     * this interpreter's world
     */
    run(code: string) {
        var program = this._initCode + '\n' + code;
        console.log("Running:", program);
        return Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, program, true);
        });
    }
}
