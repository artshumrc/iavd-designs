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
/** exercises.js **/

var exercisesGrammar={
    exercises  :{extoc:"?", exx:"*"},
    extoc      :{ exLink:"*" },
    exLink     :{},
    exx        :{exTitle:1,exPreamble:1,exSub:"*"},
    exTitle    :{},
    exPreamble :{},
    exSub      :{}
   } ;

function exTitle(){}
exTitle.prototype=new MicroFormat();
exTitle.prototype.mf_events={
  onclick:function(evt){
  var xdOb=mfObjects.obs[this.id]; // alert("xdOb="+xdOb);
  var ex=xdOb.mf_parent;
  var preamble=ex.exPreamble.mf_elt;
  if(!ex.hasHiddenPreamble)preamble.className="exPreambleX";
  else preamble.className="exPreamble";
  ex.hasHiddenPreamble=!ex.hasHiddenPreamble;
}
}

function buttonText(val,fn){
  return '<input type="button" id="bid'+(genSymNum++)+'" value="'+val+'"'
           +' onclick="'+fn+'"/>';
}

function exSub(){}
exSub.prototype=new MicroFormat();
exSub.prototype.postInit=function(){
 // if(!this.id)this.id="exSub_"+(genSymNum++);
 var xd=this.mf_elt;
 xd.innerHTML+=' <textarea rows="2" cols="60">Enter_answer_here</textarea><div>'+
                buttonText("Next Question","top.nextSub('"+xd.id+"')")+
                buttonText("Exercises List","top.showToc('"+xd.id+"')")+
                buttonText("Close Exercises","top.endSub('"+xd.id+"')")+"</div>";
}

function showToc(sourceExSubId){
  var exSub1=mfObjects.obs[sourceExSubId];
  exSub1.mf_elt.className="exSub";
  var ex1=exSub1.mf_parent;
  ex1.xdDomElement.className="exx";
  var toc=ex1.mf_parent.extoc;
  toc.mf_elt.scrollIntoView(); 
  top.thePlayerManager.prevExercise=null;
}
function nextSub(exSubId){
  var ob=mfObjects.obs[exSubId];
  var nextOb=ob.mf_nextSibling;
  if(!nextOb)return endSub(exSubId);
  ob.mf_elt.className="exSub";
  var nextElt=nextOb.mf_elt;
  nextElt.className="exSubSelected";
  nextElt.getElementsByTagName("textarea")[0].focus();
}

function endSub(exSubId){
  var ob=mfObjects.obs[exSubId];
  ob.mf_elt.className="exSub";
  top.thePlayerManager.hideExercises();
}

function exx(){}
exx.prototype=new MicroFormat();
exx.prototype.showFirst=function(){
  this.selectedSub=0;
  this.exSub[0].mf_elt.className="exSubSelected";
  var nextElt= this.exSub[0].mf_elt;
  nextElt.className="exSubSelected";
  nextElt.getElementsByTagName("textarea")[0].focus();
}

thePlayerManager.hideExercises=function(){
  this.exercisesShowing=false;
  var mLS=$('exercises');
  if(mLS)return mLS.style.display='none';
}

thePlayerManager.showExercise=function (but){ // assumes that $('exercises') exists
  var prevExercise=this.prevExercise;
  var ident=but.value;
  if(ident.indexOf(" ")>0)ident=ident.substring(0,ident.indexOf(" "));
  ident=ident.substring(0,2)+"_"+ident.substring(2);
  if(this.exercisesShowing && prevExercise==ident){this.hideExercises();return;}
  if(!this.exercisesShowing){
    this.exercisesShowing=true;
    $('exercises').style.display='block';
  }
  this.showExerciseById(ident,prevExercise);
}
thePlayerManager.showExerciseById=function(ident,prevId){
  var ex=this.ctlWindow.document.getElementById(ident);
  if(!ex)return alert("no such exercise as "+ident);
  var prevEx=this.ctlWindow.document.getElementById(prevId);
  if(prevEx){prevEx.className=prevEx.className.replace("exxSelected","exx");}
  ex.className=ex.className.replace("exx","exxSelected");
  this.prevExercise=ident;
  ex.scrollIntoView();
  var exOb=builder.subs[ident];
  exOb.showFirst(); 
}
