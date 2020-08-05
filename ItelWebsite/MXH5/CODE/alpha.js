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
  * alpha.js; routines for glossary construction in alpha.html
**/
var unitName=window.location.href.split("/");
unitName=unitName[unitName.length-2];

function fixDict(){
var T=builder.obs.glossTable.xdParts.ntDef;
for(var i=0;i<T.length;i++){
var d=T[i].xdParts;var nt=d.ntTerm; var nd=d.ntDesc; 
var np=d.ntPatList;
if (!np){alert(T[i]+"\n"+i);continue;}
np=np.xdParts.ntPat;
if(!np){alert(T[i]+"\n  "+i); continue;}
np=np[0];
if(!np){alert(T[i]+"\np "+i);continue;}
if(np.getTextValue()==nt.getTextValue())continue;
nd.setTextValue(np.getTextValue());
np.setTextValue(nt.getTextValue());
}}

function ntDef_onclick2(evt){
    var ntDefId= this.id;
    var theGlossTable=top.builder.obs['glossTable'];
    theGlossTable.selectDef(ntDefId);
    return;
}
ntDef.prototype.onclick=ntDef_onclick2;

function setFormSelect(sel,val){
  for(var i=0;i<sel.options.length;i++)
    if(sel.options[i].value==val){sel.selectedIndex=i; return;}
}
var useWordNet=false;
var showDefs=false;
var currentTerm="word";

function toggleWordNet(){
  var wnT=document.getElementById("wnToggle");
  useWordNet=!useWordNet;
  wnT.value=useWordNet?"wnDef":"googleDef";
  showWordNet();
}
    
function showWordNet(term){
  if(!term)term=currentTerm;
  currentTerm=term;
  var wnBase= // "http://wordnet.princeton.edu/perl/webwn?s="+term;
      "http://wordnet.princeton.edu/perl/webwn?o2=&amp;o0=1&amp;o6=1&amp;o1=1&amp;o5=&amp;o4=&amp;o3=&amp;s="+term;
  var goBase= "http://www.google.com/search?q=define%3A+"+term;
  var base=useWordNet?wnBase:goBase;
  document.getElementById('wordnet').src=base;
}

function getOccurs(exList){
  if(!exList)return "";
  var ex=exList.xdParts.ntEx;
  if(!ex)return "";
  if(!ex[0])return "";
  return ex[0].toString();
}
function ntGloss_selectDef(xid){
  var def=this.getDef(xid);
  if(!def)return;
  this.selectedDef=xid;
  with(document.forms.editForm){
    termId.value=xid;
    oldTermId.value=xid;
    var defP=def.xdParts;
    term.value=defP.ntTerm.toString();
    desc.value=defP.ntDesc.toString();
    pat.value=defP.ntPatList.xdParts.ntPat[0].toString();
    occurs.value=getOccurs(defP.ntExList);
    setFormSelect(pos,defP.ntPos.toString());
    if(showDefs)showWordNet(term.value);
    scrollKwicTo(pat.value);
    document.forms.editForm.scrollIntoView();
   }
}
ntGloss.prototype.selectDef=ntGloss_selectDef;

function trim(S){
  S= S.replace(/^[ ]*/,'');
  S= S.replace(/[ ]*$/,'');
  return S;
}
function isDup(A,B){
  A=A.toUpperCase(); B=B.toUpperCase();
  if(A==B)return true;
  if(A+"S"==B)return true;
  if(A==B+"S")return true;
  return false;
}
function remdups(A){
  A=A.map(trim);
  if(A.length==0)return A;
  var B=new Array(); B[0]=A[0];
  for(var i=1;i<A.length;i++)
    if(!isDup(A[i-1],A[i]))B[B.length]=A[i];
  return B;
}
function cmp(a,b){
 a=a.toUpperCase(); b=b.toUpperCase();
 if(a<b)return -1;
 if(a==b)return 0;
 return 1;
}

function remWords(A,badWords,N){
  if(N == -1 || N > badWords.length)N=badWords.length;
  var bad=new Object();
  for(var i=0;i<N;i++){
    bad[badWords[i].toUpperCase()]=true;
    }
  var B=new Array();
  for(var i=0;i<A.length;i++){
    var w=A[i];
    if(!bad[w.toUpperCase()])B[B.length]=w;
  }
  return B;
}

