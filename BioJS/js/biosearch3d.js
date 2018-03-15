/**
 *  Finalize GetBoundingWaters(atom). Until now, I have the near water oxygen. I looked for near
 *  atoms. I have to add restrictions so the atom found is part of another group than the original
 *  atom and the water itself, like a hydrogen. Also add H-bonding distances (2.8A is the ideal length)
 *  for better results??
 */

function Box(center, division, boxsize)
{
	var self = this;
	this.center = center;
	
	this.div = division;
	this.size = 0;
	var temparray = InitBox();
	this.array = temparray;
	this.boxcenter = Math.ceil(self.size / division / 2);
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	function InitBox()
	{
		var newSize = Math.ceil(boxsize);
		while(newSize%division != 0)
		{
			newSize ++;
		}
		
		if((newSize/division)%2 == 0)
		{
			newSize += division; //Making sure it is an odd number of divisions;
		}
		self.size = newSize;
		var myArr = new Array();
		for(var x = 0; x  < (newSize/division); x ++)
		{
			myArr[x] = new Array();
			for(var y = 0; y  < (newSize/division); y ++)
			{
				myArr[x][y] = new Array();
				for(var z = 0; z  < (newSize/division); z ++)
				{
					myArr[x][y][z] = null;// no atoms are placed yet;
				}
			}
		}
		return myArr;
	};
	
}

function nearAtoms(atom, distance)
{
	var boxarray = atom.structure.nearbyMap;
	var atombox = atom.box;
	
	var near = new Array();
	var boxes = getShellBox(); //2D array of boxes containing an array of index representing atoms
	for(var i = 0; i < boxes.length; i++)
	{
		var box = boxes[i];
		if(box != null)
		{
			for(var h = 0 ; h < box.length; h++)
			{
				var coords1 = atom.structure.atoms[box[h]].coords;
				var coords2 = atom.coords;
				var x = Math.pow(coords1[0] - coords2[0],2);
				var y = Math.pow(coords1[1] - coords2[1],2);
				var z = Math.pow(coords1[2] - coords2[2],2);
				var len = Math.sqrt(x+y+z);
				//console.log(structure.atoms[box[h]].name + ": " +len);
				if(len <= distance)
				{
					//console.log("accepted");
					near.push(box[h]);
				}
			}
		}
		
	}

	return near;
	
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	function inRange(value, min, max)
	{
		if(value < max && value >= min)
		{
			return true
		}
		else
		{
			return false;
		}
	}
	
	function getShellBox()
	{
		var shell = Math.ceil(distance / boxarray.div);
		var shellboxes = new Array();
		for(var x = -shell; x <= shell; x ++)
		{
			for(var y = -shell; y <= shell; y ++)
			{
				for(var z = -shell; z <= shell; z ++)
				{
					var size = boxarray.array[0].length; // its a cube so all arrays are equal length
					var tx = atombox[0]+x;
					var ty = atombox[1]+y;
					var tz = atombox[2]+z;
					if(inRange(tx,0,size) && inRange(ty,0,size) && inRange(tz,0,size))
					{
						shellboxes.push(boxarray.array[tx][ty][tz])
					}
				}
			}
		}
		return shellboxes;
	}
}

/**
 * Goal: Find all nearby residues of a specific group at a certain distance
 * @param group
 * group object as described in biogroup.js
 * @param distance
 * max distance for finding near residues
 * @returns {Array}
 * array of near residues id (group.id)
 */
function getNearResidue(group,distance)
{
	var nearRes = [];
	for(var i = 0; i < group.atoms.length; i++)
	{
		var atom = group.atoms[i];
		nearby = nearAtoms(atom,distance);
		for(var x = 0; x < nearby.length; x ++)
		{
			var nearAtom = group.structure.atoms[nearby[x]];
			
			//Checks if the atom is the oxygen ("O") of a water molecule
			if(nearAtom.group.id == atom.group.id){continue;}
			if(containsKey(nearRes, nearAtom.group.id)){continue;}
			nearRes.push(nearAtom.group.id);
		}
	}
	nearRes.sort();
	return nearRes;
}

/**
 * Goal: Find all the waters near a residue that are bonding another residue (Water Bridges) 
 * @param group
 * group object that is queried for bonded waters
 * @return {Array}
 * return all the nearby water id of the specified group that are bonded in turn to another group
 */
function GetBoundingWaters(group,distance)
{
	var waters = [];
	for(var i = 0; i < group.atoms.length; i++)
	{
		var atom = group.atoms[i];
		if(!ELEMENTS.isHeteroAtom(atom.element)){continue;}
		if(group.isWater()){continue;}
		nearby = nearAtoms(atom,distance);
		for(var x = 0; x < nearby.length; x ++)
		{
			var nearAtom = group.structure.atoms[nearby[x]];
			
			//Checks if the atom is the oxygen ("O") of a water molecule
			if(nearAtom.group.id == atom.group.id){continue;}
			if (!nearAtom.group.isWater()){continue;}
			if (nearAtom.element != "O"){continue;}
			
			//We have a water molecule at this point near the initial atom (var atom)
			var nearbyWater = nearAtoms(nearAtom,distance);
			for(var z = 0; z < nearbyWater.length; z ++)
			{
				var nearWater = group.structure.atoms[nearbyWater[z]];
				
				//Checks if the atom near this water atom is actually an heteroatom of a new group
				if (nearWater.group.isWater()){continue;}
				if(nearWater.group.id == nearAtom.group.id){continue;}
				if(nearWater.group.id == atom.group.id){continue;}
				if(containsKey(waters, nearAtom.group.id)){continue;}
				if(!ELEMENTS.isHeteroAtom(nearWater.element)){continue;}
				waters.push(nearAtom.group.id);
				break;
			}
		}
	}
	return waters;
}


/**
 * 
 * @param atoms
 * rray of atom
 * @param radius
 * distance for the contact to be accepted
 * @param crossChain
 * boolean: false does consider intra-chain contacts. True only considers inter-chain contacts
 * @returns
 */
function calcNeighbors(atoms, radius, crossChain)
{
	var nearbyAtoms = [];
	for(var i = 0; i  < atoms.length; i++)
	{
		var atom = atoms[i];
		var struct = atom.structure;
		var near = nearAtoms(atom,radius);
		for(var x = 0; x  < near.length; x++)
		{
			var nearatom = struct.atoms[near[x]];
			if(nearatom.group.name == atom.group.name)
			{
				continue;
			}
			
			if(!crossChain)
			{
				if(nearatom.chain.chainID != atom.chain.chainID)
				{
					nearbyAtoms.push(nearatom);
				}
			}
			else if (crossChain)
			{
				nearbyAtoms.push(nearatom);
			}
		}
	}
	return UniqueGroups(nearbyAtoms);
}