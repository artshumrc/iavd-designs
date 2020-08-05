

function setHeights()
{
	var compare = new Array('nav2','main','extra');
	var maxHeight = 0;
	for (var i=0;i<compare.length;i++)
	{
		if (!document.getElementById(compare[i])) continue;
		document.getElementById(compare[i]).style.height = 'auto';
		var newHeight = document.getElementById(compare[i]).offsetHeight;
		if (newHeight > maxHeight) maxHeight = newHeight;
	}
	for (var i=0;i<compare.length;i++)
	{
		if (document.getElementById(compare[i]))
			document.getElementById(compare[i]).style.height = maxHeight + 'px';
	}
}

addEventSimple(window,"load",setHeights);
addEventSimple(window,"resize",setHeights);