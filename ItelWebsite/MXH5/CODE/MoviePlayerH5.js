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
  * MoviePlayer.js 
  * MoviePlayer is an "abstract class" which runs the movie, e.g. on behalf of PlayerManager
  * AppletMoviePlayer wraps the calls on a MannX.java applet;
  * FlashSWFMoviePlayer uses CurrentFrame,GotoFrame,Play, and StopPlay
  * FlashFLVMoviePlayer uses the Javascript API of FlowPlayer [http://flowplayer.sourceforge.net]
  *  as written by Anssi Piirainen <api@iki.fi> at our request, following the standard
  *  mplayer Javascript API as guide.
**/
function MoviePlayer(){} // AppletMoviePlayer or FlashSWFMoviePlayer or FlashFLVMoviePlayer

{
  var MoviePlayerFns= {getMovieTime:0,setMovieTime:0,getMovieTimeScale:0,setMovieTimeScale:0,
                     getMaxTime:0,isPlaying:0,playRange:0,clearRange:0,getMovieState:0,stop:0,
                     getMovieRate:0,setMovieRate:0,setColor:0,
                     getVersion:0,hasHadFatalError:0,getFatalError:0};

  function setNotImplemented(C,f){
    C.prototype[f]=new Function("alert('"+f+" not implemented in MoviePlayer')");
  }

  for(var f in MoviePlayerFns)setNotImplemented(MoviePlayer,f);
}

function mp_toString(){
  var S="{";
  for(var x in this)S+="\n"+x+"="+this[x];
  return S+"}";
}
MoviePlayer.prototype.toString=mp_toString;

function AppletMoviePlayer(p){this.player=p;}

AppletMoviePlayer.prototype=new MoviePlayer(); 


function amp_getMovieTime(){return this.player.getMovieTime();}
function amp_setMovieTime(t){this.player.setMovieTime(t);}
function amp_getMovieTimeScale(){return this.player.getMovieTimeScale();}
function amp_setMovieTimeScale(s){this.player.setMovieTimeScale(s);}
function amp_getMaxTime(){return this.player.getMaxTime();}
function amp_isPlaying(){return this.player.isPlaying();}
function amp_playRange(a,b){return this.player.playRange(a,b);}
function amp_stop(a,b){return this.player.stop();}
function amp_clearRange(){this.player.clearRange();}
function amp_getMovieState(){return this.player.getMovieState();}
function amp_getMovieRate(){return this.player.getMovieRate();}
function amp_setMovieRate(r){this.player.setMovieRate(r);}
function amp_setColor(r){this.player.setColor(r);}
function amp_getVersion(){return this.player.getVersion();}
function amp_hasHadFatalError(){return this.player.hasHadFatalError();}
function amp_getFatalError(){return this.player.getFatalError();}

{var AppletMoviePlayerFns={
  getMovieTime:amp_getMovieTime,setMovieTime:amp_setMovieTime,
  getMovieTimeScale:amp_getMovieTimeScale,setMovieTimeScale:amp_setMovieTimeScale,
  getMaxTime:amp_getMaxTime,isPlaying:amp_isPlaying,playRange:amp_playRange,stop:amp_stop,
  clearRange:amp_clearRange, getMovieState:amp_getMovieState,
  getMovieRate:amp_getMovieRate, setMovieRate:amp_setMovieRate,
  setColor:amp_setColor,getVersion:amp_getVersion,
  hasHadFatalError:amp_hasHadFatalError,getFatalError:amp_getFatalError};
 for(var f in AppletMoviePlayerFns)AppletMoviePlayer.prototype[f]=AppletMoviePlayerFns[f];
}

function generateAppletElement(config){
var obS='';
obS+=('<div id="appletDiv"><applet\n');
obS+=('      id= "JSApplet" name="JSApplet"\n');
obS+=('       WIDTH="'+movieWidth+'" HEIGHT="'+movieHeight+'"\n');
obS+=('      ALIGN="top" bgColor="#'+movieColor+'"\n');
obS+=('      ARCHIVE="'+appletArchive+'"\n');
obS+=('      prestartMovie="'+prestartMovie+'"\n');
obS+=('    CODE="'+appletCode+'" file="'+movieFilePath+'" useFile="true" scriptable="true">\n');
obS+=('</applet></div>\n');
return obS;
}

function generateFlashEmbedElement(config){
var obs='';
obs+=('<object id="swfObject" \n');
obs+=('  CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"\n');
obs+=('  WIDTH="'+movieWidth+'"\n');
obs+=('  HEIGHT="'+movieHeight+'"\n');
obs+=('  CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"\n');
obs+=('  <PARAM NAME="MOVIE" VALUE="'+movieFilePath+'">\n');
obs+=('  <PARAM NAME="PLAY" VALUE="false">\n');
obs+=('  <PARAM NAME="LOOP" VALUE="false">	\n');
obs+=('  <PARAM NAME="QUALITY" VALUE="high">\n');
obs+=('  <PARAM NAME="SCALE" VALUE="SHOWALL">\n');
obs+=('  <embed\n');
obs+=('  	NAME="swfObject"\n');
obs+=('  	SRC="'+movieFilePath+'"\n');
obs+=('  	WIDTH="'+movieWidth+'"\n');
obs+=('  	HEIGHT="'+movieHeight+'"\n');
obs+=('  	PLAY="false" \n');
obs+=('  	LOOP="false"\n');
obs+=('  	QUALITY="high"\n');
obs+=('  	SCALE="SHOWALL" \n');
obs+=('  	swLiveConnect="true"\n');
obs+=('  	PLUGINSPAGE="http://www.macromedia.com/go/flashplayer/">\n');
obs+=('  </embed>\n');
obs+=('</object>\n');
return obs;
}
// depends on FlashTag.js; onload must include document.FlowPlayer.setConfig(fpConf(config));

function fpConf(config) {
  return {
	playList: [ { name: 'clip0', url:config.folders.movies+config.movie.fileName } ],
	showPlayList: true,
	baseURL: '',
	// baseURL: 'http://flowplayer.sourceforge.net/video',
	autoPlay: config.movie.prestart==2, // FLV_autoPlay,
	autoBuffering: true,
	bufferLength: 10,
	loop: false,
	videoHeight: config.movie.height, // movieHeight,
	hideControls: false
    }
}

function generateFlashFLVEmbedElement(config){
var tag = new FlashTag(config.folders.code+'FlowPlayer.swf', config.movie.width, config.movie.height+20); 
tag.setFlashvars('configInject=true');
tag.setId("FlowPlayer");
return tag.toString();
}

function generateFlashFLVEmbedElementDOMA(config){
    var flashVersion='7,0,14,0';
    var bgColor= 'ffffff'; 
    var flashVars='configInject=true';
    var appFilePath=config.folders.code+"FlowPlayer.swf";
    var ie = (navigator.appName.indexOf ("Microsoft") != -1) ? 1 : 0;
    var A=[];
    if (ie) { 
    var A0= ["object","classid","clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"];
        A0.push('id'); A0.push('FlowPlayer');
        A0.push('codebase');
          A0.push("http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version="+flashVersion);
        A0.push('width'); A0.push(""+config.movie.width);
        A0.push("height"); A0.push(""+(20+config.movie.height));
        A.push(A0);
        A.push(["param","name","AllowScriptAccess","value","always"]);
        A.push(["param","name","movie","value",appFilePath]);
        A.push(["param","name","quality","value","high"]);
        A.push(["param","name","bgcolor","value","#"+bgColor]);
        if (flashVars != null) {
          A.push(["param","name","flashvars","value",flashVars]);
        }
    }
    else
    {
       A=["embed", "src",appFilePath,
                 "AllowScriptAccess","always",
                 "quality","high",
                 "bgcolor","#"+bgColor,
                 "width",config.movie.width,
                 "height",config.movie.height+20,
                 "type","application/x-shockwave-flash",
                 'pluginspage', "http://www.macromedia.com/go/getflashplayer",
                 'id','FlowPlayer',
                 'name','FlowPlayer' 
                 ];
        if (flashVars != null) {
            A.push('flashvars'),
            A.push(flashVars);
        }
    }
    // alert("MoviePlayer domA="+A);
    return A;
}

function generateMoviePlayerElement(config){
  var S=""; // var mp=movieFilePath;var mw=movieWidth; var mh=movieHeight;
  if(config.movie.playerClass=="FlashSWFMoviePlayer"){  // set within config.js
    S+=generateFlashEmbedElement(config);
    if(0<=top.location.toString().indexOf("authorFrames")){ return alert("authorFrames no longer supported: 20071128");
      movieWidth=0;movieHeight=0;movieFilePath='';// set params so applet is invisible
      S+=generateAppletElement(config);
      S+=generatePlayerForm(config);
      }
  }else if(config.movie.playerClass=="FlashFLVMoviePlayer"){
    S+=generateFlashFLVEmbedElement(config);
    if(0<=top.location.toString().indexOf("authorFrames")){ return alert("authorFrames no longer supported: 20071128");
    //   movieWidth=0;movieHeight=0;movieFilePath='';// set params so applet is invisible
      S+=generateAppletElement(config);
      S+=generatePlayerForm(config);
      }
  }else if(config.movie.playerClass=="RealMoviePlayer"){
    S+=(generateRealEmbedElement(config));
  }else if(config.movie.playerClass=="AppletMoviePlayer"){
    S+=(generateAppletElement(config));
  }
  // movieFilePath=mp;movieWidth=mw;movieHeight=mh;
  return S;
}

function generateMoviePlayerElementDOMA(config){// returns array representing a DOM div element containing the MoviePlayer
  var playerClass=config.movie.playerClass;
  if(!playerClass)throw "no config.movie.playerClass defined";
  // var S=""; // var mp=movieFilePath;var mw=movieWidth; var mh=movieHeight;
  if(playerClass=="FlashSWFMoviePlayer"){  // set within config.js
    return generateFlashElementDOMA(config);
  }else if(playerClass=="FlashFLVMoviePlayer"){
    return generateFlashFLVEmbedElementDOMA(config);
  }else if(playerClass=="RealMoviePlayer"){
    return generateRealEmbedElementDOMA(config);
  }else if(playerClass=="AppletMoviePlayer"){
    return generateAppletElementDOMA(config);
  }
  // movieFilePath=mp;movieWidth=mw;movieHeight=mh;
 throw "unknown config.movie.playerClass: "+playerClass;
}

function generateRealEmbedElement(config){
var S=' <embed id="realvideoax" ';
    S+='src="http://localhost:8080/mfmx/testRealVideo.rpm"\n';
    S+='TYPE="audio/x-pn-realaudio-plugin" PREFETCH="true"\n ';
    S+='name="realvideoax" controls="ImageWindow" AUTOSTART="false" console="clip1" \n';
    S+='LOOP="false" height="260" width="320" border="0"/>\n';
    return S;
}

function RealMoviePlayer(p){
  this.player=p;
  this.fatalError=null;
  this.stopFrame=null;
  this.intervalID=null;
  this.index=RealMoviePlayer.instances.length;
  this.selfRef="RealMoviePlayer.instances["+this.index+"]";
  RealMoviePlayer.instances[this.index]=this;
}
RealMoviePlayer.prototype=new MoviePlayer();
RealMoviePlayer.instances=new Array();

function FlashFLVMoviePlayer(p){
  this.player=p;
  this.fatalError=null;
  this.stopFrame=null;
  this.intervalID=null;
  this.index=FlashFLVMoviePlayer.instances.length;
  this.selfRef="FlashFLVMoviePlayer.instances["+this.index+"]";
  FlashFLVMoviePlayer.instances[this.index]=this;
  // this.setConfig();
}
FlashFLVMoviePlayer.prototype=new MoviePlayer();
FlashFLVMoviePlayer.instances=new Array();

FlashFLVMoviePlayer.prototype.setConfig=function(){
  if(this.player && this.player.setConfig)
    return this.player.setConfig(fpConf(config));
  setTimeout(this.selfRef+".setConfig()",100);
}

function FlashSWFMoviePlayer(p){
  this.player=p;
  this.fatalError=null;
  this.stopFrame=null;
  this.intervalID=null;
  this.index=FlashSWFMoviePlayer.instances.length;
  this.selfRef="FlashSWFMoviePlayer.instances["+this.index+"]";
  FlashSWFMoviePlayer.instances[this.index]=this;
}
FlashSWFMoviePlayer.prototype=new MoviePlayer();
FlashSWFMoviePlayer.instances=new Array();

function swf_getMovieTime(){return this.player.CurrentFrame();}
function swf_setMovieTime(t){this.player.GotoFrame(t);}
function swf_getMovieTimeScale(){return 1;}
function swf_setMovieTimeScale(s){}
function swf_getMaxTime(){return this.player.TotalFrames();}
function swf_isPlaying(){return this.player.IsPlaying();}
// function swf_playRange(a,b){return this.player.playRange(a,b);}
function swf_clearRange(){}
function swf_getMovieState(){
 if(testing)alert("%="+this.player.PercentLoaded()); 
  return "";}
/**
PercentLoaded=function PercentLoaded() {
FrameLoaded=function FrameLoaded()
**/
function swf_getMovieRate(){return 1.0;}
function swf_setMovieRate(r){}
function swf_setColor(r){}
function swf_getVersion(){return "SWF MannX 1.1";}
function swf_hasHadFatalError(){return null!=this.fatalError;}
function swf_getFatalError(){return this.fatalError;}
function swf_isLoaded(){return this.player.PercentLoaded()==100;}
function swf_play(){this.player.Play();}
function swf_stop(){this.player.StopPlay();}
function swf_killInterval(){
  this.stop();if(!this.intervalID)return;
  clearInterval(this.intervalID);this.intervalID=null;
}
function swf_playRange(start,len){
//alert("playRange(start="+start+",len="+len+")");
  this.killInterval();
  this.stopFrame=start+len;
  this.setMovieTime(start);
  this.play();
  this.intervalID=setInterval(this.selfRef+".checkStopFrame()",100);
}
function swf_checkStopFrame(){
  if(!this.stopFrame)return this.killInterval();
  if(this.stopFrame > this.getMovieTime())return;
  this.killInterval();
}

{
  var 
swfFns={
getMovieTime:swf_getMovieTime,
setMovieTime:swf_setMovieTime,
getMovieTimeScale:swf_getMovieTimeScale,
setMovieTimeScale:swf_setMovieTimeScale,
getMaxTime:swf_getMaxTime,
isPlaying:swf_isPlaying,
playRange:swf_playRange,
clearRange:swf_clearRange,
getMovieState:swf_getMovieState,
getMovieRate:swf_getMovieRate,
setMovieRate:swf_setMovieRate,
setColor:swf_setColor,
getVersion:swf_getVersion,
hasHadFatalError:swf_hasHadFatalError,
getFatalError:swf_getFatalError,
isLoaded:swf_isLoaded,
play:swf_play,
stop:swf_stop,
killInterval:swf_killInterval,
checkStopFrame:swf_checkStopFrame
   };
 for(var f in swfFns)FlashSWFMoviePlayer.prototype[f]=swfFns[f];
}


function flv_getMovieTime(){return this.player.getTime();}
function flv_setMovieTime(t){try{this.player.Seek(t);
               }catch(e){alert("setMovieTime("+t+"):"+(e.description?ob2String(e):e));} };
function flv_getMovieTimeScale(){return 1;}
function flv_setMovieTimeScale(s){}
function flv_getMaxTime(){return this.player.getDuration();}
function flv_isPlaying(){return this.player.isPlaying() && !this.player.isPaused();}
function flv_pause(){return this.player.Pause();}
function flv_isPaused(){return this.player.isPaused();}
// function flv_playRange(a,b){return this.player.playRange(a,b);}
function flv_clearRange(){}
function flv_getMovieState(){
 if(testing)alert("%="+this.player.PercentLoaded()); 
  return "";}
/**
PercentLoaded=function PercentLoaded() {
FrameLoaded=function FrameLoaded()
**/
function flv_getMovieRate(){return 1.0;}
function flv_setMovieRate(r){}
function flv_setColor(r){}
function flv_getVersion(){return "FLV MannX 1.1";}
function flv_hasHadFatalError(){return null!=this.fatalError;}
function flv_getFatalError(){return this.fatalError;}
function flv_isLoaded(){return this.player.PercentLoaded()==100;}
function flv_play(){this.player.DoPlay();}
function flv_stop(){ if(this.isPlaying() ) this.player.Pause();
                     else this.player.StopPlay();}
function flv_killInterval(){
  this.stop();if(!this.intervalID)return;
  clearInterval(this.intervalID);this.intervalID=null;
}

function flv_playRange(start,len){
//alert("playRange(start="+start+",len="+len+")");
try{
  this.killInterval();
  var loadedUpTo= this.getMaxTime()*this.player.getPercentLoaded()/100;
  if(start>loadedUpTo)
    return "cannot play "+sec2MinSec(start)+" when only loaded up to "+sec2MinSec(loadedUpTo);
  this.stopTime=start+len;
  this.setMovieTime(start);
  this.play();
  this.intervalID=setInterval(this.selfRef+".checkStopTime()",100);
}catch(e){alert("playRange("+start+","+len+"):"+e);}
}
function flv_checkStopTime(){
  if(!this.stopTime)return this.killInterval();
  if(this.stopTime > this.getMovieTime())return;
  this.killInterval();
}

/** --------------------------------- **/

var rv_playStates="Stopped,Contacting,Buffering,Playing,Paused,Seeking".split(",");
function rv_getMovieTime(){try{return this.player.GetPosition()/1000;}catch(e){return -1;}}
function rv_setMovieTime(t){this.player.SetPosition(Math.floor(t*1000));}
function rv_getMovieTimeScale(){return 1;}
function rv_setMovieTimeScale(s){}
function rv_getMaxTime(){return this.player.GetLength();}
function rv_isPlaying(){return this.player.CanPause();}
function rv_pause(){return this.player.DoPause();}
function rv_isPaused(){return "Paused"==this.getMovieState();}
// function rv_playRange(a,b){return this.player.playRange(a,b);}
function rv_clearRange(){}
function rv_getMovieState(){
  try{return rv_playStates[this.player.GetPlayState()];}
  catch(e){return "";}
}
/**
PercentLoaded=function PercentLoaded() {
FrameLoaded=function FrameLoaded()
**/
function rv_getMovieRate(){return 1.0;}
function rv_setMovieRate(r){}
function rv_setColor(r){}
function rv_getVersion(){return "RV MannX 1.2";}
function rv_hasHadFatalError(){return null!=this.fatalError;}
function rv_getFatalError(){return this.fatalError;}
function rv_isLoaded(){return this.player.PercentLoaded()==100;}
function rv_play(){this.player.DoPlay();}
function rv_stop(){ this.player.DoPause();}
function rv_killInterval(){
  this.stop();if(!this.intervalID)return;
  clearInterval(this.intervalID);this.intervalID=null;
}
// GetBufferingTimeElapsed()
// GetBufferingTimeRemaining()

function rv_playRange(start,len){
//alert("playRange(start="+start+",len="+len+")");
  this.killInterval();
  // var loadedUpTo= this.getMaxTime()*this.player.getPercentLoaded()/100;

  var loadedUpTo=this.player.GetBufferingTimeElapsed()/1000;
  if(false && start>loadedUpTo)
    return "cannot play "+sec2MinSec(start)+" when only loaded up to "+sec2MinSec(loadedUpTo);
  this.stopTime=start+len;
  this.setMovieTime(start);
  this.play();
  this.intervalID=setInterval(this.selfRef+".checkStopTime()",100);
}
function rv_checkStopTime(){
  if(!this.stopTime)return this.killInterval();
  var t=this.getMovieTime(); if(t==-1)return;
  if(this.stopTime > t)return;
  this.killInterval();
}
{
  var 
flvFns={
pause:flv_pause,
isPaused:flv_isPaused,
getMovieTime:flv_getMovieTime,
setMovieTime:flv_setMovieTime,
getMovieTimeScale:flv_getMovieTimeScale,
setMovieTimeScale:flv_setMovieTimeScale,
getMaxTime:flv_getMaxTime,
isPlaying:flv_isPlaying,
playRange:flv_playRange,
clearRange:flv_clearRange,
getMovieState:flv_getMovieState,
getMovieRate:flv_getMovieRate,
setMovieRate:flv_setMovieRate,
setColor:flv_setColor,
getVersion:flv_getVersion,
hasHadFatalError:flv_hasHadFatalError,
getFatalError:flv_getFatalError,
isLoaded:flv_isLoaded,
play:flv_play,
stop:flv_stop,
killInterval:flv_killInterval,
checkStopTime:flv_checkStopTime
   };
 for(var f in flvFns)FlashFLVMoviePlayer.prototype[f]=flvFns[f];
}
{
  var 
rvFns={
pause:rv_pause,
isPaused:rv_isPaused,
getMovieTime:rv_getMovieTime,
setMovieTime:rv_setMovieTime,
getMovieTimeScale:rv_getMovieTimeScale,
setMovieTimeScale:rv_setMovieTimeScale,
getMaxTime:rv_getMaxTime,
isPlaying:rv_isPlaying,
playRange:rv_playRange,
clearRange:rv_clearRange,
getMovieState:rv_getMovieState,
getMovieRate:rv_getMovieRate,
setMovieRate:rv_setMovieRate,
setColor:rv_setColor,
getVersion:rv_getVersion,
hasHadFatalError:rv_hasHadFatalError,
getFatalError:rv_getFatalError,
isLoaded:rv_isLoaded,
play:rv_play,
stop:rv_stop,
killInterval:rv_killInterval,
checkStopTime:rv_checkStopTime
   };
 for(var f in rvFns)RealMoviePlayer.prototype[f]=rvFns[f];
}


/**              Button and Input Functions    **/

var controlsManager={ // assumes config exists

  onmouseover:"this.style.MozOpacity=1;this.filters.alpha.opacity=100",
  onmouseout:"this.style.MozOpacity=0.4;this.filters.alpha.opacity=40",
  div:null,
  addPlayerButtons:function(div){
    this.div=div;
    this.addButton(this.playStop); 
    this.addButton(this.nextSeg); 
    this.addButton(this.prevSeg); 
    this.addButton(this.toggleAutoPlay); 
    this.addButton(this.searchPage); 
    this.addButton(this.showHelp); 
    this.addButton(this.coursePage); 
    // if(config.detailClasses)this.addButton(this.toggleDetails);
    if($('exercises'))this.addButton(this.toggleExercises);
  //  if(config.dictSynch)this.addButton(this.synchToGloss);
    if(config.nextStyle)this.addButton(this.nextStyle);
    },
  addViewButtons:function(div){
    this.div=div;
    this.addButton(this.mdt); 
    this.addButton(this.msdc); 
    this.addButton(this.msc); 
    // this.addButton(this.msce); 
    // this.addButton(this.mce); 
    // this.addButton(this.msde); 
    },

  addButton:function(ob){
    var but=newChild(this.div,"button");
    but.id=ob.id; but.title=ob.title;but.onclick=ob.onclick;but.className=ob.className?ob.className:"ctl";
    if(ob.innerHTML)but.innerHTML=ob.innerHTML;
    if(ob.src)newChild(but,"img").src=ob.src;
    if(ob.onmouseover)but.onmouseover=ob.onmouseover;else but.onmouseover=this.onmouseover;
    if(ob.onmouseout)but.onmouseout=ob.onmouseout;else but.onmouseout=this.onmouseout;
    },
  mdt:{id:"mdtButton",title:"movieDictTiers View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"mdt",this);},
       src:config.folders.images+"mdt.gif"
  },
  msc:{id:"msdcButton",title:"movieScriptComm View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"msc",this);},
       src:config.folders.images+"msc.gif"
  },
  mce:{id:"mceButton",title:"movieCommExercises View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"mce",this);},
       src:config.folders.images+"mce.gif"
  },
  msce:{id:"msceButton",title:"movieScriptCommExercises View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"msce",this);},
       src:config.folders.images+"msce.gif"
  },
  msdc:{id:"msdcButton",title:"movieScriptDictComm View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"msdc",this);},
       src:config.folders.images+"msdc.gif"
  },
  msde:{id:"msdeButton",title:"movieScriptDictExercises View",className:"viewbuttons",
       onclick:function(evt){top.thePlayerManager.view(evt,"msde",this);},
       src:config.folders.images+"msde.gif"
  },
/** 
back.gif              mce.gif           msce.gif           msdc.gif           off.gif           play.gif
back.rollover.gif     mce.rollover.gif  msce.rollover.gif  msdc.rollover.gif  off.rollover.gif  play.rollover.gif
forward.gif           mdt.gif           msc.gif            msde.gif           on.gif            stop.gif
forward.rollover.gif  mdt.rollover.gif  msc.rollover.gif   msde.rollover.gif  on.rollover.gif   stop.rollover.gif
**/
  prevSeg:{id:"prevSegButton",title:"select previous segment",className:"playbuttons",
           onclick:function(evt){top.thePlayerManager.selectPrevSeg(evt);},
           src:config.folders.images+"back18.gif"
  },
  playStop:{id:"playStopButton",title:"play/stop toggle for current segment",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.playStopToggle(evt);},
       src:config.folders.images+"play18.gif"
  },
  nextSeg:{id:"selectNextSegButton",title:"select next segment",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.selectNextSeg(evt);},
       src:config.folders.images+"forward18.gif"
  },
  toggleDict:{id:"toggleDictButton",title:"lookup/[conceal dictionary] toggle",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.toggleDict(evt);},
       src:config.folders.images+"dict.gif"
  },
  synchToComm:{id:"synchToCommButton",
       title:"bring movie and script into synchrony with selected comment",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.synchToComm(evt);},
       innerHTML:"C"
  },
  synchToMovie:{id:"synchToMovieButton",className:"playbuttons",
      title:"bring script and commentary into synchrony with movie time",
      onclick:function(evt){top.thePlayerManager.synchToMovie(evt);},
      innerHTML:"M"
  },
  toggleAutoPlay:{id:"toggleAutoPlayButton",title:"AutoPlay on segment selection",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.toggleAutoPlay(evt);},
       src:config.folders.images+(config.playOnSelection?"on18.gif":"off18.gif")
  },
  coursePage:{id:"coursePageButton",title:"course page",className:"playbuttons",
       onclick:function(evt){top.location.href="./index.html";},
       src:config.folders.images+"logoNarrow18.png"
  }, 
  searchPage:{id:"searchPageButton",title:"search page",className:"playbuttons",
       onclick:function(evt){top.location.href="./search.html";},
       src:config.folders.images+"search18.gif"
  }, 
  openHelp:function(evt){
  },
  showHelp:{id:"openHelpButton",title:"pop up help page", className:"playbuttons",
            onclick:function(evt){
    with(config.helpFile){
      var S="";
      for(var x in params)S+=x+"="+params[x]+",";
      window.open(config.folders.docs+name,windowName,S);
      }
            },
             src:config.folders.images+"help1.gif"
  },
  toggleExercises:{id:"toggleExercisesButton",title:"show/hide exercises",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.toggleExercises(evt);},
       innerHTML:"<strong>EX</strong>"
  },
  toggleDetails:{id:"toggleDetailsButton",title:"show/hide subtables; ctl-click for details",className:"playbuttons",
       onclick:function(evt){top.thePlayerManager.toggleDetails(evt);},
       innerHTML:"*"
  }, 
  synchToGloss:{id:"synchToGlossButton",className:"playbuttons",
       title:"find instance of selected Glossary term",
        onclick:function(evt){top.thePlayerManager.synchToGloss(evt);},
        innerHTML:"T"
  },
  nextStyle:{id:"nextStyleButton",className:"playbuttons",
    title:"next style",
      onclick:function(evt){top.thePlayerManager.nextStyle(evt);},
        innerHTML:"nS"
 },
  addTextAreaForm:function(){
    var frm=newChild(this.div,"form");
    frm.name=(frm.id="lookupTextAreaForm");
    frm.action="javascript:void(0)";
    var ta=newChild(frm,"textarea");
    ta.name=(ta.id="lookupTextArea");
    ta.rows=2;
    ta.cols=40;
    ta.className="warningText";
    ta.onclick=(ta.onkeypress=function(evt){top.thePlayerManager.lookupTouched(evt);});
    ta.value="Please Wait...";
  }
}

/**
  but:function(bid,title,onC,imgAttrs,src){
   return '<button id="'+bid+'" title="'+title+'" onclick="'+onC+'"><img '+imgAttrs+' src="'+src+'"/></button>\n';
  },
  butText:function(bid,title,onC,attrs,txt){
   return '<button id="'+bid+'" title="'+title+'" '+attrs+' onclick="'+onC+'">'+txt+'</button>\n';
  },
**/
