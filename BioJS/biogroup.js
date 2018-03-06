/**
 * February 16th
 *  -> Implement getPhi() and getPsi() in the Group Object
 *     ->DONE
 *     
 *  -> Add a hasRing() function. This will speed up atom 
 *     hybridization assignment. Maybe with a FinalizeGroup function? This could also trigger the
 *     this.PTM = hasAminoBackBone(self).
 * 
 *  February 22th    
 *  -> Better implement isAminoLike(group) for C-terminal residues, where the number of bonds
 *     on the C is 3 instead of 2 because of the carboxylic acid
 *     
 *     getPreviousGroupAtom() could be improved so it does not rely on atom names, but on a backbone
 *     search instead, just like isAminoLike() function works. isAminoLike() could set the group backbone
 *     atoms for each groups that are "amino" or "amino-like", or another similar function could do it
 */

/**
 * @param chain
 * the chain object in which to create a group
 * @param seqNum
 * Integer that represent the group number in the chain
 * @param insertionCode
 * Char representing the insCode of the ResidueNumber object that will be created
 * Can be set to null
 * @param code3Letter
 * The group type will be assigned this 3 letter code.
 */
function Group(chain,seqNum,insertionCode, code3Letter)
{
	var self = this;
	this.type = "UNK"
	if(code3Letter != null && code3Letter != "   ")
	{
		self.type = code3Letter;
	}
	this.selected = false;
	this.name = createName(chain,seqNum);
	this.atoms = [];
	this.chain = chain;
	this.chainID = chain.chainID;
	this.structure = chain.structure;
	this.resNum = new ResidueNumber(chain.chainID,seqNum,insertionCode);
	this.Class = null;
	this.id = null;
	this.psi = null;
	this.phi = null;
	
	/**
	 * PUBLIC FUNCTION
	 */
	this.addAtom = function(atom)
	{
		var id = self.structure.atoms.length;
		atom.id = id;
		self.atoms.push(atom);
		self.chain.atoms.push(atom);
		self.structure.atoms.push(atom);
	}
	
	this.getResidueNumber = function()
	{
			return self.resNum;
	}
	this.isAminoAcid = function()
	{
		return ("amino" == self.Class);
	}
	this.isWater = function()
	{
		return ("water" == self.Class);
	}
	
	this.isAminoLike = function()
	{
		return ("amino-like" == self.Class);
	}
	this.isInorganic = function()
	{
		return ("inorganic" == self.Class);
	}
	this.isSmallMolecule = function()
	{
		return ("small-molecule" == self.Class);
	}
	
	this.setName = function(chain_id,resNum)
	{
		if(chain_id != " ")
		{
			self.name = chain_id+"_"+resNum;
		}
		else
		{
			self.name = resNum;
		}
	}
	
	this.getLinkerNum = function()
	{
		var linker = 0;
		for(var i = 0 ; i < self.atoms.length; i++)
		{
			var atom=  self.atoms[i];
			if(atom.isLinker)
			{
				linker++;
			}
		}
		return linker;
	}
	
	this.hasMissingAtoms = function()
	{
		if(self.isAminoAcid())
		{
			var isStarter,isEnder
			var prev = self.getPreviousGroupAtom();
			if(prev !== null){isStarter = false;}
			else{isStarter = true;}
			
			var next = self.getNextGroupAtom();
			if(next !== null){isEnder = false;}
			else{isEnder = true;}
			
			var heavy = 0;
			var num = AMINOACIDS.HeavyAtomQty[self.type];
			for(var i = 0 ; i < self.atoms.length; i++)
			{
				var atom=  self.atoms[i];
				if(atom.element !== "H")
				{
					heavy ++;
				}
			}
			if(!isEnder && heavy === num)
			{
				return 0;
			}
			else if(!isEnder && heavy > num)
			{
				return 1;
			}
			else if(!isEnder && heavy < num)
			{
				return -1;
			}
			else if(isEnder && heavy > num+1)
			{
				return 1;
			}
			else if(isEnder && heavy === num+1)
			{
				return 0;
			}
			else if(isEnder && heavy < num+1)
			{
				return -1;
			}
		}
		return 0; // DEFAULT TO OK!
	}
	
	
	/**
	 * Goal: This function find any duplicated names in the group
	 * @return 
	 * returns an array of duplicate names;
	 * The array is empty if no duplicates are found.
	 */
	this.hasDuplicateNames=  function()
	{
		var names = [];
		var duplicates = [];
		for(var i = 0 ; i < self.atoms.length; i ++)
		{
			var name= self.atoms[i].name;
			if(!containsKey(names,name))
			{
				names.push(name);
			}
			else //SAME NAMES
			{
				if(!containsKey(duplicates,name))
				{
					duplicates.push(name);
				}
			}
			
		}
		return duplicates;
	}
	
	/**
	 * Goal: Obtain the next group in the Amino Acid sequence
	 */
	this.getNextGroupAtom = function()
	{
		if(!self.isAminoAcid() && !self.isAminoLike())
		{
			return null;
		}
		for(var i = 0; i < self.atoms.length; i++)
		{
			if(self.atoms[i].name == "C")
			{
				var atom = self.atoms[i];
				var bonds = atom.bonds;
				for(var x = 0; x <bonds.length; x ++)
				{
					var bond = bonds[x];
					var atom2 = self.structure.atoms[bond];
					if(atom2.name == "N" && atom2.group.resNum.seqNum > atom.group.resNum.seqNum)
					{
						return atom2;
					}
				}
			}
		}
		return null;
	}
	
	/**
	 * Goal: Obtain the previous group in the Amino Acid sequence
	 */
	this.getPreviousGroupAtom = function()
	{
		if(!self.isAminoAcid() && self.isAminoLike())
		{
			return null;
		}
		for(var i = 0; i < self.atoms.length; i++)
		{
			if(self.atoms[i].name == "N")
			{
				var atom = self.atoms[i];
				var bonds = atom.bonds;
				for(var x = 0; x <bonds.length; x ++)
				{
					var bond = bonds[x];
					var atom2 = self.structure.atoms[bond];
					if(atom2.name == "C" && atom2.group.resNum.seqNum < atom.group.resNum.seqNum)
					{
						return atom2;
					}
				}
			}
		}
		return null;
	}
	
	/**
	 * @function
	 * this function calculates psi angle of a residue
	 * order of atoms: 
	 * 		N, CA, C, next N
	 */
	this.getPsiAngle = function()
	{
		var NN = self.getNextGroupAtom();
		if(NN == null)
		{
			return null;
		}
		var atoms1 = self.atoms;
		var N= null,CA = null,C = null;
		for(var i = 0; i < atoms1.length; i ++)
		{
			var atom = atoms1[i];
			if(atom.name == "N")
			{
				N = atom;
			}
			else if(atom.name == "C")
			{
				C = atom;
			}
			else if(atom.name == "CA")
			{
				CA = atom;
			}
		}
		if(N == null || C == null || CA == null)
		{
			return null;
		}
		var torsion = TorsionBetweenAtoms(N,CA,C,NN);
		return torsion;
		
	}
	
	/**
	 * @function
	 * this function calculates phi angle of a residue
	 * order of atoms: 
	 * 		prev C, N, CA, C
	 */
	this.getPhiAngle = function()
	{
		var PC = self.getPreviousGroupAtom();
		if(PC == null)
		{
			return null;
		}
		var atoms1 = self.atoms;
		var N = null,CA = null,C = null;
		for(var i = 0; i < atoms1.length; i ++)
		{
			var atom = atoms1[i];
			if(atom.name == "N")
			{
				N = atom;
			}
			else if(atom.name == "C")
			{
				C = atom;
			}
			else if(atom.name == "CA")
			{
				CA = atom;
			}
		}
		if(N == null || C == null || CA == null)
		{
			return null;
		}
		var torsion = TorsionBetweenAtoms(PC,N,CA,C);
		return torsion;
	}
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	function createName(chain,number)
	{
		if(chain.chainID != null || chain.chainID != " ")
		{
			return(chain.chainID+"_"+number);
		}
		else {return number};
	}
}

