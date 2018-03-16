const PDButil = 
{
	newLine:"\n",
	
	RenameHydrogen: function(atom,index)
	{
		var base = "H";
		if(atom.name.length == 1)
		{
			base = base + atom.name + index;
		}
		else if(atom.name.length == 2)
		{
			base = base + atom.name[1] + index;
		} 
		else if (atom.name.length == 3)
		{
			base = base + atom.name[1] + atom.name[2] + index;
		}
		else
		{
			base = base +"0"+index;
			atom.structure.LogError(new BioError(
					BIOERRORS.LOG_TO_INTERNAL,
					BIOERRORS.NAME,[atom],
					"Cannot assign name of built hydrogen du to too long name of this atom"));
		} 
		return base;
	},
	
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
			name = FormatString(name," ", 4, "right");
		}
		else if(name.length == 3 && !isNaN(parsed))
		{
			name = FormatString(name," ", 4, "left");
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
			name = FormatString(" "+name," ", 4, "left");
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
		ConfirmDialog(text,"Download","Cancel",action);
	}
}