function remKwicRows(A,frm){
  var badWords=frm.common.value;
  badWords=wordList(badWords,"[ \n\r\t]+");
  var N= parseInt(frm.N.value);
  var col=4;
  if(N == -1 || N > badWords.length)N=badWords.length;
  var bad=new Object();
  for(var i=0;i<N;i++){
    bad[badWords[i].toUpperCase()]=true;
    }
  var B=new Array();
  for(var i=0;i<A.length;i++){
    var w=A[i][col];
    if(!bad[w.toUpperCase()])B[B.length]=A[i];
  }
  return B;
}


// var delimPat=/[ \n\r\t.,:;!()\'\"]+/g; // '

function wordList(S,delimPat){
  delimPat=new RegExp(delimPat,"g");
  S=S.replace(delimPat,' ');
  S=trim(S);
  var A=S.split(" ");
  return A;
}

function alpha(S,badWords,N){
  var A=S.split("\n");
  badWords=wordList(badWords,"[ \n\r\t]+");
  A=remWords(A,badWords,N);
  A=A.sort(cmp);
  A=remdups(A);
  var R="";
  for(var i=0;i<A.length;i++){
    var row="<tr class='ntDef' id='"+A[i].replace(/[ \-\~]+/g,'')+"_n1'>\n  "
        row+="<td class='ntTerm'>"+A[i]+"</td>";
        row+="<td class='ntPos'>adj</td><td class='ntDesc'></td>";
        row+="<td class='ntPatList'><span class='ntPat'>"+A[i]+"</span></td>";
        row+="<td class='ntExList'><span class='ntEx'></span></td>";
    R+=row+"</tr>\n";
    }
  return R+"";
}

function alphaFix(S,badWords,N){
  var A=S.split("\n");
  badWords=wordList(badWords,"[ \n\r\t]+");
  A=remWords(A,badWords,N);
  A=A.sort(cmp);
  A=remdups(A);
  var R="";
  for(var i=0;i<A.length;i++)R+=A[i]+"\n";
  return R;
}


function alphaRemDups(frm){
  with(frm){
  var val=alphaFix(words.value,common.value,parseInt(N.value));
  words.value=val;
  }
}

function wordListToTable(frm){
  with(frm){
  var A=words.value.split("\n");
  var R="";
  for(var i=0;i<A.length;i++){
    var row="<tr class='ntDef' id='"+A[i].replace(/[ \-\~]+/g,'')+"_a1'>\n  "
        row+="<td class='ntTerm'>"+A[i]+"</td>";
        row+="<td class='ntPos'>adj</td><td class='ntDesc'></td>";
        row+="<td class='ntPatList'><span class='ntPat'>"+A[i]+"</span></td>";
        row+="<td class='ntExList'><span class='ntEx'></span></td>";
    R+=row+"</tr>\n";
    }
  words.value=R;
  }
}
function toStr(elt){
var xmlSer=new XMLSerializer();
var S=xmlSer.serializeToString(elt);
return S+"; nodeType="+elt.nodeType; 
}
/***************************************************************************/
// http://www.codingforums.com/showthread.php?s=93950459582996e259178676a3305635&threadid=31489

function maak(strXML){
    var objDOMParser = new DOMParser();
    var objDoc = objDOMParser.parseFromString('<xml>'+strXML+'</xml>', "text/xml");
  
  while (this.hasChildNodes())  this.removeChild(this.lastChild);
var objImportedNode;
for (var i=0; i < objDoc.childNodes[0].childNodes.length; i++) {
  switch (objDoc.childNodes[0].childNodes[i].nodeType){
case 3: objImportedNode = document.createTextNode(objDoc.childNodes[0].childNodes[i].data);
break;
              default:           
objImportedNode = document.importNode(objDoc.childNodes[0].childNodes[i], true);break;
 }
  this.appendChild(objImportedNode);
} //End: for
  }
  
function getXML() {
    var objXMLSerializer = new XMLSerializer();
  var temp=this.childNodes.length-1;
  var strXML='';
  for (var i=0;i==temp;i++){
  
  switch (this.childNodes[i].nodeType){
 case 3: strXML+=this.childNodes[i].data.replace(/</g,'&lt;').replace(/>/g,'&gt;');
break;
  default: strXML+=objXMLSerializer.serializeToString(this.childNodes[i]);
break;
  
              }
   
  }
    return strXML;
}

