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
/**   mfDomLib.js 
  *  This library defines generation/validation/consumption of microformats,
  * along with standard cross-browser DOM functionality such as the $() function
  * where (to begin with) $('x')==document.getElementById('x').
  * Each microformat class is both a CSS class and a Javascript class, with 
  * grammar specified in a Javascript object. For example, consider the grammar
   var G= {ntDict:{ntDef:"*"},
           ntDef:{ntName:1,ntVal:1,ntComment:"?"},
           ntName:{},
           ntVal:{},
           ntComment:{}
           };
  * This can be read aloud as
     An ntDict object contains a sequence of zero or more ntDef objects;
     An ntDef object contains exactly one ntName object and one ntVal object,
        and may optionally contain an ntComment object;
     ntName, ntVal, and ntComment are leaf classes.

  * This matches xhtml such as
    <div class="ntDict" id="sampleDict">
      <p class="ntDef">
        <b><span class="ntName">scale</span></b>
        <span class="ntVal">13</span>
     </p>
     <div class="ntDef">
       <a href="example.org/blah" class="ntName">george</a>
       <blockquote class="ntVal">Now is the time for all good
         Georges to come to the party
       </blockquote>
     </div>
   
  * After
  
    try{
      mfObjects.build($('sampleDict'),G);
    }catch(e){alert("validation error building 'sampleDict':\n"+e);}

  * every mfObject will have an id, and it will be the case that
   mfObjects.obs.sampleDict.ntDef[0].ntVal.mf_textValue()=="13";
and that
   mfObjects.obs.sampleDict.ntDef[0].ntVal.mf_prevSibling.mf_textValue()=="scale";


  * the implied Javascript classes are the names of the grammar;
   function ntDict(){}
   function ntDef(){}
   function ntName(){}
   function ntVal(){}
   function ntComment(){}
  * They will be created automatically by mfObjects.build(), unless
  * they have already been declared. Each must be a subclass of MicroFormat:

   ntDict.prototype=new MicroFormat();
   ntDef.prototype=new MicroFormat();
   ntName.prototype=new MicroFormat();
   ntVal.prototype=new MicroFormat();

if any has been given a postInit method, e.g.
if you want calculations to be performed after initialization, define
a postInit method such as

  ntDict.prototype.postInit=function(){
    var jsArray=[];
    for(var sub=this.mf_firstChild;sub;sub=sub.mf_nextSibling)
      jsArray.push([sub.ntName.mf_elt.innerHTML,
                    sub.ntVal.mf_elt.innerHTML]);
    alert(jsArray.join("\n"));
  }

this will be executed after the initialization (and postInit()) of
all subobjects.

if any mfObjects have been declared and given a set of event-handlers
such as 
   ntName.prototype.mf_events={
      onclick:function(){
     alert(mfObjects.obs[this.id].mf_nextSibling); 
     }}
then the methods will be passed along to the actual DOM element, so that
a click on the name will produce an alert of the value, as long as ntVal
is actually the mf_nextSibling of ntName within a definition. A slightly
safer onclick would be
   ntName.prototype.mf_events={onclick:function(){
     alert(mfObjects.obs[this.id].mf_parent.ntVal); 
     }}

Since ntVal is required (but ordering of parts is not implied by the grammar), this
should always work whereas the mf_nextSibling version would fail with input
  <span class="ntDef">
    <span class="ntVal">13</span>
    <span class="ntName">x</span>
  </span>
**/

