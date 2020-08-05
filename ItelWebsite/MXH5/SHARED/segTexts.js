var unitSeq="";
/** if this webapp were called W, containing three units X.xhtml, Y.xhtml, Z.xhtml,
    then unitSeq = "W/X,W/Y,W/Z" should be defined manually
    the segTextData array is then constructed by SHARED/segTexts.xhtml, and used in searching the units.
**/

var segTextData=[

];


var segTexts={
  withinPage:"", // if non-empty then we only search within that page, e.g. "algo01/algo0101"
  setWithinPage:function(S){
     var pos=this.locPos(S+"#s0");
     if(S && pos<0)return alert("cannot set current page to "+S);
     this.withinPage=S;
  }, 
  matchTypes:["_","subject","grammar","afterword"],
  commTypes:["subject","grammar","afterword"],
  matchFns:["isScriptMatch","isCommMatch","isAnyMatch","isMatchTypeMatch"], // isMatchTypeMatch uses matchTypes
  matchFn:"isMatchTypeMatch",
  isMatch:function(q,N){return this.isMatchTypeMatch(q,N);},
  setMatchFn:function(mT){
    for(var i=0;i<this.matchFns.length;i++)
      if(mT==this.matchFns[i]){
         this.matchFn=mT;
         this.isMatch=this[this.matchFns[i]];
         return true;
         }
    return alert("invalid matchFn ["+mT+"]; expected:"+this.matchFns);
    }, 
  curSegPos:0,
  length:function(){return this.segObs.length;},
  curSeg:function(){return this.segObs[this.curSegPos];},
  locPos:function(loc){
    for(var i=0;i<this.length();i++)
      if(this.segObs[i][0]==loc)return i;
    return -1;
    },
  setCurSegLoc:function(loc){
    var pos=this.locPos(loc);
    if(pos==-1)return alert("cannot find location "+loc);
    return this.curSegPos=pos;
  },
  valAtLoc:function(loc){
    var pos=this.locPos(loc);
    if(pos>=0)return this.segObs[pos][1]; else return "";
    },
  commAtLoc:function(loc){
    var pos=this.locPos(loc);
    if(pos>=0)return this.commText[pos][1]; else return "";
    },
  regExpFromTxt:function(txt){
   if(!txt)return null;
   if(txt.charAt(0)!="/")return new RegExp("("+txt+")","i");
   txt=txt.split("/");var last=txt.length-1;
   return new RegExp("("+txt.slice(1,last).join("/")+")",txt[last]); // parens for replacement via $1
  },
  isTextMatch:function(q,dat){ // q is either a regexp "/", or is upper-case.
   },
  nextSeg:function(N,d){
    if(!d)d=1;
    while(true){
      N=(d+this.length()+N)%this.length();
      // if(!confirm("N="+N+"; this.withinPage="+this.withinPage+"; N_0="+this.segObs[N][0]))throw "oops";
      if(!this.withinPage || this.segObs[N][0].match(this.withinPage))return N;
      }
    }, // same except default dir
  prevSeg:function(N){return this.nextSeg(N,-1);},
  isScriptMatch:function(q,N){ return q.test(this.segObs[N][1]["_"]);},
  isMatchTypeMatch:function(q,N,A){
   if(!A)A=this.matchTypes;
   var Ob=this.segObs[N][1];
// if(!confirm("A=["+A+"]; Ob="+ob2String(Ob)))throw "oops";
   for(var i in A)if(q.test(Ob[A[i]]))return true;
   return false;
   },
  isCommMatch:function(q,N){ 
    var Ob=this.segObs[N][1]; for(var x in Ob)if(x!="_" && q.test(Ob[x]))return true;
    return false;
  },
  isAnyMatch:function(q,N){
    var Ob=this.segObs[N][1]; for(var x in Ob)if(q.test(Ob[x]))return true;
    return false;
  },
  prevMatch:function(q,N){return this.nextMatch(q,N,-1);},
  setPosNextMatch:function(q){ this.curSegPos=this.nextMatch(q,this.curSegPos,1); },
  setPosPrevMatch:function(q){ this.curSegPos=this.prevMatch(q,this.curSegPos); },
  nextMatch:function(txt,N,d){
    if(!d)d=1; if(!N && N!=0)N=this.curSegPos;
    if(!txt)return N;
    var qry=(txt instanceof RegExp)?txt:this.regExpFromTxt(txt);
    for(var currPos=this.nextSeg(N,d);currPos!=N;currPos=this.nextSeg(currPos,d))
      if(this.isMatch(qry,currPos))return currPos;
    return N;
  },
  prevMatch:function(txt,N){return this.nextMatch(txt,N,-1);},
  allMatches:function(txt){
    var qry=(txt instanceof RegExp)?txt:this.regExpFromTxt(txt);
    var lV=this.segObs;
    var res=[];
    for(var i=0;i<lV.length;i++)if(this.isMatch(qry,i))res.push(lV[i][0]); 
    return res;
  },
  fixSegLocs:function(){ // this is old code for checking the validity of a segTexts object
    var segLocs={}; for(var i=0;i<this.locVal.length;i++)segLocs[this.locVal[i][0]]=true;
    var comLocs={}; for(var i=0;i<this.commText.length;i++)comLocs[this.commText[i][0]]=true;
    var badSegLocs=[]; for(var sl in segLocs)if(!comLocs[sl])badSegLocs.push(sl);
    var badComLocs=[]; for(var sl in comLocs)if(!segLocs[sl])badComLocs.push(sl);
    alert("bad segLocs="+badSegLocs);
    alert("bad comLocs="+badComLocs);
    document.forms.wordForm.words.value=badSegLocs.join("\n")+"\nbadcom:\n"+badComLocs.join("\n");
},
 segObs:segTextData
};


