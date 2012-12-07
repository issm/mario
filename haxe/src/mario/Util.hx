package mario;
import js.Lib;
import js.Dom;

class Util {
    public static function elm ( name : String, ?attr : Hash<String>, ?css : Hash<String> ) : HtmlDom {
        var e = Lib.window.document.createElement(name);
        if ( attr != null ) { Util.attr(e, attr); }
        if ( css != null ) { Util.css(e, css); }
        return e;
    }

    public static function app ( elm : HtmlDom, elm_target : HtmlDom ) : HtmlDom {
        elm.appendChild(elm_target);
        return elm;
    }

    public static function attr ( e : HtmlDom, h : Hash<String> ) : HtmlDom {
        var itr = h.keys();
        while ( itr.hasNext() ) {
            var k = itr.next();
            e.setAttribute( k, h.get(k) );
        }
        return e;
    }

    public static function css ( e : HtmlDom, h : Hash<String> ) : HtmlDom {
        var itr = h.keys();
        while ( itr.hasNext() ) {
            var k = itr.next();
            //e.style[k] = h.get(k);
            //untyped __js__(e + '.style["' + k + '"] = ' + h.get(k));
            var v = h.get(k);
            var style = e.style;
            switch (k) {
                case 'position':           style.position = v;
                case 'overflow':           style.overflow = v;
                case 'zIndex':             style.zIndex = Std.parseInt(v);
                case 'width':              style.width = v + 'px';
                case 'height':             style.height = v + 'px';
                case 'background':         style.background = v;
                case 'backgroundPosition': style.backgroundPosition = v;
                case 'top':                style.top = v + 'px';
                case 'left':               style.left = v + 'px';
                default:
                    throw 'Util.css: unknown key: "' + k + '" !';
            }
        }
        return e;
    }

    public static function f2i ( n : Float ) : Int {
        return Std.parseInt( Std.string(n) );
    }

    public static function field_or_default ( o : Dynamic, f : String, d : Dynamic ) : Dynamic {
        return Reflect.hasField(o, f) ? Reflect.field(o, f) : d;
    }
}