var mfObjects={
 genSymNum:0,
 genSym:function(){var gSN=this.genSymNum;
   while($('g_'+gSN))gSN++;
   return 'g_'+(this.genSymNum=gSN);
 },
 build:function(elt,gram,mfParent){
  try{
   this.buildMFClasses(gram);
   var mfClassName=elt.className.split(" ")[0];
   var mfClass=top[mfClassName];
   // alert("elt="+elt+"; mfClassName="+mfClassName+"; mfClass="+mfClass);
   var mfOb=new top[mfClassName]();
   mfOb.mf_init(mfClassName,elt,gram,mfParent);
  }catch(e){throw "ERR:build("+elt+","+ob2String(gram)+","+mfParent+")="+(e.description?e.description:e);}
 },
 obs:{},
 reset:function(){this.obs={};},
 buildMFClasses:function(gram){
   for(var cls in gram){
     if(top[cls])continue; // class already defined
     (top[cls]=new Function("","")).prototype=new MicroFormat();
     }
 }
}

function MicroFormat(){ }

function isEmptyObject(ob){
for(var x in ob)return false;
return true; 
}

MicroFormat.prototype.mf_init= function(mfClassName,elt,gram,mfParent){
  this.mf_grammar=gram;
  this.mf_className=mfClassName;
  this.mf_classPattern=gram[mfClassName];
  this.mf_parent=mfParent;
  if(!elt.id)elt.id=mfObjects.genSym();
  this.mf_elt=elt;
  mfObjects.obs[elt.id]=this;
  if(this.mf_events)
    for(evt in this.mf_events)
      elt[evt]=this.mf_events[evt];
  if(!isEmptyObject(this.mf_classPattern)){
    for(var tag in this.mf_classPattern)
      if(this.mf_hasArray(tag))this[tag]=new Array();
    var prevChild=null; var newChild=null;

    for(var nd=elt.firstChild;nd;){
      if(!(newChild=this.mf_addChild(nd))){nd=nextNode(nd,elt); }
      else{
        if(prevChild){
          newChild.mf_prevSibling=prevChild;
          prevChild.mf_nextSibling=newChild;
          }
        else this.mf_firstChild=newChild;
        prevChild=newChild;
        nd=nextNodeOver(nd,elt); 
      }
      }
    }
  this.mf_validate();
  // if(this.onclick)elt.onclick=this.onclick;
  if(this.postInit)this.postInit();
}

MicroFormat.prototype.mf_validate=function(){
  for(var tag in this.mf_classPattern){
    if(this.mf_hasChild(tag)) // required value
      if(!this[tag]){
       var path;
         try{path=this.mf_path();}
         catch(e){
           var par=this.mf_parent;
           var cls=this.mf_className;
           path=par.mf_path()+"/"+cls;
           if(par[cls] && par[cls].length)path+="["+par[cls].length+"]";
         }
        throw "ERROR: No ["+tag+"] within \n  "+path;
       }
      }
}
 
MicroFormat.prototype.mf_addChild=function(nd,nextSiblingIndex){
// if(nextSiblingIndex)alert("mf_addChild:"+nd+";"+nextSiblingIndex);
  // if nextSiblingIndex=1, insert as child 0 of this class;
  // if !nextSiblingIndex, just append.
  if(!nd || !nd.className)return false;
  var childClassName=nd.className.split(" ")[0];
  var subType= this.mf_classPattern[childClassName];
  if(!subType)return false;
  var childClass=top[childClassName];
  var child=new childClass();
  child.mf_init(childClassName,nd,this.mf_grammar,this);
  if(subType=="*"){
     if(!nextSiblingIndex) this[childClassName].push(child);
     else {
       var A=this[childClassName]; var B=[]; nextSiblingIndex--;
       var nextSib=A[nextSiblingIndex];
       var prevSib=A[nextSiblingIndex-1];
       if(prevSib)prevSib.mf_nextSibling=child;
       if(nextSib)nextSib.mf_prevSibling=child;
       child.mf_nextSibling=nextSib;
       child.mf_prevSibling=prevSib;
       for(var i=0;i<=nextSiblingIndex;i++)B.push(A[i]);
       B.push(child);
       for(var i=nextSiblingIndex+1;i<A.length;i++)B.push(A[i]);
       this[childClassName]=B;
     }
  } else if(!this[childClassName])this[childClassName]=child;
  else throw "ERROR: Duplicate ["+childClassName+"] within \n "+this.mf_path();
  return child;
}

