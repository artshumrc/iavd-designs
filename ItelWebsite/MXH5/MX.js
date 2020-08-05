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

// MX.js assumes mfDomLib.js has been read.

/** mxLoad(), the standard MannX onload function,
    reads the configData textarea as defining a configuration
    object; this object points to the default configuration
    config.js, which is to be read and used in runConfig()
**/

// function mxLoad(){
  // var cfg=JSONeval($('configData').value);
  // addJSScript(cfg.folders.code+"config.js");
  // mxLoad.cfg=cfg;
  // setTimeout("runConfig()",10);
// }

var loadTime = 0;
function mxLoad(){ // this is where we start; nothing has happened yet, really..
// if(window.parent)alert("title="+window.parent.document.title);
  var scriptDiv=$('scriptDiv');
  if(top.thePlayerManager.initialized)
    scriptDiv.onmouseup=function(evt){top.thePlayerManager.onmouseup(evt);};
  else
    scriptDiv.onmouseup=function(evt){alert("the player is not yet initialized");};

  var cfg=JSONeval($('configData').value);
  addJSScript(cfg.folders.code+"config.js");
  mxLoad.cfg=cfg;
  setTimeout("runConfig()",10);

  // Resize movie player when window size changes
  window.onresize = function(e) {
    if(loadTime == 0) {
      loadTime = setTimeout(function() {
        var window_dimensions = getWindowDimensions();
        config.movie.height = window_dimensions[1] / 2.4;
        config.movie.width = window_dimensions[0] / 2.2;

        var obS = ''
        obS+='<video id="video" controls preload="auto"';   // width, height, preload
        obS+=' width="'+config.movie.width+'" height="'+config.movie.height+'"';

        var movies=config.movie.fileNames;
        if(config.movie.fileName)movies.push(config.movie.fileName);
        for(var i in movies){
          obS+='<source src="'+movies[i]+'" type="video/'+fileType(movies[i])+'"></source>\n';
        }

        obS+='<param name="src" value="'+movies[0]+'" />\n';
        obS+='<param name="showlogo" value="false" />\n';
        obS+='<param name="autoplay" value="false" />\n';
        obS+='</video>\n';

        container = document.getElementById('innerMovieDiv');
        container.innerHTML = obS;
        loadTime = 0;
      }, 1000);
    }

  }
}

/**
  runConfig() waits until the config.js code has loaded, defining "config".
  It then uses the textarea configuration data to overwrite parts of config,
  and finally allows the URLParams http://blah/whatever?a=b&c=d&e=f to
  override any which are marked as overridable; e.g.
     http://blah/whatever?initStyle=msc&initScripts=X.js,Y.js&movie_range=1-3
  will set the initStyle and the initially selected segments, but not the
  initScripts because those aren't overridable.
**/

function addStyles(){
// alert("adding styles");
  var cssFolder=config.folders.css;
  var cssFiles=config.cssFiles;
  for(var css in cssFiles)
    if(cssFiles[css])
      styleSheetHandler.addStyle(css,cssFolder+cssFiles[css]);
  styleSheetHandler.activate(config.initStyle);
  var addedStyles=config.addedStyles.split(",");
  for(var css in addedStyles)
    if(addedStyles[css])
      styleSheetHandler.buildStyle(cssFolder+addedStyles[css]).disabled=false;

}

function addTopDivs(){
// alert("adding topdivs");
  newChild(document.body,"div").id="otherDivs";
  newChild($('otherDivs'),"div").id="movieDiv";
  newChild($('otherDivs'),"div").id="search";
  newChild($('otherDivs'),"iframe").id="glossFrame";
  $('glossFrame').onload=buildGloss;
  $('glossFrame').src=config.dict;
  newChild(document.body,"div","movieLoadSplash","movieLoadSplash");
// alert("added topdivs");
}
function loadJSScripts(){
  var scripts=config.initScripts.split(",");
  for(var i in scripts)addJSScript(config.folders.code+scripts[i]);
  addJSScript(config.folders.code+"GlossTriple.js");
  addJSScript(config.folders.shared+"segTexts.js");
// alert("added jsscripts");
}

function runConfig(){
  if(!window.config || !window.styleSheetHandler)return setTimeout("runConfig()",100);
  config.update(mxLoad.cfg);
  config.update(config.getURLParams(window.location.href));
  if(config.logLevel>0)alert("runConfig logLevel "+config.logLevel);
  if(!config.folders.home)config.folders.home=config.folders.code.split("CODE")[0];
  loadJSScripts();
  addTopDivs(); // GlossTriple.js should be there before glossFrame is loaded
  startMovieConstruction();
// alert("runConfig done");
}
function startMovieConstruction(){ // wait until MoviePlayer.js has loaded
  if(!top.generateMoviePlayerElement)return setTimeout("startMovieConstruction()",50);
  setGenerateMovieDiv($('movieDiv'),config);
  initMovie(); // initialize movie, possibly within a new setTimeout thread

  addStyles();
  setGenerateSearchElement($('search'),config);
  buildScript();
  setMovieLoadSplashScreen($('movieLoadSplash'));
  // setTimeout("buildGloss()",1000);
}

/** setMovieLoadSplashScreen provides the splashscreen source;
    shown when movie is not loaded to selected segment

**/
function setMovieLoadSplashScreen(elt){

var S='<p>The movie has not loaded far enough to play your request.';
S+=" <div id='movieErr'/>";
S+=' You may be able to play an earlier segment, ';
S+=' or you can study the text and look words up in the dictionary.</p>';
elt.innerHTML=S;
}

function setGenerateMovieDiv(elt,config){
  var S= // "<div id='movieBox'>"+generateMoviePlayerElement(config)+
  '<div id="movieContainer" style="float:right; width:100%">'+
  '<div id="innerMovieDiv" class="movie">'+generateMoviePlayerElement(config)+'</div>'+
  '<div class="playbuttons" id="playerButtons"></div>'+
  '</div>';
  elt.innerHTML=S; 
  if(document.embeds.FlowPlayer && !document.embeds.FlowPlayer.id)
    document.embeds.FlowPlayer.id='FlowPlayer';
}
function ob2S(o){
 var S="{";
 for(x in o){
   try{S+=x+":'"+o[x]+"',\t";}catch(e){S+=x+":'"+e+"',\t";}
   }
 return S+"}";

}

/** setGenerateSearchElement creates a form for dictionary lookup and segment 
  * text/regexp search
**/

