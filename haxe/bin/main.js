(function () { "use strict";
var Hash = function() {
	this.h = { };
};
Hash.__name__ = true;
Hash.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += Std.string("{");
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += Std.string(" => ");
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += Std.string(", ");
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: Hash
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
}
HxOverrides.strDate = function(s) {
	switch(s.length) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k = s.split("-");
		return new Date(k[0],k[1] - 1,k[2],0,0,0);
	case 19:
		var k = s.split(" ");
		var y = k[0].split("-");
		var t = k[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
}
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var IntIter = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = true;
IntIter.prototype = {
	next: function() {
		return this.min++;
	}
	,hasNext: function() {
		return this.min < this.max;
	}
	,__class__: IntIter
}
var Std = function() { }
Std.__name__ = true;
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	return x | 0;
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	toString: function() {
		return this.b;
	}
	,addSub: function(s,pos,len) {
		this.b += HxOverrides.substr(s,pos,len);
	}
	,addChar: function(c) {
		this.b += String.fromCharCode(c);
	}
	,add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
}
var haxe = {}
haxe.Log = function() { }
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.Timer = function(time_ms) {
	var me = this;
	this.id = window.setInterval(function() {
		me.run();
	},time_ms);
};
haxe.Timer.__name__ = true;
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.measure = function(f,pos) {
	var t0 = haxe.Timer.stamp();
	var r = f();
	haxe.Log.trace(haxe.Timer.stamp() - t0 + "s",pos);
	return r;
}
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
}
haxe.Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.id == null) return;
		window.clearInterval(this.id);
		this.id = null;
	}
	,__class__: haxe.Timer
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.isClass = function(o) {
	return o.__name__;
}
js.Boot.isEnum = function(e) {
	return e.__ename__;
}
js.Boot.getClass = function(o) {
	return o.__class__;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
js.Lib = function() { }
js.Lib.__name__ = true;
js.Lib.debug = function() {
	debugger;
}
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib["eval"] = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
var mario = {}
mario.Controller = function(param) {
	var self = this;
	this.target = param.get("target");
	var doc = js.Lib.document;
	var doc_onkeydown_stash = doc.onkeydown;
	var doc_onkeyup_stash = doc.onkeyup;
	doc.onkeydown = function(ev) {
		self.keydown(ev);
		if(doc_onkeydown_stash != null) doc_onkeydown_stash(ev);
	};
	doc.onkeyup = function(ev) {
		self.keyup(ev);
		if(doc_onkeyup_stash != null) doc_onkeyup_stash(ev);
	};
	this.UE = 0;
};
mario.Controller.__name__ = true;
mario.Controller.prototype = {
	keyup: function(ev) {
		var target = this.target;
		switch(ev.keyCode) {
		case mario.Controller.KEYCODE.LEFT:
			break;
		case mario.Controller.KEYCODE.RIGHT:
			break;
		case mario.Controller.KEYCODE.UP:
			break;
		case mario.Controller.KEYCODE.DOWN:
			target.standup();
			break;
		}
	}
	,keydown: function(ev) {
		var is_b_dash = ev.ctrlKey;
		var target = this.target;
		switch(ev.keyCode) {
		case mario.Controller.KEYCODE.LEFT:
			target.update_velocity(-1,is_b_dash);
			break;
		case mario.Controller.KEYCODE.RIGHT:
			target.update_velocity(1,is_b_dash);
			break;
		case mario.Controller.KEYCODE.UP:
			target.jump();
			break;
		case mario.Controller.KEYCODE.DOWN:
			target.crouch();
			break;
		}
	}
	,__class__: mario.Controller
}
mario.Env = function() {
	this.GRAVITY = 9.8;
	this.SWIMMABLE = false;
};
mario.Env.__name__ = true;
mario.Env.prototype = {
	swimmable: function() {
		return this.SWIMMABLE;
	}
	,__class__: mario.Env
}
mario.Main = function() { }
mario.Main.__name__ = true;
mario.Main.main = function() {
	window.mario = new mario.Mario();
	var c = new mario.Controller((function($this) {
		var $r;
		var h = new Hash();
		h.set("target",window.mario);
		$r = h;
		return $r;
	}(this)));
}
mario.Mario = function() {
	this.ABILITY_JUMP = 6;
	this.ABILITY_BDASH = 2;
	this.ABILITY_ACCEL = .25;
	this.VELOCITY_Y = 0;
	this.VELOCITY_X = 0;
	this.VELOCITY_X_MAX = 5;
	this.VELOCITY_ZERO_RANGE = .4;
	this.INTERVAL_ANIMATION_DEFAULT = 100;
	this.INTERVAL_DAEMON_DEFAULT = 25;
	var x = 100;
	var y = 300;
	var scale = 2;
	var env = new mario.Env();
	var div_classname = "mario";
	this.window = js.Lib.window;
	this.name = "MARIO";
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
	this.flg_jump = false;
	this.flg_break = false;
	this.flg_crouch = false;
	this.body = mario.Util.elm("div",(function($this) {
		var $r;
		var h = new Hash();
		h.set("id","mario-made-by-javascript");
		h.set("className",div_classname);
		$r = h;
		return $r;
	}(this)),(function($this) {
		var $r;
		var h = new Hash();
		h.set("position","absolute");
		h.set("overflow","hidden");
		h.set("zIndex",Std.string(2147483600));
		h.set("width",Std.string($this.width));
		h.set("height",Std.string($this.height));
		h.set("background","url(" + mario.Mario.BGDATA[$this.scale] + ") left top no-repeat");
		$r = h;
		return $r;
	}(this)));
	this.env = env;
	this.DIRECTION = "RIGHT";
	this.STATUS = "MINI";
	this.B_DASH = false;
	this.ACTION = "STAND";
	this.method_stack = [];
	this.update_position();
	this.start();
};
mario.Mario.__name__ = true;
mario.Mario.prototype = {
	to_fire: function() {
	}
	,to_mini: function() {
	}
	,to_super: function() {
	}
	,die: function(param) {
		this.set_action("DIE");
	}
	,swim: function() {
		this.set_action("SWIM");
	}
	,crouch: function() {
		clearInterval(this.TIMER_WALK);
		if(this.is_status_mini()) return;
		if(this.flg_jump) return;
		this.flg_crouch = true;
		this.set_action("CROUCH");
	}
	,jump: function() {
		if(this.flg_jump) return;
		this.flg_jump = true;
		if(!this.flg_crouch) this.set_action("JUMP");
		var Y_JUMP_START = this.y;
		var self = this;
		var t = 0;
		this.TIMER_JUMP = setInterval(function() {
			t += .05;
			self.VELOCITY_Y = self.ABILITY_JUMP - self.env.GRAVITY * t * t;
			self.y -= self.VELOCITY_Y;
			self.update_position();
			if(self.y >= Y_JUMP_START) {
				clearInterval(self.TIMER_JUMP);
				self.VELOCITY_Y = 0;
				self.y = Y_JUMP_START;
				self.update_position();
				self.flg_jump = false;
			}
		},40);
	}
	,brake: function() {
		if(this.flg_jump) return;
		this.flg_break = true;
		this.set_action("BREAK");
	}
	,stop: function() {
		clearInterval(this.TIMER_WALK);
	}
	,walk: function(param) {
		if(this.VELOCITY_X > 0) return;
		this.standup();
		this.T_WALK = 0;
		var bdash = param.get("bdash");
		var distance = param.get("distance") != null?param.get("distance"):-1;
		var duration = param.get("duration") != null?param.get("duration"):-1;
		var x0 = this.x;
		var self = this;
		this.TIMER_WALK = setInterval(function() {
			self.update_velocity(self.is_direction_right()?1:-1,bdash);
			if(distance > 0 && Math.abs(x0 - self.x) >= distance || duration > 0 && ++self.T_WALK * self.INTERVAL_WALK >= duration) self.stop();
		},this.INTERVAL_WALK);
	}
	,standup: function() {
		this.flg_crouch = false;
		this.set_action(this.flg_jump?"JUMP":"STAND");
	}
	,left: function() {
		if(this.flg_jump) return;
		if(!this.flg_break && this.is_direction_left()) return;
		this.DIRECTION = "LEFT";
		this.switch_bg();
	}
	,right: function() {
		if(this.flg_jump) return;
		if(!this.flg_break && this.is_direction_right()) return;
		this.DIRECTION = "RIGHT";
		this.switch_bg();
	}
	,daemon: function() {
		var self = this;
		this.TIMER_DAEMON = setInterval(function() {
			var v_x = self.VELOCITY_X;
			v_x *= .89;
			self.x += v_x;
			if(Math.abs(v_x) <= self.VELOCITY_ZERO_RANGE) {
				v_x = 0;
				if(self.flg_break) self.flg_break = false;
				if(self.VELOCITY_Y == 0) {
					if(!self.flg_crouch) self.standup();
				} else if(!self.flg_crouch) self.set_action("JUMP");
				self.INTERVAL_ANIMATION = self.INTERVAL_ANIMATION_DEFAULT;
			}
			self.VELOCITY_X = v_x;
			self.set_position(self.x,self.y);
		},this.INTERVAL_DAEMON);
	}
	,start: function() {
		this.switch_bg();
		this.daemon();
		mario.Util.app(this.window.document.body,this.body);
	}
	,update_velocity: function(v,flg_bdash) {
		if(v == null) v = 0;
		switch(true) {
		case v < 0:
			this.left();
			if(this.VELOCITY_X == 0) this.VELOCITY_X = -this.VELOCITY_ZERO_RANGE;
			this.VELOCITY_X -= this.ABILITY_ACCEL * (flg_bdash?this.ABILITY_BDASH:1);
			if(this.VELOCITY_X > this.VELOCITY_ZERO_RANGE) this.brake(); else if(!this.flg_jump) this.set_action("WALK");
			break;
		case v > 0:
			this.right();
			if(this.VELOCITY_X == 0) this.VELOCITY_X = this.VELOCITY_ZERO_RANGE;
			this.VELOCITY_X += this.ABILITY_ACCEL * (flg_bdash?this.ABILITY_BDASH:1);
			if(this.VELOCITY_X < this.VELOCITY_ZERO_RANGE) this.brake(); else if(!this.flg_jump) this.set_action("WALK");
			break;
		}
	}
	,update_interval: function() {
	}
	,switch_animation: function() {
		var self = this;
		var key = [this.STATUS,this.ACTION].join("_");
		var index = mario.Util.f2i(mario.Mario.BGINFO[key].INDEX) + (this.is_direction_left()?1:0);
		var frames = mario.Mario.BGINFO[key].FRAMES;
		clearInterval(this.TIMER_ANIMATION);
		this.TIMER_ANIMATION = setInterval(function() {
			self.FRAME_ANIMATION = ++self.FRAME_ANIMATION % frames;
			self.set_bg_position(key,index,self.FRAME_ANIMATION);
		},this.INTERVAL_ANIMATION);
	}
	,set_bg_position: function(key,index,frame) {
		this.BGPOS_TOP = -this.height * frame;
		this.BGPOS_LEFT = -this.width * index;
		mario.Util.css(this.body,(function($this) {
			var $r;
			var h = new Hash();
			h.set("backgroundPosition",Std.string($this.BGPOS_LEFT) + "px " + Std.string($this.BGPOS_TOP) + "px");
			$r = h;
			return $r;
		}(this)));
	}
	,switch_bg: function() {
		var key = [this.STATUS,this.ACTION].join("_");
		var index = Std.parseInt(Std.string(mario.Mario.BGINFO[key].INDEX)) + (this.is_direction_left()?1:0);
		this.set_bg_position(key,index,0);
		this.switch_animation();
	}
	,update_position: function() {
		this.set_position(this.x,this.y);
	}
	,set_position: function(x,y) {
		mario.Util.css(this.body,(function($this) {
			var $r;
			var h = new Hash();
			h.set("top",Std.string(mario.Util.f2i(y - $this.height)));
			h.set("left",Std.string(mario.Util.f2i(x)));
			$r = h;
			return $r;
		}(this)));
	}
	,is_direction_left: function() {
		return this.DIRECTION == "LEFT";
	}
	,is_direction_right: function() {
		return this.DIRECTION == "RIGHT";
	}
	,is_action_die: function() {
		return this.ACTION == "DIE";
	}
	,is_action_swim2: function() {
		return this.ACTION == "SWIM2";
	}
	,is_action_swim1: function() {
		return this.ACTION == "SWIM1";
	}
	,is_action_crouch: function() {
		return this.ACTION == "CROUCH";
	}
	,is_action_jump: function() {
		return this.ACTION == "JUMP";
	}
	,is_action_walk: function() {
		return this.ACTION == "WALK";
	}
	,is_action_stand: function() {
		return this.ACTION == "STAND";
	}
	,is_status_fire: function() {
		return this.STATUS == "FIRE";
	}
	,is_status_super: function() {
		return this.STATUS == "SUPER";
	}
	,is_status_mini: function() {
		return this.STATUS == "MINI";
	}
	,set_action: function(a) {
		if(this.ACTION == a) return false;
		this.ACTION = a;
		this.switch_bg();
		return true;
	}
	,set_status: function(s) {
		this.STATUS = s;
		this.switch_bg();
		return true;
	}
	,__class__: mario.Mario
}
mario.Util = function() { }
mario.Util.__name__ = true;
mario.Util.elm = function(name,attr,css) {
	var e = js.Lib.window.document.createElement(name);
	if(attr != null) mario.Util.attr(e,attr);
	if(css != null) mario.Util.css(e,css);
	return e;
}
mario.Util.app = function(elm,elm_target) {
	elm.appendChild(elm_target);
	return elm;
}
mario.Util.attr = function(e,h) {
	var itr = h.keys();
	while(itr.hasNext()) {
		var k = itr.next();
		e.setAttribute(k,h.get(k));
	}
	return e;
}
mario.Util.css = function(e,h) {
	var itr = h.keys();
	while(itr.hasNext()) {
		var k = itr.next();
		var v = h.get(k);
		var style = e.style;
		switch(k) {
		case "position":
			style.position = v;
			break;
		case "overflow":
			style.overflow = v;
			break;
		case "zIndex":
			style.zIndex = Std.parseInt(v);
			break;
		case "width":
			style.width = v + "px";
			break;
		case "height":
			style.height = v + "px";
			break;
		case "background":
			style.background = v;
			break;
		case "backgroundPosition":
			style.backgroundPosition = v;
			break;
		case "top":
			style.top = v + "px";
			break;
		case "left":
			style.left = v + "px";
			break;
		default:
			throw "Util.css: unknown key: \"" + k + "\" !";
		}
	}
	return e;
}
mario.Util.f2i = function(n) {
	return Std.parseInt(Std.string(n));
}
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var Void = { __ename__ : ["Void"]};
if(typeof document != "undefined") js.Lib.document = document;
if(typeof window != "undefined") {
	js.Lib.window = window;
	js.Lib.window.onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if(f == null) return false;
		return f(msg,[url + ":" + line]);
	};
}
mario.Controller.KEYCODE = { LEFT : 37, RIGHT : 39, UP : 38, DOWN : 40};
mario.Mario.BGINFO = { MINI_STAND : { INDEX : 0, FRAMES : 1}, MINI_WALK : { INDEX : 2, FRAMES : 3}, MINI_BREAK : { INDEX : 4, FRAMES : 1}, MINI_JUMP : { INDEX : 6, FRAMES : 1}, MINI_SWIM1 : { INDEX : 8, FRAMES : 6}, MINI_SWIM2 : { INDEX : 10, FRAMES : 2}, MINI_SUPER : { iNDEX : 12, FRAMES : 1}, MINI_DIE : { INDEX : 14, FRAMES : 1}, SUPER_STAND : { INDEX : 15, FRAMES : 1}, SUPER_WALK : { INDEX : 17, FRAMES : 3}, SUPER_BREAK : { INDEX : 19, FRAMES : 1}, SUPER_JUMP : { INDEX : 21, FRAMES : 1}, SUPER_CROUCH : { INDEX : 23, FRAMES : 1}, SUPER_SWIM1 : { INDEX : 25, FRAMES : 6}, SUPER_SWIM2 : { INDEX : 27, FRAMES : 2}, SUPER_MINI : { iNDEX : 29, FRAMES : 1}, SUPER_DIE : { INDEX : 31, FRAMES : 1}, FIRE_STAND : { INDEX : 32, FRAMES : 1}, FIRE_WALK : { INDEX : 34, FRAMES : 3}, FIRE_BREAK : { INDEX : 36, FRAMES : 1}, FIRE_JUMP : { INDEX : 38, FRAMES : 1}, FIRE_CROUCH : { INDEX : 40, FRAMES : 1}, FIRE_SWIM1 : { INDEX : 42, FRAMES : 6}, FIRE_SWIM2 : { INDEX : 44, FRAMES : 2}, FIRE_MINI : { iNDEX : 46, FRAMES : 1}, FIRE_DIE : { INDEX : 48, FRAMES : 1}};
mario.Mario.BGDATA = [null,"data:image/png;base64,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","data:image/png;base64,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"];
mario.Main.main();
})();

//@ sourceMappingURL=main.js.map