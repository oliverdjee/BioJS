/**
 * BuildAtom() needs to be improved so it handles terminal SP3 atoms.
 * Currently it does only support terminal and non-terminal SP2 and
 * non-terminal SP3
 */


/**
 * 
 * @param distance
 * distance of the atom from the center
 * @param angle
 * angle of the atom from another atom given in connected atom
 * @param axis
 * axis of rotation (unit vector)
 * @param center
 * atom that is used as the center for building another atom
 * @param connectedAtoms
 * atoms used as contraints for building SP2 of SP3 or SP centers
 */

function AtomBuilder(distance, type, centerAtom, connectedAtoms)
{
	var self = this;
	this.SP3 = "SP3";
	this.SP2 = "SP2";
	this.SP = "SP";
	this.coords = null;
	this.center = [0.0,0.0,0.0];
	this.offset = [];
	this.distance = distance;
	this.Type = type;
	
	this.TetrahedronV1 = [0,1,-1/Math.sqrt(2)];
	this.TetrahedronV2 = [0,-1,-1/Math.sqrt(2)];
	this.TetrahedronV3 = [-1,0,1/Math.sqrt(2)];
	this.TetrahedronV4 = [1,0,1/Math.sqrt(2)];
	
	this.TriangleV1 = [1,0,0];
	this.TriangleV2 = [-0.5,-Math.sin(60/360*2*Math.PI)];
	this.TriangleV3 = [-0.5,Math.sin(60/360*2*Math.PI)];
	//Atoms already connected to the center
	this.connectedAtoms = [];

	Constructor();
	
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	
	function Constructor()
	{
		for(var i = 0; i < centerAtom.length; i++)
		{
			self.offset[i] = centerAtom[i];
		}
		for(var i = 0; i < connectedAtoms.length; i++)
		{
			self.connectedAtoms[i] = [];
			for(var x = 0; x < connectedAtoms[i].length; x++)
			{
				self.connectedAtoms[i][x] = connectedAtoms[i][x];
			}
		}
		OffsetConnectedAtoms();
	}
	

	function BuildCoords() 
	{
		if(self.connectedAtoms.length == 2 && self.Type === self.SP3)
		{
			var target1 = (self.connectedAtoms[0]);
			var target2 = (self.connectedAtoms[1]);
			var corner1 = Array.from(Object.create(self.TetrahedronV1));
			var corner2 = Array.from(Object.create(self.TetrahedronV2));
			var corner3 = Array.from(Object.create(self.TetrahedronV3));
			var corner4 = Array.from(Object.create(self.TetrahedronV4));
			
			//FINDING THE NORMAL OF THE NORMALS 
			//OF THE REFERENCE PLANE vs THE CONNECTED ATOMS PLANE
			//AND THE ANGLE BETWEEN THESE NORMALS FOR ROTATION
		    var normalToTarget 	= GEOMETRY.NormalVector(target1,target2);
		    var normalToTet 	= GEOMETRY.NormalVector(corner1,corner2);
		    var normalToBoth 	= GEOMETRY.NormalVector(normalToTet,normalToTarget);
		    
		    //ROTATE EVERYTHING SO NOW WE HAVE ALIGNED THE PLANES
		    var angleToBoth = GEOMETRY.AngleBetweenVectors(normalToTet,normalToTarget);
		    var sign = GEOMETRY.RotationAngleSign(normalToTet,normalToTarget);
		    var rotMatrix = GEOMETRY.RotationMatrix3D(normalToBoth,sign*angleToBoth);
		    corner1 = GEOMETRY.RotateVector(corner1,rotMatrix);
		    corner2 = GEOMETRY.RotateVector(corner2,rotMatrix);
		    corner3 = GEOMETRY.RotateVector(corner3,rotMatrix);
		    corner4 = GEOMETRY.RotateVector(corner4,rotMatrix);

		    //NOW WE MAKE THE FINAL ROTATION TO ALIGN THE CONNECTED ATOMS
		    //AND THE REFERENCE TETRAHEDRON ALL TOGETHER
		    normalToBoth = GEOMETRY.NormalVector(target1,corner1);
		    angleToBoth = GEOMETRY.AngleBetweenVectors(target1,corner1);
		    sign = GEOMETRY.RotationAngleSign(target1,corner1);
		    rotMatrix = GEOMETRY.RotationMatrix3D(normalToBoth,sign*angleToBoth);
		    corner1 = GEOMETRY.RotateVector(corner1,rotMatrix);
		    corner2 = GEOMETRY.RotateVector(corner2,rotMatrix);
		    corner3 = GEOMETRY.RotateVector(corner3,rotMatrix);
		    corner4 = GEOMETRY.RotateVector(corner4,rotMatrix);
			var Final1 = GEOMETRY.ScaleVector(corner3,self.distance);
			var Final2 = GEOMETRY.ScaleVector(corner4,self.distance);
			return[Final1,Final2];
		}
		
		if(self.connectedAtoms.length == 1 && self.Type === self.SP3)
		{
			var target1 = (self.connectedAtoms[0]);
			var corner1 = Array.from(Object.create(self.TetrahedronV1));
			var corner2 = Array.from(Object.create(self.TetrahedronV2));
			var corner3 = Array.from(Object.create(self.TetrahedronV3));
			var corner4 = Array.from(Object.create(self.TetrahedronV4));
		 
		    //NOW WE MAKE THE FINAL ROTATION TO ALIGN THE CONNECTED ATOMS
		    //AND THE REFERENCE TETRAHEDRON ALL TOGETHER
		    var normalToBoth = GEOMETRY.NormalVector(target1,corner1);
		    var angleToBoth = GEOMETRY.AngleBetweenVectors(target1,corner1);
		    var sign = GEOMETRY.RotationAngleSign(target1,corner1);
		    var rotMatrix = GEOMETRY.RotationMatrix3D(normalToBoth,sign*angleToBoth);
		    corner1 = GEOMETRY.RotateVector(corner1,rotMatrix);
		    corner2 = GEOMETRY.RotateVector(corner2,rotMatrix);
		    corner3 = GEOMETRY.RotateVector(corner3,rotMatrix);
		    corner4 = GEOMETRY.RotateVector(corner4,rotMatrix);
		    var Final1 = GEOMETRY.ScaleVector(corner2,self.distance);
			var Final2 = GEOMETRY.ScaleVector(corner3,self.distance);
			var Final3 = GEOMETRY.ScaleVector(corner4,self.distance);
			var Final4 = GEOMETRY.ScaleVector(corner1,self.distance);
			return[Final1,Final2,Final3,Final4];
		}
	}

	/**
	 * @author Olivier
	 * This function offsets the connected atom to 
	 * match the new center atom at (0,0,0)
	 */
	function OffsetConnectedAtoms() 
	{
		for (var i =  0; i < self.connectedAtoms.length; i++)
		{
			var d = self.connectedAtoms[i];
			d[0] -= self.offset[0];
			d[1] -= self.offset[1];
			d[2] -= self.offset[2];
		}
	}
	
	/**
	 * @author Olivier
	 * This function offsets the final coordinates created to match
	 * the initial coordinate of the center atom
	 */
	function OffsetFinalCoords() 
	{
		for(var i = 0; i < self.coords.length; i++)
		{	
			self.coords[i][0] += self.offset[0];
			self.coords[i][1] += self.offset[1];
			self.coords[i][2] += self.offset[2];
		}
	}
	
	function OffsetNormalVector(vector)
	{
		v = [vector[0],vector[1],vector[2]];
		v[0] += self.offset[0];
		v[1] += self.offset[1];
		v[2] += self.offset[2];
		return v;
	}
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	this.Build = function()
	{
		self.coords = BuildCoords();
		OffsetFinalCoords();
	}
	
	/**
	 * @param type
	 * choose from:"SP3","SP2" or "SP"
	 */
	this.setType = function(type)
	{
		self.Type = type;
	}
	
	this.getCoords = function()
	{
		return self.coords;
	}
	
	this.printNewCoords = function()
	{
		for(var i = 0; i < self.coords.length; i++)
		{
			var d = self.coords[i];
			var str = "New ("+self.Type+") Atomic Coordinates: "+d[0]+","+d[1]+","+d[2];
			console.log(str);
		}
		
	}
	
	this.setDistance = function(distance) 
	{
		self.distance = distance;
	}

	this.setAngle = function(angle)
	{
		self.angle = angle;
	}
}