function setGenerateSearchElement(elt,config){if(config.logLevel>0)alert("running setGenerateSearchElement");
var dynamicHTML=false;
if(dynamicHTML){ // this kind of code may be needed for IE; 
var A=[["form","action","javascript:void(0)","name","searchForm","id","searchForm",
       "onsubmit",
         "thePlayerManager.lookup(document.forms.searchForm.searchfield.value,document.forms.searchForm)"],
        ["input","id","searchfield","name","searchfield","type","text","size","35",
          "title","search text; word for dict, can be reg exp for script or commentary"],
        ["input","id","searchbutton","value","Search","type","button",
           "onclick","thePlayerManager.lookup(this.form.searchfield.value,this.form,event)",
           "title","search for word in dict, or for text in page or (with ctrl key down) repository"],
        ["br"],
        [["div","id","boxes"],
         ["input","onchange","checkChanger.change(this)","type","checkbox",
            "checked","checked", "name","dict", "id","dictCheckbox"],
         [null,"dictionary\u00A0\u00A0"],
         ["input","onchange","checkChanger.change(this)","type","checkbox",
            "checked","checked", "name","script", "id","scriptCheckbox"],
         [null,"script\u00A0\u00A0"],
         ["input","onchange","checkChanger.change(this)","type","checkbox",
            "checked","checked", "name","comm", "id","commCheckbox"] ,
         [null,"commentary\u00A0\u00A0"]
        ]
       ];
  var X=newElt(A); elt.appendChild(X);
} else {

var S= // ' <div id="search">\n'+
'     <form action="javascript:void(0)" name="searchForm"\n'+
'   onsubmit="thePlayerManager.lookup(document.forms.searchForm.searchfield.value,document.forms.searchForm)">\n'+
'    <input  id="searchfield" type="text" size="35" \n'+
'      title="search text; word for dict, can be reg exp for script or commentary" />\n'+
'    \n'+
'    <input id="searchbutton" type="button" value="Search" \n'+
'       onclick="thePlayerManager.lookup(this.form.searchfield.value,this.form,event)" \n'+
'      title="search for word in dict, or for text in page or (with ctrl key down) repository" /> <br/> \n'+
'    <div id="boxes">\n'+
'      <input onchange="checkChanger.change(this)" type="checkbox" \n'+
'          checked="checked" name="dict" id="dictCheckbox" />dictionary\u00A0\u00A0\n'+
'      <input onchange="checkChanger.change(this)" type="checkbox" \n'+
'          name="script" id="scriptCheckbox" />script\u00A0\u00A0\n'+
'      <input onchange="checkChanger.change(this)" type="checkbox" \n'+
'          name="comm" id="commCheckbox" />commentary\u00A0\u00A0</div>\n'+
'    </form>\n';
// '</div>';
elt.innerHTML=S;
}
if(config.logLevel>0)alert("done setGenerateSearchElement");
} 

function doSearch(evt,frm){
top.thePlayerManager.lookup(frm.searchfield.value,frm,evt);
}
var checkChanger={
  change:function(box){
    this[box.name](box.form,box.checked);},
  dict:function(frm,on){
    if(on){frm.script.checked=(frm.comm.checked=false);}
    else {frm.script.checked=(frm.comm.checked=true);} },
  script:function(frm,on){
    if(on)frm.dict.checked=false;
    else if(!frm.comm.checked)frm.dict.checked=true;},
  comm:function(frm,on){
    if(on)frm.dict.checked=false;
    else if(!frm.script.checked)frm.dict.checked=true;}
}

/** initMovie waits until the movie has initialized itself;
    it works only with Flash FLV and Real, as of 20071214;
    it then adds the movie buttons and invokes the moviePlayers setConfig.
**/

function getMovieInDocument(config){
  var playerClass=config.movie.playerClass;
  if(playerClass=="H5MoviePlayer"){
    return $('video');
  }else if(playerClass=="FlashFLVMoviePlayer"){
    return $('FlowPlayer');
  }else if(playerClass=="RealMoviePlayer"){
    var rp=document.embeds.realvideoax;
    if(!rp)rp=window.realvideoax;
    if(!rp)return null;
    return rp;
  }else return alert("getMovieInDocument "+playerClass+" not supported yet, sorry");
}
function initMovie(){
  var movieDomObject=getMovieInDocument(config);
  // if(!confirm("movieDomObject="+doc2String(movieDomObject)))throw "oops";
  if(!movieDomObject)return setTimeout("initMovie()",100);
  // var mfOb=new top[mfClassName]();
  moviePlayer=new top[config.movie.playerClass](movieDomObject);
  // if(!confirm("moviePlayer="+moviePlayer))throw "oops";

  controlsManager.addPlayerButtons($('playerButtons'));
  if(config.movie.playerClass=="FlashFLVMoviePlayer")
    setTimeout("configurePlayer(0)",1000);
  else setTimeout("stopMovieThenInitPlayer()",1000);
}

function buildGloss(){
  try{
  var gF=$('glossFrame');
  if((gF).contentWindow.location.href=='about:blank'){gF.src=gF.src;return setTimeout('buildGloss()',500);}
  mfObjects.build($('glossFrame').contentDocument.getElementById('glossTable'),ntGlossGrammar);
  }catch(e){alert("buildGloss error:"+e+"\n unable to continue");throw(e);}
}
function configurePlayer(N){
  var player=moviePlayer.player;
  var S="";
  if(player.setConfig) player.setConfig(fpConf(config));
  else if(N>40){ 
    if(!confirm("player.setConfig not loaded, as if from out-of-date Flash player; keep trying?"))
      throw "user abort, player.setConfig not loading";
    else return setTimeout("configurePlayer(0)",100);
  }
  else return setTimeout("configurePlayer("+(N+1)+")",100);
  waitForMoviePlayFunctions();
}
function waitForMoviePlayFunctions(){
  var player=moviePlayer.player;
  var good=player.isPlaying && player.isPaused && player.Pause && player.StopPlay;
  if(!good)return setTimeout("waitForMoviePlayFunctions()",100);
  setTimeout("stopMovieThenInitPlayer(25)",200);
}
function stopMovieThenInitPlayer(N){
  try{moviePlayer.stop(); moviePlayer.setMovieTime(0);}
  catch(e){
    if(N>0)return setTimeout("stopMovieThenInitPlayer("+(N-1)+")",200)
    var S="the video functionality is not fully loaded;\n"+
          "I'm still getting an error ["+e+"]\n"+
          "which may just mean the server is slow;\n"+
          "should I keep trying?";
    if(!confirm(S))
      throw "loading error from stopMovieThenInitPlayer(): "+e; 
    return setTimeout("stopMovieThenInitPlayer(40)",200);
   }
  // var z=""; for(x in moviePlayer.player)z+=x+";\t"; // alert(z);
  setTimeout("thePlayerManager.init()",200);
}


function moveDivClass(S,T,cls){
// move div elts of class cls from S to T, in order
  var s=S.firstChild;
  while(s){
    var nxt=nextNode(s,S); // what would have been;
    var nxtOver=nextNodeOver(s,S); // if no sub.
    if(s.className && s.className.indexOf(cls)==0){
      T.appendChild(s);
      s=nxtOver;
      } else {// alert(s.className);
    s=nxt;
    }
    }
}

/********** microformat for script ************/

var scriptGrammar={mxScript:{synch:"*",comm:"*"},
                   synch:{scriptNode:"*"}, // added dynamically
                   comm:{},
                   scriptNode:{}
                   };
function synch(){}
synch.prototype=new MicroFormat();
synch.prototype.mf_events={
  onclick:function(){
  var mfOb=mfObjects.obs[this.id];
  // alert(""+mfOb.mf_myIndex()+":"+mfOb.time+".."+mfOb.getEndTime());
  }
}

