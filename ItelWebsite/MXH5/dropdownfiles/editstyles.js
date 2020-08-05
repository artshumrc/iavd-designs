var sheetRules; // all rules in stylesheet Set by initStyleChange()
var currentRule; // which rule are we editing? Set by assignRule()
var defaultStyles = new Array();

function initStyleChange() {
	if (!document.styleSheets) return;
	var sheets = document.styleSheets;
	for (var i=0;i<sheets.length;i++) {
		var ssName = sheets[i].href.substring(sheets[i].href.lastIndexOf('/')+1);
		if (ssName == 'colors.css')
		var currentSheet = sheets[i];
	}
	if (!currentSheet) return;
	if (currentSheet.cssRules)
		sheetRules = currentSheet.cssRules
	else if (currentSheet.rules)
		sheetRules = currentSheet.rules;
	else return;
	var selectorSelect = document.forms[0].selectors;
	var previousSelector = readCookie('selector') || null;
	for (var i=0;i<sheetRules.length;i++) {
		var value = sheetRules[i].selectorText;
		var text = sheetRules[i].style.description || value;
		selectorSelect.options[selectorSelect.options.length] = new Option(text,value);
		if (previousSelector == value) {
			selectorSelect.options[selectorSelect.options.length-1].selected = true;
			currentRule = sheetRules[i];
		}
	}
	document.getElementById('selectors').onchange = assignRule;
	document.getElementById('restoreDefaults').onclick = restoreDefaults;

	var els = document.forms[1].elements;
	for (var i=0;i<els.length;i++) {	
		els[i].onchange = assignStyles;
		els[i].onchange();
	}
	
	var links = document.getElementsByTagName('a');
	for (var i=0;i<links.length;i++) {
		if (links[i].className != 'colorPicker') continue;
		links[i].onclick = placeColorPicker;
		var targeted = links[i].parentNode.getAttribute('for') || links[i].parentNode.getAttribute('htmlFor');
		links[i].targetElement = document.forms[1].elements[targeted];
	}	
}

function assignRule() {
	var selector = this.value;
	if (!selector) return;
	for (var i=0;i<sheetRules.length;i++)
		if (sheetRules[i].selectorText.toLowerCase() == selector.toLowerCase())
			currentRule = sheetRules[i];
	setFormValues();
}

function assignStyles() {
	if (!currentRule) return;
	var styleName = this.name;
	var styleValue = this.value;
	if (this.type == 'checkbox' && !this.checked)
		styleValue = '';
	currentRule.style[styleName] = styleValue;    
}

function setFormValues() {
	document.forms[1].reset();
	var styles = currentRule.style;
	for (var i in styles) {
		if (styles[i] && isNaN(i) && typeof styles[i] == 'string') { // Moz needs thorough check
			defaultStyles[i] = styles[i];
			var relatedField = document.forms[1].elements[i];
			if (relatedField && relatedField.style) {
				switch (relatedField.type) {
					case "text":
						relatedField.value = styles[i];
						break;
					case "checkbox":
						if (relatedField.value == styles[i])
							relatedField.checked = true;
						break;
					case "select-one":
						for (var j=0;j<relatedField.options.length;j++)
							if (relatedField.options[j].value == styles[i])
								relatedField.options[j].selected = true;
				}
			}
		}
	}
}

function restoreDefaults() {
	for (var i in defaultStyles) 
		if (defaultStyles[i] && isNaN(i) && typeof defaultStyles[i] == 'string') // all exceptions for ModefaultStyles
				currentRule.style[i] = defaultStyles[i];
	setFormValues();
}

function saveSelector() {
	if (!currentRule) return;
//	createCookie('selector',currentRule.selectorText,1);
}

addEventSimple(window,"load",initStyleChange);
addEventSimple(window,"unload",saveSelector);

var colorPicker;

function createColorPicker() {
	var container = document.createElement('div');
	container.className = 'colorPicker';
	var data = ['00','33','66','99','cc','ff'];
	for (var blue=0;blue<data.length;blue++) {
		for (var green=0;green<data.length;green++) {
			for (var red=0;red<data.length;red++) {
				var colorHolder = document.createElement('div');
				var color = '#' + data[red] + data[green] + data[blue];
				colorHolder.style.backgroundColor = color;
				colorHolder.onclick = enterColor;
				colorHolder.onmouseover = function () {
					this.style.borderWidth = '3px';
					this.style.width = '6px';
					this.style.height = '6px';
				}
				colorHolder.onmouseout = function () {
					this.style.borderWidth = '';
					this.style.width = '';
					this.style.height = '';
				}
				container.appendChild(colorHolder);
			}
		}
	}
	document.getElementById('sitecontainer').appendChild(container);
	return container;
}

function placeColorPicker() {
	if (!colorPicker) colorPicker = createColorPicker();
	var coors = findPos(this);
	colorPicker.style.top = coors[1] - 20 + 'px';
	colorPicker.style.left = 0;
	colorPicker.style.visibility = 'visible';
	colorPicker.targetElement = this.targetElement;
	return false;
}

function enterColor() {
	var color = this.style.backgroundColor;
	colorPicker.targetElement.value = color;
	colorPicker.targetElement.onchange();
	colorPicker.style.visibility = 'hidden';
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	return [curleft,curtop];
}