MicroFormat.prototype.mf_hasChild=function(tag){
  return "1"==this.mf_classPattern[tag];
}
MicroFormat.prototype.mf_hasOption=function(tag){
  return "?"==this.mf_classPattern[tag];
}
MicroFormat.prototype.mf_hasArray=function(tag){
  return "*"==this.mf_classPattern[tag];
}

function startsWith(S,pre){
  if(S==null || pre==null)return false;
  if(S.length < pre.length)return false;
  return pre == S.substring(0,pre.length);
}

function textValue(node){if(!node)return "";
  if(!node.firstChild)return (node.nodeValue)?node.nodeValue:"";
  var S="";
  for(var nd=node.firstChild;nd;nd=nd.nextSibling)S+=textValue(nd);
  return S;
}
function ob2ArrayOfPairs(ob){
  var A=[];
  if(!ob)return A;
  for(var x in ob)A.push(x,ob[x]);
  return A;
}
function ob2String(ob){
  var S="{";
  for(var x in ob)
    S+="'"+x+"':'"+ob[x]+"',\n";
  if(S.length==1)return "{}";
  return S.substring(0,S.length-2)+"}";
}

MicroFormat.prototype.mf_textValue=function(){
  if(this.mf_ttextValue)return this.mf_ttextValue;
  return (this.mf_ttextValue=textValue(this.mf_elt));
}

MicroFormat.prototype.toString=function(indent){ 
  if(!indent)indent=0;
  var space="";for(var i=0;i<indent;i++)space+=" ";
  if(!this.mf_firstChild)
    return space+"<span class='"+this.mf_className+"'>"+this.mf_elt.innerHTML+"</span>";
  var S=space+"<div class='"+this.mf_className+"'>\n";
  for(var subMF=this.mf_firstChild;subMF;subMF=subMF.mf_nextSibling)
    S+=subMF.toString(indent+2)+"\n";
  S+=space+"</div>";
  return S;
}

MicroFormat.prototype.mf_path=function(){
  if(!this.mf_parent)return this.mf_elt.id;
  return this.mf_parent.mf_path()+"/"+this.mf_whichChild();
}

MicroFormat.prototype.mf_whichChild=function(){
  var parent=this.mf_parent; 
  if(!parent)throw "no parent for whichChild:\n"+this.toString();
  if(parent.mf_hasArray(this.mf_className))
    return this.mf_className+"["+this.mf_myIndex()+"]";
  return this.mf_className;
}

MicroFormat.prototype.mf_myIndex=function(){
  var parent=this.mf_parent; 
  if(!parent)throw "no parent for myIndex:\n"+this.toString();
  if(!parent.mf_hasArray(this.mf_className))throw "myIndex for non-array:\n"+this.toString();
  var A=parent[this.mf_className];
  for(var i=0;i<A.length;i++)
    if(A[i]===this)return i;
  // alert("myIndex failed for "+this.mf_elt.className+" within "+this.mf_parent.mf_elt.className);
  throw "myIndex not found:\n"+this.toString();
}


function xd_toFormString(pre,inTableRow){
  var S=""; 
  if(this.xdIsLeafClass){
    if(inTableRow)S+="<td>";
     S+=pre+":<input type='text' name='"+pre+"' class='"+this.xdClassList+"'  value='"+this.getTextValue()+"'/> ";
    if(inTableRow)S+="</td>";
    return S;
  }
  if(pre)pre+="_";
  for(var x in this.xdParts){
    var ob=this.xdParts[x];
    if(!this.xdIsArray[x])S+=ob.toFormString(pre+x,inTableRow);
    else{
      if(inTableRow){
        for(var i=0;i<ob.length;i++)S+="<td class='"+ob[i].xdClassList+"'>"+ob[i].toFormString(pre+x+i,false)+"</td>";
      } else {
        S+="<table border='1'>\n";
        for(var i=0;i<ob.length;i++)S+="<tr class='"+ob[i].xdClassList+"'>"+ob[i].toFormString(pre+x+i,true)+"</tr>\n";
        S+="</table>\n";
      }
    }
  }
  return S; 
}

