package mario;
import js.Lib;
import js.Dom;
import haxe.Timer;
import mario.Image;
import mario.Env;
import mario.Util;

class Mario {
    private static var BGINFO = {
        // MINI
        MINI_STAND:   { INDEX:  0, FRAMES:  1 },
        MINI_WALK:    { INDEX:  2, FRAMES:  3 },
        MINI_BREAK:   { INDEX:  4, FRAMES:  1 },
        MINI_JUMP:    { INDEX:  6, FRAMES:  1 },
        MINI_SWIM1:   { INDEX:  8, FRAMES:  6 },
        MINI_SWIM2:   { INDEX: 10, FRAMES:  2 },
        MINI_SUPER:   { iNDEX: 12, FRAMES:  1 },
        MINI_DIE:     { INDEX: 14, FRAMES:  1 },
        // SUPER
        SUPER_STAND:  { INDEX: 15, FRAMES:  1 },
        SUPER_WALK:   { INDEX: 17, FRAMES:  3 },
        SUPER_BREAK:  { INDEX: 19, FRAMES:  1 },
        SUPER_JUMP:   { INDEX: 21, FRAMES:  1 },
        SUPER_CROUCH: { INDEX: 23, FRAMES:  1 },
        SUPER_SWIM1:  { INDEX: 25, FRAMES:  6 },
        SUPER_SWIM2:  { INDEX: 27, FRAMES:  2 },
        SUPER_MINI:   { iNDEX: 29, FRAMES:  1 },
        SUPER_DIE:    { INDEX: 31, FRAMES:  1 },
        // FIRE
        FIRE_STAND:   { INDEX: 32, FRAMES:  1 },
        FIRE_WALK:    { INDEX: 34, FRAMES:  3 },
        FIRE_BREAK:   { INDEX: 36, FRAMES:  1 },
        FIRE_JUMP:    { INDEX: 38, FRAMES:  1 },
        FIRE_CROUCH:  { INDEX: 40, FRAMES:  1 },
        FIRE_SWIM1:   { INDEX: 42, FRAMES:  6 },
        FIRE_SWIM2:   { INDEX: 44, FRAMES:  2 },
        FIRE_MINI:    { iNDEX: 46, FRAMES:  1 },
        FIRE_DIE:     { INDEX: 48, FRAMES:  1 },
    };

    private var INTERVAL_DAEMON_DEFAULT    =  25;  // [ms]
    private var INTERVAL_ANIMATION_DEFAULT = 100;  // [ms]

    private var name : String;
    private var x : Float;
    private var y : Float;
    private var scale : Int;
    private var width : Int;
    private var height : Int;

    private var VELOCITY_ZERO_RANGE : Float = .4;
    private var VELOCITY_X_MAX : Float = 5;
    private var VELOCITY_X : Float = 0;
    private var VELOCITY_Y : Float = 0;

    private var ABILITY_ACCEL : Float = .25;
    private var ABILITY_BDASH : Float = 2;
    private var ABILITY_JUMP : Float = 6;

    private var TIMER_DAEMON : Int;
    private var INTERVAL_DAEMON : Int;
    private var TIMER_ANIMATION : Int;
    private var INTERVAL_ANIMATION : Int;
    private var FRAME_ANIMATION : Int;
    private var TIMER_WALK : Int;
    private var INTERVAL_WALK : Int;
    private var T_WALK : Int;
    private var TIMER_JUMP : Int;

    private var flg_jump : Bool;
    private var flg_break : Bool;
    private var flg_crouch : Bool;

    private var body : HtmlDom;
    private var env : Env;

    private var DIRECTION : String;
    private var STATUS : String;
    private var B_DASH : Bool;
    private var ACTION : String;

    private var method_stack : Array<Dynamic>;

    private var window : Window;

    private var BGPOS_TOP : Float;
    private var BGPOS_LEFT : Float;