Node.prototype.__defineGetter__("innerXML", getXML);
Node.prototype.__defineSetter__("innerXML", maak);

var segTexts;

function buildGlossTable(frm,initKwic){
  loadFrames(frm);
  if(!initKwic)setInnerXHTML(document.getElementById("glossTable"),frm.words.value);
//alert("gT="+toStr(document.getElementById("glossTable")));
  if(!initKwic)doIt('glossTable');
  if(initKwic)buildKwic(frm);
  if(initKwic)$('kwic').scrollIntoView();
  document.forms.editForm.scrollIntoView();
}

function wordsToList(frm){
  with(frm){
    var data=words.value.replace(/'m/g,"").replace(/'s/g,"").replace(/'ve/g,"").replace(/'ll/g,"");
    var badWords=badStr.value.split(",");
    for(var i=0;i<badWords.length;i++){
      data=data.replace(new RegExp(badWords[i],"g"),"");
      }
    var A=wordList(data,dPat.value);
    var B=new Array();
    for(var i=0;i<A.length;i++){
      var w=A[i];
      if(w.charAt(0) <= 'Z'){ // uppercase
        var j=i+1; // j is lookahead
        for(;j<A.length && A[j].charAt(0) <= 'Z' && A[j].charAt(0) >= 'A';j++)w+=" "+A[j];
        i=j-1;
        }
      B[B.length]=w;
    }
    words.value=B.join("\n");
  }
}
function delRow(frm){
  var theGlossTable=top.builder.obs['glossTable'];
  with(frm){
    if(!(oldTermId.value)){alert("no term selected");return -1;}
    var row= theGlossTable.remDef(oldTermId.value);
    document.forms.wordForm.words.value=theGlossTable.xdDomElement.innerHTML; 
    return row;
  }
}
function getFormSelect(form,nam){
  with(form[nam])return options[selectedIndex].value;
}
function updRow(frm){
  var theGlossTable=top.builder.obs['glossTable'];
  // alert('updRow');
  with(frm){
  // alert('termId='+termId.value+"; oldTermId="+oldTermId.value);
    if(termId.value==oldTermId.value){
      var ntDefOb=theGlossTable.getDef(oldTermId.value);
      with(ntDefOb.xdParts){
        ntTerm.setTextValue(term.value);
        ntPos.setTextValue(pos.options[pos.selectedIndex].value);
        ntDesc.setTextValue(desc.value); 
        ntPatList.xdParts.ntPat[0].setTextValue(pat.value);
      }
      setOccurs(ntDefOb, ntDefOb.xdParts,occurs.value);
      return theGlossTable.getDefLoc(oldTermId.value);
    } else {
    // alert("time to delete");
    delRow(frm); 
    // alert("deleted, time to add");
    return insRow(frm);
   }
  }
}

function setOccurs(ntD,xdP,exVals){ // 
  //if(!xdP.ntExList)ntD.addChild("td","ntExList");
  // if(!xdP.ntExList.xdParts.ntEx)xdP.ntExList.addChild("span","ntEx");
  xdP.ntExList.xdParts.ntEx[0].setTextValue(exVals);
}
function insRow(frm){
  var theGlossTable=top.builder.obs['glossTable'];
  // alert('about to insDef');
  with(frm){
  var row=theGlossTable.insDef(termId.value,term.value,pos.options[pos.selectedIndex].value,desc.value,pat.value,occurs.value);
  // alert('row inserted');
  document.forms.wordForm.words.value=theGlossTable.xdDomElement.innerHTML;
  return row;
  }
}

function fixTermId(frm){
 with(frm)termId.value=term.value.replace(/[ \-\~]+/g,'')+"_"+pos.options[pos.selectedIndex].value+"1";
}
function setNextForm(i,frm){
  var theGlossTable=top.builder.obs['glossTable'];
  var def=theGlossTable.xdParts.ntDef[i];
  if(!def)return frm.reset();
  var term=def.xdParts.ntTerm.toString();
  def.xdDomElement.scrollIntoView(true);
  theGlossTable.selectDef(def.xdDomElement.id);
}

