var ANIMATE_DURATION = 500;
var CSS_PROP = /^(animation|backgroundSize|borderRadius|boxShadow|boxSizing|columns|opacity|transform|textShadow|transition)/;
var CSS_PREFIX = {webkit:1,Ms:1,Moz:1,O:1}; 

var CACHE = {};

var TRUE = {'1':1, 'true':1};

function tui() {
	initHash();
	initSection();
	initLinks();
	initImages();
}

function initHash() {
	window.onhashchange = function() {
		if(location.hash)
			tui.open(location.hash);
		else
			tui.open(tui.default);
	}
}

function initSection() {
	var s = document.getElementsByTagName('section');
	tui.default = s[0];
	for(var i = 0; i < s.length; i++) {
		if(tui.hasCls(s[i], 'current')) {
			tui.rmCls(s[i], 'current')
			tui.default = s[i];
		}
	}
	tui.open(location.hash || tui.default);
}

function initImages() {
	(window.onscroll = function() {
		for(var i = 0; i < document.images.length; i++) {
			var m = document.images[i];
			var src= m.getAttribute('data-lazy-src');
			var scr = window.pageYOffset;
			if(src && m.offsetTop+m.offsetHeight > scr && scr + window.innerHeight > m.offsetTop) {
				m.src = src;
				m.removeAttribute('data-lazy-src');
			} 
		}
	})();
}


