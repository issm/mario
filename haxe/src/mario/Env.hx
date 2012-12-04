package mario;

class Env {
    private var GRAVITY : Float;
    private var SWIMMABLE : Bool;

    public function new () {
        this.GRAVITY   = 9.8;
        this.SWIMMABLE = false;
    }

    public function swimmable () {
        return this.SWIMMABLE;
    }
}