/************splitWords***************/
var splitDelim="QQQQ";
// var patWords={comput:"computer_n1",layer:"layer_n2",Parks:"ProfessorTomParks_n1"}

/**
  * p,w is a (pattern-string,word) pair e.g. ("comput", "computer_n1")
  * S is a string which may have tags, but we're sure that no tag begins with w
  * result: a copy of the string with markup inserted,
  *  namely a link to "#computer_n1" for every word beginning with "comput",
  *  e.g. computer, computing, Computer.
**/
function splitByWord(S,p,w){
 var re=new RegExp("(\\b"+p+"\\w*)","ig");
 S= S.replace(re,"$1<a target='theGlossary' href='theDict.html#"+w+"'></a>");
 return S;
}
/**
  * splitLinks separates empty anchors which may have been generated by splitByWord
  * so that we won't look inside them. 
**/
function splitLinks(S){
  var re=/(<a[^>]*><\/a>)/g;   // </a>
  S=S.replace(re,splitDelim+"$1"+splitDelim);
  return (S.split(splitDelim));
}

/**
  * splitByPatWords takes a pW defining pattern-string,word pairs, and
  * applies each of them to the string S, using splitLinks so that it
  * never transforms an anchor generated by splitByWord in previous iterations.
**/
function splitByPatWords(S,pW){
  for(var p in pW){
    var SS=splitLinks(S);
    for(var j=0;j<SS.length;j+=2)
      SS[j]=splitByWord(SS[j],p,pW[p]);
    S=SS.join("");
  }
  return S;
}

function ntGloss_splitWords(S){
  var A=this.xdParts.ntDef;
  var pW=new Object();
  for(var i=0;i<A.length;i++){
    var ntD=A[i];
    var termId=ntD.xdDomElement.getAttribute("id");
    var pLst=ntD.xdParts.ntPatList;
    if(!pLst)continue;
    var p=pLst.xdParts.ntPat[0];
    if(!p)continue;
    var patStr=p.toString();
    pW[patStr]=termId;
    }
// alert(obToString(pW));
  return splitByPatWords(S,pW);
}
ntGloss.prototype.splitWords=ntGloss_splitWords;

function send(url,method,val){
  var request = new XMLHttpRequest();
  request.open(method, url, false);
  request.send(val);
  alert("status="+request.status);
  var text=request.responseText;
 // try{
    //alert("xml?="+doc2String(request.responseXML));
  //}catch(e){alert("xml error:"+e);}
  return text;
}

function buildKwic(frm){
  segTexts=[];
  R=[];
  for(var i=0;i<iFrameIDs.length;i++){
   pm_kwic(R,iFrameNames[i],$(iFrameIDs[i]).contentDocument.getElementById("MannX_data"));
  // alert("R.length="+R.length+"; R="+R.join("\n"));
   }
  R=remKwicRows(R,frm);
  R=R.sort(function(A,B){return cpkwic(A,B,4);}); // compare position 4
  var SS= array2Table(R);
  var kwicTable=$('kwic');
  setInnerXHTML(kwicTable,SS);
  var rows=kwicTable.getElementsByTagName("tr");
  for(var i=0;i<rows.length;i++)rows[i].onclick=kwicClick;
}

var skipStringsList="n't,'s,--,'ll,'m".split(",");

