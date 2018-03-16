/**
 * AUTHOR: OLIVIER GAGNON
 * 
 * UTILITY FUNCTION TO BE DONE ON GROUPS,ATOMS,CHAINS,STRUCTURES,
 * AS DESCRIBED IN THE BIOJS SUITE
 * 
 * -> Add a function to calculate angle between three atoms
 *    This will allow me to add double bonds?
 *    -> DONE
 *    
 * -> Add function to calculate torsions between four atoms
 *    This will allow me to generate Phi-Psi charts and
 *    Ramachandran Plots
 *    -> DONE
 *    
 * -> Implement the progress bar in InterruptedLoop() function. It does not update correctly
 */



/**
 * Goal: Obtain squared distance between atoms
 * @param atom1
 * atom Object, as described in atom.js
 * @param atom2
 * atom Object, as described in atom.js
 * @returns
 * returns the squared distance between atoms, since taking 
 * the square root is an expensive operation computationally 
 */
function getAtomSquaredDistance(atom1,atom2)
{
	return GEOMETRY.PointSqrDistance(atom1.coords,atom2.coords);
}

function getAtomDistance(atom1,atom2)
{
	var coords1 = atom1.coords;
	var coords2 = atom2.coords;
	return Math.sqrt(GEOMETRY.PointSqrDistance(coords1,coords2));
}

/**
 * IMPROVE: When the Assignation of Fucntional group is implemented,
 * I will assign bond length based on functional groups and partial double bonds
 * Since those length will change depending on the delocalization of atoms
 * 
 * Goal validate bond length between atoms for bond 
 * assignment. this is based on predefined tables in the ELEMENTS constant
 * @param element1
 * String representing the element of the atom 1
 * @param element2
 * String representing the element of the atom 2
 * @param bondType
 * "double", "single" or "triple"
 * @param distanceToValidate
 * distance between both atoms to test
 * @return {Boolean}
 * returns a boolean true if the atoms are within a tolerated window near 
 * the expected bond length. False, if they are too far apart to create 
 * the bond tpe specified, accordinf to the bond length table in bioelement.js
 */
function ValidateBondLength(atom1,atom2,bondType)
{
	var element1 = atom1.element;
	var element2 = atom2.element;
	var dToV = getAtomDistance(atom1,atom2);
	if(element1 == "C" && element2 == "C")
	{
		if(bondType === "single")
		{
			return (dToV > (1.38+1.54)/2 && dToV < 1.65) ? true:false;
		}
		else if(bondType === "double")
		{
			return (dToV <= (1.38+1.54)/2 && dToV > (1.38+1.20)/2) ? true:false;
		}
		else if(bondType === "triple")
		{
			return (dToV <= (1.38+1.20)/2 && dToV > 1.10) ? true:false;
		}
	}
	else if(element1 == "C" && element2 == "O"
		||element2 == "C" && element1 == "O")
	{
		if(bondType === "single")
		{
			return (dToV > (1.21+1.43)/2 && dToV < 1.55) ? true:false;
		}
		else if(bondType === "double")
		{
			return (dToV <= (1.21+1.43)/2 && dToV > 1.10) ? true:false;
		}
		else if(bondType === "triple")
		{
			return true;
			// NOT IMPLEMENTED YET
		}
	}
	
	else if(element1 == "C" && element2 == "N" 
		|| element2 == "C" && element1 == "N")
	{
		if(bondType === "single")
		{
			return (dToV > (1.25+1.47)/2 && dToV < 1.57) ? true:false;
		}
		else if(bondType === "double")
		{
			return (dToV <= (1.25+1.47)/2 && dToV > (1.25+1.16)/2) ? true:false;
		}
		else if(bondType === "triple")
		{
			return (dToV <= (1.25+1.16)/2 && dToV > 1.05) ? true:false;
		}	
	}
	new BioError(BIOERRORS.LOG_TO_CONSOLE,BIOERRORS.BOND,[atom1,atom2], "Request to ValidateBondLength Not Good: What is "+bondType+"?");
	return false;
	
}
/**
 * Goal:Obtain center of mass of specific atoms
 * @param atoms
 * Array of atom objects, as described in atom.js 
 * @returns {Array}
 * returns the [x,y,z] coordinates of the centroid
 */
