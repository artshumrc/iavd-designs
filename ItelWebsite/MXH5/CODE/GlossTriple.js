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
GlossTriple.js 
utilities for defining ntGloss (glossary) and ntTriple
(inference rule) Javascript classes.
After we have created new MicroFormat object theGloss from glossTable, we
can say things like theGloss.ntDef[12].ntPos to find the
ntPos (part of speech) item for definition 12.

<table id="glossTable" class="ntGloss">
<tr id="sound01" class="ntDef">
  <td class="ntTerm">sound</td>
  <td class="ntPos">n</td>
  <td class="ntDesc">the particular auditory effect produced by a given cause</td>
  <td class="ntExList"><span class="ntEx">the sound of rain on the roof</span>
                     <span class="ntEx">the beautiful sound of music</span></td>
  <td class="ntPatList"><span class="ntPat">sound</span></td>
</tr>
</table>

<table id="triplesTable" class="ntTriples">
 <tr class="ntRel">
     <td class="ntRelX">sound01</td>
     <td class="ntRelR">subClass</td>
     <td class="ntRelY">perception03</td>
  </tr>
</table>
**/
var ntGlossGrammar= {ntGloss:{ntDef:"*"},
               ntDef:{ntTerm:1,ntPos:1,ntDesc:1,ntExList:"?",ntPatList:"?"},
               ntTerm:{},
               ntPos:{},
               ntDesc:{},
               ntExList:{ntEx:"*"},
               ntPatList:{ntPat:"*"},
               ntEx:{},
               ntPat:{}};

var ntTriplesGrammar={ntTriples:{ntRel:"*"},
               ntRel:{ntRelX:1,ntRelR:1,ntRelY:1},
               ntRelX:{},
               ntRelR:{},
               ntRelY:{}
              };

mfObjects.buildMFClasses(ntGlossGrammar);
mfObjects.buildMFClasses(ntTriplesGrammar);

ntRel.prototype.toTriple=function(){
  with(this)return new Array(""+ntRelX,""+ntRelR,""+ntRelY);
}

ntDef.prototype.mf_events={onclick:function (evt){
    var theGlossTable=top.mfObjects.obs.glossTable;
    theGlossTable.setSelectedDef(this.id);
}}


ntTriples.prototype.postInit=function(){
 var G=new Graph();
 var ntR=this.ntRel;
 for(var i=0;i<ntR.length;i++)G.insertTriple(ntR[i].toTriple());
 this.graph=G;
 return G;
}

ntTriples.prototype.itemIn=function(a,b){return this.graph.itemIn(a,b);}

ntGloss.prototype.itemIn=function(a,b){
if(!this.triplesTable)this.triplesTable=top.mfObjects.obs.triplesTable;
if(this.triplesTable)return this.triplesTable.itemIn(a,b);
}

ntGloss.prototype.lookupLoc=function(txt){
  if(!txt)return 0;
  var ntD=this.ntDef;
  var loc=0;
  if(this.lookupByID){hexer.init(); txt=hexer.hexify(txt);
    while(loc<ntD.length && ntD[loc].mf_elt.id<txt)loc++; // XXXXX Possible. 20150220
    }
  else if(this.caseSensitive)
    while(loc<ntD.length && ntD[loc].ntTerm.mf_textValue()<txt)loc++;
  else { txt=txt.toUpperCase();
    while(loc<ntD.length && ntD[loc].ntTerm.mf_textValue().toUpperCase()<txt)loc++;
  }
  if(loc==ntD.length)return -1;
  if(this.matchLength(txt,loc-1) >= this.matchLength(txt,loc)) return loc-1;
  return loc;
}

/** matchLength(txt,loc) is 0 or more; the number of chars in term[loc]
   which match txt, as a prefix. txt is uppercase.
**/
ntGloss.prototype.matchLength=function(txt,loc){
  var ntD=this.ntDef;
  if(loc<0 || loc>=ntD.length)return 0;
  var pat=ntD[loc].ntTerm.mf_textValue().toUpperCase();
  var len=txt.length;
  if(pat.length<len)len=pat.length;
  for(var i=0;i<len;i++)if(txt[i]!=pat[i])return i;
  return len;
}

ntGloss.prototype.lookupDef=function(txt){
  var loc=this.lookupLoc(txt);
  if(loc<0)return null;
  return this.ntDef[loc];
}

