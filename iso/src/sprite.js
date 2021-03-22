/*-----------------------------------------------------------------------------------
action items:
- 	set scene as one of arguments to constructor and use it to draw
- 	console messages should only be printed when in debug mode
-	use scene's draw() functions to draw images as scene.useCanvas() will be removed
	and there won't be access to scene's canvas object anymore

-----------------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------------
sprite class
-----------------------------------------------------------------------------------*/
function sprite(thisImageFile)
{		
	// check if image file is passed
	if (typeof thisImageFile === 'undefined' ){ throw new Error("No image file is passed to sprite."); }

	// create image object and set this image file as its source
	var m_image = new Image();
	m_image.src = thisImageFile;
	m_image.isLoaded = false;
	m_image.parent = this;
			
	// add a reference to a canvas where this image file will be loaded
	m_image.canvas = document.createElement("canvas");
	if (!m_image.canvas){ throw new Error("Failed to create a canvas for an image object."); }	
	
	// as this image file is loaded, let's set the canvas size where this image will be loaded
	m_image.onload = function() 
	{                       
		// set the canvas size based on the actual size of the image
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;			
		
		// finally let's draw this image into its canvas
		this.canvas.getContext("2d").drawImage(this, 0, 0);
		
		// set the flag so we know that this file successfully loaded into image object
		this.isLoaded = true;
		
		console.log(this.src + "(" + this.canvas.width + "x" + this.canvas.height + ") is loaded successfully to sprite object.");		
		
		// allow sprite class to handle onload event for this image
		if (this.parent.onload) this.parent.onload();
	}	

	// this event happens when image source file fails to load e.g. file doesn't exist
	m_image.onerror = function()
	{
		this.isLoaded = false;
		throw new Error("Failed to load image source file. check if file exist."); 	 
	}
	
	// accessors
	this.width = function(){ return m_image.canvas.width; }
	this.height = function(){ return m_image.canvas.height; }
	this.isLoaded = function(){ return m_image.isLoaded; }
	this.getImage = function(){ return m_image; }

	/*-----------------------------------------------------------------------------------
	draw the image to canvas with option to use canvas or direct image
	-----------------------------------------------------------------------------------*/
	this.draw = function(cvs, x, y, useCanvas = true)
	{		
		// make sure image is loaded 
		if (!m_image.isLoaded) return;
		
		// make sure we are drawing to an actual scene object
		if (cvs.constructor !== HTMLCanvasElement){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image
		if (useCanvas){ cvs.getContext("2d").drawImage(m_image.canvas, x, y); }
		else { cvs.getContext("2d").drawImage(m_image, x, y); }
	}	
	
	/*-----------------------------------------------------------------------------------
	draw a portion of the image to a specified target
	-----------------------------------------------------------------------------------*/
	this.drawClip = function(cvs, sx, sy, swidth, sheight, x, y, width, height, useCanvas = true)
	{
		// make sure image is loaded 
		if (!m_image.isLoaded) return;   
		
		// make sure we are drawing to an actual scene object
		if (cvs.constructor !== HTMLCanvasElement){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image
 
		if (useCanvas){ cvs.getContext("2d").drawImage(m_image.canvas,sx, sy, swidth, sheight, x, y, width, height); }
		else { cvs.getContext("2d").drawImage(m_image, sx, sy, swidth, sheight, x, y, width, height); }		
	}
	
	/*-----------------------------------------------------------------------------------
	check if given position in the image intersects with a non transparent pixel
	-----------------------------------------------------------------------------------*/
}
