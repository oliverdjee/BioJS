/**
 * @param options
 * showSlider: true or false if a slider for responsive motif is required
 * cutoff: percentage value of initial cutoff for the motif
 * sliderMin: int value for the minimal value of the slider cutoff range
 * sliderMax: int value for the maximum value of the slider cutoff range
 * sliderStep: value for the granularity of the slider
 * height: height of motif
 * tolerance: 	number of amino acids tolerated per position before assuming a tolerant 
 * 				position which will be represented by an "X"
 * parent: parent element to display the motif (DOM element)
 * width: width of motif
 * folder: folder of the images for the motif relative or full path(string)
 * title: title for the motif or not (string)
 * columnsTitle: array of titles for each motif columns ([string,string,...])
 */
function BioMotif(sequences, options)
{
	if(options === undefined){options = {};}

	var self = this;
	this.structure = options.structure || null;
	this.sequences = sequences;
	this.parent = options.parent || null;
	var showSlider = options.showSlider || false;
	var sliderMin = options.sliderMin || 0;
	var sliderMax = options.sliderMax || 10;
	var sliderStep = options.sliderStep || 0.1;
	var cutoff = options.cutoff || 1.0;
	var tolerance = options.tolerance || 10;
	var title = options.title || undefined;
	var col_title = options.columnsTitle || undefined;
	var folder = options.folder || undefined;
	var motif = null;;
	var data = null;
	var slider = null;
	var motifpackage = null;
	var motifcontainer = null;
	var height = options.height || "300px";
	var width = options.width || "100%";
	var onSliderChange = null;
	var motifOptions = {title:title,
			columnsTitle:col_title,
			folder:folder,
			width:width,
			height:height,
			tolerance:tolerance}
	
	/**
	 * MAIN CODE
	 */
	
	init()
	
	/**
	 * CONSTRUCTOR
	 */
	function init()
	{
		motifpackage = document.createElement("div");
		//motifpackage.style.height=height;
		//motifpackage.style.width=width;
		data = applyPerPositionCutOff(self.sequences,cutoff);
		motifcontainer = document.createElement("div");
		
		motif = createMotif(data,options);
    	motifcontainer.appendChild(motif);
    	motifpackage.appendChild(motifcontainer);
    	if(showSlider === true)
    	{
    		onSliderChange = function()
    		{
    			cutoff = parseFloat(slider.getValue());
    			self.updateMotif(cutoff);
    		}
    		slider = new BioSlider(sliderMin,sliderMax,cutoff,{onchange:onSliderChange,sliderStep:sliderStep});
    		motifpackage.appendChild(slider.getSlider());
    	}	
	}
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	
	this.setTolerance = function(number)
	{
		motifOptions.tolerance = number;
		tolerance = number;
	}
	
	this.setMotifTitle = function(newTitle)
	{
		motifOptions.title = newTitle;
		title = newTitle;
	}
	
	this.setMotifHeightAndWidth = function(newHeight,newWidth)
	{
		motifOptions.height = newHeight;
		height = newHeight;
		motifOptions.width = newWidth;
		width = newWidth;
	}
	
	/**
	 * @param newTitle
	 * new array of titles for each column of the motif
	 */
	this.setMotifColumnsTitle = function(newTitles)
	{
		motifOptions.columnsTitle = newTitles;
		col_title = newTitles;
	}
	
	this.setCutoff = function(number)
	{
		cutoff = number;
	}
	
	this.updateMotif = function(cutoff)
	{
		if(motifcontainer.contains(motif))
  		{
  			motifcontainer.removeChild(motif);
  		}
		data = applyPerPositionCutOff(self.sequences,cutoff);
    	motif = createMotif(data,motifOptions);
    	motifcontainer.appendChild(motif);
	}
	this.hideSlider = function()
	{
		if(motifpackage.contains(slider))
		{
			motifpackage.removeChilf(slider);
		}
	}
	this.showSlider = function()
	{
		if(!motifpackage.contains(slider))
		{
			motifpackage.appendChild(slider);
		}
	}
	this.getMotif = function()
	{
		return motifpackage;
	}
}

/**
 * Goal: A general slider applied for dynamic motif control
 * @param min
 * minimum value
 * @param max
 * maximum value
 * @param options
 * backgroundColor: as a string // default oatmeal
 * sliderStep: for controlling the slider's granularity;
 * onchange: function when the slider slides. To which element it should send its current value
 */
function BioSlider(min,max,value,options)
{
	if(options === undefined)
	{
		options = {};
	}
	var background_color = options.backgroundColor || "#D5C9B1"; // oatmeal as de
	var container = document.createElement("div");
	var slider = document.createElement("INPUT");
	var step = options.sliderStep || 0.05;
	var slidervalue = document.createElement("SPAN");
	var action = options.onchange;
	var onchange = function()
	{
		slidervalue.innerHTML = slider.value + "%"; //Default action updates the box
		action();
	}
	
	/**
	 * CONSTRUCTOR
	 */
	init();
	
	/**
	 * PUBLIC FUNCTIONS
	 */
	this.getValue = function()
	{
		return slider.value
	};
	this.getSlider = function()
	{
		return container;
	}
	
	/**
	 * PRIVATE FUNCTIONS
	 */
	function init()
	{
		slider.className = "bioslider";
		slider.backgroundColor = background_color;
		slider.setAttribute("type","range");
		slider.setAttribute("min", min);
		slider.setAttribute("max",max);
		slider.setAttribute("value",value);
		slider.setAttribute("step", step);
		slider.oninput = onchange;
									
								
		slidervalue.className = "bioslidervalue";
		
		container.className = "bioslidercontainer";
		container.appendChild(slider);
		container.appendChild(slidervalue);
		slidervalue.innerHTML = slider.value+"%";
	}
}