synch.prototype.postInit=function(){
 var level=this.mf_elt.className.split(" ")[1];
 if(!level || !level.charAt(0)=='L')return this.level=0;
 return this.level=parseInt(level.substring(1));
}

synch.prototype.getSegment=function(){
  var p=this.mf_elt.parentNode; // usually a segment node;
  if(p && p.className && p.className.indexOf("segment")==0)return p;
  return null;

}

synch.prototype.scrollIntoView=function(){
  var p=this.getSegment();
  if(p)p.scrollIntoView();
  else this.mf_elt.scrollIntoView();
}

function scriptNode(){}
scriptNode.prototype=new MicroFormat();
scriptNode.prototype.select=function(){
  var elt=this.mf_elt;
  if(elt.className.indexOf("selected")<0)
   elt.className+=" selected";
}

scriptNode.prototype.unselect=function(){
try{
  var elt=this.mf_elt;
  elt.className=elt.className?elt.className.split(" selected").join(""):"";
}catch(e){alert("unselect("+this+"):"+(e.description?ob2String(e):e));}
}

function toS(e){
  if(!e)return "null";
  if(e.innerHTML)return e.innerHTML;
  if(e.nodeValue)return e.nodeValue;
  return ""+e;
  }

function properties(ob){
  var S="{";
  for(var x in ob)S+=x+"\t";
  return S+"}";
}
/** getComms({subj:2,gram:1},[c1,c2,c3,c4])
     where c1.className="comm subj" == c3.className == c4.className
           c2.className="comm gram"
    = [[c2],[c1,c3,c4]]
**/
function getComms(clsOb,commArray){
  // alert("clsOb="+ob2Str(clsOb));
  var N=0; for(x in clsOb)if(clsOb[x]>N)N=clsOb[x];
  //alert("N="+N);
  var res=new Array(N);
  for(var i=0;i<res.length;i++)res[i]=[];
  for(var i=0;i<commArray.length;i++){
    var comm=commArray[i].mf_elt; var cls=comm.className.split(" ");
    var rowNum;
    try{
    if(cls.length<2)alert("no subclass for comment "+comm.innerHTML);
    else {
      rowNum= clsOb[cls[1]]-1;
       //alert("comm="+i+"row should be "+rowNum);
      // alert("that "+rowNum+" would be: "+ob2Str(res[rowNum]));
      res[rowNum].push(comm);
      }
    }catch(e){alert("cls="+cls+";clsOb="+ob2Str(clsOb)+"; rowNum="+rowNum);}
    }
  return res;
}
function mxScript(){}
mxScript.prototype=new MicroFormat();

mxScript.prototype.setCommClassList=function(){
  if(this.commClasses)return this.commClasses;
  var A=config.commentClasses.split(",");
  this.commClasses={};
  for(var i=0;i<A.length;i++)this.commClasses[A[i]]=i+1;
  this.commClassList=A;
  return this.commClasses;
}


/** synch.segmentTrees() produces an array of the top-level DOM
  subtrees from a given synch on to the next. e.g.,
  <div>
    <span id="A" class="synch">30</span>
    We sang
    <span id="B" class="synch">32</span>
    <blockquote id="C">
      I am the very model
        <span id="D" class="synch">35</span>
      of a singularitarian <br id="E"/>
      I'm combination <em id="F"> Transhuman, Immortalist, Extropian</em><br id="G"/>
        <span id="H" class="synch">38</span>
      Aggressively I'm changing all my body's biochemistry...
   </blockquote>
   in this case, starting from "A" we want the single text node
   containing two words. starting from B we want the first text
   node within "C". From D we would want a text node, "E", a
   text node, "F", "G" and a white-space text node.


**/
function containsClass(nd,cls){
if(!nd)return false;
if(nd.className && nd.className.indexOf(cls)==0)return true;
for(var i in nd.childNodes)
  if(containsClass(nd.childNodes[i],cls))return true;
return false;
}
synch.prototype.initSegmentTrees=function(){
  var A=[];
  var startNode=nextNode(this.mf_elt);
  var parentNode=this.mf_parent.mf_elt;
  for(var n=nextNodeOver(this.mf_elt,parentNode);
       n && (!n.className || !(n.className.indexOf("synch")==0));
     ){
   if(!containsClass(n,"synch")){A.push(n);n=nextNodeOver(n,parentNode);}
   else n=nextNode(n,parentNode);
   }
  return A;
}
synch.prototype.commentsOn=function(){
    if(this.commentArray)return this.commentArray;
    var A=[];
  try{
    for(var n=this.mf_nextSibling;
         n && n instanceof comm;
         n=n.mf_nextSibling){A.push(n); n.mySynch=this;}
    this.commentArray=A;
  }catch(e){alert("commentsOn("+this+"):["+A+"]"+(e.description?e.description:e));}
    return A;
}
synch.prototype.scriptNodes=function(){
    var A=[];
    var parentNode=this.mf_parent.mf_elt;
    for(var n=nextNodeOver(this.mf_elt,parentNode);
         n && (!n.className || !(n.className.indexOf("synch")==0));
       ){
     if(n.nodeType==3){A.push(n);n=nextNodeOver(n,parentNode);}
     else if(n.className && n.className.indexOf("comm")==0)
       n=nextNodeOver(n,parentNode);
     else n=nextNode(n,parentNode);
     }
    return A;
}


synch.prototype.select=function(){
  // var A=this.scriptNode; for(var i=0;i<A.length;i++)A[i].select();
  var p=this.getSegment();
  if(p)return p.className="segment selected";
  var segTrees=this.getSegmentTrees();
  for(var i in segTrees){
     var sT=segTrees[i]; if(!sT.className)continue;
     sT.className+=" selected";
    }
  
  // alert("selected "+this.mf_myIndex());
}

synch.prototype.unselect=function(){
  // var A=this.scriptNode; for(var i=0;i<A.length;i++)A[i].unselect();
  var p=this.getSegment();
  if(p)return p.className=p.className.split(" selected").join("");
  // alert("unselected "+this.mf_myIndex());
  var segTrees=this.getSegmentTrees();
  for(var i in segTrees){
     var sT=segTrees[i]; if(!sT.className)continue;
     if(sT.className)sT.className=sT.className.split(" selected").join("");
    } 
}

mxScript.prototype.showStructures=function(){
  var S="mxScript:\n";
  var f=function(s){
    return "time:"+s.time+
    "\n  text="+arrayMap(s.segmentWrappers,function f(x){return x.innerHTML;})+
    "\n  comments="+arrayMap(s.comments,function f(x){return x.className;})
    +"\n";
    };
  return arrayMap(this.synch,f).join("-----\n");
}

function genNewCommentSelect(commClasses){
var cC=commClasses.split(",");
if(cC.length<1)return alert("no comment classes in config");
var S="<select class='"+cC[0]+"' name='newCommentSelect' id='newCommentSelect' "+
    " onchange='this.className=this.value' "+
    " title='comment class for new comment' >"+
    "<option class='"+cC[0]+"' value='"+cC[0]+"' selected='selected'>"+cC[0]+"</option>";
  for(var i=1;i<cC.length;i++)
    S+="<option class='"+cC[i]+"' value='"+cC[i]+"'>"+cC[i]+"</option>";
  S+="</select>";
  return S;
}