ntGloss.prototype.setSelectedDef=function(ntDefId){
  var mfOb=top.mfObjects.obs[ntDefId];
  if(!mfOb instanceof ntDef)throw "ntGloss.setSelectedDef("+ntDefId+") but is not a definition";

  var sel=this.selectedDef;
  if(sel){
    var oldDef=top.mfObjects.obs[sel];
    if(oldDef)oldDef.mf_elt.className="ntDef";
    }
  this.selectedDef=ntDefId;
  mfOb.mf_elt.className="ntDef selected";
  
 
 /**
  var doc=this.mf_elt.ownerDocument;
  var sel=this.selectedDef;
  // alert("changing selection from "+sel+" to "+ntDefId);
  if(sel){
    var oldDef=doc.getElementById(sel);
    if(oldDef)oldDef.className="ntDef";
    }
  this.selectedDef=ntDefId;
  var theDef=doc.getElementById(ntDefId);
  if(!theDef)return;
  theDef.className="ntDef selected";
**/
}
    

ntGloss.prototype.getDefLoc=function(xid){
  var mfOb=top.mfObjects.obs[xid];
  if(mfOb instanceof ntDef)return mfOb.mf_myIndex();
  return -1;
  /**
  var doc=this.mf_elt.ownerDocument;
  var defs=this.ntDef;
  for(var i=0;i<defs.length;i++){
    var def=defs[i];
    if(!def)throw("def["+i+"] is "+def);
    if(xid==def.mf_elt.id)return i;
  }
  return -1;
  **/
}

ntGloss.prototype.getDef=function(xid){
  var loc=this.getDefLoc(xid);
  if(loc<0)throw("ntGloss.getDef: found no "+xid);
  return this.ntDef[loc];
}

ntGloss.prototype.remDef=function(xid){
  var loc=this.getDefLoc(xid);
  if(loc<0)throw "ntGloss.remDef: found no "+xid;
  var defs=this.ntDef;
  var def=defs[loc];
  var defDom=def.mf_elt;
  defDom.parentNode.removeChild(defDom);
  var newNtDefs=new Array();
  for(var j=0;j<loc;j++)newNtDefs.push(defs[j]);
  for(var j=loc+1;j<defs.length;j++)newNtDefs.push(defs[j]);
  this.ntDef=newNtDefs;
  if(newNtDefs.length>0){
    if(loc==0)newNtDefs[loc].mf_prevSibling=null;
    else if((loc+1)==newNtDefs.length)newNtDefs[loc].mf_nextSibling=null;
    else {
          newNtDefs[loc-1].mf_nextSibling=newNtDefs[loc];
          newNtDefs[loc].mf_prevSibling=newNtDefs[loc-1];
          }
    }
  top.mfObjects.obs[xid]=null;
 return loc;
}

// insDef returns location of inserted definition.
ntGloss.prototype.insDef=function(xid,term,pos,desc,pat,occurs){
  var defs=this.ntDef;
  if(defs.length==0){alert("ntGloss.insDef: can't insert into empty list yet");return -1;}
  for(var i=0;i<defs.length;i++){
    var def=defs[i];
    if(xid.toUpperCase()<def.mf_elt.id.toUpperCase()) {
// alert(def.xdDomElement.id+".insDefBefore("+xid+","+term+","+pos+"...)");
      var newNtDef=def.insDefBefore(xid,term,pos,desc,pat,occurs);
      var newNtDefs=new Array();
      for(var j=0;j<i;j++)newNtDefs.push(defs[j]);
      newNtDefs.push(newNtDef);
      for(var j=i;j<defs.length;j++)newNtDefs.push(defs[j]);
      this.xdParts.ntDef=newNtDefs;
      if(i>0){newNtDef.mf_prevSibling=newNtDefs[i-1];newNtDefs[i-1].mf_nextSibling=newNtDef;}
      if((i+1)<newNtDefs.length){
        newNtDef.mf_nextSibling=newNtDef[i+1];newNtDefs[i+1].mf_prevSibling=newNtDef;}
      return i;
     }
  }
  var def=defs[defs.length-1];
  var newDef=def.insDefAfter(xid,term,pos,desc,pat,occurs);
  defs[defs.length]=newDef;
  return defs.length-1;
}

ntDef.prototype.setPos=function(pos){ // to change the part of speech, must change id
  var ntDefId=this.mf_elt.id;
  var newId=ntDefId.split("_")[0]+"_"+pos+"1";
  this.mf_elt.id=newId;
  this.ntPos.mf_elt.innerHTML=newId;
}

