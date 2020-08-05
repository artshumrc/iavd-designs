<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page session="false" contentType= "application/xhtml+xml; charset=UTF-8"
    import="java.io.*,java.util.*,java.util.regex.*"
%><%
String word=request.getParameter("word"); if(word==null || word.length()==0)word="word";
String words=request.getParameter("words");if(words==null || words.length()==0)words=word;
String cssFile=request.getParameter("css");
String appPath=application.getRealPath("");
String[]wordList=words.split(" ");
String[][]defs=null;
if(wordList.length>0)defs=getWNDefsArray(wordList);
else defs= getWNDefsArray(word);
if(word.length()==0)word=""+wordList.length+" words"; 
%> <html xmlns="http://www.w3.org/1999/xhtml">
  <head><title><%= word%>, <%= defs.length %> definition(s)</title>
  <link type="text/css" rel="stylesheet" href="<%= cssFile %>"/>
  </head><body>
<textarea rows="30" cols="100"><%= a2String(defs) %></textarea>
</body></html><%!


/** 
Patterns to be tried:
(A)Success:
----
1 definition found

From WordNet (r) 2.0 (August 2003) [wn]:

  sound
      adj 1: financially secure and safe; "sound investments"; "a sound
             economy" [ant: {unsound}]
      2: exercising or showing good judgment; "healthy scepticism";..
      9: thorough; "a sound thrashing"
      n 1: the particular auditory effect produced by ...
-------
(B)Partial Success:
-------
No definitions found for "sounds", perhaps you mean:
wn:  sound  bounds
ERROR: exit value=21
-------
(C)Failure:
-------
No definitions found for "fxzlw"
ERROR: exit value=20
-------
 *
 *
**/

public String[][]getWNDefsArray(String[] words)throws Exception{
  if(words==null)return new String[][]{};
  ArrayList<String[]>res=getWNDefs(words);
  if(res==null)return new String[][]{};
//res.add(new String[]{"words.length="+words.length+"; words[0]="+words[0]});
  return res.toArray(new String[][]{});
}
public String[][]getWNDefsArray(String word)throws Exception{
  if(word==null)return new String[][]{};
  ArrayList<String[]>res=getWNDefs(word);
  if(res==null)return new String[][]{};
  return res.toArray(new String[][]{});
}

public ArrayList<String[]>getWNDefs(String word)throws Exception{
  return getWNDefs(word,new ArrayList<String[]>());
}
public ArrayList<String[]>getWNDefs(String[]words)throws Exception{
  if(words==null || words.length==0)return new ArrayList<String[]>();
  ArrayList<String[]>res=getWNDefs(words[0]);
  for(int i=1;i<words.length;i++)res=getWNDefs(words[i],res);
  return res;
}
public ArrayList<String[]>getWNDefs(String word,ArrayList<String[]>res)throws Exception{
  String[]cmdOut=getCmdOutput("dict -d wn "+word);
  //  String[]cmdOut=getCmdOutput("dict -d fd-eng-spa "+word);
//res.add(new String[]{"word="+word+"; cmdOut.length="+cmdOut.length});
  if(cmdOut==null || cmdOut.length==0 || cmdOut[0]==null)return res;
//for(int l=0;l<6;l++)res.add(new String[]{cmdOut[l]}); 
  String firstLine=cmdOut[0];
  if(firstLine.startsWith("No")){ // pattern (B) or (C)
    if(cmdOut.length>1 && cmdOut[1].startsWith("wn:")) //(B)
      return getWNDefs(cmdOut[1].substring(3).split("/[ ]+/g")[0],res);
    else return res; // (C)
  }
  if(cmdOut.length<=6)
    throw new Exception("truncated description for ["+word+"]!\n"+a2String(cmdOut));
  String term=cmdOut[4].replace(" ","");; 
  Pattern startDef = Pattern.compile("\\s+([a-zA-Z]+)[ \\t]+1: *(.*)");
  Pattern startNoNumDef = Pattern.compile("\\s+([a-zA-Z]+)[ \\t]+: *(.*)");
  Pattern nextDef = Pattern.compile("\\s+([0-9]+)[ \\t]*: *(.*)");
  Pattern contDef=Pattern.compile("\\s+(.*)");
  Matcher matcher = startDef.matcher(cmdOut[5]);
  if (!matcher.find()) {
    matcher=startNoNumDef.matcher(cmdOut[5]);
    if(!matcher.find())
      throw new Exception ("failed to match on "+cmdOut[5]);
    }
  String pos=matcher.group(1);
  String def=matcher.group(2);
  for(int line=6;line<cmdOut.length;line++){
    String nextLine=cmdOut[line];
 //res.add(new String[]{nextLine});
    Matcher m=startDef.matcher(nextLine);
    if(m.find()){res.add(splitDef(term,pos,def));pos=m.group(1);def=m.group(2);continue;}
    m=nextDef.matcher(nextLine);
    if(m.find()){res.add(splitDef(term,pos,def));def=m.group(2);continue;}
    def+=nextLine.replaceFirst("\\s+"," ");
    }
  res.add(splitDef(term,pos,def));
  return res;
}

private String[]splitDef(String term,String pos,String def){
int semiColonLoc=def.indexOf(';');
if(semiColonLoc<0)semiColonLoc=def.length()-1;
return new String[]{term,pos,def.substring(0,semiColonLoc),def.substring(1+semiColonLoc)};
}

public String quote(String S){if(S==null)return "";
  return '"'+S.replace('"','\'')+'"';
  }

public String a2String(String[]A){
 if(A==null || A.length==0)return "[]";
 StringBuffer sB=new StringBuffer("[").append(quote(A[0]));
 for(int i=1;i<A.length;i++)sB.append(", ").append(quote(A[i]));
 sB.append("]");
 return sB.toString();
}
public String a2String(String[][]A){
  if(A==null || A.length==0)return "[]";
 StringBuffer sB=new StringBuffer("[").append(a2String(A[0]));
 for(int i=1;i<A.length;i++)sB.append(",\n").append(a2String(A[i]));
 sB.append("]");
 return sB.toString();
}

public String[] getCmdOutput(String cmd){
  ArrayList<String>lines=new ArrayList<String>();
  try{
    Runtime runtime=Runtime.getRuntime();
    Process proc=runtime.exec(cmd);
    BufferedReader br=new BufferedReader(new InputStreamReader(proc.getInputStream()));
    for(String line=br.readLine();line!=null;line=br.readLine())lines.add(line);
    try {
      if (proc.waitFor() != 0) lines.add("ERROR: exit value="+proc.exitValue());
    } catch (InterruptedException ie) { lines.add("ERROR: "+ie); }
  } catch (Exception ex){ lines.add("ERROR: "+ex); }
  return lines.toArray(new String[]{});
}
/**
class DefLinesEater {
String cmd="dict -d wn "+word);
ArrayList<String[]>outLines=getCmdOutput("dict -d wn "+word);


public void 
int indent=0;
ArrayList<String>lines=null;

public DefLinesEater(){};
public void processLines(ArrayList<String>L){lines=L;
  
  if (S==null)return;
  int firstC=0;(while(firstC<S.length() && S[firstC]==' ')firstC++;
  if(firstC>=S.length())return;
  if(firstC >= indent) 
}

}
**/
%>
