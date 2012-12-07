package mario;
//import mario.Mario;
//import mario.Luigi;
import js.Lib;
import js.Dom;

class Main {
    static function main () {
        var w : Window = Lib.window;
        Reflect.setField( w, 'Mario', mario.Mario );
        Reflect.setField( w, 'Luigi', mario.Luigi );
        Reflect.setField( mario.Mario, 'Controller', mario.Controller );
    }
}
