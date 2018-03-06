  var jmolApplet0; // set up in HTML table, below
  var JOBID;
  var PeptideName;
  var ProteinName;
  var jmolAppletProtein;
  var jmolAppletPeptide;
  // logic is set by indicating order of USE -- default is HTML5 for this test page, though
  var use = "HTML5"; // JAVA HTML5 WEBGL IMAGE  are all otions
  var s = document.location.search;
  // Developers: The _debugCode flag is checked in j2s/core/core.z.js, 
  // and, if TRUE, skips loading the core methods, forcing those
  // to be read from their individual directories. Set this
  // true if you want to do some code debugging by inserting
  // System.out.println, document.title, or alert commands
  // anywhere in the Java or Jmol code.
  Jmol._debugCode = (s.indexOf("debugcode") >= 0);
  jmol_isReady = function(applet) {}
  var script = 'h2oOn=false;set animframecallback "jmolscript:if (!selectionHalos) {select model=_modelNumber}";' +
'set errorCallback "myCallback";frank off;' +
'set defaultloadscript "isDssp = false;set defaultVDW babel;if(!h2oOn){display !water}";' +
'set zoomlarge true;set echo top left;set echo top center;font echo 18 serif bolditalic;color echo black;';
  var Info = {
    width: 420,
    height: 300,
    debug: false,
    j2sPath: "js/JSmol/j2s",
color: "#dddddd",
disableJ2SLoadMonitor: true,
disableInitialConsole: true,
addSelectionOptions: false,
serverURL: "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
    use: use,
    readyFunction: jmol_isReady,
    script: script
  }
   var AnalyzerInfo = {
    width: 320,
    height: 310,
    debug: false,
    j2sPath: "js/JSmol/j2s",
color: "#dddddd",
disableJ2SLoadMonitor: true,
disableInitialConsole: true,
addSelectionOptions: false,
serverURL: "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
    use: use,
    readyFunction: jmol_isReady,
    script: script
  }
  var HomeInfo = {
    width: 250,
    height: 250,
    debug: false,
    j2sPath: "js/JSmol/j2s",
color: "#dddddd",
disableJ2SLoadMonitor: true,
disableInitialConsole: true,
addSelectionOptions: false,
serverURL: "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
    use: use,
    readyFunction: jmol_isReady,
    script: script
  }
  function Check2Step(name) {
    if (name == "PTM") {
  if (document.getElementById(name).checked == true) {
    changeOtherStyle("step2num");
  }
}
if (name == "Range") {
  var From = document.getElementById("From").value;
  var To = document.getElementById("To").value;
  if (From.length > 0 && To.length > 0) {
    changeOtherStyle("step2num");
    document.getElementById("PTM").checked = false;
    document.getElementById("Range").checked = true;
  } else {
    recoverStyle("step2num", "2.");
      }
    }
  }
  function recoverStyle(name, value) {
    document.getElementById(name).innerHTML = value;
    document.getElementById(name).style = "color:#DB3030";
  }
  function CheckRadio(name) {
    Check2Step(name);
  }
  function change3rdStyle(name) {
    if (document.getElementById("Terms-Of-Use-Agreement").checked == false) {
  recoverStyle("step3num", "3.");
} else {
  document.getElementById(name).innerHTML = "&#10004";
  document.getElementById(name).style = "color:#20B2AA";
    }
  }
  function changeOtherStyle(name) {
    document.getElementById(name).innerHTML = "&#10004";
document.getElementById(name).style = "color:#20B2AA";
  }
  function UpdatePeptide() {
    $("#jmolviewerPeptide").html(Jmol.getAppletHtml("jmolAppletPeptide", HomeInfo));
Jmol.script(jmolAppletPeptide, "background white;load structures/" + PeptideName + ";");
Jmol.script(jmolAppletPeptide, "spacefill 100;wireframe 100;cartoons off; color structure;select *;color CPK;" +
  "select !*; set display selected; set picking group;hover on; set hoverDelay 0.5;" +
  "set antialiasDisplay ON;  set antialiasImages ON;set specpower 5;" +
  "set hermiteLevel 4;spin on;set ambient 5;set highResolution ON;" +
  "set cartoonRockets OFF; set cartoonFancy OFF;");
  }
  function UpdateProtein() {
    $("#jmolviewerProtein").html(Jmol.getAppletHtml("jmolAppletProtein", HomeInfo));
Jmol.script(jmolAppletProtein, "background white;load structures/" + ProteinName + ";");
Jmol.script(jmolAppletProtein, "spacefill only;wireframe off;cartoons off; color structure;select *;color CPK;" +
        "select !*; set display selected; set picking group;hover on; set hoverDelay 0.5;" +
        "set antialiasDisplay ON;  set antialiasImages ON;set specpower 5;" +
        "set hermiteLevel 4;spin on;set ambient 5;set highResolution ON;" +
        "set cartoonRockets OFF; set cartoonFancy OFF;");
  }
  
  //implement this better to make it more flexible by adding 
  //function argument to this call
  function RenderPDB() 
  {
      $("#jmolviewer").html(Jmol.getAppletHtml("jmolApplet0", Info));
      Jmol.script(jmolApplet0, "background white;load analyzer/"+JOBID+".pdb;");
      Jmol.script(jmolApplet0, "spacefill only;wireframe off;cartoons off; color structure;select *;color cpk;" +
        "select !*; set display selected; set picking group;hover on; set hoverDelay 0.5;" +
        "set antialiasDisplay ON;  set antialiasImages ON;set specpower 5;" +
        "set hermiteLevel 4;spin on;set ambient 5;set highResolution ON;" +
        "set cartoonRockets OFF; set cartoonFancy OFF;");
      
  };