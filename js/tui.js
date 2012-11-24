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
	setTimeout(function() {
		e.onclick = fn;
	},0);
}

tui.addCls = function(e, c) {
	if(e) e.className += " " + (c.join ? c.join(' ') : c.toString());
}

tui.rmCls = function(e, c) {
	if(!e) return;
	if(typeof c === 'string') c = [c];
	for(var i = 0; i < c.length; i++) {
		e.className = e.className
		.replace(new RegExp("((^| +)"+c[i]+")+($| +)", 'g'), "$2")
		.replace(/ *$/, "").replace(/(^| ) +/, "$1");
	}
}

tui.hasCls = function(e, c) {
	return !!e.className
		.match(new RegExp("(^| +)"+c+"($| +)"))
}

tui.animate = function() {
	var a = arguments;
	a = a[0].join ? a : [ a ];
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
	for(var k in s) {
		e.style[k] = s[k];
		if(!CSS_PROP.test(k))
			continue;
		for(var p in CSS_PREFIX) {
			e.style[p + k[0].toUpperCase() + k.substr(1)] = s[k];
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
		else {
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
	var s = document.getElementsByTagName('section');
	for(var i = 0; i < s.length; i++) {
		tui.click(s[i], null);
	}
	tui.animate(tui.rmCls, tui.current, 'asideAt(Right|Left)', function() {
		tui.rmCls(a, 'current');
		if(a == tui.aside)
			delete tui.aside;
		cb && cb();
	});
	var l = document.links;
	for(var i = 0; i < l.length; i++) {
		var href = cleanHref(l[i].href);
		var t = document.getElementById(href.substr(1));
		if(t && t.nodeName.toLowerCase() === 'aside')
			tui.rmCls(l[i], 'selected');
	}
	return false;
}
