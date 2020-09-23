/*------------------------------------------------------------------------------------------------------------
VERSION UPDATES

v1.01
-	added getMouseMove() member for Frame and Root to return reference to _mousemove object
-	changed the algorithm of both root and frame's event handler for element's mousemove event. this is to
	update it with the addition of new events - onmouseout and onmouseenter, as well as changing design
	philisophy of other events - onmouseleave and onmouseover
-	root.parent property returns NULL now as it should be. root does not have ascendants.
-	bug fixes
	-	root
		-	on findTopChildAtPoint(), checking if child is hidden is wrong. children.hide instead of 
			children[i].hide; 
-	new 
	-	ListBox
		-	new ui control element added. all known properties implemented and tested
		-	does not support multi-select
		-	list is vertical column only
-	updates
	-	slider
		-	setting any value for min, max is allowed and no checks we're being done. the intent is to let 
			application handle error and its effects. however, slider performs calculations on thumb position
			during ondrag, onmousedown, and thumb dragging where algorithms break when max = min, causing 
			div-0. this cannot be addressed outside slider class
		- 	onUpdateThumbPos()
			-	thumb.x,y is now set to 0,0 if max <= min and/or slider.size = slider.thumbsize
		-	ondrag(), onmousedown() 
			-	current value is not updated anymore if max <= min
		-	the changes made forces slider to not update/move the thumb and current values if max <= min 
		-	min, max events added so changes to min and max can have their respective event handlers now
		-	resize event added so changes to width and height can have event handlers now

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
action item:33444
-   why did we stopped firing up onmouseenter() for root? it is done on [20181231]. can we test why?

completed
-   hide property
    -   tested slider and frame objects successfully. when hidden, objects are also disabled and never 
        receives input
    -   decided root will not have hide property
-   hide, x, y, width, height, vertical, etc... are all turned into properties and setters/getters are
    defined


completed[20200825]
-	added min, max, curr as parameters to pass on draw event handlers
-	scene.width and .height are now properties. replaced .width() and .height() getters 

completed[20190105]
-	remove setParent() to all classes

completed[20181231]
-	removed console loggers for events
- 	replaced event handler arguments with objects so its easier to add new parameters in future. 
-	removed setEventHandlers(). addEventListeners() replaced them
-	add comments on slider's body onmousedown/drag event handlers to explain in more detail how thumb
	is repositioned
-	setEventHandlers() are also removed from slider class. event handlers for slider's body and thumb 
	are now set to be the same except for draw() event in which there's separate event for drawing body
	and and another for thumb
-	stopped firing up onmouseenter() for root. onmouseenter() is only supposed to fire up if mouse cursor
	moved to ui object FROM its sibling or parent.
-	in frame class, mousemove event handlers are only fired up if mouse IS NOT hovering to any of its child.

completed[20180316]
-	element parameter now expects it to be scene and not canvas

completed[20180311]
- 	slider control class implemented
-	mx, my now passed to mousedrag event
-	mouse cursor mx, my is now being passed to onmousedown, onmouseup, mousemove event handlers for 
	frame, root
-	remove findTopAtPoint() and updated findTopChildAtPoint() so it can do the same job as findTopAtPoint()

completed[20180307]
- 	handle mousemove, mouseleave, mouseenter event handlers for root and frame class and test them
- 	add name string as property

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
DESIGN PHILOSOPHY 

event:onmousemove
-	an event triggered by ui object when mouse cursor is hovering/moving over its extent
-	this event fires up everytime the mouse cursor changes coordinate while within the ui object's extent
- 	it does NOT fire up when mouse cursor is moving over ui object's child. instead it fires up on the
	child.

event:onmousedrag
-   an event triggered by ui object when mouse button is clicked and held down while its cursor is dragged
-   it is fired up during onmousemove event while the mouse button is held down

event:onmouseout
-	an event triggered by ui object when mouse cursor hovers over a ui object's descendants while it is 
	previously hovering the ui object itself
-	it fires up only once as soon as mouse cursor enters the extent of ui object's descendants.
-	use case: a frame with a button child. mouse cursor is moving over the frame and eventually hover over 
	the button child. frame.onmouseout() is fired up as soon as mouse cursor intersects button child's extent

event:onmouseleave
-	an event triggered by ui object when mouse cursor exits ui object's extent and now hovers its ascendants 
	or siblings.
-	it fires up only once as soon as mouse cursor exits the ui object's extent.	
-	counterpart of event:onmouseenter

event:onmouseenter
-	an event triggered by ui object when mouse cursor enters into ui object's extent while it's previously 
	outside of it, hovering over its ascendants or siblings.
-	counterpart of event:onmouseleave

event:onmouseover
-	an event triggered by ui object when mouse cursor exits its descendant's extent and is now hovering within
	the ui object's extent while not intersecting any of its other children
-	use case: a frame with a button child. mouse cursor is moving over the button child and eventually hover over 
	an area within the frame's extent that does not intersect the frame's other children, if there's any. 
	frame.onmouseover() is fired up as soon as mouse cursor is outside button child's extent
-	counterpart of event:onmouseout


------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
OUTSDANDING ISSUES THAT ARE IGNORED (FOR NOW)
-   call to element.getBoundingClientRect() on element.addEventListener("mousemove", function(e) is not 
    checked for existence. it is tested that error will log into debug console of browser but not 
    necessarily crash the application

------------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------------
root element. it all starts here.
    
-   design consideration
    - 	this class instantiates the main object in user interface
    - 	it binds to an element and resizes itself automatically to fit within its bounds/extent	by 
        listening to the element's "resize" event 
    - 	it doesn't need to be rendered as its purpose is for logic use
    -	the element it binds to is typically a scene element but it does not expect it to be.
        all it needs is the element's width and height and event handlers
    -	it's top-left position is always 0,0 and width, height is always equal to parent's width, heigh 
        as it always fit to fill its parent extents
    -   no x,y property (top-left coordinate) as it's always assumed to fill its parent element
    -   no hide property as it's not meant to be drawn, although it provides option to attach draw
        event handler in case user decides to draw some background that fills the ui area

-   properties
    -   name
        -   string name when it was created. constant so you can't change it
    -   parent
		-   returns NULL as root does not have ascendants
    -   width (w), height (h)
        -   width and height
        -   since root automatically fits into its parent element, you cannot set its size

------------------------------------------------------------------------------------------------------------*/
Root = function(element, name)
{	
    Object.defineProperty(this, "version",  { get: function(){ return "1.01"; } });

    // getter for name, parent. these are constants so no setter
    Object.defineProperty(this, "name", { get: function(){ return name; } });
    Object.defineProperty(this, "parent", { get: function(){ return null; } });

	/*--------------------------------------------------------------------------------------
	element is supposed to be a scene but this object does not expect it to be all it
	needs is the width/height of the object it will fit into
	--------------------------------------------------------------------------------------*/
	var w = element?( element.width ? element.width : 0): 0;
	var h = element?( element.height ? element.height : 0): 0;
	
    Object.defineProperty(this, "width", { get: function(){ return w; } });
	Object.defineProperty(this, "height", { get: function(){ return h; } });

	/*--------------------------------------------------------------------------------------
	will handle resize event from the object it binds to as it will resize itself to 
	always fit to it. note that canvas don't fire up resize event so the canvas of the
	scene this object binds to must have a custom event that fires up upon resize 
	--------------------------------------------------------------------------------------*/
	element.addEventListener("resize", function(e)
	{
		w = e?(e.detail.width? e.detail.width : 0): 0;
		h = e?(e.detail.height? e.detail.height : 0): 0;	

		// fire up event handler
		for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); } 
    }.bind(this));

	/*--------------------------------------------------------------------------------------
	assign event handlers. ui components can have multiple handlers for each event
	--------------------------------------------------------------------------------------*/
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	var mousemoveEvents = [];
	var mouseenterEvents = [];
	var mouseoutEvents = [];
	var mouseoverEvents = [];
	var sysmousedownEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "mousemove"){ mousemoveEvents.push(f); }
		if (e === "mouseenter"){ mouseenterEvents.push(f); }
		if (e === "mouseout"){ mouseoutEvents.push(f); }
		if (e === "mouseover"){ mouseoverEvents.push(f); }
		if (e === "sysmousedown"){ sysmousedownEvents.push(f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "mouseup"){ for (var i = 0; i < mouseupEvents.length; i++){ if (mouseupEvents[i] == f){ mouseupEvents.splice(i,1); return; }}}			
		if (e === "mousedown"){ for (var i = 0; i < mousedownEvents.length; i++){ if (mousedownEvents[i] == f){ mousedownEvents.splice(i,1); return; }}}			
		if (e === "mouseleave"){ for (var i = 0; i < mouseleaveEvents.length; i++){ if (mouseleaveEvents[i] == f){ mouseleaveEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
		if (e === "mousemove"){ for (var i = 0; i < mousemoveEvents.length; i++){ if (mousemoveEvents[i] == f){ mousemoveEvents.splice(i,1); return; }}}			
		if (e === "mouseenter"){ for (var i = 0; i < mouseenterEvents.length; i++){ if (mouseenterEvents[i] == f){ mouseenterEvents.splice(i,1); return; }}}			
		if (e === "mouseout"){ for (var i = 0; i < mouseoutEvents.length; i++){ if (mouseoutEvents[i] == f){ mouseoutEvents.splice(i,1); return; }}}			
		if (e === "mouseover"){ for (var i = 0; i < mouseoverEvents.length; i++){ if (mouseoverEvents[i] == f){ mouseoverEvents.splice(i,1); return; }}}			
		if (e === "sysmousedown"){ for (var i = 0; i < sysmousedownEvents.length; i++){ if (sysmousedownEvents[i] == f){ sysmousedownEvents.splice(i,1); return; }}}			
	}	    
    
	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child){ children.push(child); }
	this.removeChild = function(child){	for (var i = 0; i < children.length; i++) { if ( children[i] == child) { children.splice(i, 1); return; }}}
	this.getNumChildren = function(){ return children.length; }
	
	/*--------------------------------------------------------------------------------------
	this object doesn't really get rendered. its main purpose is to occupy the scene it 
	binds to. this function is used to render its child objects instead. however, an it 
	fires up a render event to allow application option in case users choose to
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{
        // execute all draw events for root. you can have more than 1 draw event handler if you want.
        for (var i = 0; i < drawEvents.length; i++){ drawEvents[i]({elem: this, name: name, w: w, h: h}); } 		
        
        // execute draw functions for all the root's children
		for(var i = 0; i < children.length; i++){if (children[i].draw) children[i].draw();}					
    }    
    
	/*--------------------------------------------------------------------------------------
	tests if coordinate mx, my is within its bounds,e.g. collision detection against mouse
	--------------------------------------------------------------------------------------*/
	this.intersect = function(mx, my)
	{
		if (mx > w) return false;
		if (my > h) return false;
		if (mx < 0) return false;
		if (my < 0) return false;		
		return true;
    }	    
    
	/*--------------------------------------------------------------------------------------
	takes the given child object t and if it exist in children list will be moved to top
	--------------------------------------------------------------------------------------*/
	this.sendChildToTop = function(t)
	{
		for (var i = 0; i < children.length; i++)
		{
			if(children[i] == t)
			{
				children.splice(i,1);
				children.push(t);
				return;
			}
		}
	}

	/*--------------------------------------------------------------------------------------
    with given mx, my (mouse cursor coordinate), it finds the top child that intersects 
    with it, starting from the top. it recursively (optional, recursive = true) checks 
    through descendants until the youngest that intersect is found. 

    the top child that intersect will(optional, top = true) be moved to top of child list

	returns the child (or descendant) that is found to intersect with mouse cursor.
    returns null if no child (or descendant) if found to intersect
    --------------------------------------------------------------------------------------*/
	this.findTopChildAtPoint = function(mx, my, recursive, top)
	{
		for (var i = children.length - 1; i >= 0; i--)
		{ 
            // skip children that are hidden
			if (children[i].hide) continue;
			if (children[i].intersect(mx, my))
			{ 
				// send this child to top. also, set i to top child
				if (top) 
				{
					this.sendChildToTop(children[i]);					
					i = children.length - 1;
				}
				
				// recursively do this...
				if (typeof children[i].findTopChildAtPoint === 'function' && recursive) 
				{					
					var t = children[i].findTopChildAtPoint(mx, my, recursive, top);
					if (t) return t;							
				}					
				return children[i]; 
			}
		}
    }
    
	/*--------------------------------------------------------------------------------------
	_mousemove points to a top child where mouse cursor hovers when mouse button
	is released (mouse over)
	_mousedown points to a child where the mouse cursor hovers when mouse button is pressed
	--------------------------------------------------------------------------------------*/
	var _mousedown = null;
	var _mousemove = null;
	
	// access "mousemove" object if application want to do something on ui object where
	// mouse is hovering, e.g. displaying tooltip.
	// note that _mousemove will only point to immediate children.
	this.getMouseMove = function(){ return _mousemove; }

	/*--------------------------------------------------------------------------------------
	listen to "mousemove" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousemove", function(e)
	{       
		// calculate the mouse cursor's relative position to element we are bound to
		// mx, my absolute position with respect to root/element
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
		
		// if there's a child that mouse cursor has click to while mouse is moving, 
		// this child should track the mouse movement.
		if (_mousedown)
		{
			if(_mousedown.onmousedrag){_mousedown.onmousedrag(mx, my, e.movementX, e.movementY);}
		}
		// otherwise, find the top child that mouse cursor intersects with and set it as 
		// "mousemove" child		
		else
		{		
			// we are only looking for top child (immediate), grand childrens are not included. 
			var t = this.findTopChildAtPoint(mx, my, false, false);		

			// mouse cursor hovers over one of the children
			if (t)
			{
				// child t is not current _mousemove. since t exists, mouse cursor is now hovering a new child
				if (t != _mousemove)
				{
					// if _mousemove exists, mouse cursor is previously hovering another child 
					if(_mousemove)
					{ 
						// fire up its onmouseleave()
						if(_mousemove.onmouseleave) _mousemove.onmouseleave(); 
					}
					// if _mousemove does not exist, mouse cursor is previously hovering over the root
					else 
					{
						// if mouse cursor move from root then into its child t, we fire up root's onmouseout()
						if (this.onmouseout) this.onmouseout();
					}					

					// t exists and is a child. fire up its onmouseenter() 
					if(t.onmouseenter) t.onmouseenter(); 		
				}
			}
			// mouse cursor hovers over root
			else
			{
				// we never assign _mousemove to root. it's always its child so if _mousemove exists, it must be its 
				// child. so if mouse cursor hovers over root and none intersect with any of its children, mouse cursor 
				// has just left a child and hovers back into root
				if(_mousemove)
				{ 
					// fire up its onmouseleave()
					if(_mousemove.onmouseleave) _mousemove.onmouseleave(); 

					// since mouse cursor is hovering from a child then into root, fire up its onmouseover()
					if (this.onmouseover) this.onmouseover();
				}
			}

			// assign _mousemove to new child that interects with mouse cursor
			_mousemove = t;

			// if the new _mousemove is root's child (t exists), fire up its onmousemove()
			if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, e.movementX, e.movementY);}
			
			// if new _mousemove doesn't exist, mouse cursor is not hovering on any of the root's children
			else
			{
				// fire up root's onmousemove() 
				if(this.onmousemove) this.onmousemove(mx, my, e.movementX, e.movementY);
			}
		}
	}.bind(this));	    

	/*--------------------------------------------------------------------------------------
	listen to "mouseenter" event on the element it binds to. it occurs when mouse cursor 
	hovers into root from outside element
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseenter", function(e)
	{
		// fire up root's onmouseenter()
		this.onmouseenter(e);
	}.bind(this));	    
	
	/*--------------------------------------------------------------------------------------
	listen to "mouseleave" event on the element it binds to. it occurs when mouse cursor 
	hovers outside root
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseleave", function(e)
	{
		// fire up onmouseleave() on _mousemove if it exists
		if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave();}
		_mousemove = null;

		// fire up root's onmouseleave()
		this.onmouseleave(e);
	}.bind(this));	    

    /*--------------------------------------------------------------------------------------
	listen to "mousedown" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousedown", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 

		// find the top ui (including this) that the mouse button has click to and call its event
        _mousedown = this.findTopChildAtPoint(mx, my, true, true);
        
        // let root be the mousedown if none of its children intersects
		if (!_mousedown) _mousedown = this; 

		for (var i = 0; i < sysmousedownEvents.length; i++){ sysmousedownEvents[i]({elem: _mousedown, x: mx, y: my}); }
        
        // let ui object handle mousedown event
		if (_mousedown){ if (_mousedown.onmousedown) _mousedown.onmousedown(mx, my); }

	}.bind(this));		
	
	/*--------------------------------------------------------------------------------------
	listen to "mouseup" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseup", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
				
		// if mouse button clicked into a child...
		if(_mousedown)
		{
			// is mouse cursor still hovering the child it click to?
			if (_mousedown.intersect)
			{
					// if yes, let the child handle "mouseup" event
					if (_mousedown.intersect(mx, my)){if (_mousedown.onmouseup) _mousedown.onmouseup(mx, my);}		
					
					// otherwise, let the child handle "mouse leave" event
					else{ if (_mousedown.onmouseleave) _mousedown.onmouseleave(); }
			}
			// if mouse cursor is now hovering on another child...
			else{if (_mousedown.onmouseleave) _mousedown.onmouseleave();}
		}
		_mousedown = null;
	}.bind(this));		


	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{ 
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}	

	// handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}	
			
	// handle event when mouse is moving on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}	
	
	// handle event when mouse just moved inside this frame's extents
	this.onmouseenter = function()
	{ 
		for (var i = 0; i < mouseenterEvents.length; i++){ mouseenterEvents[i]({elem: this, name: name}); }
	}	
	
	// handle event when mouse is moving on top of root
	this.onmousemove = function(mx, my, dx, dy)
	{ 
		for (var i = 0; i < mousemoveEvents.length; i++){ mousemoveEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}	    
	// handle event when mouse is leave root
	this.onmouseleave = function()
	{ 
		for (var i = 0; i < mouseleaveEvents.length; i++){ mouseleaveEvents[i]({elem: this, name: name}); }
	}	    
	// handle event when mouse is leave root for one of its children
	this.onmouseout = function()
	{ 
		for (var i = 0; i < mouseoutEvents.length; i++){ mouseoutEvents[i]({elem: this, name: name}); }
	}	   
	// handle event when mouse hovers from one of root's children then into the root
	this.onmouseover = function()
	{ 
		for (var i = 0; i < mouseoverEvents.length; i++){ mouseoverEvents[i]({elem: this, name: name}); }
	}		 

	this.update = function()
	{
		
	}
}



/*------------------------------------------------------------------------------------------------------------
frame element. 

-   design consideration
    - 	container for control elements such as buttons, text box, list box, and drop downs
    -   can be inherited as button, components for more complex ui elements such as slider
    -   can have another frame element as its child since controls such as buttons are made
        of frames
    - 	can be dragged around via mouse 
    - 	to draw, attach a draw event handler 

-   properties
    -   name
        -   string name when it was created. constant so you can't change it
    -   parent
        -   reference to its parent object when it was created. constant so you can't change it
    -   width (w), height (h)
        -   width and height
        -   fires up resize event handler when set
    -   x, y
        -   top-left position of frame relative to its parent
    -   hide
        -   if hidden, frame is not drawn nor it receives user input (disabled)
------------------------------------------------------------------------------------------------------------*/
Frame = function(parent, name, x, y, w, h, sx, sy, hide)
{
    // add this element to its parent's child list
	if (typeof parent !== 'undefined' && parent){if (parent.addChild){ parent.addChild(this); }}

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child){ children.push(child); }
	this.removeChild = function(child){ for (var i = 0; i < children.length; i++){ if ( children[i] == child){ children.splice(i, 1); return; }}}
	this.getNumChildren = function(){ return children.length; }
	
	/*--------------------------------------------------------------------------------------
	frames and other ui elements hold position relative only to its parent. this function
	returns its absolute position which is relative to root element 
	--------------------------------------------------------------------------------------*/
	this.getAbsPos = function()
	{
		var P = {x: x, y: y};		
		if (parent){ if (parent.getAbsPos){ T = parent.getAbsPos(); P.x += T.x; P.y += T.y; }}		
		return P;
	}
	
	/*--------------------------------------------------------------------------------------
	tests if mouse cursor is within its bounds (collision detection against mouse)
	--------------------------------------------------------------------------------------*/
	this.intersect = function(mx, my)
	{
		var P = this.getAbsPos();
		
		if (mx > P.x + w) return false;
		if (my > P.y + h) return false;
		if (mx < P.x) return false;
		if (my < P.y ) return false;
		
		return true;
	}		
	
	/*--------------------------------------------------------------------------------------
	takes the given child object t and if it exist in children list will be moved to top
	--------------------------------------------------------------------------------------*/
	this.sendChildToTop = function(t)
	{
		for (var i = 0; i < children.length; i++)
		{
			if(children[i] == t)
			{
				children.splice(i,1);
				children.push(t);
				return;
			}
		}
	}

	/*--------------------------------------------------------------------------------------
	with given mouse cursor coordinate, it finds the top child that intersects with it, 
	starting from the top. it recursively (optional) checks through descendants until the 
	youngest that intersect is found. any child that intersects will also be moved to
	to top (optional)
	returns the child (or descendant) that is found to intersect with mouse cursor.
	returns null if no child (or descendant) if found to intersect
	--------------------------------------------------------------------------------------*/
	this.findTopChildAtPoint = function(mx, my, recursive, top)
	{
		for (var i = children.length - 1; i >= 0; i--)
		{ 
            if (children[i].hide) continue;
			if (children[i].intersect(mx, my))
			{ 
				// send this child to top. also, set i to top child
				if (top) 
				{
					this.sendChildToTop(children[i]);					
					i = children.length - 1;
				}
				
				// recursively do this...
				if (children[i].findTopChildAtPoint && recursive) 
				{					
					var t = children[i].findTopChildAtPoint(mx, my, recursive, top);
					if (t) return t;							
				}					
				return children[i]; 
			}
		}
	}
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	var mouseenterEvents = [];
	var mousemoveEvents = [];
	var mouseoutEvents = [];
	var mouseoverEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "mousemove"){ mousemoveEvents.push(f); }
		if (e === "mouseenter"){ mouseenterEvents.push(f); }		
		if (e === "mouseout"){ mouseoutEvents.push(f); }		
		if (e === "mouseover"){ mouseoverEvents.push(f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "mouseup"){ for (var i = 0; i < mouseupEvents.length; i++){ if (mouseupEvents[i] == f){ mouseupEvents.splice(i,1); return; }}}			
		if (e === "mousedown"){ for (var i = 0; i < mousedownEvents.length; i++){ if (mousedownEvents[i] == f){ mousedownEvents.splice(i,1); return; }}}			
		if (e === "mouseleave"){ for (var i = 0; i < mouseleaveEvents.length; i++){ if (mouseleaveEvents[i] == f){ mouseleaveEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
		if (e === "mousemove"){ for (var i = 0; i < mousemoveEvents.length; i++){ if (mousemoveEvents[i] == f){ mousemoveEvents.splice(i,1); return; }}}			
		if (e === "mouseenter"){ for (var i = 0; i < mouseenterEvents.length; i++){ if (mouseenterEvents[i] == f){ mouseenterEvents.splice(i,1); return; }}}			
		if (e === "mouseout"){ for (var i = 0; i < mouseoutEvents.length; i++){ if (mouseoutEvents[i] == f){ mouseoutEvents.splice(i,1); return; }}}			
		if (e === "mouseover"){ for (var i = 0; i < mouseoverEvents.length; i++){ if (mouseoverEvents[i] == f){ mouseoverEvents.splice(i,1); return; }}}			
	}	
	
	/*--------------------------------------------------------------------------------------
	draw function
	option to set draw event handler 
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{
        // hidden objects should not be drawn
		if (hide) return;
        
        // execute all draw events for frame. you can have more than 1 draw event handler if you want.
        var P = this.getAbsPos();
        for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: P.x, y: P.y, w: w, h: h});
        
        // execute draw functions for all the frame's children
		for(var i = 0; i < children.length; i++){ if (children[i].draw) children[i].draw(); }				
	}

    /*--------------------------------------------------------------------------------------
    handle event where mouse cursor hovers around frame
    --------------------------------------------------------------------------------------*/
    
	// _mousemove points to a top child where mouse cursor hovers when mouse button	is released (mouse over)
	var _mousemove = null;	

	// access "mousemove" object if application want to do something on ui object where
	// mouse is hovering, e.g. displaying tooltip.
	// note that _mousemove will only point to immediate children.
	this.getMouseMove = function(){ return _mousemove; }
	
	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{
		if(sx) x += dx;
		if(sy) y += dy;
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); }
	}	

	// handle event when mouse is moving on top of this frame
	this.onmousemove = function(mx, my, dx, dy)
	{		
		// we are only looking for top child (immediate), grand childrens are not included. 
		var t = this.findTopChildAtPoint(mx, my, false, false);		
	
		// mouse cursor hovers over one of the children
		if (t)
		{
			// if child is not current _mousemove
			if (t != _mousemove)
			{
				// if _mousemove exists, mouse cursor is previously hovering another child 
				if(_mousemove)
				{ 
					// fire up its onmouseleave()
					if(_mousemove.onmouseleave) _mousemove.onmouseleave(); 
				}
				// if _mousemove does not exist, mouse cursor is previously hovering over this frame
				else 
				{
					// if mouse cursor move from frame then into its child, we fire up this frame's onmouseout()
					if (this.onmouseout) this.onmouseout();
				}

				// fire up onmouseenter() on t
				if(t.onmouseenter) t.onmouseenter(); 		
			}

		}
		// mouse cursor hovers over this frame
		else
		{
			// we never assign _mousemove to this frame. it's always its child. so if _mousemove exists, it must be 
			// one of its children. so if mouse cursor hovers in this frame and none of the children intersects with
			// cursor, mouse cursor has just left a child and hovers back into this frame
			if(_mousemove)
			{ 
				// fire up its onmouseleave()
				if(_mousemove.onmouseleave) _mousemove.onmouseleave(); 

				// since mouse cursor is hovering from a child then into this frame, fire up frame's onmouseover()
				if (this.onmouseover) this.onmouseover();
			}
		}

		// update pointer to new child where mouse hovers 
		_mousemove = t;
		// if mouse cursor is now hovering over a child (t exists), fire up its onmousemove()
		if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, dx, dy);}		
				
		// if new _mousemove does not exist, no chlid is on top of mouse cursor and so it hovers over this frame
		// fire up this frame's mousemove[] events 
		if (!_mousemove){ for (var i = 0; i < mousemoveEvents.length; i++){ mousemoveEvents[i]({elem: this, name: name, x: mx, y: my, dx: dx, dy: dy}); } }
	}	

	// handle event when mouse is moved out of this frame's extents
	this.onmouseleave = function()
	{ 
		if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave();}
		_mousemove = null;
		
		for (var i = 0; i < mouseleaveEvents.length; i++){ mouseleaveEvents[i]({elem: this, name: name}); }
	}

	// handle event when mouse just moved inside this frame's extents
	this.onmouseenter = function()
	{ 
		for (var i = 0; i < mouseenterEvents.length; i++){ mouseenterEvents[i]({elem: this, name: name}); }
	}	

	// handle event when mouse is move into one of its children
	this.onmouseout = function()
	{ 
		for (var i = 0; i < mouseoutEvents.length; i++){ mouseoutEvents[i]({elem: this, name: name}); }
	}	    

	// handle event when mouse just moved inside this frame's extents
	this.onmouseover = function()
	{ 
		for (var i = 0; i < mouseoverEvents.length; i++){ mouseoverEvents[i]({elem: this, name: name}); }
	}		
	
    /*--------------------------------------------------------------------------------------
    handle event where mouse clicks over frame
    --------------------------------------------------------------------------------------*/

    // handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i]({elem: this, name: name, x: mx, y: my}); }
	}
		
	// handle event when mouse button is released while on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i]({elem: this, name: name, x: mx, y: my}); }
    }	
    
	/*--------------------------------------------------------------------------------------
    property setter/getter 
    --------------------------------------------------------------------------------------*/

    // width, height setter fires up resize event handler
    Object.defineProperty(this, "width", 
    { 
        get: function(){ return w; }, 
        set: function(e)
        { 
            w = e; 
            for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        }
    });

    // width, height setter fires up resize event handler
    Object.defineProperty(this, "height", 
    { 
        get: function(){ return h; }, 
        set: function(e)
        { 
            h = e; 
            for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
    });    

    Object.defineProperty(this, "x", { get: function(){ return x; }, set: function(e){ x = e; }});
    Object.defineProperty(this, "y", { get: function(){ return y; }, set: function(e){ y = e; }});
    Object.defineProperty(this, "hide", { get: function(){ return hide; }, set: function(e){ hide = e; }});    
    
    // getter for name, parent. these are constants so no setter
    Object.defineProperty(this, "name", { get: function(){ return name; } });
    Object.defineProperty(this, "parent", { get: function(){ return parent; } });
}

