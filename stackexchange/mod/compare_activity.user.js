// ==UserScript==
// @name         Admin Activity Comparison
// @namespace    http://artofcode.co.uk
// @version      0.1
// @description  Add a link to compare activity to admin/links and the user menu
// @author       ArtOfCode
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @match        *://*.askubuntu.com/*
// @grant        none
// ==/UserScript==

'use strict';


$(document).ready(function() {
	
	var userRegex = /^\/users\/([0-9])+/g;
	
	function getFormattedDates(date1Relative, date2Relative) {
		var date1 = new Date(), date2 = new Date();
		date1.setDate(date1.getDate() + date1Relative);
		date2.setDate(date2.getDate() + date2Relative);
		
		function format(inputDate) {
			return (inputDate.getYear() + 1900).toString() + "/" + inputDate.getMonth().toString() + "/" + inputDate.getDate().toString();
		}
		
		return [format(date1), format(date2)];
	}
	
	if(location.pathname === "/admin/links") {
		$(".content-page").children("ul").first()
		.append("<li><a href='/admin/user-activity'>Compare user activity</a></li>");
	}
	
	if(location.pathname.match(userRegex)) {
		$("body").on("DOMNodeInserted", function(e) {
			if($(e.target).hasClass("user-mod-popup")) {
				var list = $(e.target).children("div#tab-info").children("ul.action-list");
				var dates = getFormattedDates(0, -10);
				var uid = userRegex.exec(location.pathname)[0];
				var url = "/admin/user-activity#{0}|{1}|{2}"
					.replace("{0}", dates[1])
					.replace("{1}", dates[0])
					.replace("{2}", uid.toString());
				var html = '<li><a class="action-name" href="' + url + '">compare activity</a><label class="action-label"><span class="action-desc">Compare this user\'s active times to other users.</span></label></li>';
				list.append(html);
			}
		});
	}
	
});