function createTagClass(tag,cls){
  // tag=window.document.createElement(tag);
  tag=window.document.createElementNS("http://www.w3.org/1999/xhtml",tag);
  tag.className=cls;
  return tag;
}

function createTagClassText(tag,cls,txt){
  txt=window.document.createTextNode(txt);
  tag=createTagClass(tag,cls);
  tag.appendChild(txt);
  return tag;
}

function createTagClassTagClassText(tag1,cls1,tag2,cls2,txt){
  tag1=createTagClass(tag1,cls1);
  tag2=createTagClassText(tag2,cls2,txt);
  tag1.appendChild(tag2);
  return tag1;
}

ntDef.prototype.insDefBefore=function(xid,term,pos,desc,pat,occurs){
  if(!occurs)occurs="";
  var cl=["ntTerm","ntPos","ntDesc","ntPatList","ntPat","ntExList","ntEx"];
  var txt=[term,pos,desc,pat,occurs];
  var tr=createTagClass("tr","ntDef");
// alert("insDefBefore: created tag class ntDef "+tr.innerHTML+"\nto put before\n"+this.xdDomElement.innerHTML);
  for(var i=0;i<3;i++)
    tr.appendChild(createTagClassText("td",cl[i],txt[i]));
  tr.appendChild(createTagClassTagClassText("td",cl[3],"span",cl[4],txt[3]));
  tr.appendChild(createTagClassTagClassText("td",cl[5],"span",cl[6],txt[4]));
  tr.id=xid;
  var me=this.mf_elt;
  me.parentNode.insertBefore(tr,me);
  me.parentNode.insertBefore(me.ownerDocument.createTextNode("\n"),me);
// alert("builder time for:"+tr.innerHTML)
  var newDef=mfObjects.build(tr,ntGlossGrammar); 
// alert("me="+me+"; parentNode="+me.parentNode+"; tr="+tr+"; newDef="+newDef);
  return newDef;
}


ntDef.prototype.insDefAfter=function(xid,term,pos,desc,pat,occurs){
  if(!occurs)occurs="";
  var cl=["ntTerm","ntPos","ntDesc","ntPatList","ntPat","ntExList","ntEx"];
  var txt=[term,pos,desc,pat,occurs];
  var tr=createTagClass("tr","ntDef");
  for(var i=0;i<3;i++)
    tr.appendChild(createTagClassText("td",cl[i],txt[i]));
  tr.appendChild(createTagClassTagClassText("td",cl[3],"span",cl[4],txt[3]));
  tr.appendChild(createTagClassTagClassText("td",cl[5],"span",cl[6],txt[4]));
  var newDef=mfObjects.build(tr,ntGlossGrammar);
  tr.id=xid;
  var me=this.mf_elt;
  // alert("me="+me+"; parentNode="+me.parentNode+"; tr="+tr+"; newDef="+newDef);
  me.parentNode.insertAfter(tr,me);
  me.parentNode.insertAfter(me.ownerDocument.createTextNode("\n"),me);
  return newDef;
}

function pm_lookup(inbox,justPrefix){ // if justPrefix, find phrase as start of dict entry.
 var table=this.glossaryWindow.document.getElementById("dict001"); // older version, no topic support
 if(!table)table=this.glossaryWindow.document.getElementById("glossTable");
 table.scrollIntoView();
 if(inbox && inbox.value)this.selectedText=getTxtAreaSel(inbox);
 var phrase=this.selectedText; if(!phrase)phrase="";
 this.glossaryWindow.document.forms.dictForm.phrase.value=phrase;
 if(!this.isNonAlphabetic){
   phrase=phrase.toUpperCase();
   phrase=phrase.replace(/^\W*/,'').replace(/\W*$/,'');
 }
//alert("looking for "+phrase+" of length "+phrase.length);
 var cN=table.tBodies[0].rows;
 var prevTR=null;
 for(var i=0;i<cN.length;i++){var TR=cN[i];
   var row=TR.cells;
   var nD=nodeData(row[0]);
   if(!this.isNonAlphabetic)nD=nD.toUpperCase();
//if(!confirm("comparing with "+nD+" of length "+nD.length))return;
   if(phrase == nD || justPrefix && nD.indexOf(phrase)==0 || phrase < nD && !this.isNonAlphabetic)
     {chooseDef(TR);var tr=(prevTR?prevTR:TR);  tr.scrollIntoView();return;}
   prevTR=TR;
   }
  if(!justPrefix)this.lookup(inbox,true);
  else if(prevTR)prevTR.scrollIntoView(); // failure, scroll to end.
}