function getCentroidAtoms(atoms)
{
	var x,y,z;
	x = 0.0;
	y = 0.0;
	z = 0.0;
	for(var i = 0; i < atoms.length; i++)
	{
		x += atoms[i].coords[0];
		y += atoms[i].coords[1];
		z += atoms[i].coords[2];
	}
	return [x/atoms.length,y/atoms.length,z/atoms.length];
}

/**
 * Goal: Obtain average Bfactor of specific atoms
 * @param atoms
 * This is an array of atom Objects, as described in atom.js
 * @returns {Number}
 * return the Bfactor average of the atoms
 */
function calcBfactor(atoms)
{
	var bfactor = [];
	for(var i = 0; i < atoms.length; i++)
	{
		var mybfactor = atoms[i].bfactor;
		if(mybfactor > 0)
		{
			bfactor.push(mybfactor);
		}
	}
	var len = bfactor.length;
	var sum = bfactor.reduce(add, 0);
	return sum/len;

	/**
	 * PRIVATE FUNCTION
	 */
	function add(a, b) {
	    return a + b;
	}	
}

function getBoxDimension(structure)
{
	var maxX = -1000;
	var maxY = -1000;
	var maxZ = -1000;
	var minX = 1000;
	var minY = 1000;
	var minZ = 1000;
	var atoms = structure.atoms;
	for(var i = 0; i < atoms.length; i++)
	{
		if(atoms[i].coords[0] > maxX)
			{maxX = atoms[i].coords[0]};
		if(atoms[i].coords[0] < minX)
			{minX = atoms[i].coords[0]};
			
		if(atoms[i].coords[1] > maxY)
			{maxY = atoms[i].coords[1]};
		if(atoms[i].coords[1] < minY)
			{minY = atoms[i].coords[1]};

		if(atoms[i].coords[2] > maxZ)
			{maxZ = atoms[i].coords[2]};
		if(atoms[i].coords[2] < minZ)
			{minZ = atoms[i].coords[2]};
	}
	
	var x = maxX - minX;
	var y = maxY - minY;
	var z = maxZ - minZ;
	
	return Math.max(x, y, z)+10; //+10 is added just to make sure the box is big enough to contain
								 //all atoms
}

/**
 * Goal: Obtain angle in degrees between three consecutive atoms
 * @param atom1
 * atom object as described in atom.js. This atom is at one extremity.
 * @param atomCenter
 * atom object as described in atom.js. This is the atom that is in
 * the center of the three atoms
 * @param atom3
 * atom object as described in atom.js. This atom is at one extremity.
 * @returns {Number}
 * return the angle between the atoms in **degrees**
 */
function AngleBetweenAtoms(atom1,atomCenter,atom3)
{
	var vector21 = GEOMETRY.VectorizePoints(atomCenter.coords,atom1.coords);
	var vector23 = GEOMETRY.VectorizePoints(atomCenter.coords,atom3.coords);
	var angle = GEOMETRY.AngleBetweenVectors(vector21,vector23)/Math.PI*180; 
	return angle;
}

/**
 * Goal: determine if a ring is planar or not
 * @param ring
 * array of atom id forming a ring altogether
 * @param buffer
 * deviation from planarity to accept
 * @return
 * true if planar +- buffer, false otherwise
 */
function isRingPlanar(structure, ring, buffer)
{
	var atoms = structure.atoms;
	if(ring == null)
	{
		return false;
	}
	var len = ring.length;
	var angle = 0;
	var total = 0;
	if(len >= 5)
	{
		for(var i = 0; i < len - 3; i ++)
		{
			
			angle += Math.abs(TorsionBetweenAtoms(
					atoms[ring[i+0]],
					atoms[ring[i+1]],
					atoms[ring[i+2]],
					atoms[ring[i+3]]));
			total ++;
		}
		return (angle / total < buffer);
	}
	else
	{
		return true;
	}
}

