/*-----------------------------------------------------------------------------------
VERSION: 1.0

-----------------------------------------------------------------------------------*/
 
/*-----------------------------------------------------------------------------------
sprite class
-----------------------------------------------------------------------------------*/
function Sprite(imagefile)
{		
    Object.defineProperty(this, "version",  { get: function(){ return "1.0"; } });

	// check if image file is passed
	if (typeof imagefile === 'undefined' ){ throw new Error("No image file is passed to sprite."); }

	// create image object and set this image file as its source
	var image = new Image();
	image.src = imagefile;
	image.parent = this;			
	
	// as this image file is loaded, let's set the canvas size where this image will be loaded
	image.onload = function() 
	{                       
		// add a reference to a canvas where this image file will be loaded
		this.canvas = document.createElement("canvas");
		if (!this.canvas){ throw new Error("Failed to create a canvas for an image object."); }	

		// set the canvas size based on the actual size of the image
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;			
		
		// finally let's draw this image into its canvas
		this.canvas.getContext("2d").drawImage(this, 0, 0);
		
		console.log(this.src + "(" + this.canvas.width + "x" + this.canvas.height + ") is loaded successfully to sprite object.");		
		
		// allow sprite class to handle onload event for this image
		if (this.parent.onload) this.parent.onload();
	}	

	// this event happens when image source file fails to load e.g. file doesn't exist
	image.onerror = function()
	{		
		throw new Error("Failed to load image source file. check if file exist."); 	 
	}
	
	/*-----------------------------------------------------------------------------------
	draw the image to canvas with option to use canvas or direct image
	-----------------------------------------------------------------------------------*/
	this.draw = function(elem, x, y, useCanvas = true)
	{		
		// make sure image is loaded 
		if (!image) return;
		if (!image.canvas) return;
		
		// make sure we are drawing to an actual scene object
		if (!(elem instanceof Scene) ){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image
		elem.drawImage( useCanvas? image.canvas : image, x, y); 
	}	
	
	/*-----------------------------------------------------------------------------------
	draw a portion of the image to a specified target
	-----------------------------------------------------------------------------------*/
	this.drawRegionToTarget = function(elem, sx, sy, swidth, sheight, x, y, width, height, useCanvas = true)
	{
		// make sure image is loaded 
		if (!image) return;
		if (!image.canvas) return;   
		
		// make sure we are drawing to an actual scene object
		if (!(elem instanceof Scene) ){ throw new Error("scene object passed is not valid."); }

		// round off the x and y coordinate because we noticed some wierd shifting if a coordinate contains decimal value
		x = Math.round(x);
		y = Math.round(y);
		
		// draw with option to draw canvas or direct image 
		elem.drawImageRegionToTarget(useCanvas? image.canvas : image, sx, sy, swidth, sheight, x, y, width, height); 
	}
	
	/*-----------------------------------------------------------------------------------
    properties getters
    -----------------------------------------------------------------------------------*/
    Object.defineProperty(this, "width",  { get: function(){ return image.canvas? image.canvas.width  : 0; } });
    Object.defineProperty(this, "height", { get: function(){ return image.canvas? image.canvas.height : 0; } });
    Object.defineProperty(this, "image",  { get: function(){ return image; } });
}

/*-----------------------------------------------------------------------------------
sprites (sprite sheet) class 

-   design consideration
-   properties
    -   fileNamePath
        - 	image file source with full path and file name
        - 	may contain a single or multiple frames of an animated image arranged this way:
            [0,1,2,]
            [3,4,5,]
            [6,7,8,]
        	where 0 is the first frame and 8 is the last

    -   width, height
        - size of 1 frame
-----------------------------------------------------------------------------------*/
function Sprites(fileNamePath, width, height)
{
    Object.defineProperty(this, "version",  { get: function(){ return "1.0"; } });

	// load the sprite sheet into sprite object
	var sprite = new Sprite(fileNamePath);		
		
	// allow sprites class to handle onload event for this sprite object
	sprite.parent = this;
	sprite.onload = function(){ if (this.parent.onload) this.parent.onload(); }		
    
    // draw specified frame
	this.drawFrame = function(elem, x, y, index, useCanvas = true)
	{		
		// calculate how many frames can fit within the image's width
		var framesPerRow = Math.floor(sprite.width / width); 

		// calculate the top-left coordinate in the image where this frame to be drawn is located
		var sx = (index % framesPerRow) * width;
		var sy = Math.floor(index/framesPerRow) * height;
		
		// draw 
		sprite.drawRegionToTarget(elem, sx, sy, width, height, x, y, width, height, useCanvas); 
	}		
	
	// draw the whole image
	this.draw = function(elem, x, y, useCanvas = true)
	{				
		// draw with option to draw canvas or direct image
		sprite.draw(elem, x, y, useCanvas);
	}		
		
}
