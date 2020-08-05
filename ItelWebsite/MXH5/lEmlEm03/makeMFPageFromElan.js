/** objects to strings **/
function ob2Str(ob){var S="{";for(x in ob)S+=x+":"+ob[x]+",\t";if(S.length>1)S=S.substring(0,S.length-2);return S+"}";}

function attrString(ob){
  var S="";
  for(var x in ob)S+=" "+x+":'"+ob[x].replace(/'/g,"&apos;")+"'";
  return S;
}

/** set theory **/

/* invert({a:b,c:b,d:e})=={b:[a,c],e:[d]} */
function invert(ob){
    var inv={};
    for(var x in ob){
      var y=ob[x];
      var range=inv[y];
      if(range)range.push(x);else inv[y]=[x];
      }
    return inv;
  }
/* reflexiveTransitiveClosure({a:['a','b','c'],b:['a','d']})('a')==['a','b','c','d'] */
function reflexiveTransitiveClosure(F){ // F[x] = [y1,...yN] as an child-array
  var rTC=function(x){
    var R=[x];var done={x:true}; var waiting=[x];
    while(waiting.length!=0){var next=waiting.pop();var kids=F[next];
      //if(!confirm("found children ["+kids+"] of "+next+" with R=["+R+"]; waiting=["+waiting+"]"))throw "oops";
      if(!kids)continue;
      for(var k=0;k<kids.length;k++){
        var y=kids[k];
        if(done[y])continue;
        R.push(y); waiting.push(y);
        done[y]=true;
        }
      }
  return R;
  };
  return rTC;
}
function setDiff(A,B){
  var Bset={};for(var i=0;i<B.length;i++)Bset[B[i]]=true;
  var D=[];for(var i=0;i<A.length;i++)if(!Bset[A[i]])D.push(A[i]);
  return D;
}


/** consume DOM **/

function $(x){return document.getElementById(x);}
function attr(x,a){return x.getAttributeNS(null,a);}
function attrs2Object(elt){
if(!elt)throw alert("attrs2Object: no elt");
  var S={};
  for(var i=0;i<elt.attributes.length;i++){
    var a=elt.attributes[i];
//    S[a.nodeName]=a.nodeValue?a.nodeValue:"";
    S[a.nodeName]=a.value?a.value:"";
    }
  return S;
}

/** generate HTML **/

function makeRow(A){
  var S="<tr>";
  if(A)for(var i=0;i<A.length;i++)S+="<td>"+A[i]+"</td>";
  S+="</tr>\n";
  return S;
} 
function attrRows(ob,exclude){
  var S="";
  for(x in ob)if(!exclude || !exclude[x])S+=makeRow(["@"+x,ob[x]]);
  return S;
} 
function attrRowsElt(ob,lbl,path){
  var S=makeRow([lbl,path]);
  S+=attrRows(ob);
  return S;
} 

function attrRowsEltSeq(A,lbl,path){
  var S="";
  for(var i=0;i<A.length;i++)
    S+=makeRow([lbl,path+i+"]"])+attrRows(A[i]);
  return S;
}


var tierManager={
name:"tierManager",
singleTags:"ANNOTATION_DOCUMENT,HEADER".split(","),
seqTags:"MEDIA_DESCRIPTOR,TIME_SLOT,LINGUISTIC_TYPE,LOCALE,CONSTRAINT".split(","),
attrs2ObElt:function(tagName){
  var elt=this.doc.getElementsByTagName(tagName)[0];
  if(!elt)throw alert("attrs2ObElt: no elt for "+tagName);
  return attrs2Object(elt);
}, 
attrs2ObEltSeq:function(tagName){
  var A=[];
  var E=this.doc.getElementsByTagName(tagName);
  for(var i=0;i<E.length;i++)
    A.push(attrs2Object(E[i]));
  return A;
},
tagAttrs:function(tag){
  this.tagAttrsOb[tag]=this.attrs2ObElt(tag);
},
tagAttrsSeq:function(tag){
  this.tagAttrsObSeq[tag]=this.attrs2ObEltSeq(tag);
}, 
readElanTagAttrs:function(){
  this.tagAttrsOb={};
  var tags=this.singleTags;
  for(var i in tags)this.tagAttrs(tags[i]);
},
readElanTagAttrsSeqs:function(){
  this.tagAttrsObSeq={};
  var tags=this.seqTags;
  for(var i in tags)this.tagAttrsSeq(tags[i]);
},
tierAttrsSubAttrsSubSubVals:function(){ // "TIER", finds annotations and values 
  //returns A[i][attrName]==attr val for attrName of i-th tag elt,
  //        A[i].isAlignable == true iff it has alignable annotations
  //        A[i].childNodes[j][attrName] is attr val of j-th child,
  //   this.tierVals[i].childNodes[j].ANNOTATION_VALUE=='blah'
  var A=[];
try{
  var E=this.doc.getElementsByTagName("TIER");
  for(var i=0;i<E.length;i++){
    var attrOb;
    var tier=E[i]; // tier is a TIER
    try{tierAttrOb=attrs2Object(tier);
// alert("found TIER ["+i+"]=["+tierAttrOb.TIER_ID+"]");
    }catch(e){return alert("tASASSV "+e+"\nE["+i+"]="+Ei);}
    var AA=tier.getElementsByTagName("ALIGNABLE_ANNOTATION");
    var RA=tier.getElementsByTagName("REF_ANNOTATION");
    tierAttrOb.isAlignable=AA.length>0;
    if(AA.length>0 && RA.length>0)alert("WARNING: tier "+ob2Str(tierAttrOb)+" has alignable and ref annotations");
    var src=(AA.length>0)?AA:RA;
    var C=[];
    for(var j=0;j<src.length;j++){
      var aa=src[j]; //aa is an ALIGNABLE_ANNOTATION, with 
      var subattrOb=attrs2Object(aa);

      var subsubval=null;
      try{
        subsubval=aa.firstChild.firstChild.nodeValue;
      }catch(e){}
      if(!subsubval)subsubval="";
      subsubval=aa.text; /** XXXXX **/
      subattrOb.ANNOTATION_VALUE=subsubval;
      C.push(subattrOb);
    }
    tierAttrOb.childNodes=C;
    // alert("tierAttrOb.childNodes.length="+tierAttrOb.childNodes.length);
    A.push(tierAttrOb);
    }
 }catch(x){return alert("tASASSV "+x+"\nA="+A);}
    return A;
},
  toString:function(){var S="{";
    S+="srcFileName:"+this.srcFileName+",";
    S+="timeSlots:{";
    for(var x in this.timeSlots)S+=x+":"+this.timeSlots[x]+",\n";
    S+="},\ntopTiers:["+this.topTiers.join(",")+"],\n";
    S+="parentTier:{";
    for(var x in this.parentTier)S+=x+":"+this.parentTier[x]+",\t";
    S+="},\nchildTiers:{";
    for(var x in this.childTiers)S+=x+":["+this.childTiers[x].join()+"],\t";
    S+="},\ntierSets:["+this.tierSets.map(function(A){return "["+A.join(",")+"]";}).join(",\t");
    S+="],\nisAlignable:{";
    for(var x in this.isAlignable)S+=x+",";
    S+="},\nisRef:{";
    for(var x in this.isRef)S+=x+",";
    S+="},\nalignables={";
    for(var x in this.alignables)S+=this.tierToString(x)+",\n";
    S+="},\refs:{";
    for(var x in this.refs)S+=this.tierToString(x)+",\n";
    S+="}}";
    return S;
    },
  tierToString:function(tierID){var S=tierID+":"+"{";
    var ob=(this.isAlignable[tierID])?this.alignables[tierID]:this.refs[tierID];
    var tS=this.tierSequences[tierID];
    // if(!confirm("tTS:"+tierID+"\n"+tS))throw "oops";
    var A=[];
    for(var i in tS){
      var x=tS[i];
      A.push(x+":["+ob[x].join(",")+"]");
      }
    var S=tierID+":{"+A.join(",\n")+"}"
    return S;
    },
  getTierTimes:function(tierID){
    if(!(this.isAlignable[tierID]))throw "getTierTimes("+tierID+"); non-alignable tier";
    var T=[]; var ob=this.alignables[tierID];
    for(var x in ob){var trio=ob[x];T.push(this.timeSlots[trio[0]]);T.push(this.timeSlots[trio[1]]);}
    T=T.sort(function(a,b){return a-b;});
    var R=[]; var t=-1000;
    for(var i in T){var newT=T[i];if(t!=newT)R.push(t=newT);}
    return R;
  },
  iframe:null,form:null,doc:null,topTiers:[],parentTier:{},srcFileName:null,
  childTiers:{},tierSets:{},
  isAlignable:{},isRef:{},alignables:{},refs:{},tierSequences:{},
  timeSlots:{},
  init:function(iframeID,formName){
    this.iframe=$(iframeID);this.iframe.src=null;
    this.form=document.forms[formName];
    this.srcFileName=this.form.unitName.value;
    // this.iframe.onload=this.handleDoc;
    this.iframe.src=this.srcFileName;
    setTimeout(this.name+".getDoc(0)",200);
  },
  maxReadTries:50,
  getDoc:function(N){
    var errmsg=null;
    try{ this.doc=this.iframe.contentDocument;}
    catch(e){errmsg=e;};
    if(this.doc && this.doc.readyState=="complete")return this.handleDoc();
    if(N<this.maxReadTries)return setTimeout(this.name+".getDoc("+(N+1)+")",200);
    return alert("getDoc failure after "+N+" tries, sorry\n err="+errmsg+"\n");
  },
  readElanTimeSlots:function(){
    this.timeSlots={};
    var A=this.doc.getElementsByTagName("TIME_SLOT");
    var prevVal=0;
    for(var i=0;i<A.length;i++){
      var ts=A[i];
      var tsID=attr(ts,"TIME_SLOT_ID")
      var tsVal=attr(ts,"TIME_VALUE");
      if(tsVal)tsVal=parseInt(tsVal);
      else {
         alert("no TIME_VALUE for TIME_SLOT_ID:"+tsID+"; attempt interpolation from "+prevVal);
         var nextVal;
         try{ nextVal= parseInt(attr(A[i+1],"TIME_VALUE")); 
         }catch(e){alert("nextVal err "+e); nextVal=prevVal;}
       
         tsVal=0.5*(prevVal+nextVal);
         alert("result is "+tsVal+" between "+prevVal+" and "+nextVal);
         }
      prevVal=tsVal;
      this.timeSlots[tsID]=tsVal;
    }
  },
  setTierTypes:function(tTTA,tierIDs){
    var classList=trim(tTTA.value).split(/[\n]+/);
    var tierN=tierIDs.length;
    if(classList.length >=2 && classList.length < tierN){
      var ult=classList[classList.length-1];
      var penUlt=classList[classList.length-2];
      while(classList.length < tierN-1){
        classList.push(penUlt);
        classList.push(ult); // copy last two classes
        }
      if(classList.length < tierN)classList.push(penUlt);
    }
    for(var i in tierIDs){
      if(i>=classList.length)break; // not even 2 of them? Okay.
      classList[i]=tierIDs[i]+":"+trim(classList[i]);
      }
    tTTA.value=classList.join("\n");
  },
  readElanTiers:function(){
    var A=this.doc.getElementsByTagName("TIER");
    this.topTiers=[];
    this.tierIDs=[];
    this.tierAttributes={};
    this.isAlignable={},this.isRef={},
    this.parentTier={};
    for(var i=0;i< A.length;i++)this.readElanTier(A[i]);
    this.childTiers=invert(this.parentTier);
    var descendants=reflexiveTransitiveClosure(this.childTiers);
    this.tierSets=this.topTiers.map(descendants);
    this.setTierTypes(document.forms.theForm.tierTypeTA,this.tierIDs);
  }, 
  getAttrString:function(elt){ // readElanTier:tierAttributes[tierID]; handleDoc topAttrs
    var namedNodeMap=elt.attributes;
    var S="";
    for(var i=0;i<namedNodeMap.length;i++){var node=namedNodeMap.item(i);
      S+=" "+node.nodeName+'="'+node.nodeValue+'"';
    }
    return S;
  },
  getAttrObject:function(elt){
    var namedNodeMap=elt.attributes;
    var S={};
    for(var i=0;i<namedNodeMap.length;i++){var node=namedNodeMap.item(i);
      S[node.nodeName]=node.value;
    }
    return S;
  }, 
  readElanTier:function(tier){
    var tierID=attr(tier,"TIER_ID");
    this.tierAttributes[tierID]=this.getAttrObject(tier);
    this.tierIDs.push(tierID);
    var parentRef=attr(tier,"PARENT_REF");
    if(parentRef)this.parentTier[tierID]=parentRef;
    else this.topTiers.push(tierID);
    this.readElanAlignables(tierID,tier.getElementsByTagName("ALIGNABLE_ANNOTATION"));
    this.readElanRefs(tierID,tier.getElementsByTagName("REF_ANNOTATION"));
    if(this.isAlignable[tierID] && this.isRef[tierID])
      alert("tier "+tierID+" has alignable and ref annotations!");
  },
  readElanAlignables:function(tierID,alignables){
    if(alignables.length==0)return;
    this.isAlignable[tierID]=true;
    var A=[];this.tierSequences[tierID]=A;
    var trios={};
    for(var i=0;i<alignables.length;i++){
      var align=alignables[i];
      var alignID=attr(align,"ANNOTATION_ID");A.push(alignID);
      var ts1=attr(align,"TIME_SLOT_REF1");
      var ts2=attr(align,"TIME_SLOT_REF2");
//      var val="";
//      try{val=align.firstChild.firstChild.nodeValue;}catch(e){}
//      if(!val)val="";
      var val=this.getValue(align);
// if(!confirm("value of aa["+alignID+"] is ["+val+"]"))throw "up";
      trios[alignID]=[ts1,ts2,val];
      }
    this.alignables[tierID]=trios;
  },
  getValue:function(annotation){ 
    var val=null;
    try{val=annotation.getElementsByTagName("ANNOTATION_VALUE")[0].firstChild.nodeValue;}
    catch(ex){}
    return val?val:"";
  },
  readElanRefs:function(tierID,refs){
    if(refs.length==0)return;
    this.isRef[tierID]=true;
    var A=[];this.tierSequences[tierID]=A;
    var links={};
    for(var i=0;i<refs.length;i++){
      var ref=refs[i];
      var refID=attr(ref,"ANNOTATION_ID");A.push(refID);
      var link=attr(ref,"ANNOTATION_REF");
//      try{var val=ref.firstChild.firstChild.nodeValue;}catch(e){}
//      if(!val)val="";
      var val=this.getValue(ref);
// if(!confirm("value of ra["+refID+"] is ["+val+"]"))throw "up";
      links[refID]=[link,val];
    }
    this.refs[tierID]=links;
  },
  handleDoc:function(){
   try{
    var B=[];
    //alert("doc=\n\n"+this.doc);
    this.readElanTagAttrs();this.readElanTagAttrsSeqs();
    this.tierVals=this.tierAttrsSubAttrsSubSubVals();
    this.topAttrs=this.getAttrObject(this.doc.getElementsByTagName("ANNOTATION_DOCUMENT")[0]);
    this.readElanHeader();
    this.readElanTimeSlots();
    this.readElanTiers();
    this.readElanTail();
    document.forms.theForm.ta.value=this.toString();
    }catch(e){return alert(e);}
  },
  readElanHeader:function(){
    var xmlSerializer=new XMLSerializer();
    var header=this.doc.getElementsByTagName("HEADER")[0];
   
    this.ELANheaderText= xmlSerializer.serializeToString(header);
  },
  getELANheaderText:function(){return this.ELANheaderText;},
  readElanTail:function(){
    var xmlSerializer=new XMLSerializer();
    var tailElts=["LINGUISTIC_TYPE","LOCALE","CONSTRAINT"];
    var S="";
    for(var i=0;i<tailElts.length;i++){
      var A=this.doc.getElementsByTagName(tailElts[i]);
      for(var j=0;j<A.length;j++)
          S+= xmlSerializer.serializeToString(A[j]);
      }
    this.ELANtailText=S;
  },
  getELANtailText:function(){return this.ELANtailText;},
  getTimeBreaks:function(tierSet){
    var timeTiers=[];var timeBreaks=[];
    for(var i=0;i<tierSet.length;i++)
      if(this.isAlignable[tierSet[i]])timeTiers.push(i);
    if(timeTiers.length==0 || timeTiers[0]!=0)
      throw "bad top tier (not alignable)  in "+tierSet;
    if(timeTiers.length>2)
      throw "bad tierset ("+timeTiers.length+" alignable tiers) in "+tierSet;
    var topTimes=this.getTierTimes(timeTiers[0]); // e.g. [1,2,3,7]
    var endTimeLoc=topTimes.length-1;
    for(var i=0;i<endTimeLoc;i++)timeBreaks[i-1]=[topTimes[i-1],topTimes[i]];
    timeBreaks[endTimeLoc]=[topTimes[endTimeLoc]]; // e.g. [[1,2],[2,3],[3,7],[7]]
    if(timeTiers.length==2){
      var subTimes=this.getTierTimes(timeTiers[1]); // e.g. [1,1.4,2,3,4,5,6,7]
      var tableBreaksNotInColumns=setDiff(subTimes,topTimes);
      if(tableBreaksNotInColumns.length!=0)
         alert("WARNING: "+timeTiers+" has tableBreaks "+
                tableBreaksNotInColumns+ " which are not column breaks");
      timeBreaks=timeBreaks.map(function(x){return insertTimes(subTimes);});
                             // e.g. [[1,1.4,2],[2,3],[3,4,5,6,7],[7]
      }
    return timeBreaks;
  },
genMFPage:function(){
  var S=this.genXhtmlHeader(); //mostly copy of header text,+title
  S+="<body>";
  S+=this.genConfigData(); // some from eaf, movie size from form
  S+=this.genTierSets();
  S+="</body></html>";
  return S;
},
genTierSets:function(){
 var tSS=this.tierSets;
 var S="";
 for(var t=0;t<tSS.length;t++)S+=this.genTierSet(tSS[i]);
 return S;
},
genTierSet:function(tS){
  var S="<div class='tierSet'>";
  var timeBreaks=this.getTimeBreaks(tS); // hmm....thinking,thinking
  for(var i=0;i<timeBreaks.length;i++)
    S+=this.genTable(tS,timeBreaks[i]);  // not even thinking yet
  S+="</div>"
  return S;
},
genHTML:function(){

  var theForm=document.forms.theForm;
  this.tierTypes=this.getTierTypes(theForm.tierTypeTA.value.split("\n"));
  this.setTSAnnotations();
  var S="<div class='segment'><span class='synch'>0</span>";
  var tS=this.tSAnnotationsArray;;
  this.inSegment=true;
  for(var i in tS)
    S+=this.genHTMLtimeSlotTable(tS[i]);
  if(this.inSegment)S+="</div>\n";
/**
  S+="<table id='elanData' border='1'>\n";
  S+=this.genHTMLtagAttrs();
  S+=this.genHTMLtagAttrsSeqs();
  S+=this.genHTMLtierAttrs();
  S+="</table>\n";
**/
  var tiers=this.tierIDs.join(",");
/**
  S+=this.genHTMLmannxConfigData(theForm,tiers);
**/
  return wrapTemplate(S,theForm,tiers);
},
getTierTypes:function(pairs){
  var R={};
  for(var i in pairs){pair=pairs[i].split(":");R[pair[0]]=pair[1];}
  return R;
},
genHTMLtagAttrs:function(){
  var tao=this.tagAttrsOb,S="",tags=this.singleTags;
  for(var i in tags)S+=attrRowsElt(tao[tags[i]],"/"+tags[i],"");
  return S;
},
genHTMLtagAttrsSeqs:function(){
  var tao=this.tagAttrsObSeq,S="",tags=this.seqTags;
  for(var i in tags){
    var tag=tags[i];if(tag=="TIME_SLOT")continue; // output implicit
    S+=attrRowsEltSeq(tao[tags[i]],"/"+tags[i],tags[i]+"[");
  }
  return S;
},
genHTMLtierAttrs:function(){
  var A=this.tierVals; var exclude={childNodes:true};
  var S="";
  for(var i=0;i<A.length;i++)
    S+=makeRow(["/TIER","/TIER["+i+"]"])+attrRows(A[i],exclude);
  return S;
},
setTSAnnotations:function(){ // this.TSAnnotations[tsID][tierID]=undefined or [annotID,annotVal]
  var tSA={};
  var tSAA=[];
  var tS=this.timeSlots;
  this.tSAnnotations=tSA;
  this.tSAnnotationsArray=tSAA;
  
  for(var i in this.tierIDs){var tID=this.tierIDs[i];
    var isA=this.isAlignable[tID];
    var tier=isA?this.alignables[tID]:this.refs[tID];
    for(var x in tier){
      var ts=this.startingTimeSlotID(tID,isA,tier,x);
      var A=tSA[ts];
      if(!A)tSA[ts]=(A={});
      A[tID]=[x,tier[x]];  // event tier[tierID][x] begins at timeslot ts;
      }
   // if(!confirm("tSAA="+ob2Str(tSAA)))throw "oops";
  }
   for(var t in tS)tSAA.push([tS[t],t,tSA[t]]); // [time, tSID,{tierID:[eventID,[startTS,endTS,val]],...}]
                                                // [time, TSID,{tierID:[eventID,[refEvtID,val]],...}]
  return tSAA.map(function(x){return ""+x[1]+":"+x[0]+ob2Str(x[2])+"\n";}).join("\n---\n");
},
genHTMLtitle:function(){
  var S="<title>ELAN as HTML</title>\n";
  return S;
},
genHTMLmannxConfigData:function(frm,tiers){
var S="<table border='1' id='MannXconfigDataTable'>\n";
  S+=makeRow(['/MannXconfigDataTable',configTA(frm,tiers)]);
  S+="</table>\n";
  return S;
//var S="<textarea id='configData' cols='100' rows='5'>";
  S+="</textarea>\n";
  return S;
},
genHTMLtextAreaTable:function(){
  var S="<table border='1'>\n";
  S+=this.genHTMLRowTextAreaTable("ELAN header","",this.getELANheaderText());
  for(var i in this.tierIDs){var tID=this.tierIDs[i];
    S+=this.genHTMLRowTextAreaTable(tID,this.isAlignable[tID]?true:false,attrString(this.tierAttributes[tID]));
    }
  S+=this.genHTMLRowTextAreaTable("ELAN tail","",this.getELANtailText());
  S+="</table>\n";
  return S;
},
genHTMLRowTextAreaTable:function(lbl,alignable,txt){
  var S="<tr><td>"+lbl+"</td><td>"+alignable+"</td><td>";
  S+="<textarea cols='100' rows='3'>";
  if(!txt)txt="";
  S+=txt.replace(/</g,'&lt;');
  S+="</textarea></td></tr>\n";
  return S;
},
startingTimeSlotID:function(tierID,isA,tier,annotID){
      // var ts=this.startingTimeSlotID(tID,isA,tier,x);
  try{
  if(isA)return tier[annotID][0];
  var upperTierID=this.parentTier[tierID];
  var upIsA=this.isAlignable[upperTierID];
  var upperTier=upIsA?this.alignables[upperTierID]:this.refs[upperTierID];
  var upperAnnotID=tier[annotID][0];
  // if(!confirm("sTSID("+tierID+","+annotID+")-->sTSID("+upperTierID+
  // ","+upIsA+","+upperTier+","+upperAnnotID+")"))throw "oops";
  return this.startingTimeSlotID(upperTierID,upIsA,upperTier,upperAnnotID);
  }catch(e){throw alert("startingTimeSlotID("+tierID+","+annotID+"):"+isA+"\n"+e);}
},

genHTMLtimeSlotTable:function(tsAnnotation){ 
  var tierIDs=this.tierIDs;
  var tierTypes=this.tierTypes;
  var time=tsAnnotation[0];
  var tsID=tsAnnotation[1];
  var tsOb=tsAnnotation[2];
if(!tsOb)tsOb={};
// [time, tSID,{tierID:[eventID,[startTS,endTS,val]],...}]
// [time, TSID,{tierID:[eventID,[refEvtID,val]],...}]

/**
  var hasUtteranceData=false;
  for(var tID in tsOb){
     if(this.tierAttributes[tID].LINGUISTIC_TYPE_REF=='utterance')
        {hasUtteranceData=true;break;}
     }
**/
  var mustShow=false;
  var S="";
  {var S2="";
   var val="";
  for(var i in tierIDs){
    var tierID=tierIDs[i];
    var tierType=tierTypes[tierID];if(!tierType)tierType=tierID;
    var tierEvt=tsOb[tierID]; // [eventID,[startTS,endTS,val] or [eventID,[refEvtID,val]];
    if(!tierEvt)continue;
    if(this.isAlignable[tierID]){
      val=tierEvt[1][2];
      try {timeDiff=+tierEvt[1][1]-tierEvt[1][0]; if(timeDiff > 500)mustShow=true;
      }catch(ex){}
    } else val=tierEvt[1][1];
    if(val)mustShow=true;
    S2+='<div class="'+tierType+'">'; 
    S2+='<span>'+val+'</span>'; // add val;
    S2+='</div>\n';
  }
  if(mustShow){
    if(this.inSegment)S+="</div>";
    S+="<div class='segment'><span class='synch'>"+time/1000+"</span>\n";
    this.inSegment=true;
    S+=S2;
  }
  }
  return S; 
},
genHTMLtailTextArea:function(){ return "";
  var S="<textarea id='tailTA' cols='100' rows='10'>";
  S+=this.getELANtailText();
  S+="</textarea>\n";
  return S;
},
readHTML:function(frameID){
  var frame=$(frameID);
},
readHTMLtimeSlots:function(table){
},
readHTMLtiers:function(table,startRow){
},
readHTMLtier:function(table,startRow){
},
genELAN:function(){
  var S='<?xml version="1.0" encoding="UTF-8"?>\n';
  S+='<ANNOTATION_DOCUMENT '+attrString(this.topAttrs)+'>\n';
  S+=this.getELANheaderText();
  S+=this.genELANtimeSlots();
  for(var i=0;i<this.tierIDs.length;i++)
    S+=this.genELANtier(this.tierIDs[i]);
  S+=this.getELANtailText();
  S+='</ANNOTATION_DOCUMENT>\n';
  return S;
},
 genELANtimeSlots:function(){
  var tS=this.timeSlots;
  var S="<TIME_ORDER>";
  for(tsID in tS)
    S+='<TIME_SLOT TIME_SLOT_ID="'+tsID+'" TIME_VALUE="'+tS[tsID]+'"/>';
  S+="</TIME_ORDER>";
  return S; 
},
 genELANtier:function(tierID){
  if(this.isAlignable[tierID])
    return this.genELANalignableTier(tierID);
  else return this.genELANrefTier(tierID);
},
 genELANalignableTier:function(tierID){
   var S="<TIER "+attrString(this.tierAttributes[tierID])+">";
   var T=this.tierSequences[tierID];
   var trios=this.alignables[tierID];
   for(var i in T){
     var annotID=T[i];
     var trio=trios[annotID];
     S+="<ANNOTATION><ALIGNABLE_ANNOTATION";
     S+=' ANNOTATION_ID="'+annotID+'"';
     S+=' TIME_SLOT_REF1="'+trio[0]+'"';
     S+=' TIME_SLOT_REF2="'+trio[1]+'"';
     S+="><ANNOTATION_VALUE>"+trio[2]+"</ANNOTATION_VALUE>";
     S+="</ALIGNABLE_ANNOTATION></ANNOTATION>\n";
   }
   S+="</TIER>\n";
   return S;
},
 genELANrefTier:function(tierID){
   var S="<TIER "+attrString(this.tierAttributes[tierID])+">";
   var T=this.tierSequences[tierID];
   var pairs=this.refs[tierID];
   for(var i in T){
     var annotID=T[i];
     var pair=pairs[annotID];
     S+="<ANNOTATION><REF_ANNOTATION";
     S+=' ANNOTATION_ID="'+annotID+'"';
     S+=' ANNOTATION_REF="'+pair[0]+'"';
     S+="><ANNOTATION_VALUE>"+pair[1]+"</ANNOTATION_VALUE>";
     S+="</REF_ANNOTATION></ANNOTATION>\n";
   }
   S+="</TIER>\n";
   return S;
}
};

  var trimExp=/^\s*(()|([^\s].*[^\s]))\s*$/;
  function trim(S){return S?S.replace(trimExp,"$1"):"";}
  function trimEnd(S){S=trim(S);return S?S+"\n":S;}
  function buildUnit(){
    var frm=document.forms.theForm;
    var unit=frm.unitName.value;
    var scriptFrame=$('scriptFrame');
    scriptFrame.src=null;
    scriptFrame.src=unit; // +".trs";
    setTimeout("getScr(0)",1000);
 }
 function getScr(N){
    var scriptFrame=$('scriptFrame');
    var transcript=null,errmsg=null;
    try{ transcript=scriptFrame.contentDocument;
       }catch(e){errmsg=e};
    if(!transcript){
      if(N<10)return setTimeout("getScr("+(N+1)+")",100);
      return alert("getScr Failure after "+N+" tries, sorry\n"+
                   "transcript error="+errmsg+"\n");
    }
    doScript(transcript);
 }
 function doScript(transcript){
  var B=[];
  alert("transcript=\n\n"+transcript);
  var A=transcript.getElementsByTagName("TIER");
  alert("document contains "+A.length+" tiers");
  var i;
 try{
  for(i=0;i< A.length;i++)
    B.push(
       A[i].getAttributeNS(null,"PARENT_REF")+
       ":"+
       A[i].getAttributeNS(null,"TIER_ID")+
       "?"+
       (A[i].getElementsByTagName("ALIGNABLE_ANNOTATION").length)+
       "-"+
       (A[i].getElementsByTagName("REF_ANNOTATION").length)

       );
  document.forms.theForm.ta.value=B.join("\n");
 return alert(B);
    var frm=document.forms.theForm;
    var tiers=trim(frm.tiers.value).split(",");
    var endTiers=trim(frm.endOnlyTiers.value).split(",");
    var commentSeparator=frm.commentSeparator.value;
    var breakAtNewLines=frm.breakAtNewLines.checked;
    var skipEnds=frm.skipEnds.checked;
    var S="";
    var sections=transcript.getElementsByTagName("Section");
    for(var i=0;i<sections.length;i++)
      S+=doSection(sections[i],tiers,endTiers,commentSeparator,breakAtNewLines,skipEnds)
    S+="<div class='padding'>&#160;</div>\n";
    // document.forms.theForm.ta.value=S;
   document.forms.theForm.ta.value=wrapTemplate(S,frm,tiers);
 }catch(ex){return alert(ex+"\ni="+i+"\nA[i]="+A[i]+"\n"+B);}
 }

function commentDivs(tiers,A){ // A[0] is script, A[i+1] goes with tiers[i]
  S="";
  for(var i=0;i<tiers.length;i++)
    S+="<div class='comm "+tiers[i]+"'>"+(A[i+1]?A[i+1]:"")+"</div>\n";
  return S;
}

function breakText(S){
  return S.replace(/[\n][\n]+/g,"<br/>\n");
}

function sectionSegments(section,skipEnds){
  var nd=section.firstChild;
  var R=[],segTime=0.0,segText="";
  while(nd && nd.tagName!="Sync")nd=nextNode(nd,section); // got first Sync
  if(skipEnds){
    nd=nextNode(nd,section);
    while(nd && nd.tagName!="Sync")nd=nextNode(nd,section); // got next Sync
    }
  if(nd){
    segTime=nd.getAttribute('time'); segText="";
    nd=nextNode(nd,section);
    for(;nd;nd=nextNode(nd,section)){
      if(nd.tagName=="Sync"){
          R.push([segTime,segText]);segTime=nd.getAttribute('time');segText="";
          }
      else if(nd.nodeValue)segText+=trimEnd(nd.nodeValue);
      }
  }
  R.push([segTime,segText]); // even if skipEnds, we need this value as endTime
  if(skipEnds){ 
    var startTime=parseFloat(R[0][0]);
    var fileRoot=document.forms.theForm.fileName.value.split(".")[0];
    for(var i=0;i<R.length;i++)R[i][0]=parseFloat(R[i][0])-startTime;
    var endTime=R[R.length-1][0];
    var cmds="mencoder -ss X -endpos Y -oac copy -ovc copy L.avi -o tmp.avi\n"+
        "ffmpeg -i tmp.avi -s 360x240 -ar 44100 L.webm\n";
    cmds=cmds.replace(/X/g,""+startTime).replace(/Y/g,""+endTime).replace(/L/g,fileRoot);
    document.forms.theForm.cmds.value=cmds;
    R.length--; 
  }
  return R;

}

function doSection(section,tiers,endTiers,commentSeparator,breakAtNewLines,skipEnds){
  var segPairs=sectionSegments(section,skipEnds);
  var S="";
  for(var i=0;i<segPairs.length;i++){
    S+="<div class='segment'>";
    S+="<span class='synch'>"+segPairs[i][0]+"</span>\n";
    var segText=segPairs[i][1];
    if(breakAtNewLines)segText=breakText(segText);
    var A=segText.split(commentSeparator); S+=A[0]; 
    S+=commentDivs(tiers,A)+"</div>\n";
  }
  return S;
}

function synchVal(nd,attr){
  var S="<span class='synch'>"+nd.getAttribute(attr)+"</span>\n";
  return S;
}

function olddoSection(section,tiers,endTiers,commentSeparator,breakAtNewLines,skipEnds){
  var S="<div class='segment'>";
  var nd=section.firstChild;
  while(nd && nd.tagName!="Sync")nd=nextNode(nd,section); // got first Sync
  if(skipEnds)
    while(nd && nd.tagName!="Sync")nd=nextNode(nd,section); // got next Sync
  if(nd){
    S+=synchVal(nd,'time'); nd=nextNode(nd,section);
    var segText="";
    for(;nd;nd=nextNode(nd,section)){
      if(nd.tagName=="Sync"){
        if(S!="" || !skipEnds){
          if(breakAtNewLines)segText=breakText(segText);
          var A=segText.split(commentSeparator); S+=A[0]; segText="";
          S+=commentDivs(tiers,A)+"</div>";
          }
        S+="<div class='segment'>";
        S+=synchVal(nd,'time');
      } else if(nd.nodeValue)segText+=trimEnd(nd.nodeValue);
      }
  if(!skipEnds){
    if(breakAtNewLines)segText=breakText(segText);
    var A=segText.split(commentSeparator); S+=A[0]; segText="";
    S+=commentDivs(tiers,A)+"</div>";
    }
  S+="<div class='segment'>";
  S+= synchVal(section,'endTime')+commentDivs(endTiers,[]);
  S+="</div>\n"
  return S;
}
}
function synchVal(nd,attr){
  var S="<span class='synch'>"+nd.getAttribute(attr)+"</span>\n";
  return S;
}

 var XMLNS=/xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g;

function configTA(frm,tiers,tierTypes){
  if(!tierTypes)tierTypes={};
  var root=frm.inRepository.checked?"../":"./";
  var fileName=frm.fileName.value;
  var commentClasses=tiers;
var ta= "{  // this object overrides the folders.code config.js file's values \n";
  ta+= '// and some of its values can be overridden on the URL \n';
  ta+= 'folders:{code:"'+root+'CODE/", // relative to this file \n';
  ta+= '         images:"'+root+'IMG/",  // relative to unit, e.g. pencil.xhtml \n';
  ta+= '         code:"'+root+'CODE/", \n';
  ta+= '         shared:"./SHARED/", \n';
  ta+= '         css:"'+root+'CSS/", \n';
  ta+= '         docs:"'+root+'docs/"}, \n';
  ta+= 'commentClasses:"'+commentClasses+'", \n';
  ta+= 'dict:"./SHARED/theDict.html", \n';
  ta+= 'cssFiles:{mada:"mada-elan.css", // [movie/script, dict/comm] \n';
  ta+= '     mdaa:"mdaa-archi.css",      // [movie/script, comm] \n';
  ta+= '     author:"author.css"},      // [movie/script, comm] \n';
  ta+= 'showFullTimes:true,\n';
  ta+= 'detailClasses:{timeSlotID:"table-row",col1:"table-cell",col2:"table-cell",col3:"table-cell"},\n';
  ta+= 'minPlayTime:0.0,prePadMinPlayTime:0.1,\n';
  ta+= 'movie:{fileName:"'+fileName+'", \n';
  ta+= '       width:'+frm.moviewidth.value+',\n';
  ta+= '       height:'+frm.movieheight.value+',\n';
  ta+= '       playerClass:"H5MoviePlayer"} \n';
  ta+= ' }   \n';
return ta; 
}

function wrapTemplate(divText,frm,tiers,tierTypes){
  var root=frm.inRepository.checked?"../":"./";
  var fileName=frm.fileName.value;

divText='<div id="scriptDiv" class="mxScript">\n'+divText+"</div>";
var S= '<html><head> \n';
S+= '<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >\n';
    S+= "<title>"+fileName.split(".")[0]+"</title> \n";
    S+= " <style>\n  #configData {display:none;}\n </style> \n";
    S+= '<script src="'+root+'CODE/mfDomLib.js"></script> \n';
    S+= '<script src="'+root+'MX.js"></script> \n';
  S+= '</head> \n';
  S+= '<body onload="mxLoad()"> \n';
  S+= '<form name="theForm" action="javascript:void(0)"> \n';
  S+= '<textarea name="ta" id="configData" rows="10" cols="100"> \n';
  S+= configTA(frm,tiers,tierTypes);
  S+='    </textarea> \n';
  S+='</form> \n';
  S+=divText;
  S+='</body></html>\n';
  return S;
}

function onChangeUnit(frm){
  var F=frm.unitName.value.split("/");
  var unitName=F[F.length-1];
  var lastDotLocation=unitName.lastIndexOf(".");
  if(lastDotLocation>=0)unitName=unitName.substring(0,lastDotLocation);
  frm.fileName.value=unitName+".webm"; // after last "/"
}
function onChangeInRepository(frm){
  var root=frm.inRepository.checked?"../":"./";
  // frm.cssFolder.value=root+"CSS/";
}