/**
 * Goal: Calculate the torsion between atoms mainly for phi-psi
 * @param atom1
 * atom object as described in atom.js. for plane 1
 * @param atom2
 * atom object as described in atom.js. for plane 1 and 2
 * @param atom3
 * atom object as described in atom.js. for plane 1 and 2
 * @param atom4
 * atom object as described in atom.js. for plane 2
 * @returns {Number}
 * return the angle between planes (torsion) in **degrees**
 */
function TorsionBetweenAtoms(atom1,atom2,atom3,atom4)
{
	var vector12 = GEOMETRY.VectorizePoints(atom1.coords,atom2.coords);
	var vector23 = GEOMETRY.VectorizePoints(atom2.coords,atom3.coords);
	var vector34 = GEOMETRY.VectorizePoints(atom3.coords,atom4.coords);
	var normal13 = GEOMETRY.CrossProduct(vector12,vector23);
	var normal24 = GEOMETRY.CrossProduct(vector23,vector34);
	var sign = GEOMETRY.DotProduct(normal24,vector12);
	if(sign < 0)
	{
		sign = -1;
	}
	else
	{
		sign = 1;
	}
	var angle = sign * GEOMETRY.AngleBetweenVectors(normal13,normal24)/Math.PI*180;
	return angle;
}

/**
 * Goal: find the hybridization of an atom based on angles with other atoms
 * @param angle
 * the angle in degrees for the match
 * @returns {String}
 * return the most likely hybridization, based on the angle given as argument
 * 		either "SP", "SP2", "SP3"
 */
function MatchAngleToHybridization(angle)
{
	if(Math.abs(angle-109.5)  < Math.abs(angle-120))
	{
		return "SP3";
	}
	else if (Math.abs(angle-120)  < Math.abs(angle-180))
	{
		return "SP2";
	}
	else
	{
		return "SP";
	}
}




function UniqueGroups(atoms)
{
	var groups= [];
	var names = [];
	for(var i = 0; i < atoms.length; i ++)
	{
		if(!(containsKey(names,atoms[i].group.name)))
		{
			names.push(atoms[i].group.name);
			groups.push(atoms[i].group);
		}
	}
	return groups;
}

function UniqueSeqNum(groups)
{
	var nums = [];
	for(var i = 0; i < groups.length; i ++)
	{
		if(!(containsKey(nums,groups[i].resNum.seqNum)))
		{
			nums.push(groups[i].resNum.seqNum);
		}
		
	}
	return nums;
}

/**
 * SORTING FUNCTIONS
 */
function PIDsorting(pids)
{
	pids.sort(
		function(pid1, pid2)
		{
			var array1;
			var array2;
			var resultResID;
			if(pid1.includes("_") && pid2.includes("_")){
				array1 = pid1.split("_");
				array2 = pid2.split("_");
				var resultChainID = array1[0].localeCompare(array2[0]);
				
				var int1 = parseInt(array1[1]); 
				var int2 = parseInt(array2[1]); 
				
				if(int1<int2){resultResID=-1}
				else if(int1==int2){resultResID=0}
				else{resultResID=1}
				
				if(resultChainID == -1){return resultChainID;}
				else if(resultChainID == 0) {return resultResID;}
				else{return resultChainID;}
			}
			else
			{
				var int1 = parseInt(array1); 
				var int2 = parseInt(array2); 
				
				if(int1<int2){resultResID=-1}
				else if(int1==int2){resultResID=0}
				else{resultResID=1}
				
				return resultResID;
			}
		});
}