function makeColorRules(commClasses){
// javascript:{var S=document.styleSheets[5];S.insertRule('.subject {background-color:lightgreen;}',S.cssRules.length);}
 var lastSheet= document.styleSheets[document.styleSheets.length - 1];
// (document.styleSheets[5].insertRule('.subject {background-color:lightgreen}',document.styleSheets[5].cssRules.length))
// Test x.insertRule('pre {border: 1px solid #000000}',x.cssRules.length);
var commColors="GreenYellow,lightgray,Chartreuse,LawnGreen,Lime,LimeGreen,PaleGreen,LightGreen,MediumSpringGreen,SpringGreen".split(",");
var A=[];
for(var i=0;i<commClasses.length;i++)
  A.push('.'+commClasses[i]+' {background-color: '+commColors[i]+';}');
for(var i=0;i<A.length;i++){
  lastSheet.insertRule(A[i],lastSheet.cssRules.length);
}
}
mxScript.prototype.makeMadaSetup=function(){
    for(var i=0;i<this.synch.length;i++){
      var s=this.synch[i];
      var t=s.time;
      if(config.showFullTimes)
            t=(""+(Math.round(1000*t))).replace(/(\d\d\d)$/,".$1");
      else t=Math.round(t);
      s.mf_elt.innerHTML=t;
    }
}

function stringFromTo(str,startMark,endMark){
  var startPos=(!startMark)?0:str.indexOf(startMark); if(startPos<0)startPos=0;
  var endPos=(!endMark)?startMark:str.indexOf(endMark,startPos); if(endPos<0)endPos=startPos;
  return str.substring(startPos, endMark.length+endPos);
}

function send(url,method,val){
  var request = new XMLHttpRequest();
  request.open(method, url, false);
  request.send(val);
  // alert("status="+request.status);
  var text=request.responseText;
  return text;
}
function getFile(url){return send(url,"GET",null);}



mxScript.prototype.postInit=function(){
 buildScriptTime=(new Date().getTime()-buildScriptTime);
  this.buildStructures();
if(config.logLevel>0)
  if(!confirm('structures built; timings: '+timings))throw "no mxScript.postInit";
  if(!config.initStyle)return;
  var scriptDiv=$('scriptDiv');
  scriptDiv.onmouseup=function(evt){top.thePlayerManager.onmouseup(evt);};
  scriptDiv.onscroll=function(evt){ window.getSelection().removeAllRanges(); };
  if(config.initStyle=='mada' || config.initStyle=="mdaa")return this.makeMadaSetup();

return alert("invalid initStyle: "+config.initStyle);
}

var xmlns="http://www.w3.org/1999/xhtml";

mxScript.prototype.segmentFromNode=function(nd){
  var mfOb=mfObContainingNode(nd);
  if(!mfOb)return null;
  if(mfOb instanceof scriptNode)mfOb=mfOb.mf_parent;
  if(mfOb instanceof synch) return mfOb.mf_myIndex();
  if(mfOb instanceof comm) return mfOb.mySynch.mf_myIndex();
  var N=0;
  try{
  for(var nd2=this.synch[0].mf_elt;nd2 && nd2!=nd;nd2=nextNode(nd2,this.mf_elt))
    if(nd2.className && nd2.className.match("synch"))N=mfObjects.obs[nd2.id].mf_myIndex();
  if(nd2==nd)return N;
  }catch(e){throw "error:\n"+e+"\n nd2="+doc2String(nd2);}
  alert("segmentFromNode FAILURE: container for "+doc2String(nd)+"\nwas:\n"+doc2String(mfOb.mf_elt)); return null;
}

/** mxScript:
// as of 20070903, buildStructures does no DOM-changing; it
  only validates and calculates.
  it completes the validation of the microformat,
    making sure that synch nodes contain only legitimate numbers;

  buildStructures completes the validation of the microformat,
  making sure that synch nodes contain only legitimate numbers;
  after buildStructures(), we know that
  this.commClassList is the array of tier names; e.g. ["subject","grammar"];
  this.commClasses is the index of tiername locs: {subject:1,grammar:2}
  this.synch[3].time will be the time synchronized with that point;
  this.synch[this.synchOfTime(sec)] will be the synch, if any, whose
     range corresponds with the time "sec"
  this.synch[3].synchWrapper will be a new span containing the synch span,
    in the place of the synch span.
  this.synch[3].segmentWrappers will be the newly-generated innermost
    spans containing all the text for the segment;
  this.synch[3].comments will be the array of DOM structures
    of class="comm ..." in the segment beginning at synch[3];
  this.synch[3].commentWrappers will be a corresponding array of
    newly-generated divs class="comm" which initially wrap these
  this.synch[3].segmentTrees will be the array of top-most DOM
    structures,  some of which may be innermost spans, containing text
    and formatting for the segment;
**/

mxScript.prototype.segmentFromTime=function(sec){
 var ss=this.synch;
 for(var i=0;i<ss.length && sec >= ss[i].time;i++)
   if(ss[i].containsTime(sec))return ss[i];
 return null;
}
var timings={};
mxScript.prototype.buildStructures=function(){
 timings.buildScriptTime=buildScriptTime;
 var zeroTime=new Date().getTime();
 var trial=function(s,f,i){var baseTime=new Date().getTime();
   try{s[f](i);}catch(e){throw f+" failed on synch["+i+"]=["+s+"]\n"+(e.description?e.description:e);}
   if(!timings[f])timings[f]=1;
   timings[f]+=(new Date().getTime()-baseTime);
   }
 this.setCommClassList();
 var ss=this.synch;
 for(var i=0;i<ss.length;i++){
//if(i%20==0)if(!confirm(""+i+" out of "+ss.length))throw "oops";
   var s=ss[i];
   trial(s,"initTime",i);
   trial(s,"setComments",i);
   }
  ss[ss.length-1].endTime=-1; // will be movie end time;
 timings.total=buildScriptTime+(new Date().getTime()-zeroTime);
  timings=ob2String(timings);
}

function o2S(O){
  var A=[];for(var x in O)try{A.push(x+":"+O[x]);}catch(e){A.push(x+":"+e);}
  return A.join(",");
}

synch.prototype.getEndTime=function(){
  if(this.endTime==-1)this.endTime=thePlayerManager.movie.getMaxTime();
  return this.endTime;
}

synch.prototype.containsTime=function(t,margin){
  if(!margin)margin=0;
  if(t<(margin+this.time))return false;
  if(this.getEndTime()<(margin/2 +t))return false;
  return true;
}

function killElementByID(eid){
 var elt=$(eid); if(!elt)return;
 parentNode(elt).removeChild(elt);
}


synch.prototype.setTime=function(t){
    this.time=t;
    // this.mf_elt.innerHTML=""+Math.floor(t); // no more; this is in makeMada.
    var N=this.mf_myIndex();
    if(N>0)this.mf_parent.synch[N-1].endTime=t;
}

synch.prototype.initTime=function(){this.setTime(parseFloat(this.mf_elt.innerHTML));}