function XDForm(formId){
  XDForm.forms[formId]=document.forms[formId];
 } // a handler for a form representing an editable XhtmlDecoder.
XDForm.forms=new Object();

function buildFromForm(form){
}

function parentNode(nd){
  if(!nd)return nd;
  if(nd.parentNode)return nd.parentNode;
  return nd.parentElement;
}
// find next node after "node"; end must not be visited again, or risen above.
function nextNode(node,end){
  if(node.firstChild) return node.firstChild;
  while(node && !node.nextSibling && (node!=end))node=parentNode(node);
  if(node && (node!=end))return node.nextSibling;
  return null;
}

// find next node after "node", not including its children. 
// end must not be visited again, or risen above.

function nextNodeOver(node,end){
  while(node && !node.nextSibling && (node!=end))node=parentNode(node);
  if(node && (node!=end))return node.nextSibling;
  return null;
}

function obToString(ob){
  var S="{";
  for(var x in ob)S+=""+x+":"+ob[x]+",\t";
  return S+"}";
}
function obParts(ob){
  var S="{"; for(var x in ob)S+=" "+x+"; ";
  return S+"}";
}

function array2String(a){
  if(a==null || a.length==0)return "[]";
  var S="["+a[0];
  for(var i=1;i<a.length;i++)S+=",\t"+a[i];
  return S+"]\t";
}

function setInnerXHTML(elt,str){
try{
 str=str.replace("&nbsp;","&#160;","g");
 var x='<x xmlns="http://www.w3.org/1999/xhtml">';
 var ob=new DOMParser().parseFromString(x+str+"</x>","text/xml");
 var imob=elt.ownerDocument.importNode(ob,true).firstChild;
 while(elt.hasChildNodes()){  
   elt.removeChild(elt.firstChild);
   }
 while(imob.hasChildNodes()){
   elt.appendChild(imob.firstChild); 
   try{imob.removeChild(imob.firstChild);}catch(e){}
  }
}catch(e){alert("setInnerXHTML failed: "+e+";\n elt="+toStr(elt));}
}


function doc2String(doc){
  var xmlSerializer=new XMLSerializer();
  return xmlSerializer.serializeToString(doc);
}
function string2doc(str){
  var domParser=new DOMParser();
  return domParser.parseFromString(str, 'text/xml');
}
function $() {
  var f=function(x){return typeof x=='string'?document.getElementById(x):x;}
  if(arguments.length==1)return f(arguments[0]);
  return arguments.map(f);
}

function mfObContainingNode(nd){
  for(;nd;nd=parentNode(nd)){
    var mfOb= top.mfObjects.obs[nd.id];
    if(mfOb)return mfOb;
  }
  return null; 
}

function JSONeval(S){return eval("("+S+")");} // replace with JSON parser?

function newElement(pElt,tag,cls,xid,doc,isXhtml){
  if(!doc)doc=pElt.ownerDocument;
  if(!isXhtml)isXhtml=(doc.createElementNS && pElt.tagName==pElt.tagName.toLowerCase())
  if(isXhtml)res=doc.createElementNS('http://www.w3.org/1999/xhtml',tag);
  else res=doc.createElement(tag);
  if(cls)res.className=cls;
  if(xid)res.id=xid;
  return res;
}
function newChild(parentId,tag,cls,xid,doc,isXhtml){
   var pElt=$(parentId);if(!pElt)throw ("no parent for newElt "+tag);
   var res=newElement(pElt,tag,cls,xid,doc,isXhtml);
   pElt.appendChild(res);
   return res;
 } 


