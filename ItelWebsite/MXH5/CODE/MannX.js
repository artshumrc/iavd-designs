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
/* MannX.js 
   These are the MannX classes which depend on MicroFormat
   but are not themselves DOM-sensitive; code moves from here
   to mfDomLib.js as it solidifies

   MoviePlayer, Graph, Triples, Dict, MannX  classes; 
      mannX object

*/


/** MoviePlayer class;
  * MoviePlayer is an "abstract class" which runs the movie, e.g. on behalf of MannX
  * AppletMoviePlayer wraps the calls on a MannX.java applet;
  * FlashSWFMoviePlayer uses CurrentFrame,GotoFrame,Play, and StopPlay
  * FlashFLVMoviePlayer uses flowplayer.souceforge.net's Javascript API,
      based (at our request) on MPlayer's.
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

MoviePlayer.prototype.toString=function(){
  var S="{";
  for(var x in this)S+="\n"+x+"="+this[x];
  return S+"}";
}

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

function generateAppletElement(){
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

function generateFlashEmbedElement(ob){
 
var obs='';
obs+=('<object id="swfObject" \n');
obs+=('  CLASSID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"\n');
obs+=('  WIDTH="'+ob.movieWidth+'"\n');
obs+=('  HEIGHT="'+ob.movieHeight+'"\n');
obs+=('  CODEBASE="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"\n');
obs+=('  <PARAM NAME="MOVIE" VALUE="'+ob.movieFilePath+'">\n');
obs+=('  <PARAM NAME="PLAY" VALUE="false">\n');
obs+=('  <PARAM NAME="LOOP" VALUE="false">	\n');
obs+=('  <PARAM NAME="QUALITY" VALUE="high">\n');
obs+=('  <PARAM NAME="SCALE" VALUE="SHOWALL">\n');
obs+=('  <embed\n');
obs+=('  	NAME="swfObject"\n');
obs+=('  	SRC="'+ob.movieFilePath+'"\n');
obs+=('  	WIDTH="'+ob.movieWidth+'"\n');
obs+=('  	HEIGHT="'+ob.movieHeight+'"\n');
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
// depends on FlashTag.js; onload must include document.FlowPlayer.setConfig(fpConf());

function fpConf() {
  return {
	playList: [ { name: 'clip0', url:movieFilePath } ],
	showPlayList: false,
	baseURL: '',
	// baseURL: 'http://flowplayer.sourceforge.net/video',
	autoPlay: FLV_autoPlay,
	autoBuffering: true,
	bufferLength: 10,
	loop: false,
	videoHeight: movieHeight,
	hideControls: false
    }
}

function generateFlashFLVEmbedElement(){
var tag = new FlashTag('../../CODE/FlowPlayer.swf', movieWidth, movieHeight+20); // movieHeight, movieWidth);
tag.setFlashvars('configInject=true');
tag.setId("FlowPlayer");
return tag.toString();
}


function generatePlayerForm(){
var obs='';
obs+=('<form>\n');
obs+=('  <input type="button" value="Play" onclick="moviePlayer.play()"> \n');
obs+=('  <input type="button" value="Stop" onclick="moviePlayer.stop()"> \n');
obs+=('  <input type="button" value="cur" onclick="this.form.frame.value=moviePlayer.getMovieTime()"> \n');
obs+=('<input type="text" name="frame" size="6" value="30"/>\n');
obs+=('  <input type="button" value="playRange" ');
obs+=(' onclick="with(this.form){moviePlayer.playRange(parseInt(startF.value),parseInt(stopF.value)-parseInt(startF.value))}"/> \n');
obs+=('  <input type="text" name="startF" size="6" value="30"/>\n');
obs+=('  <input type="text" name="stopF" size="6" value="300"/>\n');
obs+=('  <input type="button" value="maxFrame" onclick="this.form.frame.value=moviePlayer.getMaxTime()"> \n');
obs+=('</form>\n');
return obs;
}
function generateMoviePlayerElement(){
  var S=""; var mp=movieFilePath;var mw=movieWidth; var mh=movieHeight;
  if(moviePlayerClass=="FlashSWFMoviePlayer"){  // set within config.js
    S+=generateFlashEmbedElement();
    if(0<=top.location.toString().indexOf("authorFrames")){
      movieWidth=0;movieHeight=0;movieFilePath='';// set params so applet is invisible
      S+=generateAppletElement();
      S+=generatePlayerForm();
      }
  }else if(moviePlayerClass=="FlashFLVMoviePlayer"){
    S+=generateFlashFLVEmbedElement();
    if(0<=top.location.toString().indexOf("authorFrames")){
      movieWidth=0;movieHeight=0;movieFilePath='';// set params so applet is invisible
      S+=generateAppletElement();
      S+=generatePlayerForm();
      }
  }else if(moviePlayerClass=="AppletMoviePlayer"){
    S+=(generateAppletElement());
  }
  movieFilePath=mp;movieWidth=mw;movieHeight=mh;
  return S;
}

function FlashFLVMoviePlayer(p){
  this.player=p;
  this.fatalError=null;
  this.stopFrame=null;
  this.intervalID=null;
  this.index=FlashFLVMoviePlayer.instances.length;
  this.selfRef="FlashFLVMoviePlayer.instances["+this.index+"]";
  FlashFLVMoviePlayer.instances[this.index]=this;
}
FlashFLVMoviePlayer.prototype=new MoviePlayer();
FlashFLVMoviePlayer.instances=new Array();

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
function flv_setMovieTime(t){this.player.Seek(t);}
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
function flv_playRange(start,len){
//alert("playRange(start="+start+",len="+len+")");
  this.killInterval();
  var loadedUpTo= this.getMaxTime()*this.player.getPercentLoaded()/100;
  if(start>loadedUpTo)
    return "cannot play "+sec2MinSec(start)+" when only loaded up to "+sec2MinSec(loadedUpTo);
  this.stopTime=start+len;
  this.setMovieTime(start);
  this.play();
  this.intervalID=setInterval(this.selfRef+".checkStopTime()",100);
}
function flv_checkStopTime(){
  if(!this.stopTime)return this.killInterval();
  if(this.stopTime > this.getMovieTime())return;
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

/** MultiMoviePlayer 
a MultiMoviePlayer has one or more MoviePlayers; at the moment we assume these
are swfs. We have an array this.players of them, and an int this.playerIndex
to say which one we're focussed on, and an array this.playerInfo of objects
each of which contain {href:,isloaded:,iframe:,startTime:,maxTime,...}

The basic notion is that we generate a series of iframes, each with 
   src="javascript:MultiMoviePlayer.prototype.iFrameGen(x)"
or possibly we start with, say, 10 iframes and use no more than that, 
and use innerHTML= to do the actual loading of iframe and of movie.
I'm worried about security blocks here, but it could be..in fact maybe
the iframe can have its own onload which loads the movie's embed object.
**/
/**
function mmp_getCurrentPlayer(){return this.players[this.playerIndex];}
function mmp_getMovieTime(){
  var P=this.getCurrentPlayer(); if(!P)return 0;
  return P.getMovieTime()+this.playerInfo[this.playerIndex].startTime;
}
function mmp_setMovieTime(T){}
function mmp_getMovieTimeScale(){}
function mmp_setMovieTimeScale(S){}
function mmp_getMaxTime(){
  return this.players[this.players.length-1].getMaxTime();
}
function mmp_isPlaying(){return this.players[this.currentPlayer]
}
function mmp_playRange(start,len){}
function mmp_clearRange(){}
function mmp_getMovieState(){}
function mmp_getMovieRate(){}
function mmp_setMovieRate(R){}
function mmp_setColor(C){}
function mmp_getVersion(){}
function mmp_hasHadFatalError(){}
function mmp_getFatalError(){}
function mmp_play(){}
function mmp_stop(){}
function mmp_killInterval(){}
function mmp_checkStopFrame(){}
{
  var 
mmpFns={
getMovieTime:mmp_getMovieTime,
setMovieTime:mmp_setMovieTime,
getMovieTimeScale:mmp_getMovieTimeScale,
setMovieTimeScale:mmp_setMovieTimeScale,
getMaxTime:mmp_getMaxTime,
isPlaying:mmp_isPlaying,
playRange:mmp_playRange,
clearRange:mmp_clearRange,
getMovieState:mmp_getMovieState,
getMovieRate:mmp_getMovieRate,
setMovieRate:mmp_setMovieRate,
setColor:mmp_setColor,
getVersion:mmp_getVersion,
hasHadFatalError:mmp_hasHadFatalError,
getFatalError:mmp_getFatalError,
play:mmp_play,
stop:mmp_stop,
killInterval:mmp_killInterval,
checkStopFrame:mmp_checkStopFrame
   };
 for(var f in mmpFns)MultiMoviePlayer.prototype[f]=mmpFns[f];
}
    

**/


/** end MediaPlayer class **/
/** Graph class **/


/** end Graph class **/
/** Triples class, based on Graph **/



/** end Triples class, based on Graph **/
/**  Dict class -- uses Triples **/



/**  end Dict class -- uses Triples **/
/**   MannX class, mannX object **/

/**   end MannX class, mannX object **/