synch.prototype.setComments=function(){
    var f=function(x){return x?x.mf_elt:null;};
    this.comments=arrayMap(this.commentsOn(),f);
}

function arrayMap(A,f){
  var R=[]; if(!A)return R;
  for(var i=0;i<A.length;i++)R.push(f(A[i]));
  return R;
}
synch.prototype.setSegmentTrees=function(){this.segmentTrees=this.initSegmentTrees(); }
synch.prototype.getSegmentTrees=function(){if(!this.segmentTrees)this.setSegmentTrees();return this.segmentTrees;}

var buildScriptTime=0;

function buildScript(){
  try{
    buildScriptTime=new Date().getTime();
    mfObjects.build($('scriptDiv'),scriptGrammar);
    if($('exercises')){
      mfObjects.build($('exercises'),exercisesGrammar);
      if(!($("exerciseDivPadding")))
        newChild($('exercises'),"div","padding","exerciseDivPadding").innerHTML="&#160;";
          }
   }catch(e){alert("buildScript:"+e);}
}

function parseNumberPair(S){
  try{
  var t=typeof S;
  if(t=="number"){return [S,S]}
  if(t=="string"){
   var P=arrayMap(S.split("-"),function(S){return parseFloat(S);});
   if(P.length==1)P[1]=P[0];
   return P;
  }
  return S;
  }catch(e){alert("cannot parse:["+S+"] as number pair");}
  return [0,0];
}
/**.. ..
**/
function doc2StringX(elt){
  if(!elt)return "";
  var S=doc2String(elt);
  if(!S)return "";
  S=S.replace('xmlns="http://www.w3.org/1999/xhtml"',"");
  return(S);
}

/**        thePlayerManager **/
var thePlayerManager={ // assumes "config",moviePlayer,
  playOnSelection:false,
  isAlphabetic:null,
  scriptOb:null,
  movie:null,
  dictOb:null,
  assertionsOb:null,
  currentStartSegment:0,
  currentEndSegment:0,
  //currentActiveSegment:0,
  numSegments:1,
  prevMovieTime:0.0,
  theInterval:null,
  auxInterval:null,
  exercises:null,
  unselect:function(){
console.log("unselect from "+this.currentStartSegment+" to "+this.currentEndSegment);
   for(var i=this.currentStartSegment;i<=this.currentEndSegment;i++)
    this.scriptOb.synch[i].unselect();
  },

  newPage:function(thisPage,offset){
    if(!thisPage)thisPage=config.projectName;
    var units=unitSeq.split(",");
    var pageCount=units.length;
    var pageLoc=-1;
    for(var i=0;i<units.length;i++)
      if(units[i]==thisPage){pageLoc=i;break;}
    if(pageLoc<0)return alert("cannot find this page=["+thisPage+"] in "+unitSeq);
    if(!offset)offset=1;
    window.location.href="../"+units[(pageCount+pageLoc+offset)%pageCount]+".xhtml";
  },
  selectRange:function(lo,hi){
console.log("selectRange("+lo+","+hi+")");
   var synchLevel=config.synchLevel; if(!synchLevel)synchLevel=0;
   var synchs=this.scriptOb.synch;
   if(lo<0)lo=0;
   else while(lo>0 && synchs[lo].level<synchLevel)lo--;
   if(hi>=synchs.length)hi=synchs.length-1;
   else while(hi<(synchs.length-2)&&synchs[hi+1].level<synchLevel)hi++;
   this.unselect();
   this.currentStartSegment=lo;
   this.currentEndSegment=hi;
 // if(!confirm("selectRange("+lo+","+hi+")"))throw "oops";
   // try{with(this.scriptOb){windowSelectionFromTo(synch[lo].mf_elt,synch[hi+1].mf_elt);}}catch(ex){ alert('selectRange err:'+ex);}
   for(var i=lo;i<=hi;i++)this.scriptOb.synch[i].select();
    this.scriptOb.synch[lo].scrollIntoView();
      try{
        var N=$('col_'+lo).offsetLeft;
        $('scriptDiv').scrollLeft=N;
      }catch(e){};

   if(this.playOnSelection)this.playRange();
  },
  onmouseup:function(evt){
    var so=new SelectionObject();
    if(!so || !so.getStartContainerNode())return;
    if(evt.ctrlKey){
       var str=so.toString(); try{so.pickSelection();}catch(ex){};
       return this.lookup(str);
    }
    var scr=mfObjects.obs.scriptDiv;
    var lo=0,hi=0;
    try{
      lo= scr.segmentFromNode(so.getStartContainerNode());
      hi= scr.segmentFromNode(so.getEndContainerNode());
    try{so.pickSelection();}catch(ex){};
    if(lo==null)lo=hi;
    else if(hi==null)hi=lo;
    if(lo==null)return;
    console.log("onmouseup selectRange");
    this.selectRange(lo,hi);
    // (document.selection?document.selection.createRange().text:window.getSelection())
    }catch(ex){alert("error in selecting range from selection object\n"+so+"\nsegments]"+lo+","+hi+"]:\n "+ex);}

   },
   isPlaying:function(){
     try{return this.movie.isPlaying();}
     catch(ex){if((""+ex).indexOf("isPlaying is not")>=0)top.location.reload();}
  },
  checkMovieSynch:function(){
    if(!this.movie)return;
  $('playStopButton').firstChild.src= config.folders.images+(this.isPlaying()?"stop18.gif":"play18.gif");
  $('toggleAutoPlayButton').firstChild.src=config.folders.images+(this.playOnSelection?"on18.gif":"off18.gif");
    var t=this.movie.getMovieTime();
    if(t<0)return; 
    var t0=this.prevMovieTime;
    if(t==t0)return; // no change since last time
    this.prevMovieTime=t;
    var theSynch=this.scriptOb.segmentFromTime(t);
    if(!theSynch)return;
    var synchNum=theSynch.mf_myIndex();
    //if(this.currentActiveSegment==synchNum)return;

    if(!this.movie.isPlaying()){
      if(theSynch==this.scriptOb.segmentFromTime(t0))return;
      if(synchNum==1+this.currentEndSegment)return;
      console.log("checkMovieSynch selectRange theSynch="+theSynch+"; synchNum="+synchNum);
      this.selectRange(synchNum,synchNum);
      return;
      }
    if(!theSynch.containsTime(t,config.segmentTimeMargin))return;
    this.prevMovieTime=t;
    theSynch.scrollIntoView();
    var N=theSynch.mf_myIndex();
      try{
        N=$('col_'+N).offsetLeft;
        $('scriptDiv').scrollLeft=N;
      }catch(e){};

  },
  clearInterval:function(){
    if(this.theInterval==null)return;
    clearInterval(this.theInterval);
    this.theInterval=null;
  },
  lookup:function(txt,frm,evt){
    if(!txt)return;
    if(!this.dictOb)this.dictOb=mfObjects.obs.glossTable;
    if(!this.dictOb)throw "no dictionary defined";
    this.dictOb.caseSensitive=config.caseSensitiveLookup;
    this.dictOb.lookupByID=config.lookupByID;
    if(!frm)frm=document.forms.searchForm;
    if(!frm)frm=this.dictOb.mf_elt.ownerDocument.forms.searchForm;
    var dictChecked=true;
    var scriptChecked=false;
    var commChecked=false;
    if(frm){dictChecked=frm.dict.checked;scriptChecked=frm.script.checked;commChecked=frm.comm.checked;
      if(frm.searchfield)frm.searchfield.value=txt;
      }
    if(dictChecked){
    var ntD=this.dictOb.lookupDef(txt);
    if(!ntD)return; // alert("sorry, no definition for "+txt);
    this.dictOb.setSelectedDef(ntD.mf_elt.id);
    ntD.mf_elt.scrollIntoView();
    }else{
      this.doSearch(txt,scriptChecked,commChecked,evt);
    }
  },
  init:function(){
    var reportAll=true;
    this.playOnSelection=config.playOnSelection;
    this.isAlphabetic=config.isAlphabetic;
    this.scriptOb=mfObjects.obs.scriptDiv;
    this.numSegments=this.scriptOb.synch.length;
    this.movie=moviePlayer;

    try{this.movie.stop();}catch(e){if(reportAll)alert("XXX trouble, movie stop: "+e);};
    this.dictOb=mfObjects.obs.glossTable;
    this.assertionsOb=mfObjects.obs.Triples;
    this.exercises=mfObjects.obs.exercises;
    this.theInterval=setInterval("top.thePlayerManager.checkMovieSynch()",500);
    if(config.movie.range){
      var pair=parseNumberPair(config.movie.range);
      this.prevMovieTime=this.scriptOb.synch[pair[0]].time;
      try{this.movie.setMovieTime(this.prevMovieTime);}
      catch(e){if(reportAll)alert("XXX setMovieTime("+this.prevMovieTime+"):"+e);};
    //  alert("YYY setMovieTime("+this.prevMovieTime+")");
    try{this.movie.stop();}catch(e){if(reportAll)alert("zzz trouble, movie stop: "+e);};
      if(config.initSearch)
        this.scriptOb.emphasizeRegExpInRange(segTexts.regExpFromTxt(config.initSearch),pair);
      console.log("init selectRange");
      this.selectRange(pair[0],pair[1]);
      // setTimeout("top.thePlayerManager.selectRange("+pair[0]+","+pair[1]+")",500);
    }
    this.initialized=true;
    document.body.className="initialized";
  },
  playRange:function(){ // from beginning of start synch to end of end synch
    var reportAll=false;
    var lo=this.currentStartSegment; var hi=1+this.currentEndSegment;
    console.log("playRange segments "+lo+"...."+hi);
    var synchArray=this.scriptOb.synch;
    var start=synchArray[lo].time;
    var end=(hi<synchArray.length)?synchArray[hi].time:this.movie.getMaxTime();
    var len=(end-start)+0.001;
    console.log("playRange from "+start+" through "+end+" len="+len);
    //this.movieLoadWait(start,len);
    if(reportAll)alert("report playRange from "+start +" through "+ end);

    if(config.minPlayTime && config.minPlayTime>len)
      this.movieLoadWait(start-config.prePadMinPlayTime,config.minPlayTime+config.prePadMinPlayTime);
    else this.movieLoadWait(start,len);
  },
  movieLoadWait:function(start,len){
    console.log("movieLoadWait("+start+","+len+")");
    if(this.auxInterval){clearInterval(this.auxInterval);this.auxInterval=null;}
    console.log("auxInterval cleared");
    this.prevMovieTime=start;  // assume we're actually gonna get there...
  var S=this.movie.playRange(start,len); // may yield error message, usually about delay.
  var mLS=$('movieLoadSplash');
  if(!S)return mLS.style.display='none';
  console.log("movieLoadSplash err="+S);
  $('movieErr').innerHTML=S.replace("<","&lt;");
  mLS.style.display='block';
  this.auxInterval=setTimeout('thePlayerManager.movieLoadWait('+start+','+len+')',200); // error on Mar 5, 2015
  console.log("auxInterval set to try again with "+start+","+len+" in 200 msec");
},

  selectPrevSeg:function(evt){
      if(evt && evt.ctrlKey)this.newPage(null,-1);
      var s=this.currentStartSegment-1;
      if(s<0)s=this.numSegments-2;
  try{   this.selectRange(s,s);
  }catch(ex){alert("selectPrevSeg:s="+s);}
     },
  playStopToggle:function(evt){
    if(this.movie.isPlaying()){
      this.movie.stop();
    }else {this.playRange();
    }
    },
  selectNextSeg:function(evt){
      if(evt && evt.ctrlKey)this.newPage(null,1);
      var s=(1+this.currentEndSegment) % this.numSegments;
  try{    this.selectRange(s,s);
  }catch(ex){alert("ERR: "+ex+"; selectNextSeg:s="+s);}
      },
  toggleDict:function(evt){},
  synchToComm:function(evt){},
  synchToMovie:function(evt){},
  toggleAutoPlay:function(evt){this.playOnSelection=!this.playOnSelection;},
  synchToGloss:function(evt){},
  lookupTouched:function(evt){},
}