/*------------------------------------------------------------------------------------------------------------
slider control element

-   design consideration
    -	has 2 components - body and thumb, both frame ui objects with body as thumb's parent. both are not 
        movable. thumb movement will be done manually by repositioning based on slider's value range
    -   it cannot have children
    -   setting min/max does not perform sanity check. it's up to user to ensure min/max values are valid
    -   value(current) are checked if valid. it will always be within min/max range
    -   min/max and value is expected as integers. but it will not be checked. it's up to users to ensure
        they set values as integers or expect undefined behaviors from slider
    -   if application requires range to be in decimal solution e.g. -0.01 to +0.01 and index count of 10, 
        it is up to users to inherit this class and wrap functions to manage this        
    -   width, height is not check for validity but thumb size is ensure to be <= body size        
    -   separate draw events for body and thumb for convenience
    -   thumb size aligns with orientation e.g. if vertical orientation, thumb size = thumb.height

-   properties
    -   name
        -   string name when it was created. constant so you can't change it
    -   parent
        -   reference to its parent object when it was created. constant so you can't change it
    -   min, max
        -   numerical value that defines the range of slider.
        -   expects and assume as integer but does not peform check
        -   expects and assume max > min but does not perform check
        -   when set, current value is updated to be within range
    -   value (current)
        -   defaults to min
		-   when set, it ensures value is within range
		-	if value < min, value = min
		-	if value > max, value = max
    -   thumbsize (t)
        -   length of thumb. automatically follow orientation (vertical or horizontal)
        -   size will always be <= body size e.g. if vertical, if thumb.height > body.height, thumb.height = body.height        
    -   width (w), height (h)
        -   width and height
        -   updates body and thumb width and height thereby executing their resize event handlers
        -   update thumb position after resizing
    -   x, y
        -   top-left position of slider with relative to its parent
        -   repositions body frame but not thumb. thumb is child to body so it will reposition itself
    -   hide
        -   if hidden, slider is not drawn nor it receives user input (disabled)
    -   vertical
        -   slider's orientation. 
		-   does not transpose slider's width, height if slider's orientation is changed but it transposes thumb size

-	events
	-	draw
		- draw body 
	-	drawthumb
		- draw thumb
	-	change
		-	fires up when value change
	-	max
		-	fires up when max change
	-	min
		-	fires up when min change

------------------------------------------------------------------------------------------------------------*/
function Slider(parent, name, vertical, x, y, w, h, t, min, max, hide)
{
	/* --------------------------------------------------------------------------------------
    create ui objects that will be components of slider
    -------------------------------------------------------------------------------------- */
	var body = new Frame(parent, name + "_body", x, y, w, h, false, false, hide);
	var thumb = new Frame(body, name + "_thumb", 0, 0, vertical? w:t, vertical? t:h, false, false, hide); 

	/* --------------------------------------------------------------------------------------
	internal function that updates the thumb position based on current value
	-------------------------------------------------------------------------------------- */
	var updateThumbPos = function()
	{
        if (vertical)
        {
			thumb.x = 0;

			// we add these 2 lines to make sure we don't set thumb.y to invalid value. we don't stop user 
			// to set max <= min nor h <= t but we want to make sure it does not break the application. 
			// in this case, we set thumb pos = 0 to make it look like it is set to min
			if (max - min <= 0){ thumb.y = 0; return; }
			if (h - t <= 0){ thumb.y = 0; return; }

            thumb.y = (current - min) / (max - min) * (h - t);
        }
        else 
        {
            thumb.y = 0;

			// we add these 2 lines to make sure we don't set thumb.y to invalid value. we don't stop user 
			// to set max <= min nor h <= t but we want to make sure it does not break the application. 
			// in this case, we set thumb pos = 0 to make it look like it is set to min
			if (max - min <= 0){ thumb.x = 0; return; }
			if (w - t <= 0){ thumb.x = 0; return; }

            thumb.x = (current - min) / (max - min) * (w - t);
        }
	}
	
	/*--------------------------------------------------------------------------------------
    handle draw event for slider's ui object components 
    --------------------------------------------------------------------------------------*/
    
    // add event handler for drawing the body frame. the slider ui has drawEvents array that will contain list of draw event handlers that will draw the slider's body
    // when slider's body frame is to be drawn, it will execute this
	body.addEventListener("draw", function(e)
	{
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, v: vertical, x: e.x, y: e.y, w: e.w, h: e.h, value: current, min: min, max: max});
	}.bind(this));

    // add event handler for drawing the thumb frame. the slider ui has drawThumbEvents array that will contain list of draw event handlers that will draw the slider's 
    // thumb when slider's body frame is to be drawn, it will execute this
	thumb.addEventListener("draw", function(e)
	{
		for (var i = 0; i < drawThumbEvents.length; i++) drawThumbEvents[i]({elem: this, name: name, x: e.x, v: vertical, y: e.y, w: e.w, h: e.h, value: current, min: min, max: max});
	}.bind(this));
     
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var drawEvents = [];
	var drawThumbEvents = [];
	var changeEvents = [];
	var minEvents = [];
	var maxEvents = [];
	var resizeEvents = [];
	var stateEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "change"){ changeEvents.push(f); }		
		if (e === "min"){ minEvents.push(f); }		
		if (e === "max"){ maxEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }
		if (e === "drawthumb"){ drawThumbEvents.push(f); }
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "mouseup"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousedown"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mouseenter"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mouseleave"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousemove"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "mousedrag"){ body.addEventListener(e, f); thumb.addEventListener(e, f); }		
		if (e === "state"){ stateEvents.push(f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "change"){ for (var i = 0; i < changeEvents.length; i++){ if (changeEvents[i] == f){ changeEvents.splice(i,1); return; }}}			
		if (e === "min"){ for (var i = 0; i < minEvents.length; i++){ if (minEvents[i] == f){ minEvents.splice(i,1); return; }}}			
		if (e === "max"){ for (var i = 0; i < maxEvents.length; i++){ if (maxEvents[i] == f){ maxEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "drawthumb"){ for (var i = 0; i < drawThumbEvents.length; i++){ if (drawThumbEvents[i] == f){ drawThumbEvents.splice(i,1); return; }}}			
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }} }		
		if (e === "state"){ for (var i = 0; i < stateEvents.length; i++){ if (stateEvents[i] == f){ stateEvents.splice(i,1); return; }} }		
		if (e === "mouseup"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousedown"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mouseenter"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mouseleave"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousemove"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
		if (e === "mousedrag"){ body.removeEventListener(e, f); thumb.removeEventListener(e, f); }		
    }		
    
	/* --------------------------------------------------------------------------------------
	set/get visibility state 
	-------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "hide", 
    { 
        get: function(){ return hide; }, 
        set: function(e)
        { 			
			//var t = ((hide != e)? true : false);
            hide = e; 
            thumb.hide = e; 
			body.hide = e; 

			// execute event handler ONLY if state changes
			//if (t)
			{ for (var i = 0; i < stateEvents.length; i++){ stateEvents[i]({elem: this, show: !hide}); }}
        }
    });    

	/* --------------------------------------------------------------------------------------
	set/get thumb size 
    thumb size is stored in thumb height or width depending on slider orientation
	-------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "thumbsize", 
    {
        get: function(){ return vertical? thumb.height : thumb.width; }, 
        set: function(e)
        { 
            if (vertical)
            {
                // if slider's orientation is vertical, thumb width fills slider's body width
                thumb.width = body.width;

                // make sure thumb size <= body.size
                thumb.height = e;
                if (thumb.height > body.height) thumb.height = body.height;

                // once we have valid thumb size, we store it in t as t is used by functions
                // in calculating thumb positions, movement, etc...
                t = thumb.height;
                
                // finally, update thumb position based on new size
                updateThumbPos();		
            }
            else
            {
                // if slider's orientation is horizontal, thumb height fills slider's body height
                thumb.height = body.height;

                // make sure thumb size <= body.size
                thumb.width = e;
                if (thumb.width > body.width) thumb.width = body.width;

                // once we have valid thumb size, we store it in t as t is used by functions
                // in calculating thumb positions, movement, etc...
                t = thumb.width;

                // finally, update thumb position based on new size
                updateThumbPos();		
            }
        }
    });

	/* --------------------------------------------------------------------------------------
	acquire or manually set the current index value of the slider
	-------------------------------------------------------------------------------------- */
	Object.defineProperty(this, "value", 
	{ 
		get: function(){ return current; },
		set: function(e)
		{ 
            current = e;

            // clip within range
			if (current > max) current = max;
			if (current < min) current = min;
			
			// update thumb position based on current value
			updateThumbPos();		
			
			for (var i = 0; i < changeEvents.length; i++){ changeEvents[i]({elem: this, value: current, min: min, max: max}); }	
		}
	});

	/* --------------------------------------------------------------------------------------
	acquire or manually set the min value of the slider
	-------------------------------------------------------------------------------------- */
	Object.defineProperty(this, "min", 
	{ 
		get: function(){ return min; },
		set: function(e)
		{ 
            min = e;

            // ensure current value is still within range
			if (current > max) current = max;
			if (current < min) current = min;
			
			// update thumb position based on current value
			updateThumbPos();		
			
			for (var i = 0; i < minEvents.length; i++){ minEvents[i]({elem: this, value: current, min: min, max: max}); }	
		}
    });
    
	/* --------------------------------------------------------------------------------------
	acquire or manually set the max value of the slider
	-------------------------------------------------------------------------------------- */
	Object.defineProperty(this, "max", 
	{ 
		get: function(){ return max; },
		set: function(e)
		{ 
            max = e;

            // ensure current value is still within range
			if (current > max) current = max;
			if (current < min) current = min;
			
			// update thumb position based on current value
			updateThumbPos();		
			for (var i = 0; i < maxEvents.length; i++){ maxEvents[i]({elem: this, value: current, min: min, max: max}); }	
		}
	});

	/* --------------------------------------------------------------------------------------
	snapshot current value and mouse cursor on mousedown to be used as reference for 
	mouse drag
	-------------------------------------------------------------------------------------- */
	var M; // store mouse cursor position on mouse down in this object
	thumb.addEventListener("mousedown", function(e){ M = { x: e.x, y: e.y, current: current }; });			
    
	/* --------------------------------------------------------------------------------------
    thumb is not draggable so we can manage its mouse drag movement here. its movement shift 
    snaps to slider's shift index
	-------------------------------------------------------------------------------------- */
	thumb.addEventListener("mousedrag",function(e)
	{
		// if min >= max, we'll end up with invalid shift value. let's prevent it and don't
		// bother with updating current value
		if (max - min <= 0) return;

		// calculate relative position of mouse cursor with thumb
		e.x -= M.x;
		e.y -= M.y;
		
		// calculate actual size of 1 shift 
		var shift = ((vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = M.current + Math.round( (vertical?e.y:e.x) / shift);			
		
	}.bind(this));	
	
	/* --------------------------------------------------------------------------------------
	when user click (mousedown) on the slider's body where thumb does not occupy, slider 
	forces the thumb to be repositioned where it's center sits on the mouse pointer if
	possible. the center position is with respect to its orientation - meaning, the slider's
	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	body.addEventListener("mousedown", function(e)
	{
		// if min >= max, we'll end up with invalid shift value. let's prevent it and don't
		// bother with updating current value
		if (max - min <= 0) return;

		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = body.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);

		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = Math.round( (vertical?e.y:e.x) / shift) + min;			
		
	}.bind(this));	
	
	/* --------------------------------------------------------------------------------------
	when mouse cursor is dragged into slider's body, reposition the thumb so that its center
	sits at	the mouse pointer whenever possible. the center position is with respect to its
	orientation - meaning, the slider's	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	body.addEventListener("mousedrag", function(e)
	{		
		// if min >= max, we'll end up with invalid shift value. let's prevent it and don't
		// bother with updating current value
		if (max - min <= 0) return;

		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = body.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);

		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = Math.round( (vertical?e.y:e.x) / shift) + min;			
		
    }.bind(this));	

	/* --------------------------------------------------------------------------------------
    setter/getter for orientation
    -------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "vertical", 
    {
        get: function(){ return vertical; }, 
        set: function(e)
        {
            // don't bother if our orientation is already correct
            if (e == vertical) return;
            else vertical = e;

            // set thumb size to ensure thumb <= body.size
            this.thumbsize = t;

            // update thumb position based on body's size and possibly thumbs as well
            updateThumbPos();		
        }
    });
    
	/* --------------------------------------------------------------------------------------
    setter/getters for properties
    -------------------------------------------------------------------------------------- */

    // setter/getter for width. updates thumb position after resizing
    Object.defineProperty(this, "width", 
    { 
        get: function(){ return w; }, 
        set: function(e)
        { 
            w = e;
            body.width = w;

            // set thumb size to ensure thumb <= body.size
            this.thumbsize = t;

            // update thumb position based on body's size and possibly thumbs as well
			updateThumbPos();		
			
			// fire up resize event handler for this ui
            for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
    });

    // setter/getter for height. updates thumb position after resizing
    Object.defineProperty(this, "height", 
    { 
        get: function(){ return h; },
        set: function(e)
        { 
            h = e;
            body.height = h;

            // set thumb size to ensure thumb <= body.size
            this.thumbsize = t;

            // update thumb position based on body's size and possibly thumbs as well
			updateThumbPos();		

			// fire up resize event handler for this ui
            for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
		} 
     });    

    // setter/getter for x, y. also reposition the body       
    Object.defineProperty(this, "x", { get: function(){ return x; }, set: function(e){ x = e; body.x = x; } });
    Object.defineProperty(this, "y", { get: function(){ return y; }, set: function(e){ y = e; body.y = y; } });

    // getter for name, parent. these are constants so no setter
    Object.defineProperty(this, "name", { get: function(){ return name; } });
    Object.defineProperty(this, "parent", { get: function(){ return parent; } });

	/* --------------------------------------------------------------------------------------
    initialize 
    -------------------------------------------------------------------------------------- */

	// initialize current value to min 
    var current = min;	

    // when thumb frame was created, it blindly set the size of value t without checking if t > body.width/height
    // thumbsize must be <= body.size so calling thumbsize property setter will perform size check and ensure
    // thumbsize <= body.size
    this.thumbsize = t;

    // update thumb position based on current value and thumb size. thumbsize setter will call this but just to be sure
    // we call it here again.
    updateThumbPos();	
}

/*------------------------------------------------------------------------------------------------------------
Container class implementation
-	design consideration
-	properties
-	events
	-	draw
		-	option to draw within the ui object's extent
	-	drawthumb
		-	draw the sliders' thumb frame
	-	drawslider
		-	draw the sliders' background
	-	resize
		-	body, a private object in container is the real ui object of container. 
		-	clicking on container is actually clicking on the body. body is designed to always fit into 
			container's extent so when you resize container with .width and .height property, you are 
			resizing the body.
		-	
------------------------------------------------------------------------------------------------------------*/
function Container(parent, name, x, y, w, h, t, hide)
{
	/* --------------------------------------------------------------------------------------
	build ui components. sliders are hidden by default
	-------------------------------------------------------------------------------------- */
	var body = new Frame(parent, name + "_body", x, y, w, h, false, false, hide);
	var vslider = new Slider(body, "_vslider", true, body.width - t, 0, t, 0, 0, 0, 1, true);
	var hslider = new Slider(body, "_hslider", false, 0, body.height - t, 0, t, 0, 0, 1, true);

	/*--------------------------------------------------------------------------------------
    handle draw event for slider's ui object components 
    --------------------------------------------------------------------------------------*/

	// body is the defacto container. what you draw here is the background of the container itself
	body.addEventListener("draw", function(e)
	{
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h });
	}.bind(this));

	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var drawEvents = [];
	var resizeEvents = [];
	var mousedragEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "draw"){ drawEvents.push(f); }
		if (e === "drawthumb"){ hslider.addEventListener(e, f); vslider.addEventListener(e, f); }
		if (e === "drawslider"){ hslider.addEventListener("draw", f); vslider.addEventListener("draw", f); }
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "drawthumb"){ hslider.removeEventListener(e, f); vslider.removeEventListener(e, f); }		
		if (e === "drawslider"){ hslider.removeEventListener("draw", f); vslider.removeEventListener("draw", f); }			
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
	}		

	/*--------------------------------------------------------------------------------------
	slider getters
	--------------------------------------------------------------------------------------*/	
	Object.defineProperty(this, "hsvalue", 
	{ 
		get: function(){ return hslider.value; },
		set: function(e){ hslider.value = e; }
	});
	Object.defineProperty(this, "vsvalue", 
	{ 
		get: function(){ return vslider.value; },
		set: function(e){ vslider.value = e; }
	});

	/*--------------------------------------------------------------------------------------
	width/height property handlers
	--------------------------------------------------------------------------------------*/	
    Object.defineProperty(this, "width", 
    { 
        get: function(){ return w; }, 
        set: function(e)
        { 
            w = e;	// set new width
            body.width = w;	// body frame will always resize to fit in this ui's extent

			// when width changes, vslider must reposition itself to ensure it's always 
			// located at the right side of the container
			vslider.x = w - t;
			vslider.y = 0;

			// when container's size change, it's possible it doesn't need sliders anymore as content maybe smaller
			// than display after the size change. this affect both sliders. this function will check both sliders
			// if they are still needed. the needed slider will be resize to ensure it fits the container's extent.
			// otherwise, it will be hidden
            onChange();		

			// fire up resize event handler to allow users to handle change in container's extent
			for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
    });
    
    Object.defineProperty(this, "height", 
    { 
        get: function(){ return h; },
        set: function(e)
        { 
            h = e; // set new height
            body.height = h; // body frame will always resize to fit in this ui's extent

			// when height changes, hslider must reposition itself to ensure it's always 
			// located at the bottom side of the container
			hslider.x = 0
			hslider.y = h - t;			

			// when container's size change, it's possible it doesn't need sliders anymore as content maybe smaller
			// than display after the size change. this affect both sliders. this function will check both sliders
			// if they are still needed. the needed slider will be resize to ensure it fits the container's extent.
			// otherwise, it will be hidden
            onChange();		

			// fire up resize event handler to allow users to handle change in container's extent
			for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
     });    


	/*--------------------------------------------------------------------------------------
	content 
	--------------------------------------------------------------------------------------*/
	var content = { width: 0, height: 0 }

	// handle content.width change
	Object.defineProperty(this, "contentwidth", 
	{ 
		get: function(){ return content.width; }, 
		set: function(e)
		{                    
			content.width = e; // update content size variable with new value                    
			onChange(); // when content.size change, this will handle updates to sliders' state, size, max, and thumbsize
		}
	});

	// handle content.height change
	Object.defineProperty(this, "contentheight", 
	{ 
		get: function(){ return content.height; }, 
		set: function(e)
		{
			content.height = e; // update content size variable with new value
			onChange(); // when content.size change, this will handle updates to sliders' state, size, max, and thumbsize
		}
	});

	/*--------------------------------------------------------------------------------------
	display
	--------------------------------------------------------------------------------------*/
	var display = { width: 0, height: 0 }

	// handle display.width change
	Object.defineProperty(this, "displaywidth", 
	{ 
		get: function(){ return display.width; }, 
		set: function(e)
		{                    
			display.width = e; // update content size variable with new value                    
			onChange(); // when content.size change, this will handle updates to sliders' state, size, max, and thumbsize
		}
	});

	// handle content.height change
	Object.defineProperty(this, "displayheight", 
	{ 
		get: function(){ return display.height; }, 
		set: function(e)
		{
			display.height = e; // update content size variable with new value
			onChange(); // when content.size change, this will handle updates to sliders' state, size, max, and thumbsize
		}
	});	

	/*--------------------------------------------------------------------------------------
	handle event when sliders resize
	--------------------------------------------------------------------------------------*/	
	hslider.addEventListener("resize", function(e)
	{
		// 	body is supposd to fill the container extent but if sliders are used, body has to share space so we resize it
	//body.height = h - (e.elem.hide? 0 : t);
	}); 

	vslider.addEventListener("resize", function(e)
	{
		// 	body is supposd to fill the container extent but if sliders are used, body has to share space so we resize it
		//body.width = w - (e.elem.hide? 0 : t);
	}); 

	/*--------------------------------------------------------------------------------------
	to be called when content.size and display.size change. the following need to be done:
	- we decide if we need sliders based on new content.size and current frame.size
	- update sliders' sizes. sliders are supposed to fit into the frame.
	- update max sliders' max values. max values represent on content.size
	- update sliders' thumbsize
	- if there's an expected min thumbsize, ensure we don't set it below min
	--------------------------------------------------------------------------------------*/
	function onChange()
	{
		// decide if we need sliders based on new content size. default is they are hidden
		// we update both h and v sliders even when only content.width is changed as it's possible that both sliders
		// will hide/show based on the change in content.width alone
		hslider.hide = true; 
		vslider.hide = true; 
		if (content.width > display.width) hslider.hide = false; 
		if (content.height > display.height) vslider.hide = false; 
		if ((content.width > display.width - t) && (content.height > display.height)){ hslider.hide = false; } 
		if ((content.height > display.height - t) && (content.width > display.width)){ vslider.hide = false; } 

		// now that we know which slider(v/s) is enabled, update their sizes
		// we set a rule that sliders will try to fill container.size. e.g. if vslider is hidden, hslider.height = container.height
		// both h and s sliders to be updated as it's possible that both slides will hide/show based on change in content.width alone
		//if (!hslider.hide){ hslider.width = w - (vslider.hide? 0 : t); }
		//if (!vslider.hide){ vslider.height = h - (hslider.hide? 0 : t); }
		hslider.width = hslider.hide? 0: (w - (vslider.hide? 0 : t)); 
		vslider.height = vslider.hide? 0 : (h - (hslider.hide? 0 : t)); 

		// set slider's min/max. max value is calculated as the value difference between content size and display size.
		// the excess size of content will be the scroll size of slider. if content size < display size, max < 0 but slider class will 
		// handle this properly and fix the thumbsize and its position to ensure no undesired behavior occurs
		// since both h and s sliders might have hide/show from this change, update max for both sliders
		vslider.min = 0; // min = 0, default.
		hslider.min = 0; // min = 0, default.
		vslider.max = content.height - display.height + (hslider.hide? 0 : t);
		hslider.max = content.width - display.width + (vslider.hide? 0 : t);

		// we want thumbsize to be based on ratio between content.size and frame.size. slider size is expected to fill frame size
		// but if both sliders (h and v), slider.size = frame.size - slider.t 
		// since both v and h sliders might have changed their sizes, we update both thumbsize
		vslider.thumbsize = display.height / content.height * (vslider.height - (hslider.hide? 0 : t));
		hslider.thumbsize = display.width  / content.width  * (hslider.width  - (vslider.hide? 0 : t));

		// let's set min value for thumbsize, 32, because if content.size is too big, thumbsize will be too small to click.
		if (vslider.thumbsize < 32) vslider.thumbsize = 32;
		if (hslider.thumbsize < 32) hslider.thumbsize = 32;
	}	

	this.contentwidth = 100;
	this.contentheight = 100;
	this.displaywidth = body.width;
	this.displayheight = body.height;
	
	body.addEventListener("mousedrag", function(e)
	{
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: e.x, y: e.y, dx: e.dx, dy: e.dy}); }
	});   	
}