function cleanHref(h) {
		return h.replace(location.href.replace(/#.*/,''),"");
}

function initLinks() {
	var l = document.links;
	for(var i = 0; i < l.length; i++) {
		var href = cleanHref(l[i].href)
		if(href[0] !== '#' && !TRUE[l[i].getAttribute('data-xhr')])
			continue;
		if(!l[i].onclick) tui.click(l[i], function() {
			tui.open(cleanHref(this.href), this.getAttribute('data-animation'))
			this.blur();
			return false;
		})
	}
}

tui.click = function(e, fn) {
	setTimeout(function() { tui.each(e, function(e) {
		var ev;
		if(!(ev = e.getAttribute('data-trigger')))
			ev = 'click';
		e.onclick = function() {return false};
		ev = ev.split(/\W+/);
		for(var i = 0; i < ev.length; i++)
			e['on'+ev[i]] = fn;
	}); },0);
}

tui.addCls = function(e, c) {
	tui.each(e, function(e) {
		e.className += " " + (c.join ? c.join(' ') : c.toString());
	})
}

tui.rmCls = function(e, c) {
	if(tui.isArr(c)) c = c.join('|');
	tui.each(e, function(e) {
		e.className = e.className
			.replace(new RegExp("(^| +)"+ c +"($| +)", 'g'), "$1")
			.replace(/ *$/, "").replace(/(^| ) +/, "$1");
	});
}

tui.isObj = function(obj) {
	if ( toString.call(obj) !== "[object Object]" )
		return false;
	var key;
	for ( key in obj ) {}
	return !key || hasOwnProp.call( obj, key );
}

tui.isArr = function(obj, strict) {
	var str = obj.constructor.toString();
	if(!strict && (str.match(/NodeList|HTMLCollection/)))
		return true;
	return str.indexOf("Array") != -1;
}

tui.hasCls = function(e, c) {
	if(tui.isArr(e)) e = e[0];
	return !!e.className
		.match(new RegExp("(^| +)"+c+"($| +)"))
}

tui.each = function(obj, fn) {
	if(!obj)
		return;
	var call = function(item, key) {
		var r = fn.apply(0, arguments);
		return r === undefined ? true : !!r;
	}
	if(tui.isArr(obj)) {
		for(var i = 0; i < obj.length; i++) {
			if(!call(obj[i], i)) break;
		}
	}
	else if(tui.isObj(obj)) {
		for(var i in obj) {
			if(obj.hasOwnProperty(i))
				if(!call(obj[i], i)) break;
		}
	}
	else {
		call(obj, null);
	}
}

tui.animate = function() {
	var a = Array.prototype.slice.call(arguments);
	if(!tui.isArr(a[0])) a = [ a ];
	var fn = arguments[arguments.length - 1];
	setTimeout(function() {
		for(var i = 0; i < a.length && typeof a[i][0] === 'function'; i++) {
			a[i][0](a[i][1], a[i][2]);
			tui.addCls(a[i][1], 'animate');
		}
		setTimeout(function() {
			for(var i = 0; i < a.length; i++) {
				tui.rmCls(a[i][1], 'animate');
			}
			typeof fn === 'function' && fn();
		}, ANIMATE_DURATION);
	}, 0);
}

tui.css = function(e, s) {
	tui.each(e, function(e) {
		for(var k in s) {
			var ok = k;
			for(var p in CSS_PREFIX) {
				if(k in e.style)
					break;
				k = p + ok[0].toUpperCase() + ok.substr(1);
			}
			if(k in e.style)
				e.style[k] = s[ok];
			else
				transform(e, s[ok]);
		}
	});
	if(!e.push) e = [ e ]
}

function transform(e, t) {
	for(var p in CSS_PREFIX) {
		if(p + 'Transform' in e.style || 'transform' in e.style)
			return;
	}

	if(t == "")
		return e.style.marginLeft = e.style.marginTop = 0;
	t = t.replace(/^\s+|\s+$/, "").split(/\)\s+/);
	for(var i = 0; i < t.length; i++) {
		var p = t[i].split(/\(\s*/, 2);
		var n = p[0];
		var v = p[1].split(/\s*,\s*/);
		switch(n) {
		case 'translate':
			e.style.marginLeft = (v[0]);
			e.style.marginTop = (v[1]);
			break;
		case 'translateX':
			e.style.marginLeft = (v[0]);
			break;
		case 'translateY':
			e.style.marginTop = (v[0]);
			break;
		}
	}
}

tui.open = function(u, a) {
	var e;
	if(typeof u === 'string') {
		if(u[0] !== '#')
			return false;
		e = document.getElementById(u.substr(1));
	}
	else {
		e = u;
	}
	if(!e)
		return;
	switch(e.nodeName.toLowerCase()) {
	case 'section':
		var dirIn = ''
		  , old = tui.current;
		switch(a) {
		case 'left':
			dirIn = 'leftOut';
			break;
		case 'right':
			dirIn = 'rightOut';
			break;
		}
		if(tui.current === e || tui.hasCls(e, 'animate'))
			return false;
		tui.current = e;
		location.hash = e === tui.default ? "" : e.id;
		if(window.pageYOffset != 0)
			scrollTo(0,0);
		tui.addCls(e, [dirIn, 'current']);
		tui.animate(
			[tui.rmCls, e, dirIn],
			function() {
				tui.asideClose();
				tui.rmCls(old, 'current|(left|right)Out|asideAt(Right|Left)');
			});
	break;
	case 'aside':
		tui.asideClose()
		tui.addCls(e, 'current');
		tui.animate(tui.addCls, tui.current, tui.hasCls(e, 'right') ? 'asideAtRight' : 'asideAtLeft');
		tui.aside = e;
		tui.click(tui.current, function() {
			tui.asideClose()
		});
	break;
	}
	var l = document.links;
	for(var i = 0; i < l.length; i++) {
		var href = cleanHref(l[i].href);
		if(href === '#' + e.id)
			tui.addCls(l[i], 'selected');
		else if(href[0] === '#'){
			var t = document.getElementById(href.substr(1));
			if(t && t.nodeName === e.nodeName)
				tui.rmCls(l[i], 'selected');
		}
	}
}

tui.asideClose = function(cb) {
	var a = tui.aside;
	if(!a) {
		cb && cb();
		return false;
	}
	tui.each(document.getElementsByTagName('section'), function(s) {
		tui.click(s, null);
	});
	tui.animate(tui.rmCls, tui.current, 'asideAt(Right|Left)', function() {
		tui.rmCls(a, 'current');
		if(a == tui.aside)
			delete tui.aside;
		cb && cb();
	});
	tui.each(document.links, function(l) {
		var href = cleanHref(l.href);
		var t = document.getElementById(href.substr(1));
		if(t && t.nodeName.toLowerCase() === 'aside')
			tui.rmCls(l, 'selected');
	})
	return false;
}