/**   selection object **/

function SelectionObject(win){ // cross-browser, IE/Mozilla
  if(!win)win=window;
  this.win = win;
  if(win.getSelection){
    this.isIE=false;
    this.selection=win.getSelection();
    if(this.selection.rangeCount==0)this.selection=null;
  } else {
    this.isIE=true;
    this.selection=win.document.selection;
  }
}

SelectionObject.prototype.getStartContainerNode=function(){
  if(!this.selection)return null;
  try{
  if(this.isIE){
    var rng=this.selection.createRange();
    rng.collapse(true); //alert("parentElement="+rng.parentElement().innerHTML);
    return rng.parentElement();
  }else return this.selection.getRangeAt(0).startContainer;
  }catch(ex){}
  return null;
}

SelectionObject.prototype.getEndContainerNode=function(){
  try{
  if(this.isIE)return this.selection.createRange().collapse(false).parentElement();
  else // this.endContainerNode=
     return    this.selection.getRangeAt(0).endContainer;
  }catch(ex){}
  return null;
}

SelectionObject.prototype.toString=function(){
  try{
  if(this.isIE)return this.selection.createRange().text;
  return this.selection.toString();
  }catch(ex){return "";}
}

SelectionObject.prototype.extendSelection=function(startSel,endSel){
 if(!startSel) startSel=parentNode(this.getStartContainerNode());
 if(!endSel) endSel=parentNode(this.getEndContainerNode());
 var sel=this.selection;
 if(this.isIE)return alert("no extendSelection for IE yet");
 sel.extend(startSel,0);
 sel.collapseToStart();
 sel.extend(endSel,endSel.length);
 this.startContainerNode=null; // reset in case no longer valid.
 this.endContainerNode=null;
}

SelectionObject.prototype.pickSelection=function(){
var S=this.toString();
this.selection.removeAllRanges();
if(S && config.pickSelectionLength && S.length<config.pickSelectionLength)
  try{
    var d=thePlayerManager.dictOb;
    if(!d)d=(thePlayerManager.dictOb=mfObjects.obs.glossTable);
    var frm=document.forms.searchForm;
    if(!frm)frm= d.mf_elt.ownerDocument.forms.searchForm;
    frm.searchfield.value=S;
   }catch(e){ alert(e);} 
}