function GroupNameSort(groups)
{
	groups.sort(
		function(x, y)
		{
			var name1 = x.name;
			var name2 = y.name;
			var split = [];
			if(name1.includes("_"))
			{
				split.push(name1.split("_"));
			}
			else
			{
				split.push([" ",name1])
			}
			
			if(name2.includes("_"))
			{
				split.push(name2.split("_"));
			}
			else
			{
				split.push([" ",name2])
			}
			
			if(split[0][0] < split [1][0])
			{
				return -1
			}
			else if(split[0][0] > split [1][0])
			{
				return 1
			}
			else if(split[0][0] == split [1][0])
			{
				if(parseInt(split[0][1]) < parseInt(split[1][1]))
				{
					return -1
				}
				else if(parseInt(split[0][1]) > parseInt(split[1][1]))
				{
					return 1
				}
				else if(parseInt(split[0][1]) == parseInt(split[1][1]))
				{
					return 0;
				}
			}	
		});
}

/**
 * Goal: sorts a 2D array of single point mutant sequences per positions
 * @param sequences1
 * array of sequences for positions "x"
 * @param sequences2
 * array of sequences for positions "y"
 * @return{Number}
 * returns +1 if PID of sequence1 is bigger than PID of sequence2
 * returns  0 if PID of sequence1 is equal to PID of sequence2
 * returns -1 if PID of sequence1 is smaller than PID of sequence2
 */
function SequenceArrayPIDSorting(sequences)
{
	sequences.sort(
			function(sequence1, sequence2)
			{
	
				var _p1 = sequence1[0].residuesPID[0];
				var _p2 = sequence2[0].residuesPID[0];
				var sortList = [_p1,_p2];
				var result = PIDsorting(sortList);
				return result;
			});
}

function SeqNumSort(groups)
{
	groups.sort(
		function(x, y)
		{
			var name1 = parseInt(x);
			var name2 = parseInt(y);
			if(name1 < name2)
			{
				return -1;
			}
			else if(name1 > name2)
			{
				return 1;
			}
			else if(name1 == name2)
			{
				return -1;
			}
			
			
		});
}

/**
 * Goal: Look up a key in an array
 * @param array
 * The array to look into
 * @param key
 * The key in the array to look for
 * @returns {Boolean}
 * return true if key was found in array, false otherwise
 */
function containsKey(array,key)
{
	for(var i  = 0; i < array.length; i++)
	{
		var item = array[i];
		if(key == item)
		{
			return true;
		}
	}
	return false;
}

/**
 * Goal: Look up an object in a list
 * @param obj
 * The Object to look for in the List
 * @param list
 * The List to look into for the Object
 * @returns {Boolean}
 * return true if object was found in the list, false otherwise
 */
function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

/**
 * GOAL: To prevent the browser to freese, this interrupted loop is useful in async functions
 *       to prevent big loops over atoms of other data to take all of the single Thread used by
 *       the JavaScripts (JS always runs in Single Thread)
 * @param myFunc
 * This is the function to call that process the data of the array at a certain index
 * @param array
 * this is the array of data to be processed
 * @param index
 * this is the index in the array to process the data
 * @param interval
 * the interval to set a delay in the loop
 * @param delay
 * the amount in milliseconds of delay to apply at a certain interval
 * @param progressBarElement
 * Optional: if you want to add a progress bar, pass the DOM bar element as an argument
 */
function InterruptedLoop(myFunc, array, startIndex, delay, callback, progressBarElement)
{
	if(progressBarElement === undefined){progressBarElement = new ProgressDialog("Auto Generated Progress Bar...");}
	
	var length = array.length;
	var index = startIndex;
	var interval = 30;
	var process = function() 
	{
		for(var i = 0; i < interval && index < length; i++)
		{
			myFunc(array[index]);
			index++;
		}
		
		if(index < length)
		{
			progressBarElement.update(index,length);
			setTimeout(process, delay);
		}
		
		else
		{
			progressBarElement.update(index,length);
			callback();
		}
	};
	process();
}

/**
 * Goal: Prints the elapsed time for the current task
 * @param Title
 * this is the title to add in front of the elapsed time
 * @param startDate
 * Date() object at the time the task started
 */
function PrintElapsedTime(startDate, Title)
{
	var endDate = new Date();
	console.log(Title + " " + ((endDate.getTime() - startDate.getTime())/1000) +" seconds");
}