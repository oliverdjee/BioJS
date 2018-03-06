/**
 * February 21
 * 
 *  -> Fix SelectOnCheck(). Selecting atoms in the box is not working properly.
 *     Weird atoms are being selected
 *     -> DONE (It had to do with the structure object not properly setted up)
 */

function BioSelector(structure, document, dropdown_element, height)
{
	//THIS IS CRUCIAL FOR PROPER INTERACTIONS
	dropdown_element.empty();
	dropdown_element.unbind("click");
	var startDate = new Date();
	//Contructor
	var self = this;
	this.structure =  structure;
	this.bioviewer = null;
	this.dropdown_element = dropdown_element;
	this.selectedAtoms = [];
	this.options = {
		title : structure.name,
		data: GenerateData(),
		maxHeight: height,
		selectChildren : true,
		clickHandler: function(element){
			/*
			 * ADD CODE HERE: DEFAULT DOES NOTHING
			 */
			//gets clicked element parents
			console.log($(element).GetParents());
			//element is the clicked element
			console.log(element);
			my_selector_element.SetTitle($(element).find("a").first().text());
			console.log("Selected Elements",self.dropdown_element.GetSelected());
		},
		checkHandler: function(element){
			self.dropdown_element.SetTitle($(element).find("a").first().text());
		},
		closedArrow: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
		openedArrow: '<i class="fa fa-caret-down" aria-hidden="true"></i>',
		multiSelect: true,
	}
	PrintElapsedTime(startDate, "Residue selector tree built in");

	/**
	 * PUBLIC FUNCTIONS
	 */
	
	this.showDropDown = function()
	{
		self.dropdown_element.DropDownTree(self.options);
	}
	
	this.link3DViewer = function(viewer)
	{
		self.bioviewer = viewer;
		var scene = viewer.scene;
		
		self.options.clickHandler = function(element)
		{
			CenterOnScene(scene,element);
		}
		self.options.checkHandler = function(element)
		{
			var tempeleemtn = element;
			SelectOnCheck(scene,element);
		}
	}
	
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	function SelectOnCheck(scene,element)
	{
		var selection = element.GetSelected();
		var id = element[0].innerText;
		var select = false;
		if(selection.length > 0)
		{
			id = element[0].innerText;
			select = true;
		}
		
		var isChain = "Chain ";
		var isStructure = "Structure ";
		var isGroup = "Group ";
		var isAtom = "Atom ";
		var stop = id.indexOf(":");
		
		if(id.includes(isStructure))
		{
			SelectStructure(self.structure,select);
		}
		else if(id.includes(isChain))
		{
			var index = parseInt(id.substring(isChain.length,stop))-1;
			
			SelectChain(self.structure,index,select);		
		}
		else if(id.includes(isGroup))
		{
			var index = parseInt(id.substring(isGroup.length,stop))-1;
			SelectGroup(self.structure,index,select);
		}
		
		if(id.includes(isAtom))
		{
			var index = parseInt(id.substring(isAtom.length,stop))-1;
			SelectAtom(self.structure,index,select);
		}
		
		self.bioviewer.UpdateSelection();
	}
	
	function CenterOnScene(scene,element)
	{
		var id = element[0].innerText;
		var center =  self.structure.centerOfMass;
		var zoomFactor = 5;
		var isChain = "Chain ";
		var isStructure = "Structure ";
		var isGroup = "Group ";
		var isAtom = "Atom ";
		var stop = id.indexOf(":");
		
		if(id.includes(isStructure))
		{
			center = structure.centerOfMass;
		}
		else if(id.includes(isChain))
		{
			var index = id.substring(isChain.length,stop);
			center = getCentroidAtoms(structure.chains[index-1].atoms);
		}
		else if(id.includes(isGroup))
		{
			var index = id.substring(isGroup.length,stop);
			center = getCentroidAtoms(structure.groups[index-1].atoms);
			zoomFactor = 0.8;
		}
		
		else if(id.includes(isAtom))
		{
			var index = id.substring(isAtom.length,stop);
			center = structure.atoms[index-1].coords;
			zoomFactor = 0.2;
		}
		scene.zoom(zoomFactor,center);
	}
	
	function GenerateData()
	{
		return GenerateStructureData();
		
		function GenerateGroupAtomsData(group)
		{
			var data = [];
			for(var i = 0; i < group.atoms.length; i++)
			{
				var atom = group.atoms[i];
				var atomdata = {};
				atomdata.title = "Atom "+(atom.id+1)+": "+atom.name;
				atomdata.href = "#"+i;
				//atomdata.dataAttrs = 
				data.push(atomdata);
			}
			return data;
		}
		
		function GenerateChainGroupsData(chain)
		{
			var data = [];
			for(var i = 0; i < chain.groups.length; i++)
			{
				var group = chain.groups[i];
				var groupdata = {};
				groupdata.title = "Group "+(group.id+1)+": "+group.name+" ("+group.type+")";
				groupdata.href = "#"+i;
				groupdata.data = GenerateGroupAtomsData(group);
				//atomdata.dataAttrs = 
				data.push(groupdata);
			}
			return data;
		}
		
		function GenerateStructureChainsData(structure)
		{
			var data = [];
			for(var i = 0; i < structure.chains.length; i++)
			{
				var chain = structure.chains[i];
				var chaindata = {};
				chaindata.title = "Chain "+(chain.id+1)+": "+chain.chainID;
				chaindata.href = "#"+i;
				chaindata.data = GenerateChainGroupsData(chain);
				//atomdata.dataAttrs = 
				data.push(chaindata);
			}
			return data;
		}
		
		function GenerateStructureData()
		{
			var data = [];
			var structuredata = {};
			structuredata.title = "Structure "+structure.name.substring(0,structure.name.length-4);
			structuredata.href = "#1";
			structuredata.data = GenerateStructureChainsData(structure);				//atomdata.dataAttrs = 
			data.push(structuredata);
			return data;
		}
	}	
}

