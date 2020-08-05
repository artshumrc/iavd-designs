var targetDiv="mainContent"; // replace as needed

/** the next two functions are from PPK on JavaScript **/
var XMLHttpFactories = [
  function () {return new XMLHttpRequest()},
  function () {return new ActiveXObject("Msxml2.XMLHTTP")},
  function () {return new ActiveXObject("Msxml3.XMLHTTP")},
  function () {return new ActiveXObject("Microsoft.XMLHTTP")},
];

function createXMLHTTPObject() {
  var xmlhttp = false;
  for (var i=0;i<XMLHttpFactories.length;i++)
  {
    try {
      xmlhttp = XMLHttpFactories[i]();
    }
    catch (e) {
      continue;
    }
    break;
  }
  return xmlhttp;
}

function $(x){return document.getElementById(x);}

function loadDivFn(resId,fileName){
  send2id(fileName,"GET",null,resId);
}

function loadContent (fileName) {
    loadDivFn(targetDiv,fileName);
}

function send2id(url,method,val,resId){
  var req = createXMLHTTPObject();
  req.onreadystatechange=
    function(){
      if(req.readyState!=4)return;
      if(req.status!=200)return alert(req.status+"\n"+req.responseText);
/*
      if(!confirm("I'm about to load "+resId+" with HTML,"
            +" which MUST NOT have HTML headers as if it were a full page:\n"
            +req.responseText))return;
*/
      $(resId).innerHTML=req.responseText;
    };
  req.open(method, url, true);
  req.send(val);
}
