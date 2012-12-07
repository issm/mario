package mario;
import mario.Mario;

class Luigi extends Mario {
    public function new () : Void {
        super();
    }

    override private function set_name () : Void { this.name = 'Luigi'; }
}
