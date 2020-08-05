/** 
Copyright 2007 N-Topus Software Tom Myers, AD Nakhimovsky
   tommyers@dreamscape.com adnakhimovsky@colgate.edu 

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the License for the specific
language governing permissions and limitations under the License.
**/
/**
  *  ppgd.js initial version, defines a "chatter" object which
  *    manages a chat via AJAX.
  *  
**/

function send(url,method,val){
  var request = new XMLHttpRequest(); 
  request.open(method, url, false); 
  request.send(val); 
  alert("status="+request.status);
  var text=request.responseText;
  try{
    alert("xml?="+doc2String(request.responseXML));
  }catch(e){alert("xml error:"+e);}
  return text;
}

function send2id(url,method,val,resId){
  var req = new XMLHttpRequest(); 
  req.onreadystatechange=
    function(){
      if(req.readyState!=4)return;
      if(req.status!=200)return alert(req.status+"\n"+req.responseText);
      $(resId).innerHTML=req.responseText;
    };
  req.open(method, url, true); 
  req.send(val); 
}


function doc2String(doc){
  var xmlSerializer=new XMLSerializer();
  return xmlSerializer.serializeToString(doc);
}
function string2doc(str){
  var domParser=new DOMParser();
  return domParser.parseFromString(str, 'text/xml');
}

function reqHandlerClosure(reqHandler,okStatus,extraData){
  var req=new XMLHttpRequest();
  if(!okStatus)okStatus=200;
  req.onreadystatechange= function(){
    if(req.readyState!=4)return;
    if(req.status!=okStatus)return alert(req.status+"\n"+req.responseText);
    reqHandler(req,extraData);
    }
  return req;
}
 
// and we use this to handle reqHandlers, such as

function getEntryCallBack(req,fileName){
  // alert("response text = "+req.responseText);
  var postId=noExtFileName(fileName);
  if(!postId)return alert("getEntryCallBack: "+fileName+" has no postId");
  if(!$(postId))return alert("getEntryCallBack: "+postId+" has no element");
  // alert("postId="+postId+", val="+req.responseText);
  $(postId).innerHTML='['+postId+']'+req.responseText;
}
function noExtFileName(fileName){
  return fileName.substring(0,fileName.indexOf('.'));
}
function getFeedCallBack(req){
  // alert("response text = "+req.responseText);
  var doc=req.responseXML;
  var entries=doc.getElementsByTagName("entry");
  var newEntries=sliceArray(entries,chatter.entries.length,entries.length);
  if(newEntries.length==0)return;
  var fileNames=new Array();
  var divHtml="";
  for(var i=0;i<newEntries.length;i++){
      var fileName=newEntries[i].firstChild.nodeValue;
      var postId=noExtFileName(fileName);
      fileNames.push(fileName);
      divHtml="<div id='"+postId+"'>x</div>\n"+divHtml;
  }
  var resultsDiv=$(chatter.resId);
  resultsDiv.innerHTML=divHtml+resultsDiv.innerHTML;
  // alert("resultsDiv.innerHTML="+resultsDiv.innerHTML);
  for(var i=0;i<fileNames.length;i++)
    chatter.getEntry(fileNames[i]);
  chatter.entries=entries;
}
function postEntryCallBack(req){
   alert("Post response status = "+req.status+", text = "+req.responseText+", Location = "+req.getResponseHeader('Location'));
}
function putEntryCallBack(req){
   alert("put response status = "+req.status+", text = "+req.responseText+", Location = "+req.getResponseHeader('Location'));
}
function deleteEntryCallBack(req){
   alert("Del response status = "+req.status+", text = "+req.responseText);
}
function getEntryToTextAreaCallBack (req,fileName){
  $(chatter.textAreaId).value=req.responseText;
  $(chatter.textAreaId).form.fileName.value=fileName;
}

var chatter =
  {entries:new Array(),
   feedURI:"/labs/feed/",
   resId:"resultsDiv",
   textAreaId:"ta",
   getEntryToTextArea:function(fileName){
     var req = reqHandlerClosure(getEntryToTextAreaCallBack,200,fileName);
     req.open("GET",this.feedURI+fileName, true);
     req.send(null);
     },
   chatterForm:"chatterForm",
   getEntry:function(fileName){
    var req = reqHandlerClosure(getEntryCallBack,200,fileName);
    req.open("GET", this.feedURI+fileName, true);
    req.send(null);
    },
   postEntry:function(val){
    var req = reqHandlerClosure(postEntryCallBack,201);
    req.open("POST",this.feedURI,true);
    req.send(val);
    },
   deleteEntry:function(fileName){
    var req = reqHandlerClosure(deleteEntryCallBack,200);
    req.open("DELETE",this.feedURI+fileName,true);
    req.send(null);
    },
   putEntry:function(fileName,val){
    var req = reqHandlerClosure(putEntryCallBack,201);
    req.open("PUT",this.feedURI+fileName,true);
    req.send(val);
    },
   getFeed:function(){
    var req = reqHandlerClosure(getFeedCallBack,200);
    req.open("GET", this.feedURI, true);
    req.send(null);
    }
   }
/**
 Then we say
 setInterval("chatter.getFeed()",2000);
which gets the whole feed every two seconds, and we have
a button with
  onclick="chatter.postEntry(this.form.ta.value);"
**/

// function $(x){return document.getElementById(x);}
function $() {
  var f=function(x){return typeof x=='string'?document.getElementById(x):x;}
  if(arguments.length==1)return f(arguments[0]);
  return mapArray(f,arguments);
}
function mapArray(f,a){
  var A=new Array(a.length);
  for(var i=0;i<a.length;i++)A[i]=f(a[i]);
  return A;
}
function sliceArray(A,lo,lim){
  if(!A)return A;
  if(A.length<lim)lim=A.length;
  var B=new Array();
  for(var i=lo;i<lim;i++)B.push(A[i]);
  return B;
}
