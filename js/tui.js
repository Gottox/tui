var TRUE = {1:1, 'true':1}

var xhr = {};

function initLinks() {
	for(var i = 0; i < document.links.length; i++) {
		var l = document.links[i];
		var hash = l.href.replace(tui.location.replace(/#.*/,''),"");
		if(hash[0] !== '#' && !TRUE[l.getAttribute('data-xhr')]) continue;
		click(l, (function(hash) { return function() {
			tui.open(hash);
			return true;
		}})(hash));
	}
}

function lst(c) {
	return new RegExp("((^| +)"+c+")+($| +)", 'g');
}

function initSections() {
	var sections = document.getElementsByTagName('section');
	for(var i = 0; i < sections.length; i++) {
		var s = sections[i];
		if(!tui.current || s.className.match(lst('current')))
			(tui.current = s).className += ' current';
	}
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

function fixate(e,s) {
	e.style.top = "-" + window.pageYOffset + "px";
	e.style.position = 'fixed';
	s && scrollTo(0,0)
}
function unfixate(e, s) {
	var t = parseInt(e.style.top);
	e.style.top = 0;
	e.style.position = 'absolute';
	s && scrollTo(0,-t);
}

function tui() {
	tui.location = tui.location || location.href;
	// workaround for iOS 5 rotate bug
	if(navigator.userAgent.match(/i(Phone|Pad).*5_[0-9]/))
		window.onorientationchange = function() {
			var scr = window.pageYOffset;
			document.body.style.display = 'none';
			setTimeout(function() {
				document.body.style.display = 'block';
				scrollTo(0, scr);
			},1);
		}
	initSections();
	initLinks();
	initImages();
}

function click(e, fn) {
	e.onclick = fn;
	return e;
}

function article() {
	var c = tui.current.childNodes;
	for(var i = 0; i < c.length; i++) {
		if(c[i].nodeName.toLowerCase() === 'article')
			return c[i];
	}
}

tui.closeAside = function() {
	tui.current.className = tui.current.className.replace(lst('to(Right|Left)'), " ");
	unfixate(article(), 1);
	fixate(tui.aside)
	setTimeout( function() {
		if(tui.aside) {
			tui.aside.className = tui.aside.className.replace(lst('current'), " ");
			unfixate(tui.aside)
		}
		delete tui.aside;
	}, 500);
	return tui;
}

tui.openAside = function(e) {
		setTimeout(function() {
			click(tui.current, function() {
				click(tui.current, null);
				tui.closeAside();
				return false;
			})
		}, 500);

		fixate(article(), 1)
		tui.current.className += e.className.match(lst("right")) ? ' toRight' : ' toLeft';
		(tui.aside = e).className += ' current';
}

tui.open = function(e) {
	if(e[0] === '#')
		e = document.getElementById(e.substr(1));
	else if(typeof e === 'string') {
		var r = new XMLHttpRequest();
		r.open("GET", e, false);
		r.onreadystatechange = function () {
			if (r.readyState != 4 || r.status != 200) return;
			var t = document.createElement('div');
			t.innerHTML = r.responseText.replace(/(<\/?)body( |>)/g, "$1foobar$2");
			t = t.getElementsByTagName('foobar');
			var d = document.createElement('span');
			d.innerHTML = t.innerHTML;
			xhr[e] = d;
			document.body.appendChild(d);
		};
		r.send("");
		return false;
	}
	switch(e.nodeName.toLowerCase()) {
	case 'aside':
		tui.openAside(e);
		break;
	case 'section':
		tui.closeAside().current.className = tui.current.className.replace(lst('current'), " ");
		(tui.current = e).className += ' current';
		break;
	default:
		location.href = '#' + e.id;
	}
	return tui;
}
