(function () { "use strict";
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
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
var Reflect = function() { }
Reflect.__name__ = true;
Reflect.hasField = function(o,field) {
	return Object.prototype.hasOwnProperty.call(o,field);
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.getProperty = function(o,field) {
	var tmp;
	return o == null?null:o.__properties__ && (tmp = o.__properties__["get_" + field])?o[tmp]():o[field];
}
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && (v.__name__ || v.__ename__);
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { };
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		o2[f] = Reflect.field(o,f);
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
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
mario.Controller = function(params) {
	var self = this;
	if(params == null) params = new Hash();
	this.target = mario.Util.field_or_default(params,"target",null);
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
mario.Image = function() { }
mario.Image.__name__ = true;
mario.Mario = function(params) {
	this.ABILITY_JUMP = 6;
	this.ABILITY_BDASH = 2;
	this.ABILITY_ACCEL = .25;
	this.VELOCITY_Y = 0;
	this.VELOCITY_X = 0;
	this.VELOCITY_X_MAX = 5;
	this.VELOCITY_ZERO_RANGE = .4;
	this.INTERVAL_ANIMATION_DEFAULT = 100;
	this.INTERVAL_DAEMON_DEFAULT = 25;
	if(params == null) params = new Hash();
	var x = mario.Util.field_or_default(params,"x",0);
	var y = mario.Util.field_or_default(params,"y",0);
	var scale = mario.Util.field_or_default(params,"scale",1);
	var ability = null;
	var env = new mario.Env();
	var div_classname = mario.Util.field_or_default(params,"div_classname","mario");
	this.set_name();
	this.window = js.Lib.window;
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
		h.set("background","url(" + Reflect.field(mario.Image,$this.name)[$this.scale] + ") left top no-repeat");
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
		var bginfo = Reflect.field(mario.Mario.BGINFO,key);
		var index = mario.Util.f2i(bginfo.INDEX) + (this.is_direction_left()?1:0);
		var frames = bginfo.FRAMES;
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
		var bginfo = Reflect.field(mario.Mario.BGINFO,key);
		var index = Std.parseInt(Std.string(bginfo.INDEX)) + (this.is_direction_left()?1:0);
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
	,set_name: function() {
		this.name = "Mario";
	}
	,__class__: mario.Mario
}
mario.Luigi = function() {
	mario.Mario.call(this);
};
mario.Luigi.__name__ = true;
mario.Luigi.__super__ = mario.Mario;
mario.Luigi.prototype = $extend(mario.Mario.prototype,{
	set_name: function() {
		this.name = "Luigi";
	}
	,__class__: mario.Luigi
});
mario.Main = function() { }
mario.Main.__name__ = true;
mario.Main.main = function() {
	var w = js.Lib.window;
	w.Mario = mario.Mario;
	w.Luigi = mario.Luigi;
	mario.Mario.Controller = mario.Controller;
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
mario.Util.field_or_default = function(o,f,d) {
	return Reflect.hasField(o,f)?Reflect.field(o,f):d;
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
mario.Image.Mario = [null,"data:image/png;base64,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","data:image/png;base64,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"];
mario.Image.Luigi = [null,"data:image/png;base64,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","data:image/png;base64,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"];
mario.Mario.BGINFO = { MINI_STAND : { INDEX : 0, FRAMES : 1}, MINI_WALK : { INDEX : 2, FRAMES : 3}, MINI_BREAK : { INDEX : 4, FRAMES : 1}, MINI_JUMP : { INDEX : 6, FRAMES : 1}, MINI_SWIM1 : { INDEX : 8, FRAMES : 6}, MINI_SWIM2 : { INDEX : 10, FRAMES : 2}, MINI_SUPER : { iNDEX : 12, FRAMES : 1}, MINI_DIE : { INDEX : 14, FRAMES : 1}, SUPER_STAND : { INDEX : 15, FRAMES : 1}, SUPER_WALK : { INDEX : 17, FRAMES : 3}, SUPER_BREAK : { INDEX : 19, FRAMES : 1}, SUPER_JUMP : { INDEX : 21, FRAMES : 1}, SUPER_CROUCH : { INDEX : 23, FRAMES : 1}, SUPER_SWIM1 : { INDEX : 25, FRAMES : 6}, SUPER_SWIM2 : { INDEX : 27, FRAMES : 2}, SUPER_MINI : { iNDEX : 29, FRAMES : 1}, SUPER_DIE : { INDEX : 31, FRAMES : 1}, FIRE_STAND : { INDEX : 32, FRAMES : 1}, FIRE_WALK : { INDEX : 34, FRAMES : 3}, FIRE_BREAK : { INDEX : 36, FRAMES : 1}, FIRE_JUMP : { INDEX : 38, FRAMES : 1}, FIRE_CROUCH : { INDEX : 40, FRAMES : 1}, FIRE_SWIM1 : { INDEX : 42, FRAMES : 6}, FIRE_SWIM2 : { INDEX : 44, FRAMES : 2}, FIRE_MINI : { iNDEX : 46, FRAMES : 1}, FIRE_DIE : { INDEX : 48, FRAMES : 1}};
mario.Main.main();
})();

//@ sourceMappingURL=main.js.map