
/**
 * February 21
 * 
 *-> Add a function for isolating linear or cycles of SP2 chains of atoms
 * The function assignInsaturations does not work properly yet. Problems
 * with the assignHybidization function for O of tyrosine. next atom (CZ) has a ring set
 * to null, but it should not be.
 *  
 *  ->  Improve the assignChainType to support not only peptidic, but also DNA, RNA
 *  
 *  ->  Improve the toPDB() function for wrting a structure to a PDB file. That could include 
 *  writing Headers, and Atoms, and all other records. For now, only Atoms can
 *  be written to PDBs. It is also a bit messed up.
 */


function Structure() 
{
	var self = this;
	
	//DEFAULT Force field if none is assigned
	var defaultParams = new DreidingParams();
	var defaultFF = new ForceField(defaultParams);
	defaultFF.addEterm(new PhoenixHbondTerm());
	defaultFF.addEterm(new PhoenixVdwTerm());
	defaultFF.addEHterm(new PhoenixHbondTerm());
	defaultFF.addEHterm(new PhoenixVdwTerm());
	this.fgHandler = new FunctionalGroupHandler();
	this.nearbyMap = null;	//Box representing the nearby atoms
	this.pdbHeader = new PDBHeader();
	this.name = "AutoGenerated";
	this.errorlog = "structure";
	this.selected = false;
	this.pdb_id = null;
	this.ff = defaultFF;
	this.centerOfMass 	= null;
	this.boxDimension	= 0.0;
	this.models = []; // not implemented yet
	this.connections= {}; // not implemented yet
	this.compounds= []; // not implemented yet
	this.dbrefs = []; // not implemented yet
	this.ssbonds= []; // not implemented yet
	this.sites= []; // not implemented yet
	this.hetatoms = []; // not implemented yet
	this.atoms			= [];
	this.chains			= [];
	this.groups			= [];
	this.id = null; // not implemented yet
	this.biologicalAssembly = null; //true or false, not implemented yet
	this.ringDetectionSizeLimit = 8; // will detect rigns by default up until 8 memebered rings
	this.bondDetectionTolerance = 0.3; // allow atoms to be (atom1_VDW + atom2_VDW + 0.3) Angstrom apart to be bonded (default value) 
	this.errors = [];
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	this.setName = function(name)
	{
		var newName = name;
		newName = PDButil.stripName(newName);	
		self.errorlog = newName;
		self.name =  newName;
	}
	/**
	 * See the BioError class in bioerror.js for which types are available
	 * and their respective syntax. They can be refereed by the public
	 * functions in BioError class.
	 */
	this.LogError = function(bioerror)
	{
		self.errors.push(bioerror);
	}
	
	this.toPDB = function()
	{
		var pdbtext = "";
    	for(var i = 0; i < self.atoms.length;i++)
    	{
    		var atom = self.atoms[i];
    		pdbtext += atom.toPDB();	
    	}
    	return pdbtext;
	}
	
	/**
	 * @param ff
	 * a force field object. This ff object requires to have a ComputeEnergy() function that takes not
	 * parameters. This is the interface required to work with this library
	 */
	this.setForceField = function(ff)
	{
		self.ff = ff;
	}
	
	this.addChain = function(chain)
	{
		var id = self.chains.length;
		chain.id = id;
		self.chains.push(chain);
	}
	
	/**
	 * All final preparation steps are bunched together here in this function to allow easy 
	 * hybridization, bonding and ring detection as well as implicit hydrogens attribution in the proper
	 * order.
	 * 
	 * @param ring_maxsize (optional, default 8)
	 * for detection of rings up until this value {Number}
	 * @param bond_buffer (optional, default 0.3)
	 * for tolerance of bond detection when bonding atoms. {Number}
	 */
	this.finalizeStructure = function(ring_maxsize,bond_buffer)
	{
		if(ring_maxsize === undefined)
		{
			ring_maxsize = self.ringDetectionSizeLimit;
		}
		if(bond_buffer === undefined)
		{
			bond_buffer = self.bondDetectionTolerance;
		}
		
		setBoxDimension();
		setCentroid();
	
		var box = new Box(self.centerOfMass, 2, self.boxDimension);
		self.nearbyMap = box;
		PlaceAtoms(box);
		BondAtoms(bond_buffer); 	//buffer of +- 0.3 deviation to
									//account for sloppy coordinates
		assignHetAtoms();
		assignChainType();
		assignRings(ring_maxsize);	// will not find rings bigger than X atoms!!
		assignHybridization();
		assignInsaturations();
		assignDoubleBonds();
		correctHybridization();
		assignAromaticity();
		assignImplicitH();
		assignExplicitH();
		assignFunctionalGroups();
		assignFFTypes();
	}
	
	this.assignFunctionalGroups = function()
	{
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			self.fgHandler.assignFunctionalGroup(atom);
		}
	}
		
	this.getChain = function(chain_id)
	{
		for(var i = 0; i < self.chains.length; i ++)
		{
			if(self.chains[i].chainID == chain_id)
			{
				return self.chains[i];
			}
		}
		return null;
	}
	
	this.getGroup = function(name)
	{
		for(var i = 0; i < self.groups.length; i ++)
		{
			var resi = self.groups[i];
			if(resi.name == name)
			{
				return self.groups[i];
			}
		}
		return null;
	}
	
	this.hasChain = function(name)
	{
		for(var i = 0; i < self.chains.length; i ++)
		{
			if(self.chains[i].chainID == name)
			{
				return true;
			}
		}
		return false;
	}

	this.hasGroup = function(resnum)
	{
		for(var i = 0; i < self.groups.length; i ++)
		{
			var resi = self.groups[i].resNum.seqNum;
			if(resi == resnum)
			{
				return true;
			}
		}
		return false;
	}
	
	this.atomCount = function()
	{
		return self.atoms.length;
	}
	
	this.getWarnings = function()
	{
		var text = [];
		var missingH = 0;
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			var Hs = atom.implicitH - atom.explicitH;
			if(Hs > 0)
			{
				missingH += Hs;
				new BioError(BIOERRORS.LOG_TO_CONSOLE,BIOERRORS.ATOM,[atom],"Missing Hydrogens to complete Octect: Has more implicit than explicit H's");
			}
			if(Hs < 0)
			{
				//INCONGRUENCE HERE, DO SOMETHING
			}
			var clashbuffer = 0.7; //allow clashes to be tolerated up until 70% of Equilibrium Distance
			var clashes = atom.checkClash(clashbuffer); //2D array
			var altloc = atom.checkAltLoc();//true of false
			var hyb = atom.checkAngles(10); // buffer  of +- 10 degrees around perfect angle
			var valence = atom.checkValence(); // -1 for under octet, 0 for ok, +1 for over octet
			
			if(clashes.length > 0){;}
			for(var x = 0; x < clashes.length; x++)
			{
				text.push(
					["ATOM CLASH",
			           	atom.group.name+
			           	" ("+atom.name+") <-> "+
			           	clashes[x][0].group.name+"("+clashes[x][0].name+") at " +
			           	RoundNumberTo(clashes[x][1],2)
					]
				);
			}
			if(altloc == true){text.push(["ALT LOC",atom.group.name +" ("+atom.name+")"]);}
			if(hyb === -1){text.push(["NARROW ANGLE "+atom.hybridization, atom.group.name +" ("+atom.name+")"]);}
			if(hyb === 1){text.push(["WIDE ANGLE "+atom.hybridization, atom.group.name +" ("+atom.name+")"]);}
			if(valence === -1){text.push(["UNDER OCTET", atom.group.name +" ("+atom.name+")"]);}
			if(valence === 1){text.push(["OVER OCTET",atom.group.name +" ("+atom.name+")"]);}
			if(atom.hybridization === null && atom.element !=="H"){text.push(["HYBRIDIZATION NULL",atom.group.name +" ("+atom.name+")"]);}
		}
		if(missingH > 0)
		{
			text.push(["MISSING HYDROGENS",missingH]);
		}
		
		for(var i = 0; i < self.groups.length; i++)
		{
			var group = self.groups[i];
			var miss = group.hasMissingAtoms();
			var names = group.hasDuplicateNames();
			
			for(var x = 0; x < names.length; x ++)
			{
				text.push(["DUPLICATE NAME "+names[x],group.type +" ("+group.name+")"]);
			}
			
			if(miss === -1){text.push(["MISSING ATOMS",group.type +" ("+group.name+")"]);}
			if(miss === 1){text.push(["TOO MANY ATOMS",group.type +" ("+group.name+")"]);}
		
		}
		
		for(var i = 0; i < self.chains.length; i++)
		{
			var chain = self.chains[i];
			var breaks = chain.getChainBreaks();
			var alone = chain.getLoneGroups();
			
			var tempText = "";
			for(var x = 0; x < breaks.length; x++)
			{
				if(x%2 === 0)
				{
					 tempText += self.groups[breaks[x]].name+" <--> ";
				}
				else
				{
					tempText += self.groups[breaks[x]].name;
					text.push(["CHAIN BREAK",tempText]);
					var tempText = "";
				}
			}
			for(var x = 0; x < alone.length; x++)
			{
				text.push(["LONE GROUP",self.groups[alone[x]].name]);
			}
		}
		return text;
		
	}
	
	/**
	 * Goal: clone structure by omitting the specified group class and type.
	 * @param structure
	 * @param options
	 * options.AtomReplacements: {Se: S, etc... } (dictionnary list of Atom Elements to Replace
	 * options.Types = ["HOH","ZN","SAM","PEG"] (3 letter code to remove)
	 * options.AtomsElements = ["H"] (elements to remove)
	 * options.Class = ["amino","amino-like","water","inorganic","small-molecule"] (amino types to remove)
	 * options.DetectRingSize = integer for detection of ring size up to this value. any ring bigger that this value 
	 * 							will not be detected as a ring
	 * options.DetectBondBuffer = float for the bond tolerance buffer when bonding atoms based on inter-atomic
	 * 								distances
	 */
	this.clean = function(callback, options)
	{
		/**
		 * CONSTRUCTOR
		 */
		var restriction;
		var ProcessDone;
		var Replacements = options.AtomReplacements || {};
		var Elements = options.AtomElements || [];
		var type = options.Types || [];
		var _class = options.Class || [];			
		var Max_ringSize = options.DetectRingSize || 8;
		var BondBuffer = options.DetectBondBuffer|| 0.3;
		ProcessDone = function()
		{
			cleaner.structure.finalizeStructure(Max_ringSize,BondBuffer);
			callback(cleaner.structure);
		}
		
		restriction = function(atom)
		{
			var myClass = atom.group.Class;
			var myType = atom.group.type;
			if(Replacements[(atom.element)] !== undefined)
			{
				atom.element = Replacements[atom.element];
				return true;
			}
			if(containsKey(Elements,atom.element) === true)
			{
				return false;
			}
			if(containsKey(_class,myClass) || containsKey(type,myType)){
				return false;
			}
			else
			{
				return true;
			}
		};
		var cleaner = new StructureCloner(self,restriction);
		cleaner.structure.setName(self.name+".cleaned");
		cleaner.onStructureReady = ProcessDone;
		cleaner.progressBar = new ProgressDialog(getPbarText());
		cleaner.clone();
		
		/**
		 * PRIVATE FUNCTIONS
		 */
		function getPbarText()
		{
			var text = "Removing From Structure:<br>";
			if(_class.length != 0){
				text+="Res Class "+_class.toString()+"<br>";}
			if(type.length != 0){
				text+="Res Types "+type.toString()+"<br>";}
			if(Elements.length != 0){
				text+="Elements "+Elements.toString()+"<br>";}
			for (var key in Replacements)
			{
				if(Replacements.hasOwnProperty(key))
				{
					text+=Replacements[key]+" ";
				}
			}
			return text;
		}
	}
	
	this.optimizeHbonds = function(granularity,callback,progressBar)
	{
		var startAt = 0;
		var _callback = callback || null;
		var pbar = progressBar || null;
		var OptimizeHGeometries = function(atom)
		{
			if(pbar !== null)
			{
				pbar.setText("Optimizing Hydrogen's Geometry...");
				self.ff.OptimizeHbond(atom,granularity);
			}
		}
		InterruptedLoop(OptimizeHGeometries,self.atoms,startAt,0,_callback,pbar);
	}
	
	this.addHydrogens = function(pH,_callback,_progressBar)
	{
		var callback = _callback || null;
		var pbar = _progressBar || null;
		var startAt = 0;
		
		var AddH = function(atom)
		{
			atom.BuildImplicitH(pH);
		}
		var Hadded = function()
		{
			var startAt = 0;
			self.setName(self.name+".prot");
			setBoxDimension();
			setCentroid();
		
			var box = new Box(self.centerOfMass, 2, self.boxDimension);
			self.nearbyMap = box;
			PlaceAtoms(box);
			assignImplicitH();
			assignExplicitH();
			if(pbar != null){
				pbar = new ProgressDialog("Optimizing H's Geometry");
			}
			self.optimizeHbonds(self.ff.granularity,callback,pbar);
		}
		if(pbar !== null){pbar.setText("Protonating Structure...")}
		InterruptedLoop(AddH,self.atoms,startAt,0,Hadded,pbar)
	}
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	function assignFFTypes()
	{
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			atom.assignFFType();
		}
	}
	
	function setCentroid()
	{
		self.centerOfMass = getCentroidAtoms(self.atoms);
	}
	
	function setBoxDimension()
	{
		self.boxDimension = getBoxDimension(self);
	}
	
	function assignFunctionalGroups()
	{
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			atom.assignFunctionalGroup()
		}
	}
	
	//here box is a 3D array
	//division of 2 is recommended
	//box will be updated
	function PlaceAtoms(box)
	{
		var centerbox = box.boxcenter;
		var center = box.center
		var division = box.div;
		
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			var diffx = atom.coords[0]-center[0]-(division/2);
			diffx = Math.ceil(diffx / division); //we divide division by two since we comparing to the center of the box
			var diffy = atom.coords[1]-center[1]-(division/2);
			diffy = Math.ceil(diffy / division);
			var diffz = atom.coords[2]-center[2]-(division/2);
			diffz = Math.ceil(diffz / division);
			
			//substract -1 here because array indexes starts at 0 instead of 1.
			if(box.array[diffx+centerbox-1][diffy+centerbox-1][diffz+centerbox-1] == null)
			{
				box.array[diffx+centerbox-1][diffy+centerbox-1][diffz+centerbox-1] = new Array();
			}
			box.array[diffx+centerbox-1][diffy+centerbox-1][diffz+centerbox-1].push(i);
			atom.box = [diffx+centerbox-1,diffy+centerbox-1,diffz+centerbox-1];
		}
	}
	
	function assignAromaticity()
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];
			atom.assignAromaticity();
		}
	}
	
	function assignChainType()
	{
		
		for(var x = 0; x < self.chains.length; x ++)
		{
			var size = 0;
			var chain = self.chains[x];
			for(var i = 0; i < chain.groups.length; i ++)
			{
				var group = chain.groups[i];
				if(group.isWater() || group.isInorganic()){continue;}
				size++;
				if(size > 25)
				{
					chain.isPeptidic = false;
					break;
				}
			}
		}
	}
	
	function assignHetAtoms()
	{
		for(var i = 0; i < self.groups.length; i ++)
		{
			var group = self.groups[i];
			AssignClass(group);
		}
	}
	
	function assignHybridization()
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];			
			atom.assignHybridization();
		}
	}
	
	function correctHybridization()
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];
			atom.correctSP2Hybridization();
		}
	}
	
	function assignImplicitH()
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];
			atom.assignImplicitHydrogens();
		}
	}
	
	function assignExplicitH()
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];
			atom.assignExplicitHydrogens();
		}
	}

	function BondAtoms(buffer)
	{
		var atoms = self.atoms;
		for(var i=0; i < atoms.length; i++)
		{
			var atom = atoms[i];
			atom.bonds = [];
			atom.isLinker = false;
			var nearby = nearAtoms(atom,2.2);
			for(var n = 0; n < nearby.length; n ++)
			{
				
				var near = nearby[n];
				if(near == i){continue;}
				var dist = getAtomSquaredDistance(atom,atoms[near]);
				var radius1 = ELEMENTS.getCovalentRadius(atom.element);
				var radius2 = ELEMENTS.getCovalentRadius(atoms[near].element);
				if(dist < Math.pow(radius1+radius2+buffer,2))
				{
					atom.addBond("single",near);
					if(atoms[near].group.name != atom.group.name)
					{
						atom.isLinker = true;
					}
				}
			}
		}
	}

	function assignRings(MaxDepthSearch)
	{
		var atoms = self.atoms;
		for(var x = 0; x < atoms.length; x++)
		{
			var atom = atoms[x];
			if(atom.ring != null)
			{
				continue;
			}
			var targetID = atom.id;
			var ring = [];
			var previous = atom;
			var branches = [atom.id];
			var results = DFS(atoms,atom,previous,ring,MaxDepthSearch);
			
			for(var i = 0; i < ring.length; i++)
			{
				atoms[ring[i]].ring = ring;
			}
			
			/**
			 * PRIVATE FUNCTION
			 */
			function DFS(atoms,myatom,previous,inring, max)
			{
				var found = [false,max];
				while(max > 0 && !found[0])
				{
					for(var i = 0; i < myatom.bonds.length; i++)
					{
						var maxdepth = max;
						var next = atoms[myatom.bonds[i]];
						if(previous.id === next.id){continue;}
						else if(next.id == targetID)
						{
							found = [true,MaxDepthSearch-max+1];
							inring.push(myatom.id);
							break;
						}
						else if(containsKey(branches,next.id))
						{
							continue;
						}
						
						maxdepth --;
						branches.push(next.id);
						found = DFS(atoms,next,myatom,inring,maxdepth);
						if(found[0])
						{
							inring.push(myatom.id);
							break;
						}
						else
						{
						}	
					}
					max --;
				}
				return found;
			}
		}
	}

	function assignInsaturations()
	{
		var atoms = self.atoms;
		for(var x = 0; x < atoms.length; x++)
		{
			var atom = atoms[x];	
			if(atom.deloc != null 
					|| (atom.hybridization !== "SP2" && atom.hybridization !== "SP"))
			{
				continue;
			}
			
			var deloc = [atom.id];
			var results = DFS(atoms,atom,deloc);
			
			for(var i = 0; i < deloc.length; i++)
			{
				atoms[deloc[i]].deloc = deloc;
			}
			
			/**
			 * PRIVATE FUNCTION
			 */
			function DFS(atoms,myatom,indeloc)
			{
				var found = false;
				for(var i = 0; i < myatom.bonds.length; i++)
				{
					var next = atoms[myatom.bonds[i]];
					if(containsKey(indeloc,next.id))
					{
						continue;
					}
					if(next.hybridization == "SP2" || next.hybridization == "SP" || 
							(next.hybridization === "SP3" && ELEMENTS.getPeriod(next.element) > 2))
					{
						found = true;
						indeloc.push(next.id);
						found = DFS(atoms,next,indeloc);
					}
				}
				return found;
			}
		}
	}
	
	function assignDoubleBonds()
	{
		for(var i = 0; i < self.atoms.length; i++)
		{
			var atom = self.atoms[i];
			if(atom.deloc == null){continue;}
			if(atom.doublebonds != null && atom.doublebonds.length > 0){continue;}
			var size = atom.deloc.length;
			if(atom.inRing()[0]) 
			{	
				bondCO(atom.deloc,atom);
				bondCC(atom.deloc,atom);
				bondCN(atom.deloc,atom);
				bondREST(atom.deloc,atom);
			}
			else //not in a Ring
			{
				var extremes = findExtremities(atom.deloc);
				OptimizeBonding(atom.deloc,extremes);
			}
		}
		
		/**
		 * PRIVATE INNER FUNCTIONS
		 */
		function OptimizeBonding(deloc,extremities)
		{
			var previousScore = 0;
			var optimizednet = null;
			//Here we sort extremities based on the numner of bonds they make
			//A terminal atom is more acidic, than its non-terminal counterpart
			// E.G.: Guanidinum (terminal imine:pKa 13.5, non-terminal imine: pKa 21)
			//Therefore, when adding H to the molecule, this will be important
			
			
			extremities.sort(function(a,b)
					{
						if(a.bonds.length < b.bonds.length){return -1;}
						else if(a.bonds.length == b.bonds.length){
							if(ELEMENTS.getAtomicNumber(a.element) > ELEMENTS.getAtomicNumber(b.element)){
										return -1;}
									else if(ELEMENTS.getAtomicNumber(a.element) == ELEMENTS.getAtomicNumber(b.element)){
										return 0;}
									else if(ELEMENTS.getAtomicNumber(a.element) < ELEMENTS.getAtomicNumber(b.element)){
										return 1;}
						}
						else if(a.bonds.length > b.bonds.length){return 1;}
					})
			
			for(var i = 0; i < extremities.length; i ++)
			{
				resetDoubleBonds(deloc);
				var atom1  = extremities[i];
				var doubleBonds = 0;
				DoubleBondAtoms(deloc,atom1);
				var score = evaluateDoubleBonds(deloc); // get the number of double bonds that were formed
				if(previousScore < score)
				{
					previousScore = score;
					optimizednet = getDoubleBondingNetwork(deloc);
				}	
			}
			if(optimizednet == null)
			{
				self.LogError(new BioError(
						BIOERRORS.LOG_TO_INTERNAL,
						BIOERRORS.BONDING,
						extremities,"Cannot double bond this network of SP2 atoms -> Probable cause: not an SP2 network")
				)
				return;
			}
			BondFromNetwork(optimizednet,deloc); // this should be the optimized network of double bonds that is reassigned	
			
			/**
			 * @param network
			 * network is an array of double bond array, in the same order of atoms of the deloc param
			 */
			function BondFromNetwork(network,deloc)
			{
				for(var i = 0; i < deloc.length; i ++)
				{
					var atom1  = self.atoms[deloc[i]];
					atom1.doublebonds = network[i];
				}
			}
		
		}
		
		function getDoubleBondingNetwork(deloc)
		{
			var net = [];
			for(var i = 0; i < deloc.length; i ++)
			{
				var atom1  = self.atoms[deloc[i]];
				net.push(atom1.doublebonds);
			}
			return net;
		}
		
		
		function DoubleBondAtoms(deloc,startingPoint)
		{
			bondCO(deloc,startingPoint);
			bondCC(deloc,startingPoint);
			bondCN(deloc,startingPoint);
			bondREST(deloc,startingPoint);
		}
		
		
		function resetDoubleBonds(deloc)
		{
			for(var i = 0; i < deloc.length; i ++)
			{
				var atom1  = self.atoms[deloc[i]];
				atom1.doublebonds =[];
			}
		}
		
		function evaluateDoubleBonds(deloc)
		{
			var score = 0;
			for(var i = 0; i < deloc.length; i ++)
			{
				var atom1  = self.atoms[deloc[i]];
				score += atom1.doublebonds.length;
			}
			return score;
		}
		
		function findExtremities(deloc)
		{
			var extremes = [];
			for(var i = 0; i < deloc.length; i++)
			{
				var neighbor = 0;
				var atom1 = self.atoms[deloc[i]];
				var bonds = atom1.bonds;
				for(var x =  0; x < bonds.length; x++)
				{
					var bond = bonds[x];
					if(containsKey(deloc, bond))
					{
						neighbor ++;
					}
				}
				if(neighbor > 1){continue;}
				extremes.push(atom1);
			}	
			return extremes;
		}
		
		
		function bondCO(deloc,startingPoint)
		{
			for(var i = 0; i < deloc.length; i++)
			{
				var atom1 = startingPoint;
				var atom2 = self.atoms[deloc[i]];	
				if(atom1.id === atom2.id){continue;}
				
				if(atom1.doublebonds.length > 0 || atom2.doublebonds.length > 0)
				{
					continue;
				}
				
				if(containsKey(atom1.bonds,atom2.id))
				{
					if((atom1.element === "O" && atom2.element === "C")
						 || (atom1.element === "C" && atom2.element === "O"))
					{
						 if(ValidateBondLength(atom1,atom2,"double")) 
						 {
							 atom1.addBond("double",atom2.id);
							 atom2.addBond("double",atom1.id);
						 }
						 
					}
				}
			}
		}
		
		function bondCC(deloc,startingPoint)
		{
			for(var i =0; i < deloc.length; i++)
			{
				var atom1 = startingPoint;
				var atom2 = self.atoms[deloc[i]];
				if(atom1.id === atom2.id){continue;}
				if(atom1.doublebonds.length > 0 || atom2.doublebonds.length > 0)
				{
					continue;
				}
				
				if(containsKey(atom1.bonds,atom2.id))
				{
					if((atom1.element === "C" && atom2.element === "C"))
					{							
						 if(ValidateBondLength(atom1,atom2,"double")) 
						 {
							 atom1.addBond("double",atom2.id);
							 atom2.addBond("double",atom1.id);
						 }
					}
				}
			}
		}
		function bondCN(deloc,startingPoint)
		{
			for(var i =0; i < deloc.length; i++)
			{
				var atom1 = startingPoint;
				var atom2 = self.atoms[deloc[i]];
				if(atom1.id === atom2.id){continue;}
				if(atom1.doublebonds.length > 0 || atom2.doublebonds.length > 0)
				{
					continue;
				}
				
				if(containsKey(atom1.bonds,atom2.id))
				{
					if((atom1.element === "C" && atom2.element === "N")
							|| (atom2.element === "C" && atom1.element === "N"))
					{
						if(ValidateBondLength(atom1,atom2,"double")) 
						{
							 atom1.addBond("double",atom2.id);
							 atom2.addBond("double",atom1.id);
						}
					}
				}
			}
		}
		
		function bondREST(deloc,startingPoint)
		{
			for(var i = 0; i < deloc.length; i++)
			{
				var atom1 = startingPoint;
				var atom2 = self.atoms[deloc[i]];
				if(atom1.id === atom2.id){continue;}
				if((atom1.doublebonds.length > 0 || atom2.doublebonds.length > 0)
						&& (ELEMENTS.getPeriod(atom1.element) == 2))
				{
					continue;
				}
				if(containsKey(atom1.bonds,atom2.id))
				{
					if(ValidateBondLength(atom1,atom2,"double")) 
					{
						 atom1.addBond("double",atom2.id);
						 atom2.addBond("double",atom1.id);
					}
				}
			}
		}
	}
	
}