/** end selection object **/


mxScript.prototype.emphasizeRegExpInRange=function(re,numPair){
  var upper=numPair[1]?numPair[1]:numPair[0];
  for(var i=numPair[0];i<=upper;i++){
    var snch=this.synch[i];
    var trees=snch.getSegmentTrees();
    for(var j=0;j<trees.length;j++)emphasizeRegExpInDOM(re,trees[j]);
    }
}
/** emphasizeRegExpInDom only works within a single textnode at a time **/
function emphasizeRegExpInDOM(re,elt,lvl){
lvl=lvl?lvl+1:1;
var S=null;
try{
  if(!elt)return;
  var i;
  try{
    if(elt.nodeType==1)
      for(i=0; i< elt.childNodes.length;i++){emphasizeRegExpInDOM(re,elt.childNodes[i],lvl);};
  }catch(ex1){alert("ex1:"+ex1+"; i="+i+": ecN[i]="+elt.childNodes[i]);}
  if(!elt.nodeValue)return;
  if(!re.test(elt.nodeValue))return;
  var container=wrapNode(elt,"span","emph",null,document,true);
  S=elt.nodeValue.replace(re,"<em><b>$1</b></em>");
  container.innerHTML=S;
}catch(x){alert("G:"+lvl+": x="+x+"; S="+S+"; elt="+doc2String(elt));}
}


function windowSelectionFromTo(startNode,stopNode){
 var rng=document.createRange();
 var sel=window.getSelection();
 rng.setStart(startNode,0); rng.setEnd(stopNode,0);
 // rng.setStartBefore(startNode);
 // rng.setEndBefore(stopNode);
 sel.removeAllRanges();
 sel.addRange(rng);
}

thePlayerManager.doSearch=function(txt,inScript,inComm,evt){
  // matchFns:["isScriptMatch","isCommMatch","isAnyMatch","isMatchTypeMatch"], // isMatchTypeMatch uses matchTypes
  if(inScript && inComm)segTexts.setMatchFn("isAnyMatch");
  else if(inScript)segTexts.setMatchFn("isScriptMatch");
  else if(inComm)segTexts.setMatchFn("isCommMatch");
  else return alert("cannnot search if no search is selected.");
  var N=this.currentStartSegment;
  var proj=config.projectName;  // e.g. "algo01/algo0101"
  var thisSeg=proj+"#s"+N;
// alert("location is :"+proj+"#s"+N+"\n searching for:"+sel);
  if(0>segTexts.setCurSegLoc(thisSeg))return alert("cannot find "+thisSeg+" within "+segTexts.segObs[0][0]+"...");
  if(evt && evt.ctrlKey)segTexts.setWithinPage(""); else segTexts.setWithinPage(proj);
  if(evt && evt.shiftKey)segTexts.setPosPrevMatch(txt); else 
  segTexts.setPosNextMatch(txt);
// alert("new location should be:"+segTexts.curSeg().join("\n"));
  var newProjLoc=segTexts.curSeg()[0].split("#s");
  var segNum=parseInt(newProjLoc[1]);

  if(proj==newProjLoc[0]) // no reload needed
   this.selectRange(segNum,segNum);
  else {
  var xhtmlMode=location.href.indexOf("xhtml")>=0;
alert('doSearch: xhtmlMode='+xhtmlMode);
  var url="../"+newProjLoc[0]+(xhtmlMode?(".xhtml"):".html")+"?movie_range="+segNum;
  if(this.playOnSelection)url+="&playOnSelection=true";
// if(!confirm("curSeg="+segTexts.curSeg()+"; newProjLoc="+newProjLoc+"; url="+url))throw "oops";
  top.location.href=url;
  }
}

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

/** exercises --------------------------- **/

var exercisesGrammar={
    exercises  :{extoc:"?", exx:"*"},
    extoc      :{ exLink:"*" },
    exLink     :{},
    exx        :{exTitle:1,exPreamble:1,exq:"*",exa:"*"},
    exTitle    :{},
    exPreamble :{},
    exq        :{},
    exa        :{}
   } ;

function exercises(){};
exercises.prototype=new MicroFormat();
exercises.prototype.postInit=function(){
  newChild(this.mf_elt,"div").innerHTML="&#160;";
  newChild(this.mf_elt,"div").innerHTML="&#160;";
}

/** ex(btn); a button to invoke exercise 13 should have 
  value="ex13" or "Exercise 13" or "#13" even "Part 3, Ex 13"
  and an onclick of "ex(this)".
**/
function ex(btn){ 
  thePlayerManager.showExercise(btn);
} 

//toggle visibility of answers
function showAns(exqId){ mfObjects.obs[exqId].showAns(); }

function exTitle(){}
exTitle.prototype=new MicroFormat();
exTitle.prototype.mf_events={
  onclick:function(evt){
  var xdOb=mfObjects.obs[this.id];  
  var ex=xdOb.mf_parent;
  var preamble=ex.exPreamble.mf_elt;
  if(!ex.hasHiddenPreamble)preamble.className="exPreamble";
  else preamble.className="exPreamble";
  ex.hasHiddenPreamble=!ex.hasHiddenPreamble;
}
}
exTitle.prototype.postInit=function(){
  if(!this.mf_elt.title)
    this.mf_elt.title="click to hide/show exercise preamble"; 
}

/**
function buttonText(val,fn){
  return '<input type="button" id="bid'+(genSymNum++)+'" value="'+val+'"'
           +' onclick="'+fn+'"/>';
}
**/


function exq(){}
exq.prototype=new MicroFormat();
exq.prototype.postInit=function(){ 
  var qid=this.mf_elt.id;
  // this.showAns(false);
  this.addTA();
  this.addButton("showAnswer",showAns)+
  this.addButton("Next Question",nextQ)+
  this.addButton("Exercises List",showToc)+
  this.addButton("Close Exercises",endQ);
/** 
 var xd=this.mf_elt;
 xd.innerHTML+=' <div><textarea rows="2" cols="60">Enter_answer_here</textarea></div><div>'+
                buttonText("showAnswer","top.showAns('"+xd.id+"')")+
                buttonText("Next Question","top.nextQ('"+xd.id+"')")+
                buttonText("Exercises List","top.showToc('"+xd.id+"')")+
                buttonText("Close Exercises","top.endQ('"+xd.id+"')")+"</div>";
**/
}
var genSymNum=0;
exq.prototype.addButton=function(val,fn){
  var btn=newChild(this.mf_elt,"input","q_btn", "bid"+(genSymNum++));
  var qid=this.mf_elt.id;
  btn.onclick=function(){fn(qid);};
  btn.type="button";
  btn.value=val;
}
exq.prototype.addTA=function(){
  var tadiv=newChild(this.mf_elt,"div","q_ta");
  var ta=newChild(tadiv,"textarea","q_ta");
  ta.rows="2"; ta.cols="60";
  ta.value="Enter_answer_here";
}

