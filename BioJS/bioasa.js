
/**
 * February 18th
 * 
 * -> calcASA(atoms) seems to calculate the same value for 
 *    each amino acid of the same type. It has to be fixed!
 *    -> DONE
 * 
 * 
 * 
 * Class to calculate Accessible Surface Areas based on
 * the rolling ball algorithm by Shrake and Rupley.
 * I modified the algorithm so it considers Hydrogen atoms 
 * @param atoms
 * array of atoms as described by bioatom.js
 */
function Asa(atoms)
{
	var self = this;
	this.atoms = atoms;
	this.targetAtoms = [];
	this.asas = [];
	this.radii = [];
	this.nSpherePoints = 2000;
	this.spherePoints = generateSpherePoints(this.nSpherePoints); // array of [x,y,z] coordinates
	this.probe = 1.4;
	this.cons = 4.0 * Math.PI / this.nSpherePoints;
	this.nThreads = 1;
	// Bosco uses as default 960, Shrake and Rupley seem to use in their paper 92 (not sure if this is actually the same parameter) 
	for (var i=0;i<atoms.length;i++) 
	{
		self.radii[i] = ELEMENTS.getVdwRadius(atoms[i].element);
	}
	
	/**
	 * Calculates the Accessible Surface Areas for the atoms given in constructor and with parameters given.
	 * @param targetAtoms
	 * array of atom objects to be considered for the asa calculations
	 * @param exposed
	 * boolean flag:if true, the rest of the structure is ignored
	 *				Only the atoms in targetAtoms will be used for determining
	 *				the asa. This is a good flag to use to calculate the exposure 
	 *				of a free residue for ratio asa calculations 
	 * @return an array with asa values corresponding to each atom of the input array
	 */
	this.calcAsas = function(targetAtoms, exposed)
	{
		var asas = [];
		self.targetAtoms = targetAtoms;
		for (var i=0;i<targetAtoms.length;i++) 
		{	    	
			asas[i] = calcSingleAsa(targetAtoms[i].id, exposed);
			self.atoms[i].asa = asas[i];
		}
		return asas;
	}

	/**
	 * Returns list of 3d coordinates of points on a sphere using the
	 * Golden Section Spiral algorithm.
	 * @param nSpherePoints the number of points to be used in generating the spherical dot-density
	 * @return
	 */
	function generateSpherePoints(nSpherePoints)
	{
		var points = [];
		var inc = Math.PI * (3.0 - Math.sqrt(5.0));
		var offset = 2.0 / nSpherePoints; 
		for (var k = 0; k < nSpherePoints; k++) 
		{
			var y = k * offset - 1.0 + (offset / 2.0);
			var r = Math.sqrt(1.0 - y*y);
			var phi = k * inc;
			points[k] = [Math.cos(phi)*r, y, Math.sin(phi)*r];
		}
		return points;
	}

	/**
	 * Returns list of indices of atoms within probe distance to atom k.
	 * @param k index of atom for which we want neighbor indices
	 */
	function findNeighborIndices(k,exposed) 
	{
		// looking at a typical protein case, number of neighbours are from ~10 to ~50, with an average of ~30
		// Thus 40 seems to be a good compromise for the starting capacity
		var neighbor_indices = [];
		var atom = self.atoms[k];
		var radius = self.radii[k] + self.probe + self.probe;
		var nearby = nearAtoms(atom,radius+3)
		for(var i=0; i < nearby.length; i++)
		{
			var near = nearby[i];
			if(near == k){continue;}
			if(exposed)
			{
				var nearAtom = self.atoms[near];
				var found = false;
				for(var z = 0; z < self.targetAtoms.length; z ++)
				{
					if(self.targetAtoms[z] === nearAtom)
					{
						found = true;
					}
				}
				if(!found)
				{
					continue;
				}
			}
			var dist = getAtomSquaredDistance(atom,self.atoms[near]);
			if(dist < Math.pow(radius+self.radii[near],2))
			{
				neighbor_indices.push(near);
			}
		}
		return neighbor_indices;
	}

	function calcSingleAsa(i,exposed) 
	{
		var atom_i = self.atoms[i];
		var neighbor_indices = findNeighborIndices(i,exposed);
		var n_neighbor = neighbor_indices.length;
		var j_closest_neighbor = 0;
		var radius = self.probe + self.radii[i];

		var n_accessible_point = 0;

		for (var p = 0; p < self.spherePoints.length; p ++)
		{
			var point = self.spherePoints[p];
			var is_accessible = true;
			var test_point = [point[0]*radius + atom_i.coords[0],
					point[1]*radius + atom_i.coords[1],
					point[2]*radius + atom_i.coords[2]];

			var cycled_indices = [];
			var arind = 0;
			for (var ind = j_closest_neighbor;
					ind < n_neighbor; ind++) 
			{
				cycled_indices[arind] = ind;
				arind++;
			}
			for (var ind=0; ind < j_closest_neighbor; ind++)
			{
				cycled_indices[arind] = ind;
				arind++;
			}

			for (var tj = 0; tj < cycled_indices.length; tj++) 
			{
				var j = cycled_indices[tj];
				var atom_j = self.atoms[neighbor_indices[j]];
				var  r = self.radii[neighbor_indices[j]] + self.probe;
				var diff_sq = GEOMETRY.PointSqrDistance(test_point,atom_j.coords);
				if (diff_sq < r*r) {
					j_closest_neighbor = j;
					is_accessible = false;
					break;
				}
			}
			if (is_accessible) {
				n_accessible_point++;
			}
		}
		return self.cons*n_accessible_point*radius*radius;
	}
}