function SelectStructure(structure,select)
{	
	var atoms = structure.atoms;
	for(var i = 0; i < atoms.length; i++)
	{
		var atom = atoms[i];
		atom.selected = select;
	}
}

/**
 * @param structure
 * The structure object to clone, as described in biostructure.js
 * @param AtomRestrictions
 * boolean Function that takes an atom as parameter, evaluates parameter and
 * if the atom passes these constraints, it returns TRUE, else, it returns FALSE
 * A true lets the atom by copied, a false, prevents the atom to be copied
 */
function StructureCloner(structure,AtomRestrictions)
{
	var self =  this;
	this.progressBar = null;
	this.structure = new Structure();
	this.onStructureReady = null;
	var toCloneStructure = structure;
	
	var cloneAtom = function(atom)
	{
		if(AtomRestrictions(atom) === true)
		{
			var chain_id      = atom.chain.chainID
			var myChain = new Chain(self.structure,chain_id);
			if(!self.structure.hasChain(chain_id))
			{
				self.structure.addChain(myChain);
			}
			else
			{
				myChain = self.structure.getChain(chain_id);
			}
			// process group data:
			var groupCode3     = atom.group.type;
			var resNum  = atom.group.resNum;
			var myGroup = new Group(myChain,resNum.seqNum,resNum.insCode, groupCode3);
			if(!myChain.hasGroup(myGroup.resNum.seqNum))
			{
				myChain.addGroup(myGroup);
			}
			else
			{
				myGroup = myChain.getGroup(myGroup.resNum.seqNum);
			}

			var fullname = atom.name;
			var coords = [atom.coords[0],atom.coords[1],atom.coords[2]];
			var element = atom.element;
			
			var myAtom = new Atom(myGroup,fullname,element,coords);
			myAtom.pdbserial = atom.pdbserial;
			myAtom.occupancy = atom.occupancy;
			myAtom.bfactor = atom.bfactor;
			
			//CHECK IF IT IS A ALTERNATE ATOM
			var altLoc   = atom.altLoc;
			if(altLoc !== null) 
			{
				//IMPLEMEMT THIS
			}
			myGroup.addAtom(myAtom);
		}
	}
	this.clone = function()
	{
		InterruptedLoop(cloneAtom,toCloneStructure.atoms,0,0,self.onStructureReady,self.progressBar);
	}
}