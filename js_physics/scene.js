/*------------------------------------------------------------------------------------------------------------
VERSION UPDATES:
Version [4, 20201005]
-	updates
	-	Scene
		-	refactored Scene class by breaking code down to different classes. 
			-	inherits Draw class so it can behave like a 'canvas' where it can perform draw tasks
			-	inherits Sequencer class so it can perform event sequencing
		-	now using parseInt() on x.get() to remove the 'px' suffix of canvas.style.left. same with 
			canvas.style.top for y.get() property
		-	when position (x,y) and size (width,height) is changed, it will only fire up event handler
			if new value is different from current value
-	new feature
	-	Draw
		-	new class that encapsulates canvas draw functions and convenient property defines
		-	Canvas class now inherits this class
		-	Scene class also inherits this so it can also perform draw functions to its internal 
			canvas object
	-	Canvas
		-	new class that wraps the HTMLCanvasElement and features methods that encapsulates
			HTMLCanvasElement's draw functions conveniently

Version [3, 20200924]
-	bug fixes
	-	scene.start(), addEvent(), removeEvent()
		- 	fix a bug where removing an event may not occur if called too soon
		-	removeEvent now ensures a request to remove an event with reference to specified func()
			will be queued even if there's no event with this func() in the event list. this ensures
			that if an event with the same func() is added but is also in queue, will actually be 
			removed 
-	updates
	-	scene.start(), addEvent(), removeEvent() 
			-	event objects are not created anymore when adding new events. instead, the queue event
				object is turned into event object by adding required properties. the func() is now turned
				into event property. it was the event object before...
	-	scene
		-	detached event manager from scene class and create a new class called Sequencer and all the
			event management code are now transferred to this class. Scene now inherits from Sequencer
			to make use of the event management feature
	-	drawing on specified region and clipping outside of it
		-	we previously replaced canvas.clip with using offscreen canvas to draw on specific region and
			flip to main canvas. we now use a chained offscreen canvas to allow recursive clipping on
			frames with several levels of descendants. however, this solution seems slow, so we intend
			to optimize this later or probably look for a totally new solution
-	new feature
	- Sequencer
		-	this class contain the same exact code as the event manager in Scene class. we just detached
			it for better code organization		
	
Version [2, 20200923] changes, updates
-	new feature
	-	drawing on a clipped region
		-	previously, we're using canvas.clip to specify the region that is visible when we draw images.
			this is useful when drawing child frames that are partially outside its parent's extent. however
			this technique does not work when drawing multiple frames that are clipped. it results in undesired
			behavior
		-	we ditched the canvas.clip and come up with new solution > using offscreen canvas to draw images 
			that is clipped outside specified region and flip the offscreen canvas into main canvas

v1.01
-	removed setSize() and replaced with property setter .width and .height to handle setting size
-	removed setPos() and replaced with property setter .x and .y to handle setting top-left position
-	fixed a bug on .x and .y property setter where setting canvas.style.top/left, you must append the
	value with 'px'
-	updated getTextWidth() separating font type and size as function arguments
-	updated drawRectangle() by restructuring parameters. border is now an option as well as rounded corners
-	upated drawCircle() by restructuring parameters. border is now an option

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
DESIGN PHILOSOPY

-	canvas properties and defaults
	-	canvas borders are remove by default: canvas.style.borderStyle = "none none none none"	
	-   canvas.style.position defaults to "fixed". at the moment there's no method that can change this
		-	so canvas behaves like a background and all other html elements will be drawn on top of it.
		- 	this also exhibits behavior which disables scrollbars in browser.
		-	note that disabling scrollbar in browser can be achieve with document.body.style.overflow = "hidden";   

- 	draw functions
	-	function to draw rectangle has option to draw rounded corners
	- 	function to draw polygon has error check to ensure pts are array and of valid size
	- 	function to draw text has options to align it, set size, font, color

-	drawing image that is clipped outside specified region
	-	not using canvas.clip. it does not work with drawing multiple images with unique clipped regions
	-	new technique is to use offscreen canvas object to draw images that are clipped outside specified
		region and flip the offscreen canvas into the main canvas
	-	beginClip()
		-	anything drawn after this call will be drawn only within the specified region
		-	takes rectangular region as argument. anything drawn (partial or full) outside this region will be 
			clipped
	-	endClip()
		-	drawing goes back to normal. draw functions directly draw to main canvas


------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
-	definition
	- 	contains a list of events each with specific time interval and are all executed in a loop with 
		frequency based on their time interval
------------------------------------------------------------------------------------------------------------*/
function Sequencer()
{
	Object.defineProperty(this, "version", { configurable: true, get: function(){ return "1"; } });

	/*---------------------------------------------------------------------------------------------------
	functions to manage event loop. queueing event follows FIFO rule; if 2 same function is queued, the 
	next call to stop it will stop the first one in the list
	---------------------------------------------------------------------------------------------------*/
	var events = [];
	var intID;
	var eventQueue = [];
	
	/*---------------------------------------------------------------------------------------------------
	accessors
	---------------------------------------------------------------------------------------------------*/
	this.getNumEvents = function(){ return events.length; }

	/*---------------------------------------------------------------------------------------------------
	adjust the sleep time interval of the given event
	---------------------------------------------------------------------------------------------------*/
	this.setInterval = function(func, t)
	{
		for (var i = 0; i < events.length; i++)
		{ 
			if(func != events[i].func) continue;
			events[i].t = t; 
			return; 
		}
	}
	
	/*---------------------------------------------------------------------------------------------------
	add an event handler to list of events to process in application loop
	n - if set, this event will only be executed n steps
	t - event's time interval in milliseconds
	---------------------------------------------------------------------------------------------------*/
	this.addEvent = function(func, t, n)
	{
		var e = { func: func, t: t, n: n, add: true }
		eventQueue.push(e);
	}
	
	/*---------------------------------------------------------------------------------------------------
	queue up an event handler to be removed from the list. once safe to delete, it will be deleted
	@TODO: argument is event object not event.func; in addEvent() we're passing func, seems like
		   inconsistency there, deal with this when when refactoring
	---------------------------------------------------------------------------------------------------*/
	this.removeEvent = function(event)
	{
		// look for the first occurence of this event in the list starting at first-in
		for (var i = 0; i < events.length; i++)
		{ 			
			if(event == events[i]) 
			{
				// let's pause this event so it won't get updated anymore from here onwards...
				events[i].paused = true; 

				// set flag so that when clean up happens, it will acknowledge this event to be removed
				events[i].add = false;

				eventQueue.push(events[i]);
				return;
			}			
		}
		// if we reach this point, we might have requested to remove this event a little too soon when
		// the sequencer has not yet called start() to fire up previous requests such as addEvent(). to
		// ensure  we're removing this event (if it has previous addEvent request), let's queue it up here
		event.paused = true;
		event.add = false;
		eventQueue.push(event);				
	}
	
	/*---------------------------------------------------------------------------------------------------
	start the application loop at 1ms interval. 1ms is the fastest you can set
	execute one setInterval and fire up all events from it
	---------------------------------------------------------------------------------------------------*/
	var prev;
	this.start = function()
	{
		prev = new Date().getTime();
		intID = setInterval(function()
		{
			// snapshot time now
			var now = new Date().getTime();						
			
			// loop through all events 		
			for (var i = 0; i < events.length; i++)
			{ 
				events[i].now = now;
				
				// if it's the first time for this event
				if (events[i].first)
				{
					events[i].first = false;
					events[i].prev = now;
					continue;
				}
				
				// if this event is already stopped, let's not update it anymore.
				if(events[i].paused) continue;
		
				// if time elapsed more than this event's interval, let's fire it up
				if (now - events[i].prev > events[i].t)
				{
					// calculate how many steps the event has occured based on delta time between prev and now
					var step = Math.floor((now - events[i].prev)/events[i].t);					
					
					// calculate frame rate of this event. it updates every second
					events[i].frame++;
					if(now - events[i].start1sec >= 1000)
					{
						events[i].fps = events[i].frame / (now - events[i].start1sec) * 1000; // multipier 1000 is to convert ms to sec
						events[i].start1sec = now;
						events[i].frame = 0;
					}
										
					// update timers and fire up the event!
					events[i].func	({	step: step, 
									now: now, 
									fps: events[i].fps,
									prev: events[i].prev
									});				

					// update prev with the time slice that occured in this frame
					events[i].prev += (step * events[i].t);

					// if this event is to be executed at limited step, handle it here
					if (events[i].n != 'undefined' && events[i].n)
					{
						events[i].n -= step;
						if (events[i].n <= 0) this.removeEvent(events[i]);
					}
				}	
			}		
				
			// any event that is requested to be added or removed will be performed here.
			while(eventQueue.length)
			{
				// if to be added...
				if (eventQueue[0].add == true)
				{
					// just use the current event queue object and add required properties to make it an event object 
					eventQueue[0].func = eventQueue[0].func;
					eventQueue[0].t = eventQueue[0].t;
					eventQueue[0].first = true;		
					eventQueue[0].n = eventQueue[0].n;			
					eventQueue[0].paused = false;					
					eventQueue[0].step = 0;					
					eventQueue[0].start1sec = now;					
					eventQueue[0].fps = 0;					
					events.push(eventQueue[0]);
				}
				// if to be removed...
				else
				{				
					for (var i = 0; i < events.length; i++)
					{
						// we refer to function as reference if this event is the event we want to remove
						if( eventQueue[0].func == events[i].func) 
						{
							events.splice(i,1);
							break;
						}
					}
				}
				eventQueue.shift();				
			}			
		}.bind(this), 1);
	}
	
	// stop the sequencer  
	this.stop = function(){ clearInterval(intID); }				
}

