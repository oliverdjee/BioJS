const PDButil = 
{
	newLine:"\n",
	
	FormatAtomName: function(atom) 
	{
		var name = atom.name;
		var parsed = parseInt(name);
		if(name.length > 4)
		{
			name = name.substring(0,4);
		}
		else if(name.length == 3 && isNaN(parsed))
		{
			name = FormatString(name," ", 4, "left");
		}
		else if(name.length == 3 && !isNaN(parsed))
		{
			name = FormatString(name," ", 4, "right");
		}
		else if(name.length == 2 && !isNaN(parsed))
		{
			name = FormatString(name," ", 4, "left");
		}
		else if(name.length == 2 && isNaN(parsed))
		{
			name = FormatString(name," ", 4, "center");
		}
		else
		{
			name = FormatString(" "+name, 4, "left");
		}
		return name;
	},
	
	stripName : function(fileName)
	{
		var name = fileName;
		if(name.includes("/"))
		{
			name = name.substring(name.lastIndexOf("/")+1);
		}
		if(name.endsWith(PDButil.PDBext))
		{
			name = name.substring(0,name.length-PDButil.PDBext.length);
		}
		return name;
	},
	
	
	PDBext: ".pdb",
	
	saveAs: function(filename, data) {
	    
		var text = "Do you wish to save this protein structure?";
		var action = function()
		{
			var blob = new Blob([data], {type: 'text/plain'});
		    if(window.navigator.msSaveOrOpenBlob) {
		        window.navigator.msSaveBlob(blob, filename);
		    }
		    else{
		        var elem = window.document.createElement('a');
		        elem.href = window.URL.createObjectURL(blob);
		        elem.download = filename;        
		        document.body.appendChild(elem);
		        elem.click();        
		        document.body.removeChild(elem);
		    }
		}
		var confirmbox = ConfirmDialog(text,"Download","Cancel",action);
		document.body.appendChild(confirmbox);
		
	}
}