/**
 * 
 */
function ResidueNumber(chainID, residueNum, inscode)
{
	var self = this;
	this.chainId = chainID;
	this.seqNum = residueNum;
	this.insCode = inscode;
	this.getIdentifier = function()
	{
		return (self.chainId+"_"+self.seqNum+self.insCode).trim();
	}
}

function AssignClass(group)
{
	group.Class = getClass(group);
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	/**
	 * Goal: to determine if a residue is amino-like or not, based on the connectivity of its atoms
	 * @param group
	 * the group object to query
	 * @returns
	 * true if |O-C-C-N| was found, false otherwise
	 */
	function isAminoLike(group)
	{
		var atoms = group.atoms;
		var target = null;
		var id = 0;

		var targetID = ["O","C","C","N"];
		var targetBond = [[1],[2],[2,3],[1]];
		var targetBondCterminal = [[1],[3],[2,3],[1]];
		for(var x = 0; x < atoms.length; x++)
		{
			var atom = atoms[x];
			if(atom.element == targetID[id] && containsKey(targetBond[id],atom.bonds.length))
			{
				target = atom; // this will be the starting point of the search (should be an "O" with 1 bond)
				id++;
				break;
			}
		}
		if(target == null){return false;}
		
		var backbone = [target.id];
		var results = DFS(group.structure.atoms,target,backbone,targetID,id);
		return results;	
		/**
		 * PRIVATE FUNCTION
		 */
		function DFS(atoms,myatom,inbackbone,targetID,id)
		{
			var found = false;
			for(var i = 0; i < myatom.bonds.length; i++)
			{
				var next = atoms[myatom.bonds[i]];
				if(next.group.name != myatom.group.name){continue;}
				if(!containsKey(inbackbone,next.id) && next.element == targetID[id])
				{
					var nextbonds = next.bonds;
					var mybonds = 0;
					for(var b = 0; b < nextbonds.length; b ++)
					{
						//Excludes "H" from the search. Only heavy atoms are considered
						if(atoms[nextbonds[b]].group.name == next.group.name && next.element != "H")
						{
							mybonds ++;
						}
					}
					
					if(containsKey(targetBond[id],mybonds))
					{	
						found = true;
						id++;
						if(id == targetID.length)
						{
							return found;
						}
						inbackbone.push(next.id);
						found = DFS(atoms,next,inbackbone,targetID,id);
					}
				}
			}
			return found;
		}	
	}

	function isWater(group)
	{
		var atoms = group.atoms;
		if(atoms.length > 3)
		{
			return false;
		}
		
		var targetID = "O";
		var targetBond = 0;
		for(var x = 0; x < atoms.length; x++)
		{
			var atom = atoms[x];
			if(atom.element != targetID){continue;}
			var bonds = atom.bonds;
			var mybonds = 0;
			for(var b = 0; b < bonds.length; b ++)
			{
				var next = group.structure.atoms[bonds[b]];
				//Excludes "H" from the search. Only heavy atoms are considered
				if(next.element != "H")
				{
					mybonds ++;
				}
			}
			if(targetBond == mybonds)
			{
				return true;
			}
		}
		return false;
	}
	
	/**
	 * EVALUATE IF THE GROUP CONTAINs CARBONS
	 * @return
	 * true if carbons are present, false otherwise
	 */
	function isInorganic(group)
	{
		var atoms = group.atoms;
		for(var i =  0; i < atoms.length; i ++)
		{
			if(atoms[i].element == "C")
			{
				return true;
			}
		}
		return false;
		
	}
	
	/**
	 * @return
	 * return the class of the residue
	 *   water if isWater()
	 *   amino if isAmino()
	 *   amino-like if isAminoLike()
	 *   inorganic if isInorganic()
	 *   small-molecule, otherwise
	 */
	function getClass(group)
	{
		if(isWater(group))
		{
			return "water";
		}
		else if (AMINOACIDS.isAmino(group))
		{
			return "amino";
		}
		else if (isAminoLike(group))
		{
			return "amino-like";
		}
		else if (isInorganic(group))
		{
			return "inorganic";
		}
		else
		{
			return "small-molecule";
		}
	}
}

function IsolateGroup(group)
{
	var newStruct = new Structure();
	newStruct.name = group.structure.name+"("+group.name+")";
	var newChain = new Chain(newStruct,group.chain.chainID);
	newStruct.addChain(newChain);
	var newGroup = new Group(newChain,group.resNum.seqNum,group.resNum.insCode,group.type);
	newChain.addGroup(newGroup);
	for(var i = 0; i < group.atoms.length; i++)
	{
		var atom = group.atoms[i];
		var newAtom = new Atom(newGroup,atom.name,atom.element,atom.coords);
		newAtom.bfactor = atom.bfactor;
		newAtom.occupancy = atom.occupancy;
		newAtom.pdbserial = atom.pdbserial;
		newGroup.addAtom(newAtom);
	}
	newStruct.finalizeStructure(6,0.3);
	return newStruct;
}

function SelectGroup(structure,index,select)
{
	var group = structure.groups[index];
	var atoms = group.atoms;
	for(var i = 0; i < atoms.length; i++)
	{
		var atom = atoms[i];
		atom.selected = select;
	}
}