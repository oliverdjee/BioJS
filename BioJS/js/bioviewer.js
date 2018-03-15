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
 * @param name
 * This is the id of the canvas of the viewer
 * @param options
 * choose from:
 * 		viewMode: "ballnstick" or "spacefill"
 * 		colorMode: "cpk" or  "uniform"
 * 		progressBar: ProgressBar object as defined in domutils.js
 */
function BioViewer(structure,name,options)
{
	var self = this;
	this.structure = structure;
	this.width;
	this.height;
	this.canvas;
	this.engine; // Generate the BABYLON 3D engine
    this.Materials;
    this.scene;
	this.canvas;
	this.progressBar;
	this.engine; // Generate the BABYLON 3D engine
    this.Materials = null;
    this.scene = null;
    const ballnstick = "ballnstick";
    const spacefill = "spacefill";
    /**
     * CONSTRUCTOR
     */
    this.canvas = document.createElement("CANVAS")
    this.engine = new BABYLON.Engine(this.canvas, true);
	this.scene = new BABYLON.Scene(self.engine);
	this.progressBar = options.progressBar || new ProgressDialog("Generating 3D System...");
	var colorMode = options.colorMode || "uniform"; // "cpk" or "uniform"
	var viewMode = options.viewMode || spacefill; // "ballnstick" or "spacefill"
    createScene(structure);
    
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	
    
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
	    createScene(structure).then(function(){
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
	
	this.appendToDOM = function (element,height,width)
	{
		element.style.padding = "3px";;
		element.height = height;
		element.width = width;
		var startDate = new Date();
		var keys = {37: 1, 38: 1, 39: 1, 40: 1};
		//console.log("appending scene to DOM: "+element.id);
		self.height= height - 8;
		self.width=  width - 8;
		element.appendChild(self.canvas);
		self.canvas.style.margin = "0px auto";
		self.canvas.height = self.height;
		self.canvas.width = self.width;
		//self.addHoverInfo(element);
		self.canvas.addEventListener("mouseenter", function( event ) {
			disableScroll();
		});
		self.canvas.addEventListener("mouseout", function( event ) {
			enableScroll();
		});
		
		PrintElapsedTime(startDate, "Rendered to canvas in");
		
		

		function preventDefault(e) {
		  e = e || window.event;
		  if (e.preventDefault)
		      e.preventDefault();
		  e.returnValue = false;  
		}

		function preventDefaultForScrollKeys(e) {
		    if (keys[e.keyCode]) {
		        preventDefault(e);
		        return false;
		    }
		}

		function disableScroll() {
		  if (window.addEventListener) // older FF
		      window.addEventListener('DOMMouseScroll', preventDefault, false);
		  window.onwheel = preventDefault; // modern standard
		  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
		  window.ontouchmove  = preventDefault; // mobile
		  document.onkeydown  = preventDefaultForScrollKeys;
		}

		function enableScroll() {
		    if (window.removeEventListener)
		        window.removeEventListener('DOMMouseScroll', preventDefault, false);
		    window.onmousewheel = document.onmousewheel = null; 
		    window.onwheel = null; 
		    window.ontouchmove = null;  
		    document.onkeydown = null;  
		}
	}
	
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
	
	function createScene()
	{
		var startDate = new Date();
		var scene = self.scene;
		self.progressBar.show();
		var atoms = structure.atoms;
		var aMaterial = {};
	    var particleSize = 1.0;
	    scene.actionManager = new BABYLON.ActionManager(scene);
	    scene.selectedAtoms = [];
	    var pickedAtom = null;
	    var DEFAULT_COLORS = []
	    var current_colors = [];
	    var current_color = Math.floor(Math.random() * 56);
    	for(var i = 0; i < structure.chains.length; i++)
    	{
    		DEFAULT_COLORS.push(structure.chains[i].id);
    		current_colors.push(structure.chains[i].id);
    	}
		
		scene.ballscale = 1.0/1.20; //Balls and sticks
		scene.bondscale = 0.6; //Balls and sticks
		
		var AtomMesh = BABYLON.MeshBuilder.CreateSphere("AtomInstance", {segments: 6}, scene ,true);
		scene.meshes.pop();
	    var BondMesh = BABYLON.MeshBuilder.CreateCylinder("BondInstance",
		    			{diameter:scene.bondscale, height: 1, segments: 4}, scene);
	    var Bond_material = new BABYLON.StandardMaterial("BondMat", scene);
	    Bond_material.diffuseColor =  new BABYLON.Color3(0.85,0.85,0.85);
        BondMesh.material = Bond_material;
	    scene.meshes.pop();
		
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
	    InitSceneCamerasAndLights();
	    InitMaterials();
	    
	    var AfterBuild = function()
	    {
	    	addAtomClicking();
		    addSelectionZooming("z");
		    addFullScreenToggle("f");
		    addBfactorButton("b");
		    addAngleButton("a");
		    addTorsionButton("t");
		    addExposureButton("e");
		    addNearButton("n");
		    addCompleteButton("c");
		    addInfoButton("i");
		    addDistanceButton("d");
		    addHideButton("h");
		    addShowButton("s");
		    addIsolateButton("x");
		    addHydrogensButton("p");
		    addDownloadButton("o");
		    addChangeViewButton("q");
		    addChangeColorButton("w");
		    //DEBUGGING
		    addTestButton("r");
		    
		    self.engine.runRenderLoop(function () 
    		    	{ // Register a render loop to repeatedly render the scene
    		    		self.scene.render();
    		    	});
		    window.addEventListener("resize", function () 
    		     	{ // Watch for browser/canvas resize events
    		        	self.engine.resize();
    		        });
    
		    self.scene.onDispose = function() 
		    		{
			    		while (document.getElementById("atom_info")) {
			    			document.getElementById("atom_info").parentNode.removeChild(document.getElementById("atom_info"));
			    		}
		    		};
		    
		    PrintElapsedTime(startDate, "3D molecule generated in");
	    };
	    
	    CreateAtoms(CreateBonds);
	    
    	
		/**
		 * PULBIC FUNCTION
		 */
	    
	   
	    
	    /**
	     * PRIVATE FUNCTIONS
	     */
	    function InitSceneCamerasAndLights()
	    {
		    var center =  structure.centerOfMass;
		    var areaSize = structure.boxDimension;
	    	
	    	var camera = new BABYLON.ArcRotateCamera("cam", 0, 0, 10 , new BABYLON.Vector3(center[0], center[1], center[2]), scene);    
	    	camera.setPosition(new BABYLON.Vector3(center[0]-areaSize/1.66, center[1]-areaSize/1.66, center[2]-areaSize/1.66));
	    	camera.attachControl(self.canvas, true);    
		    
		    var light = new BABYLON.PointLight("pl", camera.position, scene);
		    light.intensity = 0.7;
			light.specular = new BABYLON.Color3(0, 0, 0);
			light.groundColor = new BABYLON.Color3(0, 0, 0);
	    }
	    
	    
	    function Rescale(mesh)
	    {
	    	if(viewMode==="ballnstick")
	    	{
	    		scene.ballscale = 1.0/1.2;
	    		if(mesh.isAtom === true)
	    		{
	    			var scale = ELEMENTS.getVdwRadius(mesh.element) * scene.ballscale; //1.20 is set to see bonds
	    	        mesh.scaling = new BABYLON.Vector3(scale,scale,scale);
	    		}
	    	}
	    	
	    	else if(viewMode==="spacefill")
	    	{
	    		scene.ballscale = 1.2;
	    		if(mesh.isAtom === true)
	    		{
	    			var scale = ELEMENTS.getVdwRadius(mesh.element) * scene.ballscale; //1.20 is set to see bonds
	    	        mesh.scaling = new BABYLON.Vector3(scale,scale,scale);
	    		}
	    	}
	    }
	    
	    function InitMaterials()
	    {
	    	
	    	aMaterial.Picked = new BABYLON.StandardMaterial("Pickedmat", scene);
	    	aMaterial.Picked.diffuseColor = new BABYLON.Color4(1.0, 1.0, 0.1,1.0);
	    	aMaterial.Hover = new BABYLON.StandardMaterial("Hovermat", scene);
	    	aMaterial.Hover.diffuseColor = new BABYLON.Color3(1.0, 0.41, 0.71);
	    	aMaterial.Hover.emissiveColor = new BABYLON.Color3(1.0, 0.41, 0.71);
	    	aMaterial.Hidden = new BABYLON.StandardMaterial("Hiddenmat", scene);
	    	aMaterial.Hidden.diffuseColor = new BABYLON.Color4(1.0, 1.0, 1.0,0);
			
	    	aMaterial.getColor = function(index)
			{

	    		if(index == 0){return BABYLON.Color3.FromHexString("#BCBABE");} // cool light gray
	    		if(index == 1){return BABYLON.Color3.FromHexString("#1995AD");} // cool ice blue

	    		if(index == 2){return BABYLON.Color3.FromHexString("#F1F3CE");} // cool ivory
	    		if(index == 3){return BABYLON.Color3.FromHexString("#F52549");} // cool pink
	    		
	    		//if(index == 2){return BABYLON.Color3.FromHexString("#336B87");} // cool blue
	    		//if(index == 3){return BABYLON.Color3.FromHexString("#763626");} // cool rust
	    		
	    		if(index == 4){return BABYLON.Color3.FromHexString("#2A3132");} // cool dark
	    		if(index == 5){return BABYLON.Color3.FromHexString("#66A5AD");} // cool blue
	    		
	    		if(index == 6){return BABYLON.Color3.FromHexString("#DE7A22");} // cool orange
	    		if(index == 7){return BABYLON.Color3.FromHexString("#20948B");} // cool cyan
	    		
	    		if(index == 8){return BABYLON.Color3.FromHexString("#BCBABE");} // cool light gray
	    		if(index == 9){return BABYLON.Color3.FromHexString("#1995AD");} // cool ice blue
	    		
	    		if(index == 10){return BABYLON.Color3.FromHexString("#F62A00");} // cool bright red
	    		if(index == 11){return BABYLON.Color3.FromHexString("#F1F3CE");} // cool ivory
	    		
	    		if(index == 12){return BABYLON.Color3.FromHexString("#F52549");} // cool pink
	    		if(index == 13){return BABYLON.Color3.FromHexString("#9BC01C");} // cool green

	    		if(index == 14){return BABYLON.Color3.FromHexString("#002C54");} // cool dark blue
	    		if(index == 15){return BABYLON.Color3.FromHexString("#CD7213");} // cool bronze
	    		
	    		if(index == 16){return BABYLON.Color3.FromHexString("#7CAA2D");} // cool green
	    		if(index == 17){return BABYLON.Color3.FromHexString("#CB6318");} // cool bronze
	    		
	    		if(index == 18){return BABYLON.Color3.FromHexString("#34888C");} // cool blue
	    		if(index == 19){return BABYLON.Color3.FromHexString("#F5E356");} // cool pastel yellow
	    		
	    		if(index == 20){return BABYLON.Color3.FromHexString("#556DAC");} // cool blue lapis
	    		if(index == 21){return BABYLON.Color3.FromHexString("#F79B77");} // cool salmon
	    		if(index == 22){return BABYLON.Color3.FromHexString("#755248");} // cool peppercorn

	    		if(index == 23){return BABYLON.Color3.FromHexString("#000B29");} // cool night blue
	    		if(index == 24){return BABYLON.Color3.FromHexString("#D70026");} // cool red
	    		if(index == 25){return BABYLON.Color3.FromHexString("#F8F5F2");} // cool pearl

	    		if(index == 26){return BABYLON.Color3.FromHexString("#E1315B");} // cool fuschia
	    		if(index == 27){return BABYLON.Color3.FromHexString("#008DCB");} // cool blue
	    		if(index == 28){return BABYLON.Color3.FromHexString("#EAB364");} // cool pale yellow

	    		if(index == 29){return BABYLON.Color3.FromHexString("#A5C3CF");} // cool blue
	    		if(index == 30){return BABYLON.Color3.FromHexString("#E59D5C");} // cool sand
	    		if(index == 31){return BABYLON.Color3.FromHexString("#A99F3C");} // cool green
	    		
	    		if(index == 32){return BABYLON.Color3.FromHexString("#52908B");} // cool turquoise
	    		if(index == 33){return BABYLON.Color3.FromHexString("#DDBC95");} // cool brown-purple
	    		if(index == 34){return BABYLON.Color3.FromHexString("#E7472E");} // cool orange-red

	    		if(index == 35){return BABYLON.Color3.FromHexString("#2F2E33");} // cool blue-black
	    		if(index == 36){return BABYLON.Color3.FromHexString("#D5D6D2");} // cool gray
	    		if(index == 37){return BABYLON.Color3.FromHexString("#3A5199");} // cool cobalt
	    		
	    		if(index == 38){return BABYLON.Color3.FromHexString("#E05858");} // cool light red
	    		if(index == 39){return BABYLON.Color3.FromHexString("#D5C9B1");} // cool oatmeal
	    		if(index == 40){return BABYLON.Color3.FromHexString("#5F968E");} // cool cyan
	    		
	    		if(index == 41){return BABYLON.Color3.FromHexString("#344D90");} // cool royal blue
	    		if(index == 42){return BABYLON.Color3.FromHexString("#5CC5EF");} // cool light blue
	    		if(index == 43){return BABYLON.Color3.FromHexString("#FFB745");} // cool yellow
	    		if(index == 44){return BABYLON.Color3.FromHexString("#E7552C");} // cool orange

	    		if(index == 45){return BABYLON.Color3.FromHexString("#444C5C");} // cool navy
	    		if(index == 46){return BABYLON.Color3.FromHexString("#CE5A57");} // cool pale red
	    		if(index == 47){return BABYLON.Color3.FromHexString("#78A5A3");} // cool green blue
	    		if(index == 48){return BABYLON.Color3.FromHexString("#E1B16A");} // cool light yellow
	    		
	    		if(index == 49){return BABYLON.Color3.FromHexString("#F55449");} // cool light red
	    		if(index == 50){return BABYLON.Color3.FromHexString("#1B4B5A");} // cool blue
	    		if(index == 51){return BABYLON.Color3.FromHexString("#8E7970");} // cool taupe
	    		if(index == 52){return BABYLON.Color3.FromHexString("#A1D6E2");} // cool ice blue

	    		if(index == 54){return BABYLON.Color3.FromHexString("#CB0000");} // cool red
	    		if(index == 55){return BABYLON.Color3.FromHexString("#3F6C45");} // cool basil green
			}
	    	
	    	
	    	self.Materials = aMaterial;
	    }
	    
	    function StructureBuilder(atom, i)
	    {
			//var particle = BABYLON.MeshBuilder.CreateSphere(atom.name, {segments: 6}, scene ,true);
	    	var particle = AtomMesh.clone(atom.name);
	    	particle = scene.meshes.pop();
	    	particle.isAtom = true;
	     	particle.isBond = false;
	     	particle.bonds = [];
			particle.position.x = atom.coords[0];
	        particle.position.y = atom.coords[1];
	        particle.position.z = atom.coords[2];
	        particle.id = atom.id;
	        particle.chainID = atom.group.chainID;
	        particle.chainIndex = atom.group.chain.id;
	        particle.selected = false;
	        particle.groupselected = false;
	        particle.chainselected = false;
	        particle.structureselected = false;
	    	
	        var element = atom.element;
	        particle.element = element;
	        
	        Rescale(particle);
	        //var color = ELEMENTS.getColor(element);//Vector of size 3 (R,G,B);
	        //var atomcolor = new BABYLON.Color4(color[0],color[1],color[2],1.0);
	        //var material = new BABYLON.StandardMaterial(atom.id, scene);
	        //material.diffuseColor = atomcolor;
	        //particle.material = material;
        	particle.chainColor = aMaterial.getColor(particle.chainIndex);
	        Recolor(particle);
	        
	        particle.isPickable = true; 
	    	
	        particle.actionManager = new BABYLON.ActionManager(scene);
	    	
	    	//ON MOUSE ENTER
	        particle.actionManager.registerAction(
	        		new BABYLON.ExecuteCodeAction(
	        				BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
	        					on_hover(ev);
	        					var newmat = aMaterial.Hover;
	        			        particle.material = newmat;
	    	}));
	    	
	    	//ON MOUSE EXIT
	    	particle.actionManager.registerAction(
	    			new BABYLON.ExecuteCodeAction(
	    					BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
	    						out_hover(ev)
	    						Recolor(particle);
	    	}));
	    	
	    	scene.meshes[atom.id] = particle;
	    	atom.isDisplayed = true;
	    }
	    
	    function CreateBonds()
	    {
	    	self.progressBar.setRange(50,100);
	    	InterruptedLoop(BondBuilder, atoms, 0, 0, AfterBuild, self.progressBar);
	    }
	    
	    function CreateAtoms(callback)
	    {
	    	self.progressBar.setRange(0,50);
	    	InterruptedLoop(StructureBuilder, atoms, 0, 0, callback, self.progressBar);
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
	    	//var bond = BABYLON.MeshBuilder.CreateCylinder("bond"+atom1.id+"_"+atom2.id,
	    	//		{diameter:scene.bondscale, height: distance}, scene);
	    	var bond = BondMesh.clone("bond"+atom1.id+"_"+atom2.id);
	    	bond.height = distance;
	    	bond.diameterTop = scene.bondscale;
	    	bond.diameterBottom = scene.bondscale;
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
	    
	    function on_hover(meshEvent)
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
            
            self.canvas.parentNode.appendChild(info);
        };
    	
        function out_hover(meshEvent)
        {
    		while (document.getElementById("atom_info")) {
    			document.getElementById("atom_info").parentNode.removeChild(document.getElementById("atom_info"));
    		}
        };
	    
	    function Recolor(sphere)
	    {
	    	if(sphere.isAtom === false){return;}
	    	
	    	//DEBUGGING PASSED
	    	if(sphere.selected == true)
	    	{
		        var material = aMaterial.Picked;
		        sphere.material = material;
	    	}
	    	else
	    	{
		    	var color = [0,0,0];
	    		if(colorMode === "cpk")
		    	{
		    		if(sphere.element == "O" || sphere.element == "N" || sphere.element =="H")
	    			{
		    			color = ELEMENTS.getColor(sphere.element);
	    			}
		    		else
		    		{
		    			color = sphere.chainColor || aMaterial.getColor(DEFAULT_COLORS[sphere.chainIndex]);
			    		color = [color.r,color.g,color.b];
		    		}
		    	}	
		    	else if(colorMode === "uniform")
		    	{
		    		color = sphere.chainColor || 9;
		    		color = [color.r,color.g,color.b];
		    	}
	    		
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
			        	InfoDialog("B-factor ("+atoms.length+" atoms): "
			        			+FormatNumberToString(calcBfactor(atoms),2," ",10,"right"), "OK");
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
			        		InfoDialog("Angle ("+atoms[0].name+"-"+atoms[1].name+"-"+atoms[2].name+"): "
			        				+FormatNumberToString(angle,2," ",10,"right"),"OK");
			        	}
			        	else
			        	{
			        		InfoDialog("Please select only 3 atoms", "OK");
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
			        		var dist = getAtomDistance(atoms[0],atoms[1]);
			        		InfoDialog("Distance ("+atoms[0].name+"-"+atoms[1].name+"): "
			        				+FormatNumberToString(dist,2," ",10,"right"),"OK");
			        	}
			        	else
			        	{
			        		InfoDialog("Please select only 2 atoms","OK");
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
			        		InfoDialog("Printing Atom Attributes:<br>"+atoms[0].printInfo("html"),"OK");
			        	}
			        	else
			        	{
			        		InfoDialog("Please select only 1 atom","OK");
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
			        		InfoDialog("Torsion angle ("+atoms[0].name+"-"+atoms[1].name+"-"+atoms[2].name+"-"+atoms[3].name+"): "
			        				+FormatNumberToString(angle,2," ",10,"right"),"OK");
			        	}
			        	else
			        	{
			        		InfoDialog("Please select only 4 atoms", "OK");
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addExposureButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var sel = self.getSelectedGroups();
			        	if(sel.length == 1)
			        	{
			    			var asa  = new Asa(self.structure.atoms);
			        		var buried = asa.calcAsas(sel[0].atoms,false);
                        	var exposed = asa.calcAsas(sel[0].atoms,true);
                        	var buried_sum = buried.reduce(add, 0);
                        	var exposed_sum = exposed.reduce(add, 0);
                        	var percentage = FormatNumberToString(buried_sum/exposed_sum*100,1," ",5,"right");
                        	InfoDialog("Exposure of "+sel[0].name+": "+percentage+"%","OK");
			        	
                        	function add(a,b)
                        	{
                        		return(a+b);
                        	}
			        	}
			        	else
			        	{
			        		InfoDialog("Please select only 1 group", "OK");
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
	    
	    function addHydrogensButton(key)
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
	    
	    function addDownloadButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	var atoms = [];
			        	var pdbtext = "";
			        	if(scene.selectedAtoms.length == 0)
			        	{
			        		pdbtext = structure.toPDB();
			        	}
			        	for(var i = 0; i < scene.selectedAtoms.length;i++)
			        	{
			        		var atom = structure.atoms[scene.meshes[scene.selectedAtoms[i]].id];
			        		pdbtext += atom.toPDB();	
			        	}
			        	PDButil.saveAs(structure.name+".pdb",pdbtext);
			        }
			    )
	    	);
	    }
	    
	    function addChangeViewButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () 
			        {	
			        	if(viewMode === "spacefill"){viewMode = "ballnstick";}
		        		else if(viewMode === "ballnstick"){viewMode = "spacefill";}
			        	if(scene.selectedAtoms.length === 0)
			        	{ 	
			        		for(var i = 0; i < scene.meshes.length; i++)
				        	{
				        		var mesh = scene.meshes[i]; 
				        		Rescale(mesh);
				        	}
			        	}
			        	else if(scene.selectedAtoms.length > 0)
			        	{ 	
			        		for(var i = 0; i < scene.selectedAtoms.length; i++)
				        	{
				        		var mesh = scene.meshes[scene.selectedAtoms[i]]; 
				        		Rescale(mesh);
				        	}
			        	}
			        }
			    )
	    	);
	    }
	    
	    /**
	     * THIS FUNCTION IS STRICLY FOR DEBUGGING PURPOSES
	     */
	   
	    function addChangeColorButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	if(colorMode === "uniform"){colorMode = "cpk";}
			        	else if(colorMode === "cpk")
			        	{
			        		colorMode = "uniform";
				        	current_colors = [];
				        	current_color = Math.floor(Math.random() * 56);
				        	for(var i = 0; i < structure.chains.length; i++)
				        	{
				        		current_colors.push(Math.floor(Math.random() * 56));
				        	}
			        	}
			        	
			        	if(scene.selectedAtoms.length === 0)
			        	{ 	
			        		for(var i = 0; i < scene.meshes.length; i++)
				        	{
			        			var mesh= scene.meshes[i];
			        			mesh.chainColor = aMaterial.getColor(current_colors[mesh.chainIndex]);
				        		Recolor(mesh);
				        	}
			        	}
			        	else if(scene.selectedAtoms.length > 0)
			        	{ 	
			        		for(var i = 0; i < scene.selectedAtoms.length; i++)
				        	{
			        			var mesh = scene.meshes[scene.selectedAtoms[i]];
			        			mesh.chainColor = aMaterial.getColor(current_color);
				        		Recolor(mesh);
				        	}
			        	}
			        }
			    )
	    	);
	    }
	    
	    function addTestButton(key)
	    {
	    	scene.actionManager.registerAction(
			    new BABYLON.ExecuteCodeAction(
			        {
			            trigger: BABYLON.ActionManager.OnKeyUpTrigger,
			            parameter: key
			        },
			        function () {
			        	alert(structure.name);
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