function addJSScript(shref){  // 
// adds a script element with id sid, href shref
  var head = document.getElementsByTagName('head')[0];
  if (!head)return alert("no head in document!")
  var scrElt=newChild(head,"script");
  scrElt.language = 'javascript';
  scrElt.src = shref;
  scrElt.type = 'text/javascript';
};

/** wrapNode(nd,"div","ntDict") replaces the node nd 
    with a div of class ntDict containing nd as sole child.
    wrapNode(nd,"div","ntDict","dict_1") uses dict_1 as id.
**/
function wrapNode(nd,tag,cls,xid,doc,isXhtml){
  if(!nd)return null;
  var pElt=nd.parentNode; if(!pElt)return null;
  if(!tag)tag="span";
  var res=newElement(pElt,tag,cls,xid,doc,isXhtml);
  pElt.replaceChild(res,nd);
  // pElt.insertBefore(res,nd);
  res.appendChild(nd);
  return res;
}

/** unwrapNode(nd) assumes that nd is a wrapper, with
  one child; nd is to be replaced by its child.
**/
function unwrapNode(nd){
  try{
  if(!nd.parentNode)throw "unwrapNode: no parent for "+doc2String(nd);
  var parent=nd.parentNode;
  if(!nd.firstChild)throw "unwrapNode: no child for "+doc2String(nd);
  var child=nd.firstChild;
  if(child.nextSibling)throw "unwrapNode: two children for "+doc2String(nd);

  parent.replaceChild(child,nd);
  }catch(e){if(!confirm("unwrapNode: "+e+" on "+doc2String(nd)))throw "oops";}
}

/**

**/

/* --------- STYLESHEET MANAGER ----  */

