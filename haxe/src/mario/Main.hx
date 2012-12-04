package mario;
//import mario.Mario;
//import mario.Luigi;
import js.Lib;
import js.Dom;

class Main {
    static function main () {
        untyped window.mario = new mario.Mario();
        //untyped window.mario = new mario.Luigi();

        var c = new mario.Controller(
            {
                var h = new Hash<Dynamic>();
                h.set( 'target', (untyped window.mario) );
                h;
            }
        );
    }
}
