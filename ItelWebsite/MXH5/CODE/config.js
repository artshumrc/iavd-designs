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
/** CODE/config.js
  * default MannX configuration object, "config".
  * usual folder structure:
  * /webapps
  *   /movies              -- moviesFolder
  *   /mfmx                -- "webAppName"
  *     /CODE
  *       /config.js       -- this file; default config ob
  *       /mfDomLib.js     -- MicroFormat, etc.
  *       /MannX.js        -- define player MicroFormat classes
  *       FlowPlayer.swf, JMFJSApplet.jar, etc.
  *     /hongkong          -- (sample)repository
  *       /index.xhtml     -- search page
  *       /config.js       -- repository config ob, used as update;
  *       theDict.xhtml    -- shared dictionary for repository
  *       /hongkong1.xhtml -- self-loading XHTML unit; config in textarea
  *       /hongkong2.xhtml -- self-loading XHTML unit;   "     "    "
  *       /hongkong3.xhtml -- self-loading XHTML unit; ...
  *     wilson.xhtml       -- independent unit with config in textarea
  *     /CSS               -- CSS files for use in units and index pages
  *       /movieDictScriptComm.css
  *       /movieScriptComm.css
  *       /movieScriptExercises.css
  *       /movieDictTiers.css    -- shows "ELAN/Toolbox" view
  *     /SHARED            -- data shared between repositories, if any
  *       /theDict.xhtml
  *     /IMG               -- button images, etc.
  *       ....
**/

function getWindowDimensions(){
  var window_height;
  var window_width;
  // Get Height
  if (window.innerHeight) {
    window_height=window.innerHeight;
  }
  else if (document.documentElement && document.documentElement.clientHeight) {
    window_height=document.documentElement.clientHeight;
  }
  else if (document.body) {
    window_height=document.body.clientHeight;
  }
  //alert(window_height);
  // Get Width
  if (window.innerWidth) {
    window_width=window.innerWidth;
  }
  else if (document.documentElement && document.documentElement.clientWidth) {
    window_width=document.documentElement.clientWidth;
  }
  else if (document.body) {
    window_width=document.body.clientWidth;
  }
  //alert(window_width);
  return [window_width, window_height];
}

function obType(ob){
  var res=typeof ob;
  if(res=="object" && ob instanceof Array)res="array";
  return res;
  }
function ob2Str(ob){
  var typeOfOb=obType(ob);
  if(typeOfOb=='string')return '"'+ob+'"';
  if(ob instanceof Array)return "["+(ob.map(ob2Str).join(","))+"]";
  if(!(ob instanceof Object))return ""+ob;
  var A=[];
  for(var x in ob)A.push(x+":"+ob2Str(ob[x]));
  return "{"+A.join(",\n")+"}";
}

var window_dimensions = getWindowDimensions();
var config={
  toString:function(){return ob2Str(this);},
  update:function(ob){ // one-level or two-level, not more.
    for(var x in ob){
      if(x.indexOf("_")<0){
         if(/** this[x] instanceof Object && **/ obType(ob[x])=='object'){
           for(var y in ob[x])this[x][y]=ob[x][y];
         } else this[x]=ob[x];
      } else {var p=x.split("_");this[p[0]][p[1]]=ob[x];}
         // a.movie_color=x -> a.movie.color=x
      }
    },
  getURLParams:function(href){
    var ob={};
    href=href.replace("#","");
    var locP=href.split("?");
    this.projectName=locP[0].replace(/.*[/]([^/.]*[/][^/.]*)[.][^/.]*/,"$1");
    href=locP[1]; if(!href)return ob;

    var A=("isAlphabetic,playOnSelection,startPlayDelay,mode,synchLevel,logLevel,initStyle,initSearch,folders_css,"
         +"movie_color,movie_width,movie_height,movie_fileName,movie_prestart,movie_range").split(",");
    var updatable={};
    for(var i in A)updatable[A[i]]=i+1;
   var A=href.split("&").map(function(s){return unescape(s.replace(/\+/g," "));});
  // alert("A="+ob2Str(A));
   var ob={};
   for(var i=0;i<A.length;i++){
       var p=A[i].split("=");
       var n=p[0];var v=p.length<2?"true":p[1];
       if(!(updatable[n]))continue;
       if(v=="true"||v=="false"||v.match(/^[0-9.E]+$/))v=eval(v);
       ob[n]=v;
     }
   // alert(ob2Str(ob));
   return ob;
  },

  startPlayDelay:2000,
  webAppName:"mfmx",
  projectName:"mfmx/pencil",
  folders:{movies:"../../movies/", // relative to code folder for FLV
           images:"../IMG/",  // relative to unit, e.g. pencil.xhtml
           code:"../CODE/",
           docs:"../docs/",
           shared:"./SHARED/",
           css:"../CSS/" },
  dict:"./SHARED/theDict.html",
  cssFiles:{
            mada:"mada-archi.css",       //  [movie/dict],tiers
            mdaa:"mdaa-archi.css",       //  [movie,dict]/tiers
            "author-interlinear":"author-interlinear.css",
            mdtwwt:"mdtwwt.css",
            author:"author.css"},   //  authormode
  initStyle:"mada",
  addedStyles:"",
  // initScripts:"FlashTag.js,MoviePlayer.js,dropdownfiles/dropdown.js,dropdownfiles/setheight.js", // after MX,config
  initScripts:"FlashTag.js,MoviePlayer.js", // after MX,config
  caseSensitiveLookup:false,
  lookupByID:false,   // if true, then compare hexified string with ID instead of string with term
  // nextStyle:"mdt,msdc,msc,msd", // show the nextStyle button; use this sequence
  dictSynch:false, // don't show button for topic search
  commentClasses:"subject,grammar,afterword",
  detailClasses:{},  // e.g., {col0:'table-cell',r12:'table-row'} to be shown/hidden
  synchBreakDiv:"&#160;",
  testing:false,
  scrollToExerciseQuestions:false,
  isAlphabetic:true, // !chinese, whatever; if isAlphabetic, sort dict.
  playOnSelection:false, // don't autoplay when a segment is selected
  pickSelectionLength:30, // copy selection to search box if 0<length<pickSelectionLength
  segmentTimeMargin:0.5, // if movie is this far into a segment, we're sure
  synchLevel:0, // if 1,2,..., we choose segments up to synch L1, synch L2,...
  logLevel:0,
  movie:{fileName:"F12_Pencil.webm",
         height:window_dimensions[1] / 2.4,
         width:window_dimensions[0] / 2.2,
                                             //height:240,width:360,
         color:"b4b4b4",prestart:1,
                  // 0= don't prestart, 1=minimal init, 2=play
         range:"", 
         secondsPerPixel:0.02, // fileName.split(".")[0]+".png" is picFileName
         playerClass:"FlashFLVMoviePlayer" // "AppletMoviePlayer" "FlashFLVMoviePlayer"
         },
  applet:{archive:"JMFJSApplet.jar",code:"JMFJSApplet.class"}, // within CODE
  helpFile:{name:"MannXUserGuide.html", // in folders.docs
            windowName:"heelp", // window name
            params:{menubar:"yes",toolbar:"yes",status:"yes",scrollbars:"yes",
                    resizable:"yes",width:400,height:400,screenX:600,screenY:20}
                   }
}


// var FLV_autoPlay=true;