var styleSheetHandler={
 tst:function(){
   alert(this.toString());
   this.addStylesOb({"tst":"tst.css"});
   alert(this.toString());
   this.activate("tst");
   alert(this.toString());
   this.deactivate("tst");
   alert(this.toString());
 },
 ob2A:function(o){ var A=[]; for(var x in o)A.push(x+":'"+o[x]+"'"); return A; },
 toString:function(){
   var S="{styles:{"+this.ob2A(this.styles).join(",")+"},\n";
   S+="{activeStyles:{"+this.ob2A(this.activeStyles).join(",")+"}}";
   return S;
   },
 styles:{},
 activeStyles:{},
 addStylesOb:function(ob){ for(var s in ob)this.addStyle(s,ob[s]); },
 styleID:function(href){
   for(var s in this.styles)
     if(this.styles[s]==href)return s;
   throw "styleID for ["+href+"] not found in "+this.ob2A(this.styles);
 },
 init:function(x){
  if(x)this.addStylesOb(x);
  for(var s in this.styles){
    this.addStyle(s,this.styles[s]);
    this.addButton('buttons',s);
    }
  /**
  this.activate("tst1","tst2");
  this.deactivate("tst2");
  this.deactivate("tst1");
  this.activate("tst3","tst1");
  this.deactivateAll();
  **/
},
 newChild:function(parentId,tag){
   var pElt=$(parentId);if(!pElt)throw ("no parent for newElt "+tag);
   var res=null;
   if(document.createElementNS && pElt.tagName==pElt.tagName.toLowerCase())
     res=document.createElementNS('http://www.w3.org/1999/xhtml',tag);
   else res=document.createElement(tag);
   pElt.appendChild(res);
   return res;
 },
buildStyle:function(shref){  // assumes this.styles[sid]=shref;
//from http://juicystudio.com/article/accessible-stylesheet-bookmarklet.php
  if(!shref || !shref.match(/css$/))return alert("no CSS file "+shref);
  var head = document.getElementsByTagName('head')[0];
  if (!head)return alert("no head in document!")
  var cssElt=this.newChild(head,"link");
  cssElt.rel = 'stylesheet';
  cssElt.href = shref;
  cssElt.type = 'text/css';
  cssElt.disabled=true;
  return cssElt;
  // alert(this.toString());
},
addStyle:function(sid,shref){  // assumes this.styles[sid]=shref;
//from http://juicystudio.com/article/accessible-stylesheet-bookmarklet.php
  var cssElt =this.buildStyle(shref);
  if(!cssElt)return;
  this.styles[sid]=shref;
  // alert("added style:"+sid+"="+shref);
  /**
  var cssElt=(document.createElementNS && head.tagName=='head')
             ?document.createElementNS('http://www.w3.org/1999/xhtml','link')
             :document.createElement('link');
  head.appendChild(cssElt);
  **/
  cssElt.id = sid;
},

 addButton:function(parentId,sid){
   var pElt=$(parentId); if(!pElt)throw "no parent for addButton";
   var btn=this.newChild(pElt,"input");
   btn.type='button';
   btn.value=sid;
   btn.id="button_"+sid;
   btn.className=this.isActive(sid)?"buttonOn":"buttonOff";
   btn.onclick=function(){styleSheetHandler.toggle(sid,this);}
  },
  toggle:function(sid,btn){
    if(this.isActive(sid)){this.deactivate(sid);btn.className="buttonOff";}
    else{this.activate(sid);btn.className="buttonOn";}},
  isActive:function(x){return this.activeStyles[x];},
   checkActive:function(){
     for(var x in this.styles)if(this.activeStyles[x])$(x).disabled=false;
     for(var x in this.styles)if(!this.activeStyles[x])$(x).disabled=true;
     // for(var x in this.styles)$(x).disabled=!(this.activeStyles[x]);
   },
   deactivateAll:function(){this.activeStyles={};this.checkActive();},
   deactivate:function(){
     var ob=this.activeStyles;
     for(var i=0;i<arguments.length;i++){
       var p=arguments[i];
       delete ob[p];
       }
     this.checkActive();
   },
   set1Active:function(sid){
    this.activeStyles={};
    this.activate(sid);
   },
   get1Active:function(){
     for(var x in this.activeStyles)return x;
     throw "get1Active: no active stylesheet";
     },
   nextStyle:function(sSeq,d){
     if(!d)d=1;
     var sid=this.get1Active();
     sSeq=sSeq.split(",");
     var i=0;while(i<sSeq.length&&sSeq[i]!=sid)i++;
     if(i>=sSeq.length)throw "nextStyle for ["+sid+"] not in ["+sSeq+"]";
     var newSid= sSeq[(i+d+sSeq.length)%(sSeq.length)];
     this.set1Active(newSid);
     return newSid;
   },
   activate:function(){
     for(var i=0;i<arguments.length;i++){
       var sid=arguments[i];
       this.activeStyles[sid]=this.styles[sid];
       }
     this.checkActive();
     },
   getListActive:function(){
     var A=[];
     for(var x in this.activeStyles)A.push(this.styles[x]);
     return A;
   }
}
// http://www.hunlock.com/blogs/Ten_Javascript_Tools_Everyone_Should_Have
// setting Object.prototype causes blowup, dunno why -- 20070622 tjm
// Object.prototype.getElementsByClass = function (searchClass, tag) {      
function getElementsByClass(thisElt,searchClass,tag){
   if(!thisElt)thisElt=document.body;
   var returnArray = [];
   tag = tag || '*';
   var els = thisElt.getElementsByTagName(tag);
   var cM = classMatcher(searchClass);  
   // var pattern = new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
   for (var i = 0; i < els.length; i++) {
      if ( cM(els[i]) ) { // pattern.test(els[i].className) ) {
         returnArray.push(els[i]);
      }
   }
   return returnArray;
}

/** classMatcher(cls) returns a function which will match an elt of class cls
**/
function classMatcher(searchClass){
  var pat=new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
  var fn=function(x){ return x && pat.test(x.className);};
  return fn;
}

/** setClassDisplay("subject","none") will hide all xhtml of class "subject"
    setClassDisplay("grammar","block",divElt) shows all grammar within divElt
**/  

