/**
 * february 15:
 * -> Added addAtomCliking() to have access to atoms info or actions on the system.
 *    Implementation of it is now required. The function only changes the
 *    Color of the picked atom as of right now.
 *    Access to selected atoms can be done via scene.selectedAtoms (array of index)
 *    
 * -> Implement Function calling of createScene
 *    Add options in the arguments for customizing the scene?
 *    
 * -> Improve Coloring and Scaling of spheres when they are created by adding the info
 *    to the ELEMENT enumeration in element.js
 *    Then calling a scaling(element) and coloring(element) method will be much cleaner
 *    -> DONE
 *    
 * -> Improve the interface to the "createScene" Method:
 *    Idea: Make an object for the engine and an internal
 *    function for the engine.createScene?
 *    -> DONE
 *    
 * -> Make atom info appear on hover of atom: addHoverInfo is glitch. 
 * 	  It does not show the span properly. Anyways, for now this feature is more
 *    annoying that useful. I will not implement it any further.
 *    The functionality was implemented so the info is shown at top left corner
 *    -> FIXED, DONE
 *    
 * -> Add overriding of the "ESC" (27) key in full-screen mode for proper resizing
 * 
 * 
 * March 6th 2018
 * 
 * -> Make the CreateScene a Self Contained class instead of a function
 * 
 * -> Improve the "UpdateViewer()" functinon to be more efficient. Right now, it deletes
 * 	  the BABYLON engine and then regenerates it with additionnal atoms. This is unefficient.
 *    this will require a Scene object/class.
 */	  


/**
 * Goal: Generate a Molecular Viewer, based on BABYLON JS, a 3D Game engine...
 * @param structure
 * the structure object to display
 * @param window
 * the window element of the page
 * @param document
 * the document in which the viewer is set up
 * @param element
 * The HTML DOM element to carry the canvas for the viewer (Normally a "div" element)
 * @param name
 * This is the id of the canvas of the viewer
 * @param height
 * height of the viewer
 * @param width
 * width of the viewer
 */
