async function createPTMTable(structure,titleSize)
{
	if(titleSize == null)
	{
		titleSize = 16;
	}
	var title = buildTitle(titleSize,"Non-Cannonical or Modified AminoAcids");
	var dom_array = [];
	var sizes = [20,30,100]
	//push column titles at index 0
	dom_array.push(["Type","ResName","Structure"]);
	//build the rest of the data as an array of DOM elements for each columns
	for(var i = 0; i < structure.groups.length; i++)
	{
		var group = structure.groups[i];
		if(group.isAminoLike())
		{
			var height = sizes[2];
			var width = sizes[2];
			var view = new BioViewer(IsolateGroup(group),window,document,group.name,height,width);
			view.canvas.height = height;
			view.canvas.width = width;
			
			var col1 = document.createTextNode(group.type);
			var col2 = document.createTextNode(group.name);
			var col3 = view.canvas;
			
			dom_array.push([col1,col2,col3]);
		}
	}
	
	var newdiv = document.createElement("div");
	
	if(dom_array.length > 1)
	{
		var tables = buildDOMelementScrollingTable(dom_array,sizes);
		newdiv.style.cssFloat="left";
		newdiv.appendChild(title);
		
		var scroll = document.createElement("div");
		scroll.style.overflowY="scroll";
		scroll.style.height="350px";
		scroll.appendChild(tables[1]);
		newdiv.appendChild(tables[0]);
		newdiv.appendChild(scroll);
	}
	return newdiv;
}

async function createPeptideTable(structure,titleSize)
{
	if(titleSize == null)
	{
		titleSize = 16;
	}
	var title = buildTitle(titleSize,"Detected Peptides (Chain length < 25)");
	var dom_array = [];
	
	//push column titles at index 0
	dom_array.push(["Chain ID","Chain Sequence","Structure"]);
	var sizes = [20,150,170];
	//build the rest of the data as an array of DOM elements for each columns
	for(var i = 0; i < structure.chains.length; i++)
	{
		var chain = structure.chains[i];
		if(chain.isPeptidic == true)
		{
			var height = sizes[2];
			var width = sizes[2];
			var view = new BioViewer(IsolateChain(chain),window,document,"peptide_"+chain.name,height,width);
			view.canvas.height = height;
			view.canvas.width = width;
			
			var col1 = document.createTextNode(chain.chainID);
			var col2 = document.createTextNode(chain.getSequence());
			var col3 = view.canvas;
			
			dom_array.push([col1,col2,col3]);
		}
	}
	var newdiv = document.createElement("div");
	
	if(dom_array.length > 1)
	{
		var tables = buildDOMelementScrollingTable(dom_array,sizes);
		newdiv.style.cssFloat="left";
		newdiv.appendChild(title);
		
		var scroll = document.createElement("div");
		scroll.style.overflowY="scroll";
		scroll.style.height="350px";
		scroll.appendChild(tables[1]);
		newdiv.appendChild(tables[0]);
		newdiv.appendChild(scroll);
	}
	return newdiv;
}

async function createHetatmTable(structure,titleSize)
{
	if(titleSize == null)
	{
		titleSize = 16;
	}
	var title = buildTitle(titleSize,"Non-Amino Groups");
	var dom_array = [];
	var sizes = [20,20,100];
	//push column titles at index 0
	dom_array.push(["Type","ResName","Structure"]);
	//build the rest of the data as an array of DOM elements for each columns
	for(var i = 0; i < structure.groups.length; i++)
	{
		var group = structure.groups[i];
		if(group.isInorganic() || group.isSmallMolecule())
		{
			var height = sizes[2];
			var width = sizes[2];
			var view = new BioViewer(IsolateGroup(group),window,document,group.name,height,width);
			view.canvas.height = height;
			view.canvas.width = width;
			
			var col1 = document.createTextNode(group.type);
			var col2 = document.createTextNode(group.name);
			var col3 = view.canvas;
			
			dom_array.push([col1,col2,col3]);
		}
	}
	
	var newdiv = document.createElement("div");
	
	if(dom_array.length > 1)
	{
		var tables = buildDOMelementScrollingTable(dom_array,sizes);
		newdiv.style.cssFloat="left";
		newdiv.appendChild(title);
		
		var scroll = document.createElement("div");
		scroll.style.overflowY="scroll";
		scroll.style.height="350px";
		scroll.appendChild(tables[1]);
		newdiv.appendChild(tables[0]);
		newdiv.appendChild(scroll);
	}
	return newdiv;
}

async function createNearResTable(structure,titleSize)
{
	if(titleSize == null)
	{
		titleSize = 16;
	}
	var title = buildTitle(titleSize,"Nearby Residue List at 4 \u212B");
	var dom_array = [];
	var sizes = [20,20,400];
	//push column titles at index 0
	dom_array.push(["Type","ResName", "Nearby (4 \u212B)"]);
	//build the rest of the data as an array of DOM elements for each columns
	for(var i = 0; i < structure.groups.length; i++)
	{
		var group = structure.groups[i];
		var near = getNearResidue(group,4);
		var text = "";
		for(var x = 0 ; x < near.length; x++)
		{
			var n = near[x];
			text += structure.groups[n].type + "("+structure.groups[n].name+")"; 
			if(x < near.length -1)
			{
				text+=", ";
			}
		}
		var col1 = document.createTextNode(group.type);
		var col2 = document.createTextNode(group.name);
		var col3 = document.createTextNode(text);
			
		dom_array.push([col1,col2,col3]);
	}
	
	var newdiv = document.createElement("div");
	
	if(dom_array.length > 1)
	{
		var tables = buildDOMelementScrollingTable(dom_array,sizes);
		newdiv.style.cssFloat="left";
		newdiv.appendChild(title);
		
		var scroll = document.createElement("div");
		scroll.width = tables[0].width;
		scroll.style.overflowY="scroll";
		scroll.style.height="350px";
		scroll.appendChild(tables[1]);
		newdiv.appendChild(tables[0]);
		newdiv.appendChild(scroll);
	}
	return newdiv;
}

async function createWarningTable(structure,titleSize)
{
	if(titleSize === undefined)
	{
		titleSize = 16;
	}
	var title = buildTitle(titleSize,"Structural Warnings");
	var dom_array = [];
	var sizes = [160,240];
	//push column titles at index 0
	dom_array.push(["Warning Type","Description"]);
	//build the rest of the data as an array of DOM elements for each columns
	var data = structure.getWarnings();
	
	for(var i = 0 ; i < data.length; i++)
	{
		var col1 = document.createTextNode(data[i][0]);
		var col2 = document.createTextNode(data[i][1]);
		
		dom_array.push([col1,col2]);
	}
	var newdiv = document.createElement("div");
	
	if(dom_array.length > 1)
	{
		var tables = buildDOMelementScrollingTable(dom_array,sizes);
		newdiv.style.cssFloat="left";
		newdiv.appendChild(title);
		
		var scroll = document.createElement("div");
		scroll.width = tables[0].width;
		scroll.style.overflowY="scroll";
		scroll.style.height="350px";
		scroll.appendChild(tables[1]);
		newdiv.appendChild(tables[0]);
		newdiv.appendChild(scroll);
	}
	return newdiv;
}