function setClassDisplay(cls,disp,elt){
  if(!elt)elt=document.body;
  getElementsByClass(elt,cls).map(function(x){x.style.display=disp;});
}

function setClassListDisplay(clsList,disp,elt){
  if(!clsList)return;
  if(!(clsList instanceof Array))clsList=clsList.split(",");
  var cls=null;i=0;
  for(i=0;i< clsList.length;i++){
    var cls=clsList[i];
    try{
    setClassDisplay(cls,disp,elt);
    }catch(e){if(!confirm("class="+cls+",i="+i+",disp="+disp+"):"+e))throw "oops";}
    }
}

/** getAncestorOfClass(nd,"segment") will get the innermost ancestor of nd
    which is of class "segment"
**/

function getAncestorOfClass(thisElt,searchClass){ 
  var cM= classMatcher(searchClass);
  for(var anc=thisElt.parentNode;anc;anc=anc.parentNode)
    if(cM(anc.className))return anc;
  return null; 
}

/** General (non-DOM) utilities **/

function numFormat(N,digits){ // 123.456789,3 -> 123.456;
  if(N<0)return "-"+numFormat(-N,digits);
  var a=Math.floor(N); var b=N-a;
  for(var i=0;i<digits;i++)b*=10;
  b=""+Math.floor(b);
  while(b.length<digits)b="0"+b;
  return ""+a+"."+b;
}
function sec2MinSec(numSec){
  var quo= Math.floor(numSec/60);
  var rem=numSec-quo*60;
  return ""+quo+":"+numFormat(rem,3);
}

/*
  newElt(["div","id","x","onclick","xyz"])
    produces <div id='x' onclick='xyz'/>
  newElt([null,"this is some text"])
    produces the textnode "this is some text", and
  newElt([
          ["div","id","x","onclick","xyz"],
          [null,"this is some text"]
         ]
  produces 
     <div id='x' onclick='xyz'>this is some text</div>
if the document is an XHTML document, then it uses the
XHTML namespace to do so.
*/

function newElt(A,doc,isXhtml){if(!doc)return newStruct(A);
  var addAttr=function(elt,att,val){
    // elt[att]=val;
    if(isXhtml)elt.setAttributeNS(null,att,val);
    else elt.setAttribute(att,val);
    // if(!confirm("added "+att+"="+val+" to "+doc2String(elt)))throw "oops";
    };
  if(!(A instanceof Array) || A.length<1)throw "ERROR in newElt: bad element array descriptor: "+A;
  var tag=A[0];
  if(!tag) return doc.createTextNode(A[1]?A[1]:"");

  var elt= (isXhtml)?doc.createElementNS('http://www.w3.org/1999/xhtml',tag)
                    :doc.createElement(tag); 
  var last=A.length-1;
  for(var i=1;i<=last;i+=2){
      if(i==last)elt.nodeValue=A[i];
      else addAttr(elt,A[i],A[i+1]);
      }
  // alert("newElt returns\n"+doc2String(elt));
  return elt;
}

function newStruct(A,doc,isXhtml){
  if(!doc){
    doc=window.document;
    isXhtml=doc.createElementNS && doc.body.tagName=="body";
    }
  if(!(A instanceof Array) || A.length<1)throw "ERROR in newStruct: bad structure descriptor: "+A;
  if(!(A[0] instanceof Array))return newElt(A,doc,isXhtml);
  var topElt=newStruct(A[0],doc,isXhtml);
  var i=1;
  var kid=null;
  try{
  for(;i<A.length;i++){
    kid= newStruct(A[i],doc,isXhtml);
    topElt.appendChild(kid);
    }
  }catch(e){alert("topElt="+doc2String(topElt)+"\ni="+i+"\kid[i]="+kid?doc2String(kid):"null\n"+e);}
  // alert("newStruct returns\n"+doc2String(topElt));
  return topElt;
}