/** exq.showAns() toggles visibility; exq.showAns(true), exq.showAns(false) just set it **/
exq.prototype.showAns=function(yes){
  var toggle=arguments.length==0;
  // alert("showAns:"+this);
  for(var nxt=this.mf_nextSibling;nxt && nxt instanceof exa;nxt=nxt.mf_nextSibling){
    var elt=nxt.mf_elt;
    if(toggle) yes=elt.className=="exa"
    elt.className=yes?'exa showing':'exa';
    }
}
exq.prototype.nextQ=function(){
  
  var nxt=this.mf_nextSibling;
  while(nxt && nxt instanceof exa)nxt=nxt.mf_nextSibling;
  return nxt;
}


function showToc(sourceExQId){
  var exQ1=mfObjects.obs[sourceExQId];
  var ex1=exQ1.mf_parent;
  ex1.unselect();
  var toc=ex1.mf_parent.extoc;
  if(toc){ toc.mf_elt.scrollIntoView(); }
  top.thePlayerManager.prevExercise=null;
}
function nextQ(exQId){
  var q=mfObjects.obs[exQId];
  if(!q)return alert("error: no object "+exQId);
  var nextOb=q.nextQ();
  if(!nextOb)return showToc(exQId);
  nextOb.select(config.scrollToExerciseQuestions);
}


function endQ(exQId){
  var q=mfObjects.obs[exQId];
  q.unselect();
  top.thePlayerManager.hideExercises();
}

function exx(){}
exx.prototype=new MicroFormat();

exx.prototype.showFirst=function(){
  var selq=this.exq[0];
  if(!selq)return alert("no questions in "+this.mf_elt.id);
  selq.select(false);
}

exx.prototype.unselect=function(){
  if(this.selectedQ){this.selectedQ.unselect();this.selectedQ=null;}
  this.mf_parent.selectedEx=null;
  this.mf_elt.className="exx";
}

exx.prototype.select=function(){
  var prevSelect=this.mf_parent.selectedEx;
  if(prevSelect)prevSelect.unselect();
  this.mf_elt.className="exx selected";
  this.showFirst(); 
  this.mf_parent.selectedEx=this;
}

exq.prototype.select=function(scroll){
  var prevSelect=this.mf_parent.selectedQ;
  if(prevSelect)prevSelect.unselect();
  this.mf_elt.className="exq selected";
  var ta= this.mf_elt.getElementsByTagName("textarea")[0];
  if(ta){ta.focus();ta.select();}
  if(scroll)this.mf_elt.scrollIntoView();
  this.mf_parent.selectedQ=this;
}

exq.prototype.unselect=function(){
  this.mf_parent.selectedQ=null;
  this.showAns(false);
  this.mf_elt.className="exq";
}

thePlayerManager.hideExercises=function(){
  if(!this.exercises)return;
  this.exercisesShowing=false;
  var mLS=this.exercises.mf_elt;
  if(mLS)return mLS.style.display='none';
}
thePlayerManager.showExercises=function(){
  if(!this.exercises)return;
  this.exercisesShowing=true;
  var mLS=this.exercises.mf_elt;
  mLS.style.display='block';
  if(this.exercises.extoc)this.exercises.extoc.mf_elt.scrollIntoView();
  else mLS.scrollIntoView();
  if(this.exercises.selectedEx)this.exercises.selectedEx.select();
  
}
thePlayerManager.toggleExercises=function(){
  if(this.exercisesShowing)this.hideExercises();
  else this.showExercises(); 
}

thePlayerManager.toggleSubtables=function(){
  if(this.subtablesShowing)setClassDisplay('subtable','none');
  else setClassDisplay('subtable','table');
  this.subtablesShowing=!this.subtablesShowing;
}
thePlayerManager.toggleDetails=function(evt){
  if(evt && !evt.ctrlKey)return this.toggleSubtables();
  if(!config.detailClasses)return;
  for(var cls in config.detailClasses){
    if(this.detailsShowing)
      setClassDisplay(cls,"none");
      else setClassDisplay(cls,config.detailClasses[cls]);
  }
  this.detailsShowing=!this.detailsShowing;
}


thePlayerManager.showExercise=function (but){ // assumes that $('exercises') exists
  var prevExercise=this.prevExercise;
  var ident;
  if(but){ // button value="ex3" or "try #3" or something like that
           // could be "ex7 - Comprehension"
    ident=but.value.match(/ex[0-9]+/i);
    if(ident)ident=""+ident; else ident="ex"+but.value.match(/[0-9]+/);
    //ident=but.value.split(" ");ident=ident[ident.length-1]; // last word.
    ident="ex"+"_"+ident.replace(/[^0-9]/g,""); 
  }else ident=mfObjects.obs.exercises.exx[0].mf_elt.id;
  if(this.exercisesShowing && prevExercise==ident){this.hideExercises();return;}
  if(!this.exercisesShowing)this.showExercises();
  this.showExerciseById(ident,prevExercise);
}
thePlayerManager.showExerciseById=function(ident,prevId){
  var ex=$(ident);
  if(!ex)return alert("no such exercise as "+ident);
  var prevEx=$(prevId);
  if(prevEx){prevEx.className=prevEx.className.replace("exx selected","exx");}
  ex.className=ex.className.replace("exx","exx selected");
  this.prevExercise=ident;
  ex.scrollIntoView();
  var exOb=mfObjects.obs[ident];
  exOb.showFirst(); 
}

function toggleView(elt){
  if(!(elt.style.display=='block'))elt.style.display='block';
  else elt.style.display=='none';
}

var interlinearAuthor={
  columnHeadTag:null,
  getColumnHeadTag:function(elt){
   if(this.columnHeadTag)return this.columnHeadTag;
   return this.getEnclosingDiscourseUnit(elt).tagName;},
  getSentenceNumber:function(elt){ // 1-origin
    var ref=this.getSentenceRef(elt);
    var n=0;
    while(ref){if(ref.className=='ref')n++;ref=ref.prevSibling;};
    return n; 
    },
  getDiscourseUnitNumber:function(elt){
    var du=this.getEnclosingDiscourseUnit(elt);
    // XXXXXXXXXXXXXXXXXXX
    },
  getColumnNumber:function(elt){},
  getSubColumnNumber:function(elt){},
  getEnclosingSubColumn:function(elt){},
  getEnclosingColumn:function(elt){},
  getEnclosingDiscourseUnit:function(elt){},
  getSentenceRef:function(elt){},
  mergeSentence:function(elt){},
  mergeDiscourseUnit:function(elt){},
  mergeColumn:function(elt){},
  mergeSubColumn:function(elt){},
  splitSentence:function(elt){},
  splitDiscourseUnit:function(elt){},
  splitColumn:function(elt){},
  splitSubColumn:function(elt){},
  getSubColumn:function(elt,rowNum,colNum,subColNum){},
  getColumn:function(elt,rowNum,colNum){}, // can return array
  getRow:function(elt,rowNum){}, // can return nested array
  setSubColumn:function(elt,rowNum,colNum,subColNum,txt){},
  setColumn:function(elt,rowNum,colNum,txt){}, // txt can be array
  setRow:function(elt,rowNum,txt){} // txt can be nested array
}