/**
  * wordsFromString("hey,   don't -- I mean it!") = [hey, don't,I,mean,it")
**/
function wordsFromString(S){
  S=S.replace(String.fromCharCode(8226),"");
  // S=S.replace(String.fromCharCode(160),"");
  var RE=new RegExp(String.fromCharCode(160),"g");
  S=S.replace(RE,"");
  if(S.indexOf(String.fromCharCode(160))>=0)throw alert("bad 160 in "+S);
  S=S.replace(/[ \n\r\t.,*:;#?<>+\[\]/!()\"]+/g," ");
  while(S && S[0]==" ")S=S.substring(1);
  if(S.length==0)return [];
  S=S.split(" ");
  var R=[];
  for(var i=0;i<S.length;i++){
    var Si=S[i]; if(Si && Si!=" " && Si!="-" && Si!="--")R[R.length]=Si;
    }
  return R;
}

function cpkwic(A,B,i){
try{
 var a=A[i].toLowerCase();
 var b=B[i].toLowerCase();
 if(a==b)return 0;if(a<b)return -1;return 1;
}catch(e){alert("cpkwic: "+e+"\nA=["+A+"],\nB=["+B+"],\ni="+i+";");return -1;}
}

function pm_kwic(R,ifName,elt){
  if(!R)R=[];
  var K=[]; S=""; // alert(this.scriptWindow.document.body);
  // var elt=this.scriptWindow.document.getElementById("MannX_data"); 
  var justStarted=true;
  if(!elt)return alert("no MannX_data element!");
  for(var nd=elt.nextSibling;nd;nd=backtrackNextNode(nd)){
    if(nd.nodeType==1 && nd.nodeName.toLowerCase()=="span" && nd.className=="synch"){
      if(!justStarted){K[K.length]=S;S="";}
      justStarted=false;
      //if(nd.nextSibling)nd=nd.nextSibling; // it's a synch node, we don't want the innerHTML
    } else if(nd.nodeType==3 && nd.parentNode.className!="synch"){S+=nd.nodeValue;}
    // else if(!confirm(""+nd.nodeType+":"+nd.nodeName+":"+nd.className+":"+nd.nodeValue+"\n"+K.join("\n")))return alert("ouch");
    }
  for(var i=0;i<K.length;i++)
      segTexts.push('["'+ifName+'#s'+i+'","'+K[i].replace(/\s+/g," ").replace(/\"/g,"&quot;")+'"]')
  K=K.map(wordsFromString);
  for(var i=0;i<K.length;i++){var seg=K[i];
    for(var j=0;j<seg.length;j++)
      addKwic(R,ifName,K,i,j,3,3);
      }
}

function kwicClick(evt){
  var theGlossTable=top.builder.obs['glossTable'];
  var cells=this.getElementsByTagName("td");
  var field=document.forms.editForm.occurs;
  var occurs=field.value?field.value.split(","):[];
  var occurCell=cells[0];
  var occurrenceAndId=occurCell.innerHTML.split(":"); // either [algo0101#12], or [algo0101#12,sound_v1]
  occurs[occurs.length]=occurrenceAndId[0];
  if(document.forms.editForm.termId.value)
    occurCell.innerHTML=occurrenceAndId[0]+":"+document.forms.editForm.termId.value;
  else occurCell.innerHTML=occurrenceAndId[0];
  field.value=occurs.join(",");
}

function scrollKwicTo(pat){
  var kwicTable=$('kwic');
  var rows=kwicTable.getElementsByTagName("tr");
  for(var i=0;i<rows.length;i++){
    var cells=rows[i].getElementsByTagName("td");
    if(cells[4].innerHTML.toLowerCase() >= pat.toLowerCase())return rows[i].scrollIntoView();
    }
}
function array2Table(A){
 return // "<table border='1'>"
    A.map(function(V){return "<tr><td>"+V.join("</td><td>")+"</td></tr>";}).join("\n")
   // +"</table>";
   }

/**
  * tryGetItem([the,time,for],0,SS,13) == [the,time,for][0]="the";
  * it is invoked if SS[13] == [the,time,for];
  * tryGetItem([the,time,for],-1,SS,13) will get the last item from SS[12];
  * tryGetItem([the,time,for],3,SS,13) will get item(0) from SS[13]; etc.
**/
function tryGetItem(A,i,deflt,segSeq,segNum){
try{
  if(i<0){
    if(segNum<=0)return deflt;
    var prevSeg=segSeq[segNum-1];
    return tryGetItem(prevSeg,prevSeg.length+i,deflt,segSeq,segNum-1);
  } else if(A.length<=i){
    segNum+=1;
    if(segNum >= segSeq.length)return deflt;
    return tryGetItem(segSeq[segNum],i-A.length,deflt,segSeq,segNum);
  } else return A[i];
}catch(e){alert("tryGetItem:"+e+"\nA="+A+"\nsegNum="+segNum+"\ni="+i+"\nsegSeq="+segSeq); throw "ugh";}
}
/**
 * addKwic(R,ifName,segSeq,segNum,posInSeg,pre,post) takes
   R ... cumulative kwic array, to be extended;
   ifName=algo0101 // the iframename (unitName) we're working in
   segSeq= seguence of all segments seg, such as
    segSeq[segNum]=[Now, is, the, time, for, all, good, men, to, come, to, the]
   segNum=12  // there are 12 previous 0-indexed segments
   posInSeg=5 // we want to index the word at 0-indexed pos 5=all
   pre=2 // along with time, for
   post=3 // and good, men, to
      and adds the following to the accumulative array R:
   [12,time,for,all,good,men,to]
**/
function addKwic(R,ifName,segSeq,segNum,pos,pre,post){
  var segWords=segSeq[segNum];
  var seqlen=2+pre+post;
  A=[];
  A[0]=ifName+"#"+segNum;
  for(var i=1;i<seqlen;i++)A[i]=tryGetItem(segWords,i+-1+pos-pre,"",segSeq,segNum);
  R[R.length]=A;
  }

function $(x){return document.getElementById(x);}

function doMO(e){
  var counter=0;
  var f=function(evt){
          resTextArea.value=e.tagName+':'+(counter++)+':'+e.innerHTML;
          evt.stopPropagation();
        };
  e.addEventListener('mouseover',f,false);
  for(var s=e.firstChild;s;s=s.nextSibling)doMO(s);
  };

var iFrameIDs=[];
var iFrameNames=[];

function scriptsToWords(){
 var ifList_Names=loadFrames(document.forms.wordForm);
 var iFrameList=ifList_Names[0];
 iFrameNames=ifList_Names[1];
  if(!confirm(""+iFrameList.length+" iframes: "+iFrameNames.join(",")))return;
  var initWords="";
  for(var i=0;i<iFrameList.length;i++){
    initWords+=textValueNC($("ifn_"+i).contentDocument.body)+"\n";
  }
  document.forms.wordForm.words.value=initWords;
}

function loadFrames(frm){
var ifnn=frm.docs.value.split(",");
iFrameNames=[]; iFrameIDs=[];
for(var i=0;i<ifnn.length;i++)
  if(ifnn[i]&&ifnn[i].length>1)
    iFrameNames[iFrameNames.length]=ifnn[i];
var iFrameList=[];
for(var i=0;i<iFrameNames.length;i++){
  var ifn=iFrameNames[i]; 
  var ifid="ifn_"+i; iFrameIDs[iFrameIDs.length]=ifid;
  if(ifn.indexOf("http:")!=0)ifn="../../"+ifn+"/theScript.xhtml";
  else ifn+="/theScript.xhtml";
  iFrameList[i]="<tr><td>"+
       '<iframe  name="'+ifid+'" id="'+ifid+'" src="'+ifn+'"></iframe>'+
       "</td></tr>";
  }
  var iFrameTable=$('iFrameTable');
  setInnerXHTML(iFrameTable,iFrameList.join("\n"));
  return [iFrameList,iFrameNames];
}

function commentariesToSegmentList(){
 var ifList_Names=loadFrames(document.forms.wordForm);
 var iFrameList=ifList_Names[0];
 iFrameNames=ifList_Names[1];
  if(!confirm(""+iFrameList.length+" iframes: "+iFrameNames.join(",")))return;
  var segList=[];
  for(var i=0;i<iFrameList.length;i++){
    var T=$("ifn_"+i).contentDocument.getElementById("translationTable");
    if(!T){alert("no translationTable in "+iFrameNames[i]);continue;}
    var TR=T.getElementsByTagName("tr");
    for(var r=0;r<TR.length;r++){
      segList.push('["'+iFrameNames[i]+"#s"+r+'","'+(textValueNC(TR[r]).replace(/\s+/g," ").replace(/\"/g,"&quot;"))+'"]');
    }
  }
  document.forms.wordForm.words.value="["+segList.join(",\n")+"]";
}
function scriptsToSegments(frm){ 
  // title="load the named scripts into iframes below, and put segTexts in textarea" type="button"/>
  scriptsToWords();
  buildKwic();
  frm.words.value="["+segTexts.join(",\n")+"]";
}
function commsToSegments(frm){  //commTexts
  commentariesToSegmentList();
}
function textValueNC(node){if(!node)return "";
  if(node.nodeType==8)return ""; // comment node
  if(!node.firstChild)return (node.nodeValue)?node.nodeValue:"";
  var S="";
  for(var nd=node.firstChild;nd;nd=nd.nextSibling)S+=textValueNC(nd);
  return S;
}