/*------------------------------------------------------------------------------------------------------------
wrapper class for canvas object draw functions
------------------------------------------------------------------------------------------------------------*/
function Draw(canvas)
{
	Object.defineProperty(this, "version", { configurable: true, get: function(){ return "1"; } });

	// is canvas valid object?
	if (!(canvas instanceof HTMLCanvasElement)){ throw new Error(canvas + " is not HTMLCanvasElement."); }

	/*------------------------------------------------------------------------
	color can be set as #[XX][YY][ZZ] where XX is 8-bit red, YY is 8-bit 
	green, ZZ is 8-bit blue; #FFFF00 = yellow. option to make set 
	transparency #[XX][YY][ZZ][AA]; #FFFF0077 = semitransparent yellow
	setting transparency doesn't make sense though since it's a background 
	color; nothing will be drawn behind it
	------------------------------------------------------------------------*/	
    this.setBackgroundColor = function(color){ canvas.style.backgroundColor = color; }	

	/*------------------------------------------------------------------------
	turns background color to transparent, remove all borders, erase any 
	color fills within the canvas area
	------------------------------------------------------------------------*/	
	this.clear = function(){ canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); }

	/*------------------------------------------------------------------------
	get the top-left position of canvas in the document as well as its 
	width/height all in the form of 'rect' object
	------------------------------------------------------------------------*/	
	this.getBoundingClientRect = function(){ return canvas.getBoundingClientRect(); }

	/*------------------------------------------------------------------------
    property setter/getter wrappers
	------------------------------------------------------------------------*/

	// set or access canvas properties
	Object.defineProperty(this, "shadowBlur", { get: function(){ return canvas.getContext("2d").shadowBlur; }, set: function(e){ canvas.getContext("2d").shadowBlur = e; }});
	Object.defineProperty(this, "fillStyle", { get: function(){ return canvas.getContext("2d").fillStyle; }, set: function(e){ canvas.getContext("2d").fillStyle = e; }});
	Object.defineProperty(this, "strokeStyle", { get: function(){ return canvas.getContext("2d").strokeStyle; }, set: function(e){ canvas.getContext("2d").strokeStyle = e; }});
	Object.defineProperty(this, "shadowColor", { get: function(){ return canvas.getContext("2d").shadowColor; }, set: function(e){ canvas.getContext("2d").shadowColor = e; }});
	Object.defineProperty(this, "shadowOffsetX", { get: function(){ return canvas.getContext("2d").shadowOffsetX; }, set: function(e){ canvas.getContext("2d").shadowOffsetX = e; }});
	Object.defineProperty(this, "shadowOffsetY", { get: function(){ return canvas.getContext("2d").shadowOffsetY; }, set: function(e){ canvas.getContext("2d").shadowOffsetY = e; }});
	Object.defineProperty(this, "globalAlpha", { get: function(){ return canvas.getContext("2d").globalAlpha; }, set: function(e){ canvas.getContext("2d").globalAlpha = e; }});
	Object.defineProperty(this, "font", { get: function(){ return canvas.getContext("2d").font; }, set: function(e){ canvas.getContext("2d").font = e; }});
	Object.defineProperty(this, "textBaseline", { get: function(){ return canvas.getContext("2d").textBaseline; }, set: function(e){ canvas.getContext("2d").textBaseline = e; }});    

	/*------------------------------------------------------------------------
	draw another canvas into this canvas
	------------------------------------------------------------------------*/	
	this.drawImage = function(image, x, y)
	{ 
		if (image instanceof HTMLCanvasElement){ canvas.getContext("2d").drawImage(image, x, y); return; }
		if (image instanceof HTMLImageElement ){ canvas.getContext("2d").drawImage(image, x, y); return; }
		canvas.getContext("2d").drawImage(image.canvas, x, y); 
	}	
	this.drawImageRegionToTarget = function(image, sx, sy, sw, sh, x, y, w, h)
	{ 
		if (image instanceof HTMLCanvasElement){ canvas.getContext("2d").drawImage(image, sx, sy, sw, sh, x, y, w, h); return; }
		if (image instanceof HTMLImageElement ){ canvas.getContext("2d").drawImage(image, sx, sy, sw, sh, x, y, w, h); return; }
		canvas.getContext("2d").drawImage(image.canvas, sx, sy, sw, sh, x, y, w, h); 
	}	
	this.drawImageToTarget = function(image, x, y, w, h)
	{ 
		if (image instanceof HTMLCanvasElement){ canvas.getContext("2d").drawImage(image, x, y, w, h); return; }
		if (image instanceof HTMLImageElement ){ canvas.getContext("2d").drawImage(image, x, y, w, h); return; }
		canvas.getContext("2d").drawImage(image.canvas, x, y, w, h); 
	}

	this.drawImageToViewPort = function(image, x, y, vx, vy, vw, vh)
	{
		// if image is fully outside visible area, let's not bother
		if (x > vx + vw) return;
		if (x + image.width < vx) return;
		if (y > vy + vh) return;
		if (y + image.height < vy) return;

		// if image size is 0, don't bother
		if (image.width <= 0) return;
		if (image.height <= 0) return;

		// if visible area is 0, don't bother
		if (vw <= 0) return;
		if (vh <= 0) return;		
		
		// if top-left is outside visible region but is still partially visible
		var tx = x < vx? vx : x;
		var ty = y < vy? vy : y;
		
		// default size to draw is b.w/b.h but if there's a clipped area, we need to recalculate actual size
		var w = tx + image.width > vx + vw? vx + vw - tx : image.width;
		var h = ty + image.height > vy + vh? vy + vh - ty : image.height;

		// draw to our main canvas
		this.drawImageRegionToTarget(image, tx - x, ty - y, w, h, tx, ty, w, h);
	}		

	/*------------------------------------------------------------------------
	draw text
	------------------------------------------------------------------------*/	

	// wrapped canvas functions for text
	this.getTextWidth = function(text, size, font)
	{ 
		if (typeof font !== undefined && font){ canvas.getContext("2d").font = size + "px " + font; }
		return canvas.getContext("2d").measureText(text).width; 
	}

	this.drawText = function(	text, 
								x, y, // top-left position to draw
								w, h, // alignment rectangular area
								s, font = 'verdana', color = 'black', // font size, style, and color
								halign = 'left', // horizontal alignment - left, right, center
								valign = 'top', // vertical alignment - top, bottom, center
							)
	{
		var ctx = canvas.getContext("2d");

		// get width of font
		var tw = this.getTextWidth(text, s, font);
	
		// calculate top-left x,y position based on given alignment 
		//tx = x; // left
		//tx = x - (tw - w)/2; // center
		//tx = x - (tw - w); // right
		x -= (halign === 'left'? 0 : (tw - w) / (halign === 'right'? 1 : 2));
		y -= (valign === 'top'? 0 : (s - h) / (valign === 'bottom'? 1 : 2));
	
		// ensure there's no transparency or shadow
		ctx.globalAlpha = 1;
		ctx.shadowBlur = 0;

		// canvas will always align to top-left x,y as we managed the alignment ourselves
		ctx.textAlign = "left";
		ctx.textBaseline = "top";				
		
		// tell canvas font size, type, and color
		if (typeof font !== 'undefined' && font){ ctx.font = s + "px " + font; }
		if (typeof color !== 'undefined' && color){ ctx.fillStyle = color; }		

		ctx.translate(x, y);
		ctx.fillText(text, 0, 0);
		ctx.translate(-x, -y);
	}			

	/*------------------------------------------------------------------------
	draw line
	------------------------------------------------------------------------*/	
	this.drawLine = function(x0, y0, x1, y1, color, thickness)
	{		
		var ctx = canvas.getContext("2d");
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.lineWidth = thickness || 1;
		ctx.moveTo(x0, y0)
		ctx.lineTo(x1, y1)
		ctx.stroke();			
	}	

	/*------------------------------------------------------------------------
	draw circle
	------------------------------------------------------------------------*/	
	this.drawCircle = function(x, y, r, color, option = {bordercolor: "", borderwidth: 0})
	{
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);

		// draw fill
		if (typeof color != 'undefined')
		{
			ctx.fillStyle = color;
			ctx.fill();
		}		

		// draw border
		if (option.hasOwnProperty('bordercolor') && option.hasOwnProperty('borderwidth') )
		{
			if (option.borderwidth > 0)
			{
				ctx.lineWidth = option.borderwidth;
				ctx.strokeStyle = option.bordercolor; 
				ctx.stroke();			
			}
		}		
	}		

	/*------------------------------------------------------------------------
	draw rectangle with option to make corner rounded 
	------------------------------------------------------------------------*/	
	this.drawRectangle = function(x, y, 					// top-left position
									w, h, 					// width, height
									color, 					// color fill in "rgb(1,1,1,1)"
									option = 				// option 
									{
										bordercolor: "", 	// border color in "rgb(1,1,1,1)"
										borderwidth: 0,		// border thickness
										radius:0, 			// corner radius
										topleft:false, 		// rounded top-left corner
										topright:false, 	// rounded top-right corner
										btmright:false, 	// rounded btm-right corner
										btmleft:false		// rounded btm-left corner
									})
	{
		var ctx = canvas.getContext("2d");

		if (!option.hasOwnProperty('radius') || option.radius <= 0 )
		{
			if (color) 
			{
				ctx.fillStyle = color;
				ctx.fillRect(x,y,w,h);
			}
			if (option.bordercolor && option.borderwidth > 0)
			{
				ctx.lineWidth = option.borderwidth;
				ctx.strokeStyle = option.bordercolor; 
				ctx.beginPath();
				ctx.rect(x,y,w,h);
				ctx.stroke();	
			}							
		}
		else
		{	
			ctx.beginPath();			
			ctx.moveTo(x + (option.topleft?option.radius: 0), y + 0);
			ctx.lineTo(x + w - (option.topright? option.radius:0), y + 0);
			if(option.topright) ctx.arcTo(x + w, y + 0, x + w, y + option.radius, option.radius);
			ctx.lineTo(x + w, y + h - (option.btmright?option.radius:0));
			if(option.btmright) ctx.arcTo(x + w, y + h, x + w - option.radius, y + h, option.radius);
			ctx.lineTo(x + (option.btmleft?option.radius:0), y + h);
			if(option.btmleft) ctx.arcTo(x + 0, y + h, x + 0, y + h - option.radius, option.radius);
			ctx.lineTo(x + 0, y + (option.topleft?option.radius:0));
			if(option.topleft) ctx.arcTo(x + 0, y + 0, x + option.radius, y + 0, option.radius);
			if(color){ ctx.fillStyle = color; ctx.fill(); }		
			if (option.bordercolor && option.borderwidth > 0)
			{ 
				ctx.lineWidth = option.borderwidth;
				ctx.strokeStyle = option.bordercolor; 
				ctx.stroke(); 
			}
		}
	}	

	/*------------------------------------------------------------------------
	draw polygon
	------------------------------------------------------------------------*/
	this.drawPolygon = function(	pts, 
									x, y, 
									color,
									option = 				// option 
									{
										bordercolor: "", 	// border color in "rgb(1,1,1,1)"
										borderwidth: 0,		// border thickness
									})
	{ 
		// is the pts array?
		if (!Array.isArray(pts))
		{
			throw new Error("ERROR on scene.drawPolygon(): pts is not a valid array");
			return;
		}
		// what is pts array size? it must be 6 or more
		if (pts.length < 6)
		{
			throw new Error("ERROR on scene.drawPolygon(): pts array size < 6");
			return;
		}

		var ctx = canvas.getContext("2d");

		ctx.beginPath();
		ctx.moveTo(x + pts[0], y + pts[1]);
		for (var i = 0; i < pts.length; i+=2)
		{
			ctx.lineTo(x + pts[i], y + pts[i+1]);
		}

		// draw line to 1st pt to close out the polygon
		ctx.lineTo(x + pts[0], y + pts[1]);

		if(color){ ctx.fillStyle = color; ctx.fill(); }		
		if (option.bordercolor && option.borderwidth > 0)
		{ 
			ctx.lineWidth = option.borderwidth;
			ctx.strokeStyle = option.bordercolor; 
			ctx.stroke(); 
		}
	}		
}

