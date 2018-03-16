/**
 * February 21
 * 
 *  -> Correct assignHybridization() for 5 membered rings, where the angles cannot
 *     reproduce hybridization because of ring strain.
 *     Idea: Calculate planarity of the plane of the cycle : planar = SP2!
 *     
 *  -> Add a isInRing() method based on a tree that is breadth first search and that 
 *     spreads on each side of the target atom (faster this way). Currently it is based on a 
 *     Deep first Search Algorithm.
 *     
 *  -> Improve the OptimizeBonding() algorithm to take into account pKa's of molecules. This would be 
 *     the best way to assign double bond networks. I would have to create a table for each types of
 *     chemical environments. Also I would have to create a function that assigns the chemical environment
 *     to an atom. The latter would be useful for parameterizing atoms;
 */


/**
 * Goal: Create a new atom at a given 
 */
function Atom(group,name,element,coordinates)
{
	var self = this;
	this.errorlog = "atom "+name+" of " + group.name;
	this.selected = false;
	this.box = null;
	this.asa = null;
	this.pdbserial = null;
	this.id = null;
	this.isLinker = false; // is true, this atom is linked to another group.
	this.name     = name;
	this.element = element;
	this.coords   = coordinates;
	this.occupancy  = 1.0;
	this.bfactor = 0.0;
	this.altLoc = null;
	this.group = group;
	this.chain = group.chain;
	this.structure = this.chain.structure;
	this.bonds = [];
	this.doublebonds = [];
	this.hybridization = null;
	this.implicitH = null;
	this.explicitH= null;
	this.ring = null;
	this.deloc = null;
	/**
	 * PUBLIC FUNCTIONS
	 */
	
	this.addAltLoc = function(atom)
	{
		if(self.altLoc == null)
		{
			self.altLoc = [];
		}
		atom.id = self.id;
		
		self.altLoc.push(atom);
	}
	
	this.BuildImplicitH = function()
	{
		var connectedCoords = [];
		var inPlaneAtoms = [];
		var structure = self.structure;
		var atom = self;
		var bonds = atom.bonds;
		for(var x = 0 ; x < bonds.length; x ++)
		{
			var nextAtom = structure.atoms[bonds[x]];
			connectedCoords.push(nextAtom.coords);
			
			var nextBonds = nextAtom.bonds;
			for(var z = 0 ; z < nextBonds.length; z++)
			{
				if(nextBonds[z] === atom.id){continue;}
				var inPlaneAtom = structure.atoms[nextBonds[z]];
				inPlaneAtoms.push(inPlaneAtom.coords);
			}
		}
		
		var distance = ELEMENTS.getCovalentRadius(atom.element)
							+ELEMENTS.getCovalentRadius("H");
		
		var builder = new AtomBuilder(distance, atom.hybridization, atom.coords, connectedCoords,inPlaneAtoms);
		builder.Build();
		
		var newAtoms = builder.getCoords();
		
		number = atom.implicitH-atom.explicitH;
		
		for(var x = 0; x < newAtoms.length && x < number;x++)
		{
			var newAtom = new Atom(atom.group,PDButil.RenameHydrogen(atom,x),"H",newAtoms[x]);
			atom.explicitH ++;
			atom.group.addAtom(newAtom);
			atom.bonds.push(newAtom.id);
			newAtom.bonds.push(atom.id);
		}
	}
	
	this.toPDB = function()
	{
		var group = self.group;
		var type = group.Class;

		var line = "";
		if (group.isAminoAcid()) 
		{
			record = "ATOM  ";
		}
		else
		{
			record = "HETATM";
		}

		var code3 = group.type; 
		var pdbcode = group.resNum.seqNum;
		var inscode = group.resNum.insCode;
		if(inscode === null){
			inscode = " ";
		}
		var resNum     = FormatString(pdbcode+inscode, " ", 5, "right");
		var atomNum		= FormatString(self.id.toString(), " ", 5, "right");	
		var atomName   	= PDButil.FormatAtomName(self);
		var resName		= FormatString(code3, " ", 3, "left");
		var x       	= FormatNumberToString(self.coords[0],3," ",8 , "right");
		var y           = FormatNumberToString(self.coords[1],3," ",8 , "right");
		var z           = FormatNumberToString(self.coords[2],3," ",8 , "right");
		var occupancy   = FormatNumberToString(self.occupancy,2," ",6 , "right");
		var tempfactor  = FormatNumberToString(self.bfactor,2 ," ", 6 , "right");
		var elem = self.element.toUpperCase();
		
		line += record;
		line += atomNum;
		line += " ";
		line += atomName;
		line += " "; // OR alternate Locate code
		line += resName;
		line += " "; 
		line += group.chainID;
		line += resNum;
		line += "   ";
		line += x;
		line += y;
		line += z;
		line += occupancy;
		line += tempfactor;
		
		line = FormatString(line," ",76, "left");
		line += FormatString(elem," ",2, "right");
		line = FormatString(line," ",80, "left");
		line += PDButil.newLine;
		return line;
	}
	
	/**
	 * @author Olivier
	 * This function assigns SP,SP2,SP3 or null as hybridization of atoms.
	 * BE CAREFUL ->	MANY HARDCODED RULES are used here, that may not apply to every small molecules
	 * 				 	SPECIALLY, isRingPlanar = true assumes SP2 hybridization for planar rings,
	 * 					but some rings may have an SP3 atom in it.
	 * 					****It will work for most cases, but not every small molecules****
	 * 
	 * 					I also assume that a O terminal (only bonded to 1 atom) next to an SP2 carbon
	 * 					is SP2 as well, and will double bond with it
	 *
	 * This function requires prior bonding call in the
	 * structure object, as described in biostructure.js
	 * as structure.BondAtoms()
	 * 
	 * In other words, the bond array of the atom must have been 
	 * properly set, otherwise, do not trust the results
	 * 
	 * This function also heavily relies on angles between atoms,
	 * which can be erroneous in PDB files. To prevent weird hybridization
	 * an average is made over all partners, in hope that the out-lier 
	 * partner will be discarded.
	 * @return {Array[2]}
	 * array[0] = angle
	 * array[1] = hybridization string
	 */
	this.assignHybridization = function()
	{	
		if(self.element == "H")
		{
			self.hybridization = null;
			return null;
		}
		
		if(self.group.isWater())
		{
			self.hybridization = "SP3";
			return [null,"SP3"]
		}
		
		var atoms = self.structure.atoms;
		var bonds = self.bonds;
		var angles = 0;
		var len  = 0 ;
		
		if(bonds.length == 0){return null;}
		else if(bonds.length > 1)
		{
			if(self.element === "N" && bonds.length < 4)
			{
				self.hybridization = "SP2";
				return [null,"SP2"]
			}
			else if(self.element === "N" && bonds.length == 4)
			{
				self.hybridization = "SP3";
				return [null,"SP3"]
			}
			
			else if(self.inRing()[0] && isRingPlanar(self.structure,self.ring,10))
			{
				self.hybridization = "SP2";
				return [null,"SP2"];
			}
			else if (self.inRing()[0] == true)
			{
				self.hybridization = "SP3";
				return [null,"SP3"]
			}
			
			for(var i = 0; i < bonds.length-1; i++)
			{
				var atom1 = atoms[bonds[i]];
				var atomCenter = self;
				if(atomCenter.id == atom1.id){
					atom1.structure.LogError(BIOERRORS.LOG_TO_ALERT,new BioError(BIOERRORS.BONDING,
							[atomCenter,atom1],"FATAL!!! Atoms share same id, implying self-bonding: will cause error"));
					//MAYBE I SHOULD DELETE THE ATOM??
					continue;
					}
				for(var x = i+1; x < bonds.length; x++)
				{
					var atom3 = atoms[bonds[x]];
					angles += AngleBetweenAtoms(atom1,atomCenter,atom3);
					len ++;
				}
			}
			var angle = angles/len
			self.hybridization = MatchAngleToHybridization(angle);
			return [angle,self.hybridization];
		}
		//HERE WE HAVE TO FIND HYBRIDIZATION OF ATOMS THAT ARE BOND TO ONLY 1 OTHER
		//ATOM. THUS, WE SEARCH FOR THE NEXT ATOM AND FIND THE ANGLE IT MAKES WITH
		//BONDED ATOMS TO THE NEXT ATOM.
		else if(bonds.length === 1)
		{
			var nextAtom = atoms[bonds[0]];
			var nextBonds = nextAtom.bonds;
			var hyb = nextAtom.hybridization || nextAtom.assignHybridization()[1];
			if(hyb != null && hyb == "SP3" && ELEMENTS.getPeriod(nextAtom.element) == 2)
			{
				self.hybridization = "SP3";
				return [null,"SP3"]; //this is the only possiblity;
			}
			else if(hyb != null && hyb == "SP2" && nextAtom.element == "C")
			{
				if(nextAtom.inRing()[0] && isRingPlanar(nextAtom.structure,nextAtom.ring,10))
				{
					self.hybridization = "SP3";
					return [null,"SP3"];
				}
				else
				{
					self.hybridization = "SP2";
					return [null,"SP2"];
				}
			}
			else	
			{
				self.hybridization = "SP3";
				return [null,"SP3"]; // the default
			}
		}
	}
	
	this.correctSP2Hybridization = function()
	{
		if(self.deloc === null){return;}
		if(self.deloc.length === 1)
		{
			if(self.element !== "N") // Nitrogen is SP2 by default because of tunneling of lone pair
			{
				self.structure.LogError(new BioError(
						BIOERRORS.LOG_TO_INTERNAL,
						BIOERRORS.HYBRIDIZATION,
						[self],
						"SP2 hybridized, but no SP2 neighbor atoms detected"));
				self.hybridization = "SP3";
			}
			RemoveIdFromDeloc();
			self.deloc = null;
			
		}
		else if(self.deloc.length > 1 && self.doublebonds.length == 0)
		{
			if(self.element !== "N" 
				&& self.element !== "O"
				&& self.hybridization == "SP2")
			{
				self.structure.LogError(new BioError(
						BIOERRORS.LOG_TO_INTERNAL,
						BIOERRORS.HYBRIDIZATION,
						[self],
						"SP2 hybridized, but no double bonds detected"));
				self.hybridization = "SP3";
				RemoveIdFromDeloc();
				self.deloc = null;
			}
		}
		
		function RemoveIdFromDeloc()
		{
			for(var i = 0; i < self.deloc.length;i++)
			{
				var atom = self.structure.atoms[self.deloc[i]];
				if(atom.id === self.id){continue;}
				var index = atom.deloc.indexOf(self.id);
				if(index > -1){atom.deloc.splice(index,1);}
			}
		}
		
	}
	
	/**
	 *@param MaxDepthSearch
	 *@return{Array}
	 * Array[0] = true if is in a ring, false otherwise
	 * Array[1] = the ring size that the atom is part of
	 */
	this.inRing = function()
	{		
		if(self.ring == null)
		{
			return [false,0];
		}
		else
		{
			return [true,self.ring.length];
		}
	}
	
	this.exceedOctet = function()
	{
		var period = ELEMENTS.getPeriod(self.element)
		if(period == 1)
		{
			if(self.bonds.lenght * 2  > 2)
			{
				return true;
			}
		}
		else if(period == 2)
		{
			if(self.bonds.lenght * 2  > 8)
			{
				return true;
			}
		}
		return false;
	}
	
	/**
	 * @return
	 * 0 = ok
	 * 1 = over
	 * -1 = under
	 */
	this.checkValence = function()
	{
		var period = ELEMENTS.getPeriod(self.element)
		var valence = ELEMENTS.getValenceElectron(self.element)
		var bonds = self.implicitH - self.explicitH + self.bonds.length + self.doublebonds.length;
		var electrons = bonds*2;
		var diff = valence - bonds;
		
		if(period == 1)
		{
			var charge = 2 - (electrons + diff);
			self.charge = charge;
			if(electrons  > 2)
			{
				return 1;
			}
			else if(electrons  == 2)
			{
				return 0;
			}
			else{return -1;}
		}
		else if(period == 2)
		{
			var charge = 8 - (electrons + diff);
			self.charge = charge;
			if(electrons > 8)
			{
				return 1;
			}
			else if(electrons == 8)
			{
				return 0;
			}
			else
			{
				if(charge == 0) {return 0;}
				else if(charge < 0 && self.element !== "O") {return -1;}
				else if(charge < 0 && self.element === "O") {return 0;}
				else if(charge > 0 && self.element !== "N") {return 1;}
				else if(charge > 0 && self.element === "N") {return 0;}
			}
		}
		else
		{
			//IMPROVE THIS FOR SULFUR AND PHOSPHORUS GROUPS
			return 0;
		}	
	}
	
	this.assignExplicitHydrogens = function()
	{
		var Hbonds = 0;
		for(var i = 0 ;  i  < self.bonds.length; i ++)
		{
			var atom = self.structure.atoms[self.bonds[i]];
			if(atom.element === "H")
			{
				Hbonds ++;
			}
		}
		self.explicitH = Hbonds;
	}
	
	this.assignImplicitHydrogens = function()
	{
		//Count octet(for corresponding period - valence electrons = max number of partners for SP3.
		//max number - 1 = max number for SP2
		//max number - 2 = max number for SP;
		
		//isolate delocalized systems
			//By following the chain of SP2 atoms and including uncertain atoms such as terminal "O"
				//Be aware of possible cycles: mark atom as visited so you dont come back to the same spot
				//when you revisit an atom: this is a cycle:
		
			//Find cycles of 5 or 6 (tree data structure, 3 steps are required)
			//Determine if cycle is aromatic (all sp2 atoms in the cycle)
			//for the cycle, assign double bonds by minimizing 
		if(self.element === "H"){return;}
		var noHBonds = 0;
		for(var i = 0 ;  i  < self.bonds.length; i ++)
		{
			var atom = self.structure.atoms[self.bonds[i]];
			if(atom.element !== "H")
			{
				noHBonds ++;
			}
		}
		var bonds = noHBonds + self.doublebonds.length;
		var valence = ELEMENTS.getValenceElectron(self.element);
		var electrons = valence + bonds;
		var octet = 8;
		if(ELEMENTS.getPeriod(self.element) == 2)
		{
			self.implicitH = octet - electrons;
		}
		else if(ELEMENTS.getPeriod(self.element) > 2) //For phosphorus or Sulfur
		{
			//IMPLEMENT THIS??
		}
	}
	
	/**
	 * @param type
	 * "html" if <br> to be added
	 * "text" if "\n" to be added
	 * "csv" if "," to be added at each end of line
	 * 
	 * @return {String}
	 * returns the text String to print
	 */
	this.printInfo = function(type)
	{
		var newLine = "";
		if(type == "csv"){newLine = ",";}
		if(type == "html"){newLine = "<br>";}
		if(type == "text"){newLine = "\n";}
		
		
		var info ="";
		info += "Name   : "+self.name+newLine;
		info += "Index  : "+self.id+newLine;
		info += "PDB id : "+self.pdbserial+newLine;
		info += "Element: "+self.element+newLine;
		info += "Coords : "+self.printCoords()+newLine;
		info += "Struct : "+self.structure.name+newLine;
		info += "Chain  : "+self.chain.chainID+newLine;
		info += "Group  : "+self.group.Class + " " + self.group.type+ " " +self.group.resNum.seqNum+newLine;
		info += "Alt Loc: "+self.printAltLoc()+newLine;
		info += "Occupcy: "+self.occupancy+newLine;
		info += "B-factr: "+self.bfactor+newLine;
		info += "Hybryd : "+self.hybridization+newLine;
		info += "SASA   : "+self.asa+newLine;
		info += "Linker : "+self.isLinker+newLine;
		info += "Bonds  : "+self.printBonds()+newLine;
		info += "D-Bonds: "+self.printDoubleBonds()+newLine;
		info += "Deloc  : "+self.printDelocalization()+newLine;
		info += "Impl H : "+self.printImplicitH()+newLine;
		info += "Expl H : "+self.printExplicitH()+newLine;
		info += "In Ring: "+self.printRingInfo()+newLine;
		return info;
	}
	
	this.printBonds = function()
	{
		var text = "";
		if(self.bonds == null || self.bonds.length == 0){return "Not Bonded";}
		for(var i =0; i < self.bonds.length; i++)
		{
			text += self.bonds[i]
			if(i < self.bonds.length-1)
			{
				text += " ";
			}
		}
		return text;
		
	}
	
	this.printDoubleBonds = function()
	{
		var text = "";
		if(self.doublebonds === null || self.doublebonds.length == 0){return "No Double Bonds";}
		for(var i =0; i < self.doublebonds.length; i++)
		{
			text += self.doublebonds[i]
			if(i < self.doublebonds.length-1)
			{
				text += " ";
			}
		}
		return text;
		
	}
	
	this.printDelocalization = function()
	{
		var text = "";
		if(self.deloc === null || self.deloc.length === 0){return "No Delocalization Group";}
		for(var i =0; i < self.deloc.length; i++)
		{
			text += self.deloc[i]
			if(i < self.deloc.length-1)
			{
				text += " ";
			}
		}
		return text;	
	}
	
	this.printRingInfo = function()
	{
		var text = "";
		if(self.ring === null || self.ring.length == 0){return "Not in a Ring";}
		for(var i =0; i < self.ring.length; i++)
		{
			text += self.ring[i]
			if(i < self.ring.length-1)
			{
				text += " ";
			}
		}
		return text;
	}
	
	this.printImplicitH = function()
	{
		var text = "";
		if(self.implicitH === null){return "Not yet assigned";}
		if(self.implicitH === 0){return "No Implicit Hydrogens";}
		text = self.implicitH;
		return text;
	}
	
	this.printExplicitH = function()
	{
		var text = "";
		if(self.explicitH === null){return "Not yet assigned";}
		if(self.explicitH === 0){return "No Explicit Hydrogens";}
		text = self.implicitH;
		return text;
	}
	
	this.printAltLoc = function()
	{
		if(self.altLoc == null){return "No Alt Loc";}
		var text = "";
		for(var i  = 0; i <  self.altLoc.length; i++)
		{
			text += self.altLoc.name+": "+self.altLoc.printCoords();
			if(i < self.altLoc.length-1)
			{
				text += " ";
			}
		}
		return text;
	}
	
	this.printCoords = function()
	{
		var text = "X: "+self.coords[0]+", ";
		text += "Y: "+self.coords[1]+", ";
		text += "Z: "+self.coords[2];
		return text;
	}
	
	/**
	 * @return {boolean}
	 * return false if no altLoc, true otherwise
	 */
	this.checkAltLoc = function()
	{
		if(self.altLoc === null){return false;}
		else if (self.altLoc.length > 0){return true;}
		else{return false;}
	}
	
	/**
	 * @param buffer
	 * The buffer softens the equilibrium distance between atoms and
	 * allow for PDB files common errors on the positions of atoms 
	 * a buffer of 
	 * 		80%: small clashes or bond length that are too small
	 * 		70%: reasonable buffer: only severe clashes will pop-up here
	 * 		60%: Severe clashes will be identified here
	 * 		50%: Extreme clashes will be identified 
	 * @return {2D array}
	 * returns null if no clash found.
	 * returns the id of the atom that clashes with self (array[x][0]) and a ratio of 
	 * strength (array[x][1]). 
	 * The ratio represents the allowed squared distance (with buffer calculated)
	 * divided by the actual squared distance
	 */
	this.checkClash = function(buffer)
	{
		var clashes = [];
		
		var atom1 = self;
		var radii1 = ELEMENTS.getCovalentRadius(atom1.element);
		var near = nearAtoms(atom1,3);
		
		for(var i = 0; i < near.length; i ++)//check at 3 Ang
		{
			nearby = near[i];
			if(nearby == atom1.id){continue;}
			
			var atom2 = self.structure.atoms[nearby];
			var dist_sqr = getAtomSquaredDistance(atom1,atom2);
			
			var radii2 = ELEMENTS.getCovalentRadius(atom2.element);
			var eq_sqr = Math.pow((radii1+radii2)*buffer,2);
			
			if(dist_sqr < eq_sqr)
			{
				if(clashes == null)
				{
					clashes = [];
				}
				clashes.push([atom2.id,eq_sqr/dist_sqr]);
			}
		}
		return clashes;
	}
	
	/**
	 * @return
	 * return +1 if angle wider than hydridization's ideal value + buffer
	 * return -1 if angle narrower than hydridization's ideal value - buffer
	 * return 0 if angle is within hydridization's ideal value +- buffer
	 */
	this.checkAngles = function(buffer)
	{
		var bonds = self.bonds;
		var atoms = self.structure.atoms;
		if(bonds.length > 1)
		{
			for(var i = 0; i < bonds.length-1; i++)
			{
				var atom1 = atoms[bonds[i]];
				var atomCenter = self;
				if(atomCenter.id == atom1.id){continue;} // THIS SHOULD NOT HAPPEN IF BONDS ARE PROPERLY ASSIGNED IN THE FIRST PLACE
				for(var x = i+1; x < bonds.length; x++)
				{
					var atom3 = atoms[bonds[x]];
					var angles = AngleBetweenAtoms(atom1,atomCenter,atom3);
					if(atom1.inRing()[0] && atomCenter.inRing()[0] && atom3.inRing()[0])
					{
						return 0;
					}
					if(self.hybridization === "SP3" && (angles < 109.47-buffer))
					{
						return -1;
					}
					else if(self.hybridization === "SP3" && (angles > 109.47+buffer))
					{
						return 1;
					}
					else if(self.hybridization === "SP2" && (angles < 120.0-buffer))
					{
						return -1;
					}
					else if(self.hybridization === "SP2" && (angles > 120.0+buffer))
					{
						return 1;
					}
					else if(self.hybridization === "SP" && (angles < 180.0-buffer))
					{
						return -1;
					}
					else if(self.hybridization === "SP" && (angles > 180.0+buffer))
					{
						return 1;
					}
					else {return 0;}
				}
			}
		}
		else{return 0;}
	}
}

function SelectAtom(structure,index,select)
{
	var atom = structure.atoms[index];
	atom.selected = select;
}
