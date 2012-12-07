package mario;
import mario.Util;
import js.Lib;
import js.Dom;

class Controller {
    private static var KEYCODE = {
        LEFT:  37,
        RIGHT: 39,
        UP:    38,
        DOWN:  40,
    };

    private var UE : Int;

    private var target : Mario;

    //__init: function (param) {
    public function new (params : Dynamic = null) {
        var self = this;

        if ( params == null ) { params = new Hash<Dynamic>(); }
        this.target = Util.field_or_default( params, 'target', null );

        var doc = Lib.document;

        // キーイベントをListenする
        var doc_onkeydown_stash : Dynamic = doc.onkeydown;
        var doc_onkeyup_stash : Dynamic = doc.onkeyup;

        doc.onkeydown = function (ev : Event) : Void {
            self.keydown(ev);
            if ( doc_onkeydown_stash != null ) {
                doc_onkeydown_stash(ev);
            }
        };
        doc.onkeyup = function (ev : Event) : Void {
            self.keyup(ev);
            if ( doc_onkeyup_stash != null ) {
                doc_onkeyup_stash(ev);
            }
        };

        this.UE = 0;
    }

    private function keydown ( ev : Event ) : Void {
        var is_b_dash : Bool = ev.ctrlKey;
        var target : Mario = this.target;

        switch ( ev.keyCode ) {
        // ←
        case KEYCODE.LEFT:
            target.update_velocity(-1, is_b_dash);
        // →
        case KEYCODE.RIGHT:
            target.update_velocity(1, is_b_dash);
        // ↑
        case KEYCODE.UP:
            target.jump();
        // ↓
        case KEYCODE.DOWN:
            target.crouch();
        }
    }

    private function keyup ( ev : Event ) : Void {
        var target = this.target;

        switch (ev.keyCode) {
        // ←
        case KEYCODE.LEFT:
        // →
        case KEYCODE.RIGHT:
        // ↑
        case KEYCODE.UP:
        // ↓
        case KEYCODE.DOWN:
            //if ( ! target.flg_jump ) { target.standup(); }
            target.standup();
        }
    }
}
