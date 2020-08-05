/** Lift2Dict.js **/
/**
  this file provides JS functionality for the output of Lift2Dict.java,
  which turns a FLEx output LIFT dictionary file into HTML containing
  references to the stylesheet ./Lift2Dict.css and this file, as ./Lift2Dict.js

the html structure is
body
  div @main_content
    [script, button, div --- error material, generated only if bad chars are found]
    div .letData
                span .letter
       div .entry
         span .citation-form_text, or .lexical-unit_form_text
         other content.
       ...   
    ...
**/
    
function $(x){return document.getElementById(x);}

function clearForm(){$('q').value='';$('weird').selectedIndex=0; search('');}

function nonEmptyEntries(){
  var lex=$("main_content");
  var entries=lex.getElementsByTagName("div");
  alert("found "+entries.length+" possible entries");
  for(var i=0;i<entries.length;i++){
    var entry=entries[i]; if(entry.className!="entry")continue;
    if(entry.getElementsByTagName("span").length==0){
      var pN=entry.parentNode;
      pN.removeChild(entry);
    }
  }
  $('ta').value=lex.innerHTML;
}

 function hdwrd(entry){
    //     span .citation-form_text, or .lexical-unit_form_text
   for(var ch=entry.firstChild;ch;ch=ch.nextSibling){
     if(!ch.tagName)continue;
     if(ch.classList.contains("citation-form_text") || ch.classList.contains('lexical-unit_form_text'))return ch.textContent;
     }
   return "";
}

 var text_id=[]; // actually has [entryText,entryID,letterID,headwordText]

 var letterCount=0;
 var entryCount=0;
 var visibleLetter={};
/**
  div @main_content
    [script, button, div --- error material, generated only if bad chars are found]
    div .letData
                span .letter
       div .entry
         span .citation-form_text, or .lexical-unit_form_text
         other content.
       ...   
**/
var mediaElement=null;
 function onloadFunction(){
   mediaElement=$('mediaElement');
   var rt=$('main_content');
   $('header').innerHTML=headerText();
   $('formDiv').innerHTML=formDivText();
   for(var nd=rt.firstChild;nd;nd=nd.nextSibling){
     if(!nd.tagName)continue;
     if(nd.classList.contains('letData'))loadLetData(nd);
   }
 }
 function loadLetData(letDataDiv){
   var letterID= "Letter_"+ ++letterCount;
   letDataDiv.id=letterID;
   visibleLetter[letterID]=true;
   for(var nd=letDataDiv.firstChild;nd;nd=nd.nextSibling){
     if(!nd.tagName)continue;
     if(nd.classList.contains('entry')){
       nd.id="ENTRY_"+ ++entryCount;
       text_id.push([nd.textContent,nd.id,letterID,hdwrd(nd)]);
       }
     }
 }

 var searchOb={
   search:function(S,asPrefix,headWordOnly){
     this.S=S;
     this.asPrefix=asPrefix;
     this.headWordOnly=headWordOnly;
     $('main_content').style.display='none';
     // $('main_content').classList.add('hidden');
     setTimeout('searchOb.ss()',100);
   },
   ss:function(){
    search(this.S,this.asPrefix,this.headWordOnly);
    // $('main_content').classList.remove('hidden');
    $('main_content').style.display='block';
   }
 }

  function search(S,asPrefix,headWordOnly){
    if(!text_id || text_id.length==0)return;
    for(var l in visibleLetter){visibleLetter[l]=false;$(l).classList.add("hidden");}
    if(!S)S=$('q').value;
    var curLetter=text_id[0][2];
    for(var i in text_id){
      var tii=text_id[i];
      var txt=tii[0]; if(headWordOnly)txt=tii[3];
      var entryId=tii[1];
      var entryLetter=tii[2];
      if(entryLetter!=curLetter){
        if(visibleLetter[curLetter])$(curLetter).classList.remove("hidden");
        curLetter=entryLetter;
        } 
      var entry=$(entryId);
      var foundIt=asPrefix?txt.indexOf(S)==0:txt.indexOf(S)>=0;
      if(foundIt)visibleLetter[entryLetter]=true;
//      if(!confirm("foundIt="+foundIt+"; S=["+S+"]\n"+txt))throw "up";
      if(foundIt)entry.classList.remove("hidden");
      else entry.classList.add("hidden");
    }
      if(visibleLetter[curLetter])$(curLetter).classList.remove("hidden");
  }

