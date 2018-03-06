const GEOMETRY =
{	
	NormalVector: function(vect1, vect2) {
		var v2 = GEOMETRY.Normalize(vect2);
		var v0 = GEOMETRY.Normalize(vect1);
		var normal = GEOMETRY.CrossProduct(v0, v2);
		normal = GEOMETRY.Normalize(normal);
		return [normal[0],normal[1],normal[2]];
	},

	Normalize: function(vector)
	{
		var len = GEOMETRY.VectorLength(vector);
		return([vector[0]/len,vector[1]/len,vector[2]/len]); 
	},

	/**
	 * 
	 * @param axis
	 * Must be a unit vector
	 * @param angle
	 * angle between 0 and 360
	 * @return
	 * Rotation matrix (3x3)
	 */
	RotationMatrix3D: function(axis, angle)
	{
		var rot = GEOMETRY.Matrix2D(3,3);
		rot[0][0] = Math.cos(angle)+Math.pow(axis[0],2)*(1-Math.cos(angle));
		rot[1][0] = axis[1]*axis[0]*(1-Math.cos(angle))+axis[2]*Math.sin(angle);
		rot[2][0] = axis[2]*axis[0]*(1-Math.cos(angle))-axis[1]*Math.sin(angle);
		rot[0][1] = axis[1]*axis[0]*(1-Math.cos(angle))-axis[2]*Math.sin(angle);
		rot[1][1] = Math.cos(angle)+Math.pow(axis[1],2)*(1-Math.cos(angle));
		rot[2][1] = axis[2]*axis[1]*(1-Math.cos(angle))+axis[0]*Math.sin(angle);
		rot[0][2] = axis[0]*axis[2]*(1-Math.cos(angle))+axis[1]*Math.sin(angle);
		rot[1][2] = axis[1]*axis[2]*(1-Math.cos(angle))-axis[0]*Math.sin(angle);
		rot[2][2] = Math.cos(angle)+Math.pow(axis[2],2)*(1-Math.cos(angle));
		return rot;
	},
	
	Matrix2D: function(sizeX,sizeY)
	{
		var matrix = [];
		for(var x = 0; x < sizeX; x++)
		{
			matrix.push(new Array())
			for(var y = 0; y < sizeY; y ++)
			{
				matrix[x].push(new Array());
			}
		}
		return matrix;
	},
	
	Matrix3D: function(sizeX,sizeY,sizeZ)
	{
		var matrix = [];
		for(var x = 0; x < sizeX; x++)
		{
			matrix.push(new Array())
			for(var y = 0; y < sizeY; y ++)
			{
				matrix[x].push(new Array());
				for(var z = 0; z < sizeZ; z ++)
				{
					matrix[x][y].push(new Array());
				}
			}
		}
		return matrix;
	},
	
	RotationAngleSign: function(vector1,vector2)
	{
		var sign = GEOMETRY.DotProduct(vector1,vector2);
		if(sign < 0)
		{
			return -1;
		}
		else
		{
			return 1;
		}
	},
	
	RotateVector: function(vector, RotationMatrix3D)
	{
		
		var newVector =  [];
		newVector[0] = RotationMatrix3D[0][0]*vector[0] +
							RotationMatrix3D[0][1]*vector[1] + 
								RotationMatrix3D[0][2]*vector[2];
		
		newVector[1] = RotationMatrix3D[1][0]*vector[0] + 
							RotationMatrix3D[1][1]*vector[1] + 
								RotationMatrix3D[1][2]*vector[2];
		
		newVector[2] = RotationMatrix3D[2][0]*vector[0] + 
							RotationMatrix3D[2][1]*vector[1] + 
								RotationMatrix3D[2][2]*vector[2];
		
		return newVector;
	},
	
	ScaleVector: function(vector,distance)
	{
		var newVector = [];
		var len = GEOMETRY.VectorLength(vector);
		newVector[0] = vector[0]*distance/len;
		newVector[1] = vector[1]*distance/len;
		newVector[2] = vector[2]*distance/len;
		return newVector;
	},

	/**
	 * Goal: Transform two points in space in a vector
	 * @param point1
	 * point in space represented by an array [x,y,z]
	 * @param point2
	 * point in space represented by an array [x,y,z]
	 * @returns {Array}
	 * a vector represented by an array [x,y,z]
	 */
	VectorizePoints: function(point1,point2)
	{
		var vector12 = GEOMETRY.SubstractVectors(point1,point2);
		return vector12;
	},

	/**
	 * Goal: This function calculates angles between two vectors
	 * @param vector1
	 * array [x,y,z]
	 * @param vector2
	 * array [x,y,z]
	 * @return {Number}
	 * returns the angle in **radians** between the vectors
	 */
	AngleBetweenVectors: function(vector1,vector2)
	{
		var len = GEOMETRY.VectorLength;
		var length1 = 	len(vector1);
		var length2 = 	len(vector2);
		var dot12 = GEOMETRY.DotProduct(vector1,vector2);
		var operand = dot12 / (length1 * length2);
		var angle = Math.acos(operand);
			
		return angle;
	},

	/**
	 * Goal: calculate the length of a vector
	 * @param vector
	 * array [x,y,z] coordinates
	 * @return{Number}
	 * returns the length of the vector
	 */
	VectorLength: function(vector)
	{
		var len = 	Math.sqrt(Math.pow(vector[0],2) + 
								Math.pow(vector[1],2) + 
									Math.pow(vector[2],2)
							  );
		return len;
	},
	

	PointSqrDistance:  function(point1,point2)
	{
		return (Math.pow(point1[0] - point2[0],2)+
					Math.pow(point1[1] - point2[1],2)+
						Math.pow(point1[2] - point2[2],2));
	},
	
	/**
	 * Goal: Check if vectors are aligned to prevent big errors in rotation Matrix
	 * @param v1, v2
	 * v1, v2 are BABYLON.Vector3 objects
	 * @param toleratedDeviation
	 * I suggest a deviation of < 0.00005 in any axis
	 */
	CheckIfVectorsAligned: function(v1, v2, toleratedDeviation)
	{
		if (v1[0] < v2[0] - toleratedDeviation 
				|| v1[0] > v2[0] + toleratedDeviation ) 
		{
			return false;
		}
		else if (v1[1] < v2[1] - toleratedDeviation 
				|| v1[1] > v2[1] + toleratedDeviation) 
		{
			return false;
		}
		else if (v1[2] < v2[2] - toleratedDeviation
				|| v1[2] > v2[2] + toleratedDeviation)
		{
			return false;
		}

		return true;
	},
	
	/**
	 * @param vector1,vector2
	 * both vectors that are part of the same plane P1
	 * @param vector3,vector4
	 * both vectors that are part of the same plane P2
	 * @return {Number}
	 * return the torsion angle in radians with the sign according
	 * to the correct rotation;
	 */
	TorsionBetweenVectors: function (vector1,vector2,vector3,vector4)
	{
		var normal12 = GEOMETRY.CrossProduct(vector1,vector2);
		var normal34 = GEOMETRY.CrossProduct(vector3,vector4);
		var sign = GEOMETRY.DotProduct(normal12,vector34);
		if(sign < 0)
		{
			sign = -1;
		}
		else
		{
			sign = 1;
		}
		var angle = sign * GEOMETRY.AngleBetweenVectors(normal12,normal34);
		return angle;
	},

	/**
	 * 
	 * @param v1
	 * the vector to substract from v2 in the form [x,y,z]
	 * @param v2
	 * vector [x,y,z] 
	 * @returns {Array}
	 * v2-v1 [x,y,z]
	 */
	SubstractVectors: function(v1,v2)
	{
		return[v2[0]-v1[0],v2[1]-v1[1],v2[2]-v1[2]];
	},

	AddVectors: function(v1,v2)
	{
		return[v2[0]+v1[0],v2[1]+v1[1],v2[2]+v1[2]];
	},

	/**
	 * Goal: Calculate v1 dot v2
	 * @param vector1
	 * array [x,y,z] coordinates
	 * @param vector2
	 * array [x,y,z] coordinates
	 * @returns {Number}
	 * returns the dot product of v1 dot v2
	 */
	DotProduct: function(vector1,vector2)
	{
		var dot = vector1[0]*vector2[0] 
						+ vector1[1]*vector2[1] 
							+ vector1[2]*vector2[2];
		return dot;
	},

	/**
	 * Goal: Calculate Cross product "v1" x "v2"
	 * @param vector1
	 * array [x,y,z] coordinates
	 * @param vector2
	 * array [x,y,z] coordinates
	 * @returns {Array}
	 * returns the cross product of v1 cross v2
	 * which is the normal vector of v1 and v2 (perpendicular)
	 */
	CrossProduct: function(vector1,vector2)
	{
		var x = (vector1[1]*vector2[2]) - vector1[2]*vector2[1];
		var y = (vector1[2]*vector2[0]) - vector1[0]*vector2[2];
		var z = (vector1[0]*vector2[1]) - vector1[1]*vector2[0];
		var normal = [x,y,z];
		return normal;
	}
}