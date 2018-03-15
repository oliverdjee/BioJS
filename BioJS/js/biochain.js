/**
 * @param structure
 * the structure object in which to create a chain
 * @param chainID
 * String representing the ID and name of the chain in the structure object
 */

function Chain(structure,chainID)
{
	var self = this;
	var DEFAULT_CHAIN_ID = "A";
	this.size = 0;
	this.selected = false;
	this.chainID = chainID; // the chain identifier as in PDB files
	this.swissprot_id = null; // not implemented yet
	this.seqResGroups = []; // not implemented yet
	this.id  = null;
	this.name = this.chainID; //DUPLICATE ? Maybe I should remove, but some objects are using it...
	this.mol = null; // not implemented yet
	this.structure = structure;
	this.groups = [];
	this.atoms = [];
	this.pdbResnumMap = {}; //Not implemented yet
	this.internalChainID = null; // the chain identifier used in mmCIF files (not implemented yet!!)
	this.isPeptidic = true; // at 25 groups, the chain is not peptidic anymore
	/**
	 * PUBLIC FUNCTIONS
	 */
	this.addGroup = function(group)
	{
		var id = structure.groups.length;
		group.id = id;
		self.groups.push(group);
		structure.groups.push(group);
	}
	
	this.getSequence = function()
	{
		var text = ""
		for(var i = 0; i < self.groups.length; i++)
		{
			if(self.groups[i].isWater() || self.groups[i].isInorganic()){continue;}
			text += self.groups[i].type +"-"
		}
		return text.substring(0,text.length-1);
	}
	
	
	this.getChainID = function()
	{
		return self.chainID;
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
	
	/**
	 * Returns the residues that are making only 1 or less bonds with other groups.
	 */
	this.getChainBreaks = function()
	{
		var linker1 = [];
		for(var i = 0 ; i < self.groups.length; i++)
		{

			var group = self.groups[i];
			if(group.isWater()){continue;}
			if(group.getNextGroupAtom() === null 
					&& (group.isAminoAcid() || group.isAminoLike()))
			{
				linker1.push(group.id);
				i++;
				for(i; i < self.groups.length; i++)
				{
					group = self.groups[i];
					if(group.isWater()){continue;}
					if(group.getPreviousGroupAtom() === null 
							&& (group.isAminoAcid() || group.isAminoLike()))
					{
						linker1.push(group.id);
						i--;
						break;
					}
				}
			}
		}
		
		var chainbreaks = [];
		if(linker1.length%2 !== 0)
		{
			for(var i = 0; i < linker1.length-1; i++)
			{
				chainbreaks.push(linker1[i]);
			}
		}
		else
		{
			chainbreaks = linker1;
		}
		return chainbreaks;
	}
	
	this.getLoneGroups = function()
	{
		var linker0 = [];
		for(var i = 0 ; i < self.groups.length; i++)
		{
			var group = self.groups[i];
			if(group.isWater()){continue;}
			if(group.getLinkerNum() == 0 && (group.isAminoAcid() || group.isAminoLike()))
			{
				linker0.push(group.id);
			}
		}
		return linker0;
	}
	
	this.getGroup = function(resnum)
	{
		for(var i = 0; i < self.groups.length; i ++)
		{
			var resi = self.groups[i].resNum.seqNum;
			if(resi == resnum)
			{
				return self.groups[i];
			}
		}
		return null;
	}
}

function IsolateChain(chain)
{
	var newStruct = new Structure();
	newStruct.name = chain.structure.name+"("+chain.chainID+")";
	var newChain = new Chain(newStruct,chain.chainID);
	newStruct.addChain(newChain);
	
	for(var i = 0; i < chain.groups.length; i++)
	{
		var group = chain.groups[i];
		var newGroup = new Group(newChain,group.resNum.seqNum,group.resNum.insCode,group.type);
		newChain.addGroup(newGroup);
		
		for(var x = 0; x < group.atoms.length; x++)
		{
			var atom = group.atoms[x];
			var newAtom = new Atom(newGroup,atom.name,atom.element,atom.coords);
			newAtom.bfactor = atom.bfactor;
			newAtom.occupancy = atom.occupancy;
			newAtom.pdbserial = atom.pdbserial;
			newGroup.addAtom(newAtom);
		}
	}
	
	newStruct.finalizeStructure(6,0.3);
	return newStruct;
}

function UniqueChains(groups)
{
	var chains = [];
	var names = [];
	for(var i = 0; i < groups.length; i ++)
	{
		if(!(containsKey(names,groups[i].chainID)))
		{
			names.push(groups[i].chainID);
			chains.push(groups[i].chain);
		}
	}
	return chains;
}


function SelectChain(structure,index, select)
{	
	var chain = structure.chains[index];
	var atoms = chain.atoms;
	for(var i = 0; i < atoms.length; i++)
	{
		var atom = atoms[i];
		//selectedAtoms.push(atom.id);
		atom.selected = select;
	}
}