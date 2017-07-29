/**
 * Cookie Manager
 * 
 * Reads/writes to and from cookies
 */

var Cookies = window.Cookies || {};
(function() {
	var cookies;
	
	Cookies.read = function(name) {		
		if (cookies) return cookies[name];
		
		Cookies.refresh();
		return cookies[name];
	}
	
	Cookies.refresh = function() {
		var cookieList = document.cookie.split('; ');
		cookies = {};
		
		for (var i = 0; i < cookieList.length; i++) {
			var cookie = cookieList[i].split('=');
			cookies[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
		}
	}
	
	Cookies.write = function(name, value, days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		}
		
		document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
		Cookies.refresh();
	}
	
	Cookies.erase = function(name) {
		Cookies.write(name, "", -1);
	}
}());