function BioViewer(structure,name,height,width)
{
	var self = this;
	this.width;
	this.height;
	this.canvas;
	this.engine; // Generate the BABYLON 3D engine
    this.Materials;
    this.scene;
    
	self.width = 0;
	self.height = 0;
	self.canvas = null;
	self.engine = null; // Generate the BABYLON 3D engine
    self.Materials = null;
    self.scene = null;
	
	if(width != null && height != null)
	{
		self.height = height;
		self.width =  width;
	}
    var newelement = document.createElement("CANVAS");
    newelement.id = name;
    self.canvas = newelement;
    self.engine = new BABYLON.Engine(self.canvas, true);
    createScene().then(function(){
    	 self.engine.runRenderLoop(function () 
    		    	{ // Register a render loop to repeatedly render the scene
    		    		self.scene.render();
    		    	});
    	window.addEventListener("resize", function () 
    		     	{ // Watch for browser/canvas resize events
    		        	self.engine.resize();
    		        });
    	}
    );
	
	/**
	 * PUBLIC FUNCTION
	 */
	this.appendToDOM = function(element,height,width)
	{
		self.height= height;
		self.width=  width;
		element.appendChild(self.canvas);
		self.canvas.height = height;
		self.canvas.width = width;
		self.addHoverInfo(element);
	}
	
	this.addHoverInfo = function(element)
    {	   	
    	var on_hover = function(meshEvent)
    	{
    		var info = document.createElement("p");
    		info.id = "atom_info";
            info.zIndex = 0;
            var sty = info.style;
            info.align ="left";
            sty.position = "absolute";
            sty.lineHeight = "1.2em";
            sty.paddingLeft = "2px";
            sty.paddingRight = "2px";
            sty.color = "black";
            sty.border = "1pt black";
            sty.backgroundColor = "beige";
            sty.font = "8px Consolas";
            sty.top = "5px";
            sty.left = "5px";

            var atom = structure.atoms[meshEvent.meshUnderPointer.id];
            var text = "Atom "+atom.name;
            var node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "X: "+atom.coords[0];
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Y: "+atom.coords[1];
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Z: "+atom.coords[2];
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Grp: "+atom.group.name;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Cla: "+atom.group.Class;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Hyb: "+atom.hybridization;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Elm: "+atom.element;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Ocp: "+atom.occupancy;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "B-f: "+atom.bfactor;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Impl H: "+atom.implicitH;
            node = document.createTextNode(text);
            info.appendChild(node);
            info.appendChild(document.createElement("br"));
            text = "Expl H: "+atom.explicitH;
            node = document.createTextNode(text);
            info.appendChild(node);
            
            element.appendChild(info);
        };
    	
        var out_hover = function(meshEvent)
        {
    		while (document.getElementById("atom_info")) {
    			document.getElementById("atom_info").parentNode.removeChild(document.getElementById("atom_info"));
    		}
        };
        
    	for(var i = 0; i < self.scene.meshes.length; i++)
        {
        	var sphere = self.scene.meshes[i];
        	if(sphere.isAtom)
        	{
        		sphere.actionManager.registerAction(
        	            new BABYLON.ExecuteCodeAction(
        	                BABYLON.ActionManager.OnPointerOverTrigger,
        	                on_hover
        	            )
        	        );
        	        sphere.actionManager.registerAction(
        	            new BABYLON.ExecuteCodeAction(
        	                BABYLON.ActionManager.OnPointerOutTrigger,
        	                out_hover
        	            )
        	        );

        	}
       	}
    	

    	self.scene.onDispose = function() {
    		while (document.getElementById("atom_info")) {
    			document.getElementById("atom_info").parentNode.removeChild(document.getElementById("atom_info"));
    		}
        };
    }
	
	this.getSelectedGroups = function()
	{
		var myatoms = [];
		for(var i = 0; i < self.scene.selectedAtoms.length; i++)
		{
			var index = self.scene.selectedAtoms[i];
			
			myatoms.push(structure.atoms[index]);
		}
		return(UniqueGroups(myatoms));
	}
	
	this.UpdateSelection = function()
	{
		self.scene.selectedAtoms = [];
		var atoms = structure.atoms;
		for(var i = 0; i < atoms.length; i++)
		{
			UpdateAtom(atoms[i]);
		}
		//console.log(self.scene.selectedAtoms);
	}
	
	this.UpdateViewer = function()
	{
		var element = self.canvas;
		var height = self.canvas.heigth;
		var width = self.canvas.width;
		
		while (element.firstChild) 
		{
			element.removeChild(element.firstChild);
		}
		
		self.scene.dispose();
		self.engine.dispose();
		
		self.engine = new BABYLON.Engine(self.canvas, true);
	    createScene().then(function(){
	    	 self.engine.runRenderLoop(function () 
	    		    	{ // Register a render loop to repeatedly render the scene
	    		    		self.scene.render();
	    		    	});
	    	window.addEventListener("resize", function () 
	    		     	{ // Watch for browser/canvas resize events
	    		        	self.engine.resize();
	    		        });
	    	}
	    );
	    self.addHoverInfo(element.parentNode);
	}
	
	/**
	 * PRIVATE FUNCTION
	 */
	
	function UpdateAtom(atom)
    {
    	if(atom.selected)
    	{
    		var sphere = self.scene.meshes[atom.id];
    		sphere.material = self.Materials.Picked;
    		sphere.selected = true;
    		self.scene.selectedAtoms.push(atom.id);
    	}
    	else
    	{
    		var sphere = self.scene.meshes[atom.id];
    		var color = ELEMENTS.getColor(atom.element);
    		var atomcolor = new BABYLON.Color4(color[0],color[1],color[2],1.0);
            var material = new BABYLON.StandardMaterial("atomMat", self.scene);
            material.diffuseColor = atomcolor;
            sphere.material = material;
            sphere.selected = false;
            sphere.groupselected = false;
            sphere.chainselected = false;
            sphere.structureselected = false;
    	}
    	
    }
		
	function SelectAtoms(item)
	{
		for(var j = 0; j < item.atoms.length; j++)
		{
			SelectAtom(item.atoms[j]);
		}
	}
	
	function SelectAtom(item)
	{
		self.scene.selectedAtoms.push(item.id);
		self.scene.meshes[item.id].material = self.Materials.Picked;
	}
	
	async function createScene()
	{
		var startDate = new Date();
		
		var atoms = structure.atoms;
		var aMaterial = {};
	    var center =  structure.centerOfMass;
	    var particleNb = atoms.length;      // even number please
	    var areaSize = structure.boxDimension;
	    var particleSize = 1.0;
	    var pickedAtom = null;
		var scene = new BABYLON.Scene(self.engine);
		scene.scale = 1/1.20; //Balls and sticks
		self.scene = scene;
		
		scene.zoom = function(zoomFactor,center)
		{
			var camera = scene.cameras[0];
			var position = new BABYLON.Vector3(center[0],center[1], center[2]);
			var direction = camera.position.subtract(position).normalize();
			direction.scaleInPlace(zoomFactor);
			camera.position = direction;
			var light = scene.lights[0];
			light.intensity = 0.8;
			light.position = camera.position;   
			camera.setTarget(position);
		}
	    scene.clearColor = new BABYLON.Color3(1, 1, 1);
	    var camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10 , new BABYLON.Vector3(center[0], center[1], center[2]), scene);    
	    camera.attachControl(self.canvas, true);
	    scene.actionManager = new BABYLON.ActionManager(scene);
	    scene.selectedAtoms = [];
	    var light = new BABYLON.PointLight("pl", camera.position, scene);
	    light.intensity = 0.7;
	    
	    camera.setPosition(new BABYLON.Vector3(center[0]-areaSize/1.66, center[1]-areaSize/1.66, center[2]-areaSize/1.66));
	    
	    InitMaterials();
	    CreateAtoms().then(CreateBonds().then(function(){
	    	addAtomClicking();
		    addSelectionZooming("z");
		    addFullScreenToggle("f");
		    addBfactorButton("b");
		    addAngleButton("a");
		    addTorsionButton("t");
		    addNearButton("n");
		    addCompleteButton("c");
		    addInfoButton("i");
		    addDistanceButton("d");
		    addHideButton("h");
		    addShowButton("s");
		    addIsolateButton("x");
		    //DEBUGGING
		    addTestButton("r");
		    PrintElapsedTime(startDate, "3D molecule displayed in")
	    }));
	    
		/**
		 * PULBIC FUNCTION
		 */
	    
	   
	    
	    /**
	     * PRIVATE FUNCTIONS
	     */
	    
	    function InitMaterials()
	    {
	    	aMaterial.Picked = new BABYLON.StandardMaterial("Pickedmat", scene);
	    	aMaterial.Picked.diffuseColor = new BABYLON.Color4(1.0, 1.0, 0.1,1.0);
	    	aMaterial.Hover = new BABYLON.StandardMaterial("Hovermat", scene);
	    	aMaterial.Hover.diffuseColor = new BABYLON.Color3(1.0, 0.41, 0.71);
	    	aMaterial.Hover.emissiveColor = new BABYLON.Color3(1.0, 0.41, 0.71);
	    	aMaterial.Hidden = new BABYLON.StandardMaterial("Hiddenmat", scene);
	    	aMaterial.Hidden.diffuseColor = new BABYLON.Color4(1.0, 1.0, 1.0,0);
			self.Materials = aMaterial;
	    }
	    
	    function StructureBuilder(atom, i)
	    {
			var particle = BABYLON.MeshBuilder.CreateSphere(atom.name, {segments: 6}, scene ,true);
			particle = scene.meshes.pop();
	    	particle.isAtom = true;
	     	particle.isBond = false;
	     	particle.bonds = [];
			particle.position.x = atom.coords[0];
	        particle.position.y = atom.coords[1];
	        particle.position.z = atom.coords[2];
	        particle.id = atom.id;
	        particle.selected = false;
	        particle.groupselected = false;
	        particle.chainselected = false;
	        particle.structureselected = false;
	    	
	        var element = atom.element;
	        particle.element = element;
	        
	        var scale = ELEMENTS.getVdwRadius(element) * scene.scale; //1.20 is set to see bonds
	        particle.scaling = new BABYLON.Vector3(scale,scale,scale);
	        
	        var color = ELEMENTS.getColor(element);//Vector of size 3 (R,G,B);
	        var atomcolor = new BABYLON.Color4(color[0],color[1],color[2],1.0);
	        var material = new BABYLON.StandardMaterial(atom.id, scene);
	        material.diffuseColor = atomcolor;
	        particle.material = material;
	        
	        particle.isPickable = true; 
	    	
	        particle.actionManager = new BABYLON.ActionManager(scene);
	    	
	    	//ON MOUSE ENTER
	        particle.actionManager.registerAction(
	        		new BABYLON.ExecuteCodeAction(
	        				BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
	        					var newmat = aMaterial.Hover;
	        			        particle.material = newmat;
	    	}));
	    	
	    	//ON MOUSE EXIT
	    	particle.actionManager.registerAction(
	    			new BABYLON.ExecuteCodeAction(
	    					BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
	    						Recolor(particle);
	    	}));
	    	
	    	scene.meshes[atom.id] = particle;
	    	atom.isDisplayed = true;
	    }
	    
	    async function CreateBonds()
	    {
	    	InterruptedLoop(BondBuilder, atoms, 0, 25, 0);
	    }
	    
	    async function CreateAtoms()
	    {
	    	InterruptedLoop(StructureBuilder, atoms, 0, 25, 0);
	    }
	    
	    function BondBuilder(atom)
	    {
	   		for(var b = 0; b < atom.bonds.length; b ++)
	   		{
	       		var atom2 = atoms[atom.bonds[b]];
	       		if(atom2.id > atom.id)
	       		{
	       			BondAtomsCylinder(atom, atom2, scene);
	       			//BondAtomsLines(atom1,atom2,scene);
	       		}
	   		}
	    }
	    
	    function BondAtomsLines(atom1,atom2,scene)
	    {
	    	var vstart = new BABYLON.Vector3(atom1.coords[0],atom1.coords[1],atom1.coords[2]);    
		   	var vend = new BABYLON.Vector3(atom2.coords[0],atom2.coords[1],atom2.coords[2]);
		    var myPoints = [vstart,vend];
		   	var bond = BABYLON.MeshBuilder.CreateLines("bond", {points:myPoints}, scene);
		   	bond.isAtom = false;
		   	bond.isBond = true;
		   	bond.id = scene.meshes.length-1;
		   	bond.color = new BABYLON.Color3(0.1,0.1,0.1);
		   	bond.atom1 = atom1.id;
		   	bond.atom2 = atom2.id;
	    }
	    
	    function BondAtomsCylinder(atom1,atom2,scene)
	    {
	    	var distance = getAtomDistance(atom1,atom2);
	    	var bond = BABYLON.MeshBuilder.CreateCylinder("bond"+atom1.id+"_"+atom2.id,
	    			{diameter:0.4, height: distance}, scene);
	    	bond.isAtom = false;
		   	//bond.color = new BABYLON.Color4(0.2,0.2,0.2,1.0);
		   	bond.atoms = []
		   	bond.atoms.push(scene.meshes[atom1.id]);
		   	scene.meshes[atom1.id].bonds.push(bond);
		   	bond.atoms.push(scene.meshes[atom2.id]);
		   	scene.meshes[atom2.id].bonds.push(bond);
		 	bond.isBond = true;
		 	bond.id = scene.meshes.length-1;
		 	
	    	var vstart = new BABYLON.Vector3(atom1.coords[0],atom1.coords[1],atom1.coords[2]);    
		   	var vend = new BABYLON.Vector3(atom2.coords[0],atom2.coords[1],atom2.coords[2]);
			var v1 = vend.subtract(vstart);
			var v2 = new BABYLON.Vector3(0, 1, 0);
	        v1.normalize();
			
			if (!GEOMETRY.CheckIfVectorsAligned([v1.x,v1.y,v1.z], [v2.x,-v2.y,v2.z],0.00005)) 
			{
				var axis = BABYLON.Vector3.Cross(v2, v1);
				axis.normalize();
				var angle = BABYLON.Vector3.Dot(v1, v2);
				angle = Math.acos(angle);
				bond.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
				bond.position = vend;
				bond.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
			}
			else
			{
				v2 = new BABYLON.Vector3(1, 0, 0);
				var axis = BABYLON.Vector3.Cross(v2, v1);
				axis.normalize();
				var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2)) + (2*Math.PI / 4);
				bond.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance / 2, 0));
				bond.position = vend;
				var quaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
				quaternion.w = -quaternion.w;
				bond.rotationQuaternion = quaternion;
			}
		}
	    
	    function Recolor(sphere)
	    {
	    	//DEBUGGING PASSED
	    	if(sphere.selected == true)
	    	{
		        var material = aMaterial.Picked;
		        sphere.material = material;
	    	}
	    	else
	    	{
		    	var color = ELEMENTS.getColor(sphere.element);
		    	var atomcolor = new BABYLON.Color4(color[0],color[1],color[2],1.0);
		        var material = new BABYLON.StandardMaterial("atomMat", scene);
		        material.diffuseColor = atomcolor;
		        sphere.material = material;
	    	}
	    }
	    /**
	     * @key
	     * the key to be pressed on the keyboard to trigger event
	     */
	    function addFullScreenToggle(key)
	    {
	    	this.canvasstyle = self.canvas.style;
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	
			        	if(!self.engine.isFullscreen)
			        	{
			        		self.canvas.style = "height:100vh; width:100vw";
			        		self.engine.switchFullscreen(false);
			        		self.engine.resize()
			        	}
			        	else
			        	{
			        		self.engine.switchFullscreen(false);
			        		self.canvas.style = self.canvasstyle;
			        		self.canvas.width = self.width;
			        		self.canvas.height = self.height;
			        		self.engine.resize()
			        		
			        	}
			        	
			        }
			    )
	    	);
	    }
	    
	    function addSelectionZooming(key)
	    {
	    	scene.actionManager.registerAction(
				    new BABYLON.ExecuteCodeAction(
				        {
				            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
				            parameter: key
				        },
				        function () {
				        	var atoms = [];
			    			var zoomFactor = 5;
			    			var center;
				        	for(var i = 0; i < scene.selectedAtoms.length;i++)
				        	{
				        		var sphere = scene.meshes[i];
				        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
				        		if(sphere.structureselected == true)
				    			{
				    				zoomFactor = 5
				    			}
				    			else if(sphere.chainselected == true 
				    					&& sphere.structureselected == false)
				    			{
				    				zoomFactor = 2
				    				
				    			}
				    			else if(sphere.chainselected == false 
				    					&& sphere.groupselected == true)
				    			{
				    				zoomFactor = 0.8;
				    			}
				    			
				    			else
				    			{
				    				zoomFactor = 0.2;
				    			}
				        	}
				        	if(atoms.length > 0)
				        	{
				        		center = getCentroidAtoms(atoms);
				        	}
				        	else
				        	{
				        		center = getCentroidAtoms(structure.atoms);
				        	}
			    			scene.zoom(zoomFactor,center);
				        }
				    )
		    	);
	    }
	    
	    function addAtomClicking()
	    {
	    	scene.onPointerDown = function (evt, pickingInfo) 
	    	{
				pickResult = scene.pick(scene.pointerX, scene.pointerY);
				if (pickResult.pickedMesh) {
					pickedAtom = pickResult.pickedMesh;
					if(pickedAtom.selected == false)
					{
						PickAtom(pickedAtom);
					}
					else if(pickedAtom.selected == true 
							&& pickedAtom.groupselected == false)
					{
						PickGroup(pickedAtom);
					}
					else if(pickedAtom.selected == true 
							&& pickedAtom.groupselected == true 
								&& pickedAtom.chainselected == false)
					{
						PickChain(pickedAtom);
					}
					else if(pickedAtom.selected == true 
							&& pickedAtom.groupselected == true 
								&& pickedAtom.chainselected == true
									&& pickedAtom.structureselected == false)
					{
						PickStructure(pickedAtom);
					}
					else if(pickedAtom.selected == true 
							&& pickedAtom.groupselected == true 
								&& pickedAtom.chainselected == true
									&& pickedAtom.structureselected == true)
					{
						PickNothing();
					}
				}
				else
				{
					//PickNothing();
				}
	    	}
		}
	    
	    
	    
	    /**
	     * @key
	     * String of the key to hit to trigger event
	     */
	    function addBfactorButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
			        	}
			        	alert("Bfactor: "+calcBfactor(atoms));
			        }
			    )
	    	);
	    }
	    
	    /**
	     * @key
	     * String of the key to hit to trigger event
	     */
	    function addAngleButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
			        	}
			        	if(atoms.length == 3)
			        	{
			        		var angle = AngleBetweenAtoms(atoms[0],atoms[1],atoms[2]);
			        		alert("Angle: "+angle);
			        	}
			        	else
			        	{
			        		alert("Please select 3 atoms");
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addDistanceButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
			        	}
			        	if(atoms.length == 2)
			        	{
			        		var dist = getDistance(atoms[0],atoms[1]);
			        		alert("Distance: "+dist);
			        	}
			        	else
			        	{
			        		alert("Please select 2 atoms");
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addInfoButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
			        	}
			        	if(atoms.length == 1)
			        	{
			        		alert("Printing Atom Attributes:\n"+atoms[0].printInfo("text"));
			        	}
			        	else
			        	{
			        		alert("Please select 1 atom");
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addTorsionButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		atoms.push(structure.atoms[scene.selectedAtoms[i]]);
			        	}
			        	if(atoms.length == 4)
			        	{
			        		var angle = TorsionBetweenAtoms(atoms[0],atoms[1],atoms[2],atoms[3]);
			        		alert("Torsion: "+angle);
			        	}
			        	else
			        	{
			        		alert("Please select 4 atoms");
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addNearButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		var atom = structure.atoms[scene.selectedAtoms[i]];
			        		var nearby = nearAtoms(atom,4);
			        		for(var x = 0; x<nearby.length; x++)
			        		{
			        			if(!containsKey(atoms,nearby[x]))
			        			{
			        				atoms.push(nearby[x]);
			        			}
			        		}
			        	}
			        	for(var i = 0; i < atoms.length;i++)
			        	{
			        		var atom = atoms[i];
			        		scene.meshes[atom].material = aMaterial.Picked;
							if(scene.meshes[atom].selected == false)
							{
								scene.meshes[atom].selected = true;
								scene.selectedAtoms.push(scene.meshes[atom].id);
							}
			        	}
			        	
			        }
			    )
	    	);
	    }
	    

	    function addCompleteButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		var mesh_atom = scene.selectedAtoms[i];
			        		var group = structure.atoms[mesh_atom].group.atoms;
			        		if(scene.meshes[mesh_atom].groupselected == true){continue;}
			    	   		for(var a = 0 ; a < group.length; a ++)
			    			{
			        			scene.meshes[group[a].id].material = aMaterial.Picked;
			   	    			if(scene.meshes[group[a].id].selected == false)
			   					{
			   						scene.selectedAtoms.push(group[a].id);
			   						scene.meshes[group[a].id].selected = true;
		    					}
		    					scene.meshes[group[a].id].groupselected = true;
			    	    	}
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addHideButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	
			        	while(scene.selectedAtoms.length > 0)
			        	{
			        		var mesh_atom = scene.meshes[scene.selectedAtoms.pop()];
			        		if(mesh_atom.isVisible)
			        		{
			        			mesh_atom.isVisible = false;
			        			for(var x = 0; x < mesh_atom.bonds.length; x++)
				        		{
				        			mesh_atom.bonds[x].isVisible=  false;
				        		}
			        		}
			        	}
			        	PickNothing();
			        }
			    )
	    	);
	    }
	    
	    function addShowButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () 
			        {       	
					    for(var i = 0; i < scene.selectedAtoms.length;i++)
				    	{
					    	var mesh_atom = scene.meshes[scene.selectedAtoms[i]];
							mesh_atom.isVisible = true;
							for(var x = 0; x < mesh_atom.bonds.length; x++)
				    		{
				    			var bond = mesh_atom.bonds[x];
				    			if(bond.atoms[0].isVisible && bond.atoms[1].isVisible)
				    			{
				    				bond.isVisible = true;
				    			}
				    		}
						}
			        }));
	    }
	    
	    function addIsolateButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	
			        	for(var i = 0; i < scene.meshes.length;i++)
			        	{
			        		var mesh_atom = scene.meshes[i];
			        		if(mesh_atom != null && mesh_atom.isAtom === true
			        				&& !containsKey(scene.selectedAtoms,mesh_atom.id))
			        		{
			        			mesh_atom.isVisible = false;
			        			for(var x = 0; x < mesh_atom.bonds.length; x++)
				        		{
				        			mesh_atom.bonds[x].isVisible=  false;
				        		}
			        		}
			        	}
			        }
			    )
	    	);
	    }
	    

	    /**
	     * THIS FUNCTION IS STRICLY FOR DEBUGGING PURPOSES
	     */
	   
	    function addTestButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		var atom = structure.atoms[scene.selectedAtoms[i]];
			        		atom.BuildImplicitH();
			        	}
			        	self.UpdateViewer();
			        }
			    )
	    	);
	  
	    }
	    function PickAtom(mesh_atom)
    	{
    		mesh_atom.material = aMaterial.Picked;
			if(mesh_atom.selected == false)
			{
				mesh_atom.selected = true;
				scene.selectedAtoms.push(mesh_atom.id);
			}
    	}
    	
    	function PickGroup(mesh_atom)
    	{
    		var group = atoms[mesh_atom.id].group.atoms;
    		for(var a = 0 ; a < group.length; a ++)
			{
    			scene.meshes[group[a].id].material = aMaterial.Picked;
    			if(scene.meshes[group[a].id].selected == false)
				{
					scene.selectedAtoms.push(group[a].id);
					scene.meshes[group[a].id].selected = true;
				}
				scene.meshes[group[a].id].groupselected = true;
			}
    	}
    	
    	function PickChain(mesh_atom)
    	{
    		var group = atoms[mesh_atom.id].chain.atoms;
    		for(var a = 0 ; a < group.length; a ++)
			{
				scene.meshes[group[a].id].material = aMaterial.Picked;
				if(scene.meshes[group[a].id].selected == false)
				{
					scene.selectedAtoms.push(group[a].id);
					scene.meshes[group[a].id].selected = true;
				}
				scene.meshes[group[a].id].selected = true;
				scene.meshes[group[a].id].groupselected = true;
				scene.meshes[group[a].id].chainselected = true;
				
			}
    	}
    	
    	function PickStructure(mesh_atom)
    	{
    		var group = atoms[mesh_atom.id].structure.atoms;
    		for(var a = 0 ; a < group.length; a ++)
			{
				scene.meshes[group[a].id].material = aMaterial.Picked;
				if(scene.meshes[group[a].id].selected == false)
				{
					scene.selectedAtoms.push(group[a].id);
					scene.meshes[group[a].id].selected = true;
				}
				scene.meshes[group[a].id].selected = true;
				scene.meshes[group[a].id].groupselected = true;
				scene.meshes[group[a].id].chainselected = true;
				scene.meshes[group[a].id].structureselected = true;
				
			}
    	}
    	
    	function PickNothing()
    	{
    		scene.meshes.forEach(function(m)
    		{
				if(m.isAtom == true) //this means it is an atom
    			{
					m.selected = false;
					m.groupselected = false;
					m.chainselected = false;
					m.structureselected = false;
					Recolor(m);
    			}
			});
    		scene.selectedAtoms = [];
    	}
	}
}
