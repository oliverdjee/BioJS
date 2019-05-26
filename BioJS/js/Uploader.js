
 var ProteinInfo = "";

function callBack(data) 
  {
    var strings = data.split(",");
    ProteinInfo = "";
    for (var x = 0; x < strings.length; ++x) 
    {
        var key = strings[x].split("=")[0];
        var value = strings[x].split("=")[1];
        if (key == "JOBID") 
        {
            JOBID = value;
            console.log(value);
        }
        if (key == "INFO") 
        {
            ProteinInfo = value;
        }
        console.log(value);
    }
    ProteinName = JOBID + "Protein.pdb";
    PeptideName = JOBID + "Peptide.pdb";
  };

function UploadLocalPDB(file) {
    var formData = new FormData();
    // add assoc key values, this will be posts values
    formData.append("file", file, file.name);
    formData.append("PDBrcsb", "");
    formData.append("upload_file", true);
    $.ajax({
      type: "POST",
      url: "ProteinPeptideRender",
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        return myXhr;
      },
      success: function(data) {
        callBack(data);
        console.log(data);
        UpdateProtein();
        UpdatePeptide();
        document.getElementById("JmolBlock").style.display = "block";
        document.getElementById("ProteinInfoText").innerHTML = ProteinInfo;
        changeOtherStyle("step1num");
      },
      error: function(error) {
        document.getElementById("step1Title").innerHTML = "INVALID FILE";
        document.getElementById("step1num").innerHTML = "!"
      },
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000
    });
  }
  function getType(file) {
    return file.type;
  };
  function getSize(file) {
    return file.size;
  };
  function UploadRCSB(name) {
    //var element = document.getElementById("PDBrcsb");
    //var name = element.value;
    var ID = element.value;
    var formData = new FormData();
    formData.append("PDBrcsb", name);
    $.ajax({
      type: "POST",
      url: "ProteinPeptideRender",
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        return myXhr;
      },
      success: function(data) {
        callBack(data);
        console.log(data);
        UpdateProtein();
        UpdatePeptide();
        document.getElementById("JmolBlock").style.display = "block";
        document.getElementById("ProteinInfoText").innerHTML = ProteinInfo;
        changeOtherStyle("step1num");
      },
      error: function(error) {},
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000
    });
  };
  function getName(files) {
    for (var i = 0; i < files.length; i++) {
      file = files[i];
      filename = file.name;
      document.getElementById('pdb-local').innerHTML = filename;
      recoverStyle("pdb-local", filename);
      UploadLocalPDB(file);
    }
  }
  
  function UploadAnalyzerLocalPDB(file) {
      var formData = new FormData();
      // add assoc key values, this will be posts values
      formData.append("file", file, file.name);
      formData.append("PDBrcsb", "");
      formData.append("upload_file", true);
      $.ajax({
        type: "POST",
        url: "PDBRender",
        xhr: function() {
          var myXhr = $.ajaxSettings.xhr();
          return myXhr;
        },
        success: function(data) {
          callBack(data);
          console.log(data);
          onUpload(file);
          //RenderPDB();
          //document.getElementById("JmolBlock").style.display = "block";
          //document.getElementById("ProteinInfoText").innerHTML = ProteinInfo;
          //changeOtherStyle("step1num");
        },
        error: function(error) {
          document.getElementById("step1Title").innerHTML = "INVALID FILE";
          document.getElementById("step1num").innerHTML = "!"
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
      });
    };
    
    function UploadAnalyzerRCSB(element) 
    {
    	var value = element.value;
      	var formData = new FormData();
      	formData.append("PDBrcsb", value);
      	$.ajax({
	        type: "POST",
	        url: "PDBRender",
	        xhr: function() {
	          var myXhr = $.ajaxSettings.xhr();
	          return myXhr;
	        },
	        success: function(data) {
	          callBack(data);
	          console.log(data);
	          rcsbUpload(element);
	          //RenderPDB();
	          
	          //document.getElementById("JmolBlock").style.display = "block";
	          //document.getElementById("ProteinInfoText").innerHTML = ProteinInfo;
	          //changeOtherStyle("step1num");
	        },
	        error: function(error) {},
	        async: true,
	        data: formData,
	        cache: false,
	        contentType: false,
	        processData: false,
	        timeout: 60000
      	});
    };
    
    function getAnalyzerName(files) {
      for (var i = 0; i < files.length; i++) {
        file = files[i];
        filename = file.name;
        document.getElementById('pdb-local').innerHTML = filename;
        recoverStyle("pdb-local", filename);
        UploadAnalyzerLocalPDB(file);
      }
    }
  