/*------------------------------------------------------------------------------------------------------------
-	min property is read-only. it represents the display size of container. display size is dependent on
	container.size and if sliders are hidden or not
-	max property is the content.size. must do the following if this is changed
	-	check if sliders are needed since content.size has changed
	-	
------------------------------------------------------------------------------------------------------------*/
function Container2(parent, name, x, y, w, h, t, xmin, xmax, ymin, ymax, hide)
{
	xmin = 50;
	ymin = 45;
	xmax = 120;
	ymax = 130;
	/* --------------------------------------------------------------------------------------
	build ui components. sliders are hidden by default
	-------------------------------------------------------------------------------------- */
	var body = new Frame(parent, name + "_body", x, y, w, h, false, false, hide);
	var xslider = new Slider(body, name + "_XXX", false, 0, body.height - t, 0, t, 0, xmin, xmax, true);
	var yslider = new Slider(body, name + "_YYY", true, body.width - t, 0, t, 0, 0, ymin, ymax, true);

	/*--------------------------------------------------------------------------------------
    handle draw event here 
    --------------------------------------------------------------------------------------*/

	// body is the defacto container. what you draw here is the background of the container itself
	body.addEventListener("draw", function(e)
	{		
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h });
	}.bind(this));

	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var drawEvents = [];
	var resizeEvents = [];
	var mousedragEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "draw"){ drawEvents.push(f); }
		if (e === "drawthumb"){ xslider.addEventListener(e, f); yslider.addEventListener(e, f); }
		if (e === "drawslider"){ xslider.addEventListener("draw", f); yslider.addEventListener("draw", f); }
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "drawthumb"){ xslider.removeEventListener(e, f); yslider.removeEventListener(e, f); }		
		if (e === "drawslider"){ xslider.removeEventListener("draw", f); yslider.removeEventListener("draw", f); }			
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
	}		

	this.thumbsize = function(){ return yslider.thumbsize; }
	this.slidersize = function(){ return yslider.height; }

	/*--------------------------------------------------------------------------------------
	body frame always fill the whole container. only area it won't is the ones where 
	sliders are located, if they are enabled. so when you click and drag mouse cursor
	over container, you are actually dragging over the body frame. handle body's mousedrag
	event and fire up container's mousedrag event handler for it
	--------------------------------------------------------------------------------------*/	
	body.addEventListener("mousedrag", function(e)
	{
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i]({elem: this, name: name, x: e.x, y: e.y, dx: e.dx, dy: e.dy}); }
	});   		

	/*--------------------------------------------------------------------------------------
	slider value property handler
	--------------------------------------------------------------------------------------*/	
	Object.defineProperty(this, "xval", 
	{ 
		get: function(){ return xslider.value; },
		set: function(e){ xslider.value = e; }
	});
	Object.defineProperty(this, "yval", 
	{ 
		get: function(){ return yslider.value; },
		set: function(e){ yslider.value = e; }
	});

	/*--------------------------------------------------------------------------------------
	slider min property handler
	-	display.size
	-	read only
	--------------------------------------------------------------------------------------*/	
	Object.defineProperty(this, "xmin", 
	{ 
		get: function(){ return xslider.min; },
		set: function(e){}
	});
	Object.defineProperty(this, "ymin", 
	{ 
		get: function(){ return yslider.min; },
		set: function(e){}
	});

	/*--------------------------------------------------------------------------------------
	slider max property handler
	-	content.size
	--------------------------------------------------------------------------------------*/	
	Object.defineProperty(this, "xmax", 
	{ 
		get: function(){ return xslider.max; },
		set: function(e)
		{ 
			// set new value for max, firing up its event handler
			xslider.max = e; 

			// check if sliders are needed since content.size has changed. 

			// if slider is needed, enable and update its size

			// if any of the slider state has toggled (previously disabled but now enabled, and vice versa),
			// update sliders' min as slider state change affects display.size

			// if we want thumbsize to match display/content proportion, update thumbsize since slider
			// min, state, and size changed			
		}
	});
	Object.defineProperty(this, "ymax", 
	{ 
		get: function(){ return yslider.max; },
		set: function(e)
		{ 
			// set new value for max, firing up its event handler
			yslider.max = e; 

			// check if sliders are needed since content.size has changed. 

			// if slider is needed, enable and update its size

			// if any of the slider state has toggled (previously disabled but now enabled, and vice versa),
			// update sliders' min as slider state change affects display.size

			// if we want thumbsize to match display/content proportion, update thumbsize since slider
			// min, state, and size changed			
		}
		
	});

	/*--------------------------------------------------------------------------------------
	width/height property handlers
	if container.size change, display size change too. need to update:
	-	slider position
	--------------------------------------------------------------------------------------*/	
    Object.defineProperty(this, "width", 
    { 
        get: function(){ return w; }, 
        set: function(e)
        { 
            w = e;	// set new width
            body.width = w;	// body frame will always resize to fit in this ui's extent

			// when width changes, yslider must ensure it's always located at the right side of the container
			yslider.x = w - t;
			yslider.y = 0;
			
			// check if sliders are needed
			onUpdateSliderState();

			// if container.size changed, slider size must definitely change as well IF it is enabled
			onUpdateSliderSize();

			// min is display.size so when container.size change, display.size definitely changes 
			onUpdateMin();

			// update thumbsize if needed
			onUpdateSliderThumbSize();

			// fire up resize event handler to allow users to handle change in container's extent
			for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
    });
    
    Object.defineProperty(this, "height", 
    { 
        get: function(){ return h; },
        set: function(e)
        { 
            h = e; // set new height
            body.height = h; // body frame will always resize to fit in this ui's extent

			// when height changes, xslider must ensure it's always located at the bottom side of the container
			xslider.x = 0;
			xslider.y = h - t;			

			// check if sliders are needed
			onUpdateSliderState();

			// if container.size changed, slider size must definitely change as well IF it is enabled
			onUpdateSliderSize();

			// min is display.size so when container.size change, display.size definitely changes 
			onUpdateMin();

			// update thumbsize if needed
			onUpdateSliderThumbSize();
			
			// fire up resize event handler to allow users to handle change in container's extent
			for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i]({elem: this, name: name, w: w, h: h}); }	
        } 
	 });   
	 
	/*--------------------------------------------------------------------------------------
	handle event when sliders resize
	--------------------------------------------------------------------------------------*/	
	xslider.addEventListener("resize", function(e)
	{
		onUpdateSliderThumbSize();
	}); 

	yslider.addEventListener("resize", function(e)
	{
		onUpdateSliderThumbSize();
	}); 		 

	/*--------------------------------------------------------------------------------------
	handle event when sliders state change, e.g. hidden to shown, vice versa
	-	when sliders state toggled, the display.size has also changed because sliders 
		share footprint of the container extent so we update slider.min as it represents
		display.size. 
	-	it's fine to update .min before slider size because .min does not need sliders size
		to calculate its new value
	-	resize slider as it's state toggled
	--------------------------------------------------------------------------------------*/	
	xslider.addEventListener("state", function(e)
	{
		onUpdateMin();
		onUpdateSliderSize();
	}); 

	yslider.addEventListener("state", function(e)
	{
		onUpdateMin();
		onUpdateSliderSize();
	}); 	 

	/*--------------------------------------------------------------------------------------
	handle event when sliders max change
	-	check if sliders are needed since content.size has changed. 
	--------------------------------------------------------------------------------------*/	
	xslider.addEventListener("max", function(e)
	{
		onUpdateSliderState();
		onUpdateSliderThumbSize();
	}); 

	yslider.addEventListener("max", function(e)
	{
		onUpdateSliderState();
		onUpdateSliderThumbSize();
	}); 	 	

	/*--------------------------------------------------------------------------------------
	calculate sliders' min based on display.size
	display.size = container.size - slider.size
	--------------------------------------------------------------------------------------*/	
	function onUpdateMin()
	{
		// store current min 
		var pxmin = xslider.min;
		var pymin = yslider.min;

		// store current values
		var xcurr = xslider.value;
		var ycurr = yslider.value;

		// set new min. slider will internally try to update current value to ensure it's within its range. e.g. if curr = 20, new min = 25, curr = 25
		// this is why we store original values before we do this. we use original values to calculate new values
		xslider.min = w - (yslider.hide? 0 : t);
		yslider.min = h - (xslider.hide? 0 : t);

		// calculate the change in min and use it to update current values. e.g. old.min = 20, old.val = 24, new.min = 15, new.val = 19
		// we always keep the delta between min and value. if value end up >max, slider will handle it.
		xcurr -= (pxmin - xslider.min);
		ycurr -= (pymin - yslider.min);

		// finally, update values
		xslider.value = xcurr;
		yslider.value = ycurr;
	}

	/*--------------------------------------------------------------------------------------
	check if sliders are needed. update state only if it changed
	-	slider's state will ONLY be set to new value if it has changed (toggled)
	-	setting slider's state fires up its "state" event handler
	--------------------------------------------------------------------------------------*/	
	function onUpdateSliderState()
	{
		// check if sliders are needed since content.size has changed. 
		var x = true; 
		var y = true; 
		if (xslider.max > w) x = false; 
		if (yslider.max > h) y = false; 
		if ((xslider.max > w - t) && (yslider.max > h)){ x = false; } 
		if ((yslider.max > h - t) && (xslider.max > w)){ y = false; } 		

		// update state only if it change so event handler fires up only if state change
		if (x != xslider.hide) xslider.hide = x;
		if (y != yslider.hide) yslider.hide = y;
	}
	 
	/*--------------------------------------------------------------------------------------
	update sliders' size based on current state and container.size
	-	update sliders' size, fires up its "resize" event handler
	--------------------------------------------------------------------------------------*/	
	function onUpdateSliderSize()
	{
		xslider.width = xslider.hide? 0: (w - (yslider.hide? 0 : t)); 
		yslider.height = yslider.hide? 0 : (h - (xslider.hide? 0 : t)); 	
	}

	/*--------------------------------------------------------------------------------------
	update sliders' thumbsize
	--------------------------------------------------------------------------------------*/	
	function onUpdateSliderThumbSize()
	{
		xslider.thumbsize = xslider.min / xslider.max * (w - (yslider.hide? 0 : t));		
		yslider.thumbsize = yslider.min / yslider.max * (h - (xslider.hide? 0 : t));

		// let's set min value for thumbsize, 32, because if content.size is too big, thumbsize will be too small to click.
		if (xslider.thumbsize < 32) xslider.thumbsize = 32;
		if (yslider.thumbsize < 32) yslider.thumbsize = 32;		
	}

	this.width = 300;
	this.height = 300;
}


 /*------------------------------------------------------------------------------------------------------------
-	design consideration
	-	list items are arrange in vertical order only
	-	scrollbars (slider) can be always visible or only if max > min. this is a property that can be set
	-	has 3 draw events to handle pre and post item drawing and setting up clip area properly
-	properties
	-	x, y
		-	top, left position
	- 	width (w), height (h)
		- 	extent of listbox 
		-	resizes and repositions scrollbar too when value change
	-	min (min)
		-	number of items visible in listbox 
		-	internally, the actual "min" value set to scrollbar is min * res. res is scroll resolution
		-	when min change, scrollbar state is updated as well as its thumbsize as they are affected by
 			changed in min value
		-	it is advisable this be set to >0
	-	max (max)
		- 	item size
		-	internally, the actual "max" value set to scrollbar is max * res. res is scroll resolution
		-	when max change, scrollbar state is updated as well as its thumbsize as they are affected by
			changed in max value
		-	when max change, and current selected index is now out of max range, selected index is se to -1
			and "select" event is fired up
	-	showFullSel
		-	internal flag that ensures selected item during mouse click and drag are fully visible
		-	defaults to true but cannot be set as there's no property for it
	-	select (select)
 		-	read-only property that specifies which item index is currently selected
		-	it is updated when mouse cursor clicks or drags over an item in the ListBox
		-	fires up "select" event when set		
	-	mouseover
		-	internal variable that stores the item index where mouse cursor is currently hovering, if any
		-	cannot be set nor read as there's no property to define this but a reference is passed on
			"drawcontent" event to identify which content has mouse over 
	-	thumbsize (ts)
		-	thumbsize if it's set to fixed
		-	if auto-thumbsize(ats) property is enabled, this is ignored	 
	-	autothumbsize (ats)
		-	when enabled (default), scrollbar ignores thumbsize (ts) property and dynamically resize it
			so thumb.size/scrollbar.size = visible.size/content.size
	-	scrollres (res)
		-	scrolling resolution. factor that defines how smooth items scroll up/down when dragging or sliding 
			scrollbar thumb 
		-	if set to 1 (default), scroll index size is the same as item size. if set to 2, scroll index size is 
			half the item size. so the higher the scrollres, the smoother the scrolling will be. 
	-	autoscroll (as)
		-	when enabled (default), scrollbar is hidden when min > max, where number of visible items is greater
			than total item size
	-	scrollthickness (t)		 
		-	thickness of scrollbar. since scrollbar is vertical, this will be the width
		-	defaults to a value but can be set as property
		-	when changed, resizes the slider and repositions to ensure it is on right side of the ListBox			 
-	events
	-	drawbegin
		-	there are 3 draw events called when this ui is rendered. this is the 1st 
		-	it provides the coords and extent of the whole ListBox so you can draw the background
		-	it is also recommended to setup clip area in this event so when the listbox contents
			are drawn (2nd draw event), they will be clipped within the listbox's extents			 
	-	drawcontent
		-	2nd draw event after drawbegin() 
		-	executed for each list item visible in the ListBox. 
		-	provides the coords and extent for list item to be drawn
	-	drawend
		-	3rd draw event after drawcontent()
		-	you can draw stuff here if you wish but it will draw on top of contents and background so it's not suggested
		-	it's purpose is to clear clipping area set in drawbegin()
	-	drawthumb, drawslider
		- 	you can draw the thumb and background of the slider used as scrollbar 		
	-	select
		-	fires up when an item is selected. passes 's' parameter that holds select index value

------------------------------------------------------------------------------------------------------------*/
function ListBox(parent, name, x, y, w, h, min = 1, max = 0, show = true)
{
	/* --------------------------------------------------------------------------------------
	validate parameters 
	-------------------------------------------------------------------------------------- */
	var select = -1;		// content index that is selected
	var mouseover = -1;		// content index where mouse cursor hovers
	var as = true; 			// auto-scroll feature state
	var ats = true; 		// auto-thumbsize feature state
	var res = 1;			// scroll resolution
	var showFullSel = true;	// when enabled, ensure selected items are fully visible
	var t = 24;				// scrollbar thickness
	var ts = 32;			// thumbsize (ignored if ats = true)

	/* --------------------------------------------------------------------------------------
	build ui components 
	-------------------------------------------------------------------------------------- */
	var body = new Frame(parent, name + "_body", x, y, w, h, false, false, !show);
	var scrollbar = new Slider(body, name + "_scrollbar", true, body.width - t, 0, t, h, ts, min*res, max*res, false);

	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var drawbeginEvents = [];
	var drawendEvents = [];
	var resizeEvents = [];
	var mousedragEvents = [];
	var drawcontentEvents = [];
	var selectEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "drawbegin"){ drawbeginEvents.push(f); }
		if (e === "drawend"){ drawendEvents.push(f); }
		if (e === "drawcontent"){ drawcontentEvents.push(f); }
		if (e === "drawthumb"){ scrollbar.addEventListener(e, f); }
		if (e === "drawslider"){ scrollbar.addEventListener("draw", f); }
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "select"){ selectEvents.push(f); }
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "drawbegin"){ for (var i = 0; i < drawbeginEvents.length; i++){ if (drawbeginEvents[i] == f){ drawbeginEvents.splice(i,1); return; }}}			
		if (e === "drawend"){ for (var i = 0; i < drawendEvents.length; i++){ if (drawendEvents[i] == f){ drawendEvents.splice(i,1); return; }}}			
		if (e === "drawcontent"){ for (var i = 0; i < drawcontentEvents.length; i++){ if (drawcontentEvents[i] == f){ drawcontentEvents.splice(i,1); return; }}}			
		if (e === "drawthumb"){ scrollbar.removeEventListener(e, f);  }		
		if (e === "drawslider"){ scrollbar.removeEventListener("draw", f); }			
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
		if (e === "select"){ for (var i = 0; i < selectEvents.length; i++){ if (selectEvents[i] == f){ selectEvents.splice(i,1); return; }}}			
	}		

	/*--------------------------------------------------------------------------------------
    handle draw event here 
    --------------------------------------------------------------------------------------*/

	// body is the defacto container. what you draw here is the background of the container itself
	body.addEventListener("draw", function(e)
	{	
		// begin draw event. draw background, start clipping, etc...
		for (var i = 0; i < drawbeginEvents.length; i++) drawbeginEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h });

		// draw each content. this loop will set coordinates and extent value for each item.
		var start = Math.floor((scrollbar.value - scrollbar.min) / res);
		var end = Math.ceil((scrollbar.value > scrollbar.max? scrollbar.max: scrollbar.value) / res);
		for (var i = start; i < end; i++)
		{
			// for each content, execute all event handlers for it
			for (var j = 0; j < drawcontentEvents.length; j++) 
			{
				// contents are drawn in column
				drawcontentEvents[j]({elem: this, name: name, i: i, 
					x: e.x, 
					y: e.y + h/(scrollbar.min/res) * (i - (scrollbar.value - scrollbar.min)/res ), 
					w: e.w - (scrollbar.hide? 0 : t), 
					h: h/(scrollbar.min/res),
					s: (i == select? true: false), // is this content selected?
					m: (i == mouseover? true: false), // is mouse cursor hovering this content?
				});
			}
		}
		// end draw event
		for (var i = 0; i < drawendEvents.length; i++) drawendEvents[i]({elem: this, name: name, x: e.x, y: e.y, w: e.w, h: e.h });
	}.bind(this));


	/*--------------------------------------------------------------------------------------
	when mouse drags over listbox, it actually drags over body so we handle it here
	--------------------------------------------------------------------------------------*/
	body.addEventListener("mousedrag", function(e)
	{
		// calculate the index of the list where mouse cursor intersects
		var s =  Math.floor((e.y - e.elem.getAbsPos().y) / (h/(scrollbar.min)));

		// assume visible.size (scrollbar.min) = content.size and calculate which content.index intersects with mouse cursor
		// this means index s can only be between 0 to visible.size - 1. let's make sure that's the case
		if (s < 0) 
		{
			scrollbar.value -= res; // if cursor is dragged outside and above, let's scroll up
			s = 0;
		}
		if (s >= scrollbar.min)
		{
			scrollbar.value += res; // if cursor is dragged outside and below, let's scroll down			
			s = scrollbar.min - 1;
		}

		// but what if content.size is actually smaller than visible.size? since contents are located starting at the top
		// of display, some area in display below the last content are unoccupied, and mouse cursor maybe intersecting it.
		// let's ensure the index s stays at max value then
		if (s >= scrollbar.max) s = scrollbar.max - 1;
		
		// finally, visible.size can be different from content.size, so we shift value based on scrollbar's current value.
		s += (scrollbar.value - scrollbar.min);

		// at this point, s is based on min/max resolution of scrollbar. let's convert it to list item resolution
		s /= res;
		s = Math.floor(s);

		// it's possible that selected items during mouse drag are partially visible. if this is enabled, it will update
		// scrollbar to ensure selected item is fully visible
		if (showFullSel)
		{
			// if select.top < value - min, value = top + min; select.top = select * res
			if (select*res < scrollbar.value - scrollbar.min) scrollbar.value = (select*res) + scrollbar.min;

			// if select.btm >= value, value = select.btm + min; select.btm = select * res + res - 1
			if (select*res + res - 1 >= scrollbar.value) scrollbar.value = (select*res + res - 1) + 1;
		}

		// update variables with new select values
		select = s;
		mouseover = s;

		// execute event handlers for select change
		for (var i = 0; i < selectEvents.length; i++){ selectEvents[i]({elem: this, name: name, s: select}); }
	}.bind(this));

	/*--------------------------------------------------------------------------------------
	find the item index where mouse cursor hovers
	--------------------------------------------------------------------------------------*/
	body.addEventListener("mousemove", function(e)
	{
		mouseover = (e.y - e.elem.getAbsPos().y) / (h/scrollbar.min) + (scrollbar.value - scrollbar.min);
		mouseover /= res;
		mouseover = Math.floor(mouseover);

	}.bind(this));

	/*--------------------------------------------------------------------------------------
	no more mouseover on any item if mouse leaves listbox extent or enter 
	its child (scrollbar)
	--------------------------------------------------------------------------------------*/
	body.addEventListener("mouseleave", function(e){ mouseover = -1;}.bind(this));	
	body.addEventListener("mouseout", function(e){ mouseover = -1; }.bind(this)); 
	
	/*--------------------------------------------------------------------------------------
	find the item where mouse cursor click and set it as select
	--------------------------------------------------------------------------------------*/
	body.addEventListener("mousedown", function(e)
	{
		// calculate the index of the list where mouse cursor intersects
		select = (e.y - e.elem.getAbsPos().y) / (h/scrollbar.min) + (scrollbar.value - scrollbar.min);
		select /= res;
		select = Math.floor(select);

		// it's possible that selected items during mouse down are partially visible. if this is enabled, it will update
		// scrollbar to ensure selected item is fully visible
		if (showFullSel)
		{
			// if select.top < value - min, value = top + min; select.top = select * res
			if (select*res < scrollbar.value - scrollbar.min) scrollbar.value = (select*res) + scrollbar.min;

			// if select.btm >= value, value = select.btm + min; select.btm = select * res + res - 1
			if (select*res + res - 1 >= scrollbar.value) scrollbar.value = (select*res + res - 1) + 1;
		}
		
		// execute event handlers for select change
		for (var i = 0; i < selectEvents.length; i++){ selectEvents[i]({elem: this, name: name, s: select}); }
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	update thumbsize based on min/max values IF auto-thumbsize feature is ON
	otherwise, set it to fixed value ts
	--------------------------------------------------------------------------------------*/
	function onUpdateThumbSize()
	{
		if (ats)
		{
			// update thumbsize. make sure it's not too small or it will be too small to click
			scrollbar.thumbsize = scrollbar.min / scrollbar.max * h;
			if (scrollbar.thumbsize < ts) scrollbar.thumbsize = ts;
		}
		else scrollbar.thumbsize = ts;
	}

	/*--------------------------------------------------------------------------------------
	min property
	--------------------------------------------------------------------------------------*/
    Object.defineProperty(this, "min", 
    { 
        get: function(){ return scrollbar.min/res; },
		set: function(e)
		{ 
			scrollbar.min = e *res; 
			scrollbar.hide = as? (scrollbar.min >= scrollbar.max? true: false): false;		
			onUpdateThumbSize();
		} 
	 });   

	/*--------------------------------------------------------------------------------------
	max property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "max", 
	{ 
		get: function(){ return scrollbar.max/res; },
		set: function(e)
		{ 
			scrollbar.max = e * res; 
			scrollbar.hide = as? (scrollbar.min >= scrollbar.max? true: false): false;		
			onUpdateThumbSize();

			// if our content size is now smaller than currently selected, let's reset select
			if (scrollbar.max <= select)
			{
				select = -1;
				
				// execute event handlers for select change
				for (var i = 0; i < selectEvents.length; i++){ selectEvents[i]({elem: this, name: name, s: select}); }
			}
		} 
	});   

	/*--------------------------------------------------------------------------------------
	thumb property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "thumbsize", 
	{ 
		get: function(){ return scrollbar.thumbsize; },
		set: function(e)
		{ 
			ts = e;
			onUpdateThumbSize();
		} 
	});   

	/*--------------------------------------------------------------------------------------
	fixed/dynamic thumb size property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "autothumbsize", 
	{ 
		get: function(){ return ats; },
		set: function(e)
		{ 
			ats = e;
			onUpdateThumbSize();
		} 
	});   

	/*--------------------------------------------------------------------------------------
	width property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "width", 
	{ 
		get: function(){ return w; },
		set: function(e)
		{ 
			w = e;
			body.width = w;
			scrollbar.x = w - t;
		} 
	});   	

	/*--------------------------------------------------------------------------------------
	height property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "height", 
	{ 
		get: function(){ return h; },
		set: function(e)
		{ 
			h = e;
			body.height = h;
			scrollbar.height = h;
			onUpdateThumbSize();
		} 
	});   	

	/*--------------------------------------------------------------------------------------
	scroll resolution property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "scrollres", 
	{ 
		get: function(){ return res; },
		set: function(e)
		{
			prev = res;
			res = e;
			// do this to fire up min/max property function and update stuff based on new 
			// scroll resolution value			
			this.min = scrollbar.min / prev;
			this.max = scrollbar.max / prev;
		} 
	});   

	/*--------------------------------------------------------------------------------------
	select property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "select", {	get: function(){ return select; } });   	

	/*--------------------------------------------------------------------------------------
	scrollbar thickness (width) property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "scrollthickness", 
	{	
		get: function(){ return scrollbar.width; },
		set: function(e)
		{
			t = e;
			scrollbar.width = t;		
			scrollbar.x = body.width - t;
		}
	});   	

	/*--------------------------------------------------------------------------------------
	autoscroll property
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "autoscroll", 
	{ 
		get: function(){ return as; },
		set: function(e)
		{ 
			as = e; 
			scrollbar.hide = as? (scrollbar.min >= scrollbar.max? true: false): false;		
		} 
	});   

	/*--------------------------------------------------------------------------------------
	various properties
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "x", { get: function(){ return x; }, set: function(e){ x = e; }});
    Object.defineProperty(this, "y", { get: function(){ return y; }, set: function(e){ y = e; }});
    Object.defineProperty(this, "hide", { get: function(){ return !show; }, set: function(e){ show = !e; }});    
    Object.defineProperty(this, "name", { get: function(){ return name; } });
    Object.defineProperty(this, "parent", { get: function(){ return parent; } });

	/*--------------------------------------------------------------------------------------
	initialize certain properties so to update all properties before launching
	--------------------------------------------------------------------------------------*/
//	this.min = this.min;
}