function topText(){
  var S="<body class='dicBody' onload='onloadFunction()'>";
  S+="<textarea style='display:none' id='ta' rows='20' cols='120'></textarea>";
  S+="<div id='container'>";
  return S;
}
 function headerText(){
//  var S="<div id='header'>";
  var S="	<div id='logo'>";
  S+="		<a href='../index.html'><img src='../images/transparentlogo.png' width='220' height='50'/></a>";
  S+="	</div>";
  S+="	<div id='main_nav'>";
  S+="		<ul>";
  S+="			<li><a href='../pages/currentProjects.html'>Current Projects</a></li>";
  S+="            <li><a href='../pages/community.html'>Local Communities</a></li>";
  S+="            <!--li><a href='../pages/scholars.html'>Community of Scholars</a></li-->";
  S+="            <li><a href='../pages/corpus.html'>Corpus</a></li>";
  S+="            <li id='currentpage'><a href='../pages/lexicon.html'>Lexicon</a></li>";
  S+="            <li><a href='../pages/contributors.html'>About Us</a></li>";
  S+="        </ul>          ";
  S+="	</div>";
//  S+="</div><!-- header -->";
  return S;
}
function changeWeirdCharSelect(){
  var selector=$('weird');
  $('q').value+=selector.options[selector.selectedIndex].value;
}
function searchQ(){return searchOb.search($('q').value);}
function searchQall(){return searchOb.search($('q').value,false,false);}
function searchQhead(){return searchOb.search($('q').value,false,true);}
function searchQprefix(){return searchOb.search($('q').value,true,true);}

function formDivText(){
  // var S="<div id='formDiv'>";
  var S="<form id='lexform' name='lexform' action='javascript:searchOb.search()' accept-charset='utf-8'>";
  S+="";
  S+="		<p style='display:none' id='searchSelect'>";
  S+="		 	<label for='searchBy'>Search:</label>";
  S+="    		<select name='searchBy' id='searchBy' tabindex='1'>";
  S+="				<option value='all'>entire dictionary</option>";
  S+="				<option value='lang'>Itelmen headword</option>";
  S+="				<option value='glossEn'>English gloss</option>";
  S+="				<option value='glossRu'>Russian gloss</option>";
  S+="				<option value='glossJp'>Japanese gloss</option>";
  S+="				<option value='ipa'>IPA Transcription</option>";
  S+="				<option value='cyr'>Approximate pronunciation</option>";
  S+="			</select>";
  S+="		</p>";
  S+="		<div id='query'>";
  S+="			<label for='q'>Search for:</label>";
  S+="			<input type='text' name='q' id='q' value=''  tabindex='2' /> ";
  S+="			<select id='weird' onchange='changeWeirdCharSelect()'>";
  S+="			  <option class='bigChar' value='' selected>Select a character</option>";
  S+="			  <option class='bigChar' value='ӑ'>ӑ</option>";
  S+="			  <option class='bigChar' value='ё'>ё</option>";
  S+="			  <option class='bigChar' value='ӄ'>ӄ</option>";
  S+="			  <option class='bigChar' value='љ'>љ</option>";
  S+="			  <option class='bigChar' value='ԓ'>ԓ</option>";
  S+="			  <option class='bigChar' value='њ'>њ</option>";
  S+="			  <option class='bigChar' value='ӈ'>ӈ</option>";
  S+="			  <option class='bigChar' value='ŏ'>ŏ</option>";
  S+="			  <option class='bigChar' value='ў'>ў</option>";
  S+="			  <option class='bigChar' value='ҳ'>ҳ</option>";
  S+="			  <option class='bigChar' value='χ'>χ</option>";
  S+="			  <option class='bigChar' value='ә'>ә</option>";
  S+="			  <option class='bigChar' value='˚'>˚</option>";
  S+="			  <option class='bigChar' value='ʔ'>ʔ</option>	";
  S+="			</select>";
  S+="            <input type='button' id='SBall'  value='all' onclick='searchQall()'/>";
  S+="            <input type='button' id='SBheadwords'  value='head' onclick='searchQhead()'/>";
  S+="            <input type='button' id='SBhead_init' value='head_prefix' onclick='searchQprefix()'/>";
  S+="            <input type='button' id='SBclear' value='clear' onclick='clearForm()'/>";
  // S+="<iframe name='media' id='media' src='about:blank' height='20' width='60'></iframe>";
  S+="           <audio id='mediaElement' autoplay='true'>Your browser does not support the audio element.</audio>";
  // S+=" <span id='audiospan'>&nbsp;</span> ";
  S+="			<div id='search_help'>";
  S+="				<a href='help.html' rel='help' title='help with queries' target='_blank'>Help</a>";
  S+="			</div>";
  S+="		</div>";
  S+="		<p style='display:none' id='submit'>";
  S+="    		<input type='submit' value='Go' tabindex='3' />";
  S+="    		<br/>";
  S+="    		<a class='specialsearch imagegallery' href='./?images' title='display entries with images' tabindex='6'>";
  S+="			   Entries with pictures</a>";
  S+="    		<a class='specialsearch random' href='./?random' title='display a random entry' tabindex='7'>A random word</a>";
  S+="    	</p>	";
  S+="";
  S+="";
  S+="</form>";
  // S+="</div><!-- formDiv -->";
  return S;
}

function playAudio(f){if(!mediaElement)mediaElement=$('mediaElement'); mediaElement.src="./sound/"+f;mediaElement.load();mediaElement.play();}

window.onload=onloadFunction;