/*------------------------------------------------------------------------------------------------------------
wrapper class for HTMLCanvasElement
------------------------------------------------------------------------------------------------------------*/
function Canvas(w = 0, h = 0)
{
	// initialize the canvas element
	var canvas = document.createElement("canvas");
	if(!canvas){ throw new Error("Failed to create canvas."); }

	// inherit draw class
	Draw.call(this, canvas);

	// do this here to override version property of Draw class
	Object.defineProperty(this, "version", { configurable: true, get: function(){ return "1"; } });

	// provide property to access reference to canvas object
	Object.defineProperty(this, "canvas", { configurable: false, writeable: false, value: canvas });	

	// width property
	Object.defineProperty(this, "width", 
	{
		get: function(){ return canvas.width; },
		set: function(e)
		{
			if (e == canvas.width) return; // if value is same as we're setting, don't do anything
			canvas.width = e; // set new value for width			
		}
	});

	// height property
	Object.defineProperty(this, "height", 
	{ 
		get: function(){ return canvas.height; },
		set: function(e)
		{
			if (e == canvas.height) return; // if value is same as we're setting, don't do anything
			canvas.height = e; // set new value for height			
		}
	 });		
		
	// constructor
	canvas.width = w;
	canvas.height = h;
}

/*------------------------------------------------------------------------------------------------------------
implementation
------------------------------------------------------------------------------------------------------------*/
function Scene(src)
{
	/*------------------------------------------------------------------------
	inherited classes. scene is a sequencer, a canvas
	------------------------------------------------------------------------*/
	Sequencer.call(this);

	/*------------------------------------------------------------------------
	initialize the canvas element
	------------------------------------------------------------------------*/
	var canvas = {};

	// is there a src argument passed?
	if (src != undefined)
	{		
		// get the canvas element specified by 'src'
		canvas = document.getElementById(src);		
		
		// let's check if the referenced canvas exist
		if (!canvas)
		{
			// dynamically create canvas element
			console.log("canvas with id='" +src+ "' does not exist. Creating a new canvas...");
			canvas = document.createElement("canvas");
		}
	}
	// otherwise, if no canvas reference is passed, we create a new one
	else
	{
		console.log("no canvas reference passed, creating a canvas with id=" +src+ "...");
		canvas = document.createElement("canvas");
	}  	
	
	// at this point, canvas is either created or already exist so we do final verification
	if (canvas)
	{
		canvas.id = src;		
		document.body.appendChild(canvas);		
		console.log("canvas with id='" +canvas.id+ "' successfully created or already exists.");
	}
	else{ throw new Error("Failed to create canvas with id=" +src+ "."); }	

	/*------------------------------------------------------------------------
	initialize the canvas element
	------------------------------------------------------------------------*/
	Draw.call(this, canvas);

	// do this here so it overwrites teh 'version' property of Sequencer and Draw class
	Object.defineProperty(this, "version",  { get: function(){ return "4"; } });

	/*------------------------------------------------------------------------
    feature to allow secene to automatically resize canvas to fill document 
    area. can be enabled/disabled
	------------------------------------------------------------------------*/	
	
	// internal function that resizes the canvas
	var autoFitDocument = function(e)
	{
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.x = 0;
		this.y = 0;
	}.bind(this);

	// enable/disable auto resize canvas 
	var autofit = false;
	Object.defineProperty(this, "autofit", 
	{
		get: function(){ return autofit; },
		set: function(e)
		{
			autofit = e;
			if (autofit)
			{
				autoFitDocument();
				window.addEventListener("resize", autoFitDocument);				
			}
			else{ window.removeEventListener("resize", autoFitDocument); }
		}
	});

	/*------------------------------------------------------------------------
	wrapper for event handler functions for canvas element
	------------------------------------------------------------------------*/	
	this.addEventListener = function(evt, func){ canvas.addEventListener(evt, func); }
	this.removeEventListener = function(evt, func){ canvas.removeEventListener(evt, func); }

	/*------------------------------------------------------------------------
	handle x,y property, top-left position of canvas. dispatch "move" event 
	when width or these properties change
	------------------------------------------------------------------------*/
	Object.defineProperty(this, "x", 
	{
		get: function(){ return parseInt(canvas.style.left, 10); },
		set: function(e)
		{
			// if autofit to element we're associated at, set to 0 always
			if(autofit) e = 0;

			// if value is same as we're setting, don't do anything
			if (e == this.x) return;

			// set left pos of canvas 
			canvas.style.left = e + 'px';

			//CSS3 transform to move element, doing this for cross-browser compatibility
			canvas.style.MozTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";
			canvas.style.WebkitTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";
			canvas.style.OTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";

			// fire up a "move" event 
			var move = new CustomEvent("move",{ detail:{x: canvas.style.left, y: canvas.style.top}});
			canvas.dispatchEvent(move);		
		}
	});

	Object.defineProperty(this, "y", 
	{ 
		get: function(){ return parseInt(canvas.style.top, 10); },
		set: function(e)
		{
			// if autofit to element we're associated at, set to 0 always
			if(autofit) e = 0;

			// if value is same as we're setting, don't do anything
			if (e == this.y) return;

			// set top pos of canvas 
			canvas.style.top = e  + 'px';

			//CSS3 transform to move element, doing this for cross-browser compatibility
			canvas.style.MozTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";
			canvas.style.WebkitTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";
			canvas.style.OTransform = "translate(" + canvas.style.left + ", " + canvas.style.top + ")";
				
			// fire up a "move" event 
			var move = new CustomEvent("move",{ detail:{x: canvas.style.left, y: canvas.style.top}});
			canvas.dispatchEvent(move);		
		}
	});	

	/*------------------------------------------------------------------------
	handle width, height property. dispatch "resize" event when width or
	height has changed
	------------------------------------------------------------------------*/
	Object.defineProperty(this, "width", 
	{
		get: function(){ return canvas.width; },
		set: function(e)
		{
			// if autofit to element we're associated at, set to screen size always
			if(autofit) e = window.innerWidth;

			// if value is same as we're setting, don't do anything
			if (e == canvas.width) return;

			// set new value for width
			canvas.width = e;

			// create 'resize' event and dispatch it on canvas so anyone who listens to canvas' 'resize' event
			// will execute its corresponding event handler 
			var resize = new CustomEvent("resize",{ detail:{ width: canvas.width, height: canvas.height }});
			canvas.dispatchEvent(resize);
		}
	});

	Object.defineProperty(this, "height", 
	{ 
		get: function(){ return canvas.height; },
		set: function(e)
		{
			// if autofit to element we're associated at, set to screen size always
			if(autofit) e = window.innerHeight;

			// if value is same as we're setting, don't do anything
			if (e == canvas.height) return;

			// set new value for height
			canvas.height = e;

			// create 'resize' event and dispatch it on canvas so anyone who listens to canvas' 'resize' event
			// will execute its corresponding event handler 
			var resize = new CustomEvent("resize",{ detail:{ width: canvas.width, height: canvas.height }});
			canvas.dispatchEvent(resize);
		}
	 });	

	/*------------------------------------------------------------------------
    initialize default settings
    ------------------------------------------------------------------------*/	
    canvas.style.position = "fixed";        			// canvas will behave like a background and other html element will be on top of it. scrollbars are also disabled in browser
	this.autofit = true;                  				// fills document area by default
	canvas.style.borderStyle = "none none none none";	// set "none" to all sides of the rectangle to remove all the borders of canvas element
}

export {Scene};