    public function new () : Void {
        // param = param  ||  {};
        // var x             = param.x  ||  0
        //   , y             = param.y  ||  0
        //   , scale         = param.scale  ||  1
        //   , ability       = param.ability  ||  {}
        //   , environment   = param.environment  ||  new Mario.Environment()
        //   , div_classname = param.div_classname  ||  'mario'
        // ;
        var x : Float = 100;
        var y : Float = 300;
        var scale : Int = 2;
        var env : Dynamic = new Env();
        var div_classname : String = 'mario';

        this.set_name();

        this.window = Lib.window;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.width = 16 * this.scale;
        this.height = 32 * this.scale;

        this.INTERVAL_DAEMON = this.INTERVAL_DAEMON_DEFAULT;
        this.INTERVAL_ANIMATION = this.INTERVAL_ANIMATION_DEFAULT;
        this.FRAME_ANIMATION = 0;
        this.INTERVAL_WALK = 40;
        this.T_WALK = 0;

        this.flg_jump   = false;
        this.flg_break  = false;
        this.flg_crouch = false;

        // マリオの体: div要素
        this.body = Util.elm(
            'div',
            {
                var h = new Hash<String>();
                h.set( 'id', 'mario-made-by-javascript' );
                h.set( 'className', div_classname );
                h;
            },
            {
                var h = new Hash<String>();
                h.set( 'position', 'absolute' );
                h.set( 'overflow', 'hidden' );
                h.set( 'zIndex', Std.string(2147483600) );
                h.set( 'width', Std.string(this.width) );
                h.set( 'height', Std.string(this.height) );
                h.set( 'background', 'url(' + Reflect.field(mario.Image, this.name)[this.scale] + ') left top no-repeat' );
                h;
            }
        );

        this.env = env;

        // 向き: String: 'RIGHT' or 'LEFT'
        this.DIRECTION = 'RIGHT';
        // 状態: String: 'MINI', 'SUPER', 'FIRE'
        this.STATUS = 'MINI';
        // Bダッシュ状態: Bool
        this.B_DASH = false;
        // アクション: String: 'STAND', 'WALK', ['RUN'], 'JUMP', 'BREAK', 'CROUCH', 'SWIM'
        this.ACTION = 'STAND';

        // メソッドスタック: Array of Function
        this.method_stack = [];

        this.update_position();
        //this.set_position( this.x, this.y );
        this.start();
    }

    private function set_name () : Void { this.name = 'Mario'; }

    private function set_status (s : String) : Bool {
        this.STATUS = s;
        this.switch_bg();
        return true;
    }

    private function set_action (a : String) : Bool {
        if ( this.ACTION == a ) { return false; }
        this.ACTION = a;
        this.switch_bg();
        return true;
    }
    

    private function is_status_mini     () : Bool { return this.STATUS == 'MINI';  }
    private function is_status_super    () : Bool { return this.STATUS == 'SUPER'; }
    private function is_status_fire     () : Bool { return this.STATUS == 'FIRE';  }
    private function is_action_stand    () : Bool { return this.ACTION == 'STAND';  }
    private function is_action_walk     () : Bool { return this.ACTION == 'WALK';   }
    private function is_action_jump     () : Bool { return this.ACTION == 'JUMP';   }
    private function is_action_crouch   () : Bool { return this.ACTION == 'CROUCH'; }
    private function is_action_swim1    () : Bool { return this.ACTION == 'SWIM1';  }
    private function is_action_swim2    () : Bool { return this.ACTION == 'SWIM2';  }
    private function is_action_die      () : Bool { return this.ACTION == 'DIE';    }
    private function is_direction_right () : Bool { return this.DIRECTION == 'RIGHT'; }
    private function is_direction_left  () : Bool { return this.DIRECTION == 'LEFT';  }

    /**
     *
     *  指定した座標（左下）に位置をセットする
     *
     **/
    private function set_position (x : Float, y : Float) : Void {
        Util.css(
            this.body,
            {
                var h = new Hash<String>();
                h.set( 'top', Std.string( Util.f2i( y - this.height ) ) );
                h.set( 'left', Std.string( Util.f2i(x) ) );
                h;
            }
        );
    }

    private function update_position () : Void {
        this.set_position( this.x, this.y );
    }

    private function switch_bg () : Void {
        var key : String = [this.STATUS, this.ACTION].join('_');
        var index =
            Std.parseInt( Std.string( untyped BGINFO[key].INDEX ) ) + ( this.is_direction_left() ? 1 : 0 );
        this.set_bg_position( key, index, 0 );
        this.switch_animation();
    }
   
    private function set_bg_position (key : String, index : Int, frame : Int ) : Void {
        this.BGPOS_TOP  = - this.height * frame;
        this.BGPOS_LEFT = - this.width * index;
        Util.css(
            this.body,
            {
                var h = new Hash<String>();
                h.set(
                    'backgroundPosition',
                    Std.string(this.BGPOS_LEFT) + 'px ' + Std.string(this.BGPOS_TOP)  + 'px'
                );
                h;
            }
        );
    }

    private function switch_animation () : Void {
        var self = this;
        var key : String = [this.STATUS, this.ACTION].join('_');
        var index : Int  = Util.f2i( untyped BGINFO[key].INDEX ) + ( this.is_direction_left() ? 1 : 0 );
        var frames : Int = ( untyped BGINFO[key].FRAMES );
        //var frame : Int = 0;

        untyped clearInterval(this.TIMER_ANIMATION);
        this.TIMER_ANIMATION = untyped setInterval(
            function () {
                self.FRAME_ANIMATION = ++self.FRAME_ANIMATION % frames;
                self.set_bg_position( key, index, self.FRAME_ANIMATION );
                // frame = ++frame % frames;
                // self.set_bg_position( key, index, frame );
            },
            this.INTERVAL_ANIMATION
        );
    }

    private function update_interval () : Void {
    }

    public function update_velocity ( v : Float, flg_bdash : Bool ) : Void {
        if ( v == null ) { v = 0; }

        switch ( true ) {
            case v < 0:
                this.left();
                if ( this.VELOCITY_X == 0 ) {
                    this.VELOCITY_X = - this.VELOCITY_ZERO_RANGE;
                } // 初速
                this.VELOCITY_X -=
                    this.ABILITY_ACCEL * ( flg_bdash  ?  this.ABILITY_BDASH  :  1 );
                if ( this.VELOCITY_X > this.VELOCITY_ZERO_RANGE ) {
                    this.brake();
                }
                else {
                    //this.walk();
                    if ( ! this.flg_jump ) {
                        this.set_action('WALK');
                    }
                }
            case v > 0:
                this.right();
                if ( this.VELOCITY_X == 0 ) {
                    this.VELOCITY_X = this.VELOCITY_ZERO_RANGE;
                } // 初速
                this.VELOCITY_X +=
                    this.ABILITY_ACCEL * ( flg_bdash  ?  this.ABILITY_BDASH  :  1 );
                if ( this.VELOCITY_X < this.VELOCITY_ZERO_RANGE ) {
                    this.brake();
                }
                else {
                    //this.walkK();
                    if ( ! this.flg_jump ) {
                        this.set_action('WALK');
                    }
                }
        }
    }

    private function start () : Void {
        this.switch_bg();
        this.daemon();
        Util.app( this.window.document.body, this.body );
    }

    private function daemon () : Void {
        var self = this;
        this.TIMER_DAEMON = untyped setInterval(
            function() {
                var v_x = self.VELOCITY_X;
                // ジャンプしていない場合は自然減速する
//                if( ! self.flg_jump ) {
                v_x *= .89; // 減速する．この値は要調整
//                }
                self.x += v_x;

                // 現在の速度が，速度0引き込み圏内にある
                if ( Math.abs(v_x) <= self.VELOCITY_ZERO_RANGE ) {
                    v_x = 0;
                    if ( self.flg_break ) {
                        self.flg_break = false;
                    }
        
                    if ( self.VELOCITY_Y == 0 ) {
                        if ( ! self.flg_crouch ) { self.standup(); }
                        //self.flg_crouch  ?  self.crouch()  :  self.standup();
                        //if( self.flg_jump  &&  self.flg_crouch ) self.standup();
                    }
                    else {
                        if ( ! self.flg_crouch ) { self.set_action('JUMP'); }
                    }
                    //self.INTERVAL_ANIMATION = self.INTERVAL_ANIMATION_DEFAULT;
                    self.INTERVAL_ANIMATION = self.INTERVAL_ANIMATION_DEFAULT;
                }

                self.VELOCITY_X = v_x;

                self.set_position( self.x, self.y );
            },
            this.INTERVAL_DAEMON
        );
    }