function chooseDef(tr){
  if(!tr)return;
  var defId=tr.getAttribute("id"); if (!defId)return;
  var builder=top.builder; if(!builder)return;
  var glossTable=builder.obs.glossTable; if(!glossTable)return;
  glossTable.setSelectedDef(defId);
}
function getTestSelection(txtarea){
  if(isIE)return txtarea.document.selection.createRange().text;
  var selStart=txtarea.selectionStart;
  var selEnd=txtarea.selectionEnd;
  if(selEnd<3)selEnd=txtarea.textLength;
  return (txtarea.value).substring(selStart,selEnd);
}
function getTxtAreaSel(txtarea){
  var sel=getTestSelection(txtarea);
  if(!sel)sel=txtarea.value;

  return trim(sel);
}
function trim(str){
 if(!str)return "";
 str=str.replace(/\s+/g," ");
 str=str.replace(/^\s/,"");
 str=str.replace(/\s$/,"");
 return str;
 }

var hexer={
alphabet:[[],[" "], ["А","а"], ["Ӑ","ӑ"], ["Б","б"], ["В","в"], ["Г","г"], ["Д","д"],
["Дʼ","дʼ"], ["Е","е"], ["Ӗ","ӗ"], ["Ё","ё"], ["Ж","ж"], ["З","з"], ["И","и"],
["Й","й"], ["К","к"], ["Кʼ","кʼ"], ["Ӄ","ӄ"], ["Ӄʼ","ӄʼ"], ["Л","л"], ["Љ","љ"],
["Ԓ","ԓ"], ["М","м"], ["Н","н"], ["Њ","њ"], ["Њ","ӈ"], ["О","о"], ["","ŏ"], ["П","п"],
["Пʼ","пʼ"], ["Р","р"], ["С","с"], ["Т","т"], ["Тʼ","тʼ"], ["У","у"], ["Ў","ў"],
["Ф","ф"], ["Х","х"], ["Ӽ","ӽ"], ["Ц","ц"], ["Ч","ч"], ["Чʼ","чʼ"], ["Ш","ш"],
["Щ","щ"], ["Ъ","ъ"], ["Ы","ы"], ["Ь","ь"], ["Э","э"], ["Ю","ю"], ["Я","я"], ["Ә","ә"], ["ʼ","ʼ"]
],
alphaset:{},
alphaMaxLen:0,
hex:function(n,d){
  var hx=n.toString(16).toUpperCase();
  // alert("hex("+n+","+d+")=?"+hx);
  if(hx.length>d)throw "hex("+n+","+d+")=?"+hx+"? needs more than "+d+" hex digits";
  while(hx.length<d)hx="0"+hx;
  // alert("hex("+n+","+d+")=?"+hx);
  return hx;
},
init:function(alpha){
  if(alpha)this.alphabet=alpha;else alpha=this.alphabet;
  for(var i=0;i<alpha.length;i++){
  var cc=alpha[i];
  var code=this.hex(i,2);
  for(var j=0;j<cc.length;j++){
    var lett=cc[j];
    if(lett.length>this.alphaMaxLen)this.alphaMaxLen=lett.length;
    if(!lett)continue;
    this.alphaset[lett]=code;
    }
  }
},
unXmlify:function(S){ // replaces entity references with special chars
 if(!S)return "";
 return S.replace("&amp;","&")
         .replace("&lt;","<")
         .replace("&gt;",">")
         .replace("&apos;","'")
         .replace("&#10;","\n")
         .replace("&#x02bc;","\u02bc");
},
 hexify:function(S){
  if(!S)return "";
  S=this.unXmlify(trim(S));
  var next=0;var N=S.length;
  var sB="";
  var sC="";
  while(next<N){
    for(var len=this.alphaMaxLen;len>=1;len--){
      var endInd=next+len;if(endInd>N)endInd=N;
      var sub=S.substring(next,endInd); 
      var code=this.alphaset[sub];
      if(code){sB+=code;next=endInd;sC+=sub;break;}
      else if(len>1)continue;
      else {sB+="00"; next=endInd;sC+="$";break;} 
      }
   }
   return "nt$"+sB+"-"+S.replace(/[() &<>'\n\u02bc,"]/g,"\$");
 }
}