    /**
     *
     *  右を向く
     *
     **/
    public function right () : Void {
        if ( this.flg_jump ) { return; }
        if ( ! this.flg_break  &&  this.is_direction_right() ) { return; }
        this.DIRECTION = 'RIGHT';
        this.switch_bg();
    }
    /**
     * 
     *  左を向く
     *  
     **/
    public function left () : Void {
        if ( this.flg_jump ) { return; }
        if ( ! this.flg_break  &&  this.is_direction_left() ) { return; }
        this.DIRECTION = 'LEFT';
        this.switch_bg();
    }
    /**
     *  立つ
     *
     **/
    public function standup () : Void {
        this.flg_crouch = false;
        //this.set_action( this.flg_jump ? 'JUMP' : 'STAND' );
        this.set_action( this.flg_jump ? 'JUMP' : 'STAND' );
    }
    /**
     *  歩く，ダッシュする
     *
     **/
    public function walk ( param: Hash<Dynamic> ) : Void {
        if ( this.VELOCITY_X > 0 ) { return; }
        this.standup();
        this.T_WALK = 0;

        // if (typeof param == 'undefined') { param = {}; }
        // var bdash    = param.bdash  ||  false
        //   , distance = param.distance  ||  -1
        // ,   duration = param.duration  ||  -1
        // ;
        var bdash : Bool = param.get('bdash') || false;
        var distance : Int = param.get('distance') != null ? param.get('distance') : -1;
        var duration : Int = param.get('duration') != null ? param.get('duration') : -1;
        var x0 : Float = this.x;

        var self = this;
        this.TIMER_WALK = untyped setInterval(
            function () {
                self.update_velocity(
                    self.is_direction_right() ? 1 : -1,
                    bdash
                );
                // distance 指定時，その距離を経過したら静止する
                // duration 指定時，その時間が経過したら静止する
                if(
                    ( distance > 0  &&  Math.abs( x0 - self.x ) >= distance )  ||
                    ( duration > 0  &&  ++self.T_WALK * self.INTERVAL_WALK >= duration )
                ) {
                    self.stop();
                }
            },
            this.INTERVAL_WALK
        );
    }
    /**
     *
     *  止まる
     *
     **/
    public function stop () : Void {
        untyped clearInterval(this.TIMER_WALK);
    }
    /**
     *  ブレーキ（？）をかける
     *
     **/
    public function brake () : Void {
        if (this.flg_jump) { return; }
        this.flg_break = true;
        this.set_action('BREAK');
    }
    /**
     *  ジャンプする
     *
     **/
    public function jump () : Void {
        if (this.flg_jump) { return; }
        this.flg_jump = true;
        if ( ! this.flg_crouch ) {
            this.set_action('JUMP');
        }
        var Y_JUMP_START = this.y;

        var self = this;
        var t : Float = 0;
        this.TIMER_JUMP = untyped setInterval(
            function () {
                t += .05;
                self.VELOCITY_Y = self.ABILITY_JUMP - self.env.GRAVITY * t * t;
                self.y -= self.VELOCITY_Y;
                self.update_position();

                if ( self.y >= Y_JUMP_START ) {
                    untyped clearInterval(self.TIMER_JUMP);
                    self.VELOCITY_Y = 0;
                    self.y = Y_JUMP_START;
                    self.update_position();
                    self.flg_jump = false;
                }
            },
            40
        );
    }
    /**
     *  しゃがむ
     *
     **/
    public function crouch () : Void {
        untyped clearInterval(this.TIMER_WALK);
        if ( this.is_status_mini() ) { return; }
        if ( this.flg_jump )         { return; }
        this.flg_crouch = true;
        this.set_action('CROUCH');
    }
    /**
     *  泳ぐ
     *
     **/
    public function swim () : Void {
        this.set_action('SWIM');
    }
    /**
     *
     *  ミス
     *
     **/
    public function die ( param : Hash<Dynamic> ) : Void {
        // //param = param  ||  {};
        // var callback = param.get('callback');
        this.set_action('DIE');

        // if ( callback != null ) { callback(); }
        // else {
        //     this.body.parentNode.removeChild(this.body);
        // }
        // untyped delete this;
    }

    public function to_super () : Void {}
    public function to_mini () : Void {}
    public function to_fire () : Void {}
}
