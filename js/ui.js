/*------------------------------------------------------------------------------------------------------------
Version [5, 20201005]
-	updates
	-	frame
		-	frame.draw
			-	it now calculates the visible extent of the frame that is outside of its ascendants
			-	new parameters are passed to draw event handler that specify the viewport, visible extent
				that the frame can be rendered. it is used for clipping certain portion of the frame that 
				is outside its parent/ascendant
		-	frame.drawbegin
			-	new event handler called before 'draw' event handler. can be used for initializing draw
				objects and set draw states before drawing it in the 'draw' event
		-	frame.drawend
			-	new event handler called after all children.draw are executed. can be used to restore
				draw states after drawing the frame
	-	ListBox.draw
		-	renamed draw events to drawcontenbegin, drawcontent, and drawcontentend because we now add
			drawend and drawbegin at base frame class
	-	Slider
		-	added 'thumbresize' event that fires up when thumb size change
		-	updated thumb.draw event to include viewport parameter	
	-	ListBox (new events added)
		-	.drawcontentbegin
			-	new event called inside 'draw' event. it provides coords and extent for the whole listbox
				so you can draw background if needed. 
		-	.drawcontent
			-	each visible (full and partial) item calls this event and passes coords and extent for 
				the each item
		-	.drawcontentend
			-	event called after all contents are drawn through 'drawcontent' event. 
		-	.thumbresize, .sliderresize
			-	fires up when slider and/or its thumb change size
		-	.change
			-	fires up when slider value changes e.g. it scrolled	
		-	.drawthumb, .drawslider
			- 	you can draw the thumb and background of the slider used as scrollbar 		
		-	.select
			-	fires up when an item is selected. passes 's' parameter that holds select index value					
	-	Root
		- PopupManager
			-	new class derived from Popup that overrides certain properties and functions for it
				to behave uniquely as popup manager instead of generic popup
			-	need this to override x, y, width, and height property so that it returns values 
				from element associated with root. this is so that when accessing these properties, it
				returns value of element's. 
			-	fixes the bug when calculating viewport of popup objects

Version [4, 20200924]
-	updates
	-	frame
		-	added "drawend" event called at frame.draw() after calling children.draw(). this allows frames to perform
			nested clipping on its children
			-	it affects ListBox.draw() as it originally has its own "drawend" event. we're removing it now as its base
				class frame has it already

Version [3, 20200923] changes, updates
-	updates
	-	popup
		- 	remove 'root' as one of constructor arguments. it was never used
		- 	root is now parent to its popup manager but it's illegitimate because it's removed from children list.
			purpose is to allow popup frames to get reference to root through recursive parent search
	-	ListBox
		-	min/max property handler now fires up event handler
-	new features
	-	DropDown
		-	new ui object implemented. the dropdown popup frame can have child frames


Version [2, 20200921] changes, updates
-	root
	-	you don't have to set width/height of root anymore. 
		-	internally it sets position to 0, 0 and width, height to 0
		-	event handlers for its "parent" canvas makes it so that canvas' width, height is its width, height as well.
	-	a new object added to contain list of events and its event handlers. events can now be added dynamically
	-	popup class
		-	a new frame class used as popup frames. 
		-	defined internally in root class as it must have popup manager as its parent. 
		-	used as containers for dropdown list box, combo box, menu, submenu, etc...
	-	popup manager
		-	this is a new popup object and member of root itself but not its child
		-	it acts like another root that can contain popup objects as its children
		-	it will always be on top of the standard frame objects managed by root(root chilren)
		-	it will always be drawn top of the standard frame objects managed by root(root chilren)
		-	tasks associated with any popup objects will be executed first before root and its children on call to update()
	-	x, y property handler 
		-	overriden so that x,y will always be return 0, 0 and cannot be set to other values
	-	width, height property handler 
		-	overiden so that it will always return element.width, element.height. cannot be set anymore
-	frame
	-	refactored frame class as "base" class for all ui objects. this include root itself
	-	frame.setIntersect()
		-	you can now set the intersect function used to check if mouse cursor intersects with a frame. this allows
			frames to have different shapes other than just rectangle e.g. circle
	-	draw()
		-	e.w and e.h is now set using frame.width and frame.height instead of internal variable w and h
	-	x, y, width, height property handler 
		-	added "configurable" attribute so it can now be overriden by inherited class
-	update()
	-	adding/removing event listeners immediately is a bad idea. 
	-	when an event occurs in a frame, that frame will execute the corresponding list of event listeners. within this
		list, if an event listener is added or removed, that will mess up the loop in executing the list as the number
		of event listeners changed. 
	-	to fix this problem, adding/removing event listeners are not executed immediately. it becomes a task and is
		queued into a list. this list will be flushed on call to update() where all requests will be executed
	-	it is recommended to execute update() within the application loop, along with the draw().

			
issues
-	event:mouseleave "double event" fire up
	-	a frame "captures" a mouse when it clicks on it. and "release" it when the mouse button is unclicked on top of the
		same frame that captures it. 
	-	but if it's unclicked on other frame, the frame that originally captures it fires up mousemove event. you will notice
		that it fires up twice. but it doesn't. 
	-	apparently when mouse button is released, parent element's mousemove event also fires up. frame's event handler for 
		mousemove also fires up mouseleave thereby causing a double event. 
	-	i don't consider this as a bug so we keep it this way
------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
HISTORY FROM LEGACY CODES
action item:
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

-	event:onmouseup
	-	this event occurs when mouse button is released while hovering over a frame
	-	when event:onmousedown occurs while mouse hovers a frame, that frame "captures" the mouse. if mouse
		button is released while still hovering the same frame that captured it, this frame will "release"
		the mouse, firing up event:onmouseup
	-	if mouse button is released while hovering over a child of the frame that captured it, this frame
		will still "release" the mouse, firing up event:onmouseup
	-	if mouse button is released outside of the frame that captures it, the frame will fire up
		event:onmouseleave instead

-	update()
	-	adding/removing event listeners immediately is a bad idea. 
	-	when an event occurs in a frame, that frame will execute the corresponding list of event listeners. within this
		list, if an event listener is added or removed, that will mess up the loop in executing the list as the number
		of event listeners changed. 
	-	to fix this problem, adding/removing event listeners are not executed immediately. it becomes a task and is
		queued into a list. this list will be flushed on call to update() where all requests will be executed
	-	it is recommended to execute update() within the application loop, along with the draw().
	-	type of tasks on queue for update()
		-	user input events from source object (canvas, scene). user inputs such as mouse click/move can happen anytime.
			to prevent it from happening in the middle of event listener execution, it is queued as task to be executed
			on next call to update()
		-	all add and remove event listener functions, obviously
	-	update() can be executed immediately if you want to flush the current tasks on queue. a good scenario is when you add
		event listeners during application initialization and performing tasks that triggers the event for these listeners. 
		the added event listeners will only fire up after a call to update() so to force it, you can call update() before
		performing tasks that triggers them.
	-	tasks queued for execution in update() are stored in a list. this list is locked when update() is executing and is 
		flushing the list. any tasks that are queued during update() are then stored in queue list. once flushing is over
		the queued list will then be appended into task list so they will be executed on next call to update()





------------------------------------------------------------------------------------------------------------*/

EventHandler = function()
{
	Object.defineProperty(this, "version", { configurable: true, get: function(){ return "1"; } });

	/*--------------------------------------------------------------------------------------
	event manager functions
	--------------------------------------------------------------------------------------*/
	var eventHandlers = {};

	// adding event is a queued task for safety
	this.addEventListener = function(e, f)
	{
		this.queueTask(function()
		{		
			if(eventHandlers.hasOwnProperty(e)){ eventHandlers[e].push(f); }
			else{ eventHandlers[e] = []; eventHandlers[e].push(f); }
		}.bind(this));		
	}

	// removing event is a queued task for safety
	this.removeEventListener = function(e, f)
	{
		this.queueTask(function()
		{		
			if (eventHandlers.hasOwnProperty(e))
			{
				for (var i = 0; i < eventHandlers[e].length; i++)
				{ 
					if (eventHandlers[e][i] == f){ eventHandlers[e].splice(i,1); return; }
				}
			}		
		}.bind(this));		
	}

	// option to add new event. used by inherited class
	this.addEvent = function(e){ if(!eventHandlers.hasOwnProperty(e)){ eventHandlers[e] = []; }}

	// execute event listeners for the specified event
	this.callEvent = function(e, p)
	{
		if (eventHandlers.hasOwnProperty(e))
		{
			for (var i = 0; i < eventHandlers[e].length; i++) 
			{
				eventHandlers[e][i](p);
			}
		}
	}

	/*--------------------------------------------------------------------------------------
	debug tools
	--------------------------------------------------------------------------------------*/
	this.numEventListeners = function(e)
	{
		if (eventHandlers.hasOwnProperty(e))
		{
			return eventHandlers[e].length;
		}
		else return 0;
	}
}

/*------------------------------------------------------------------------------------------------------------
FRAME CLASS
-	base class where all ui components will be derived

-   properties
    -   parent
        -   reference to its parent object when it was created. constant so you can't change it
    -   name
        -   string name when it was created. constant so you can't change it
    -   width (w), height (h)
        -   width and height
        -   updates body and thumb width and height thereby executing their resize event handlers
        -   update thumb position after resizing
    -   x, y
        -   top-left position of slider with relative to its parent
        -   repositions body frame but not thumb. thumb is child to body so it will reposition itself
    -   show
        -   if hidden, slider is not drawn nor it receives user input (disabled)
	-   sx, sy
		-	flag that specifies if frame can be dragged
		-	sx = true, can be dragged horizontally
		-	sy = true, can be dragged vertically

-	methods
	-	addEventListener
		-	events are occurence that happens frame elements e.g. frame change size or position, mouse cursor 
			hovers or click on top of frame, etc...
		-	when this event happens, an application may want to do something about it e.g. a frame acting as 
			a button is mouse clicked. the application might want to do something when the frame button is clicked.
			frame allows application to do something but letting application assign an event handler for mouse click			
		-	there's a list of predefined events in frame
			-	draw > allow application to draw the frame
			-	move > position x, y properties changes
			-	resize > width, height properties changes	
			-	show > frame becomes visible or invisible/disabled
			-	add > frame is added into its parent's children list
			- 	remove > frame is removed from its parent's children list
			-	mousemove > mouse cursor intersects frame
			-	mousedown > mouse button is pressed while cursor intersects frame
			-	mouseup > mouse button is release while cursor intersects frame (same frame was mouse down)
			-	mouseleave > mouse cursor leaves frame and moved into another frame that is not its child
			-	mouseenter > mouse cursor intersects frame while previously intersects frame that is not its child
			-	mouseout > mouse cursor leaves frame and moved into frame's child
			-	mouseover > mouse cursor intersects frame while previously intersects frame that is its parent
		-	adding events is a queued task. this is to prevent adding event listener on specified event while the 
			same event is being looped to execute its list of event listeners.	
	-	removeEventListener
		-	removing events is a queued task. this is to prevent removing event listener on specified event while the 
			same event is being looped to execute its list of event listeners.	
	- 	addEvent
		-	option to add new event. this is useful on inherited class
	-	add, addChild, remove, removeChild
		-	functions to add/remove child frames
	-	queueTask
		-	tasks to be queued for execution in update() are queued here. there are 2 lists > queue, tasks
		-	tasks list are the ones to be executed on next call to update(). queue list is where new tasks
			are queued while task lists are being executed. the queued list will be appended into task list
			for next call to update()
	-	update
		-	certain tasks cannot be executed immediately e.g. add/remove event listeners. 
		-	these tasks are queued and executed in this function
	-	draw
		-	execute "draw" event handlers for frame
		-	recursively call draw on all children
	-	getAbsPos
		-	get the actual x,y position with respect to oldest descendant (descendant without parent)
	- 	intersect, setIntersect
		-	used for checking mouse cursor intersects with frame extent. 
		-	can specify new algorithm (function) in intersect test using setIntersect()
	-	findTopChildAtPoint
		-	find the top child that intersects with given coordinate. option to move the child on top of the list
		-	option to recursively find among all descendants
	-	sendChildToTop
		- 	move a specified child to top of the list (end of the child list)
	-	onmousedown
		-	returns the top descendant that intersects with mouse cursor when its button is pressed, or returns 
			this frame if none of its descendants intersect with mouse cursor
	-	onmousemove
		-	returns the top child (immediate only) that intersects with mouse cursor but returns null if none of
			the children instersects with it
	-	onmousedrag
		- 	update position of frame based on mouse drag if frame dragging (sx, sy) is enabled	
	-	mouseup
		-	executed on this frame when mouse button is released while mouse cursor is over this frame and mouse button
			was pressed on this frame (frame captures mouse)
	-	mouseenter
		-	executed when mouse cursor intersects with this frame while previously hovering over another frame that is 
			not this frame's child
	-	mouseleave
		-	executed when mouse cursor intersects another frame that is not this frame's child while previously hovering 
			this frame
	-	mouseover
		-	executed when mouse cursor intersects with this frame while previously hovering over its child
	-	mouseout
		-	executed when mouse cursor intersects with this frame's child while previously hovering this frame		
	
------------------------------------------------------------------------------------------------------------*/
Frame = function(parent, name, x, y, w, h, sx = true, sy = true, show = true)
{
	EventHandler.call(this); // __DEBUG__

	Object.defineProperty(this, "version", { configurable: true, get: function(){ return "5"; } });

	this.numChildren = function(){ return children.length; }

	/*--------------------------------------------------------------------------------------
	add predefined events
	--------------------------------------------------------------------------------------*/
	this.addEvent("resize");
	this.addEvent("move");
	this.addEvent("show");
	this.addEvent("drawbegin");
	this.addEvent("draw");
	this.addEvent("drawend");
	this.addEvent("mouseup");
	this.addEvent("mousedown");
	this.addEvent("mouseleave");
	this.addEvent("mousedrag");
	this.addEvent("mousemove");
	this.addEvent("mouseenter");
	this.addEvent("mouseout");
	this.addEvent("mouseover");
	this.addEvent("add");
	this.addEvent("remove");

	/* --------------------------------------------------------------------------------------
	show property handler
	-------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "show", 
    { 
		configurable: true,
        get: function(){ return show; }, 
        set: function(e)
        { 			
			show = e; 			
			this.callEvent("show", {elem: this, name: name, show: show});
        }
    });    	

	/*--------------------------------------------------------------------------------------
	position property handler
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "x", 
	{ 
		configurable: true,
		get: function(){ return x; }, 
		set: function(e)
		{ 
			x = e;
			this.callEvent("move", {elem: this, name: name, x: x, y: y});
		}
	});

	Object.defineProperty(this, "y", 
	{ 
		configurable: true,
		get: function(){ return y; }, 
		set: function(e)
		{ 
			y = e; 
			this.callEvent("move", {elem: this, name: name, x: x, y: y});
		}
	});

	/*--------------------------------------------------------------------------------------
	extent property handler	
	--------------------------------------------------------------------------------------*/
    Object.defineProperty(this, "width", 
    { 
		configurable: true,
        get: function(){ return w; }, 
        set: function(e)
        { 
            w = e; 
			this.callEvent("resize", {elem: this, name: name, w: w, h: h});
        }
    });

    // width, height setter fires up resize event handler
    Object.defineProperty(this, "height", 
    { 
		configurable: true,
        get: function(){ return h; }, 
        set: function(e)
        { 
            h = e; 
			this.callEvent("resize", {elem: this, name: name, w: w, h: h});
        } 
	});  	

	/*--------------------------------------------------------------------------------------
	access to name and parent
	--------------------------------------------------------------------------------------*/
    Object.defineProperty(this, "name", { get: function(){ return name; } });
	Object.defineProperty(this, "parent",{ get: function(){ return parent; }, set: function(e){ parent = e; }});	// __DEBUG__

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child)
	{ 
		this.queueTask(function()
		{		
			children.push(child); 
			child.callEvent("add", {elem: this, name: name});
		}.bind(this));
	}

	this.removeChild = function(child)
	{ 
		this.queueTask(function()
		{		
			for (var i = 0; i < children.length; i++)
			{ 
				if ( children[i] == child)
				{ 
					children.splice(i, 1); 
					child.callEvent("remove", {elem: this, name: name});
					return; 
				}
			}
		}.bind(this));
	}

	/*--------------------------------------------------------------------------------------
	request to be added/remove into parent's children list if it has parent
	no need to queue this in task list as the actual add/remove will do it
	--------------------------------------------------------------------------------------*/
	this.remove = function(){ if (parent){ if (parent.removeChild){ parent.removeChild(this); } } }
	this.add = function(){ if (parent){ if (parent.addChild){ parent.addChild(this); } } }


	/*--------------------------------------------------------------------------------------
	certain tasks cannot be executed immediately e.g. add/remove event listeners. these 
	tasks are queued and executed on call to update()
	--------------------------------------------------------------------------------------*/
	var tasks = [];
	var queue = [];
	var lock = false;
	this.queueTask = function(e)
	{		
		if (lock) queue.push(e); // add to queue instead if we're locked
		else tasks.push(e);
	}

	this.update = function()
	{
		// prevent adding new tasks while we are flushing current list of tasks
		lock = true; 
		// execute queued tasks and flush them
		while(tasks.length)
		{
			tasks[0]();
			tasks.shift();	
		}		
		//any new tasks added while flushing current list? let's append here now to queue them for next update
		tasks = tasks.concat(queue); 
		queue = [];		
		lock = false;

		// recursively do this for child frames
		for(var i = 0; i < children.length; i++){ if (children[i].update) children[i].update(); }	
	}

	/*--------------------------------------------------------------------------------------
	this object doesn't really get rendered. its main purpose is to occupy the scene it 
	binds to. this function is used to render its child objects instead. however, an it 
	fires up a render event to allow application option in case users choose to
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{
        // hidden frames should not be drawn as well as all its children
		if (!show) return;

		// let's calculate absolute position of this frame
		// we're also calculating the visible rectangular area of this frame after being clipped by all its ascendants
		var P = {x: x, y: y};		

		// let V be the visible area of this frame. initialize it with this frame's position and extent
		var V = {x: x, y: y, w: this.width, h: this.height}
		var n = parent;
		while(n)
		{			
			// add relative pos of this frame and its ascendants to calculate absolute position
			P.x += n.x;
			P.y += n.y;

			// if frame's top-left is inside its parent's area BUT is partially outside (overlapping bottom-right),
			// recalculate its visible area by reducing its value by whatever is outside parent's area
			if (V.w + V.x > n.width){ V.w = n.width - V.x; }			
			if (V.h + V.y > n.height){ V.h = n.height - V.y; }			

			// if frame's top-left is outside parent's area (overlapping parent's top-left), make top-left be the 
			// parent's top-left now. also readjust frame's area to compensate with changes to its top-left value
			if (V.x < 0)
			{
				V.w += V.x;
				V.x = n.x;
			}
			// if frame's top-left is inside its parent's area, update its value to be absolute value with respect
			// to its parent
			else V.x += n.x; 

			if (V.y < 0)
			{
				V.h += V.y;
				V.y = n.y;
			}
			else V.y += n.y;

			// next ascendant
			n = n.parent;
		}

		var e = 
		{
			elem: this,
			name: name,
			x: P.x,
			y: P.y,
			w: this.width,
			h: this.height,
			vx: V.x,
			vy: V.y,
			vw: V.w,
			vh: V.h
		};

		// prepare before drawing e.g. setup clipping, color, effects...
		this.callEvent("drawbegin", e);
		
        // execute all draw events for frame. you can have more than 1 draw event handler if you want.
		this.callEvent("draw", e);
        
        // execute draw functions for all the frame's children
		for(var i = 0; i < children.length; i++){ if (children[i].draw) children[i].draw(); }	

		// close anything needed e.g. restore system in previous state prior to drawing this frame
		this.callEvent("drawend", e);
	}   

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
	default function for mouse cursor intersect test
	--------------------------------------------------------------------------------------*/
	var intersect = function(x, y)
	{
		var P = this.getAbsPos();		
		if (x > P.x + w) return false;
		if (y > P.y + h) return false;
		if (x < P.x) return false;
		if (y < P.y ) return false;
		return true;
	}.bind(this);

	// can specify a different algorithm for intersect test
	this.setIntersect = function(f){ intersect = f; }

	/*--------------------------------------------------------------------------------------
	tests if mouse cursor is within its bounds (collision detection against mouse)
	--------------------------------------------------------------------------------------*/
	this.intersect = function(mx, my){ return intersect(mx, my); }	

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
	this.findTopChildAtPoint = function(mx, my, recursive = false, top = false)
	{
		for (var i = children.length - 1; i >= 0; i--)
		{ 
			// skip hidden frames
            if (!children[i].show) continue; 
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
		// if we reach this point, none of the children intersects with mouse cursor
		return null;
	}	

	/*--------------------------------------------------------------------------------------
	_mousemove refers to a child of this frame where mouse cursor hovers while mouse 
	buttons are released. if this frame has no child, or none of its children intersects
	with mouse cursor as it hovers over this frame, _mousemove = null
	--------------------------------------------------------------------------------------*/
	var _mousemove = null;	

	/*--------------------------------------------------------------------------------------
	handle event when mouse is moving on top of this frame
	--------------------------------------------------------------------------------------*/
	this.onmousemove = function(mx, my, dx, dy)
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
				// if _mousemove does not exist, mouse cursor is previously hovering over this frame
				else 
				{
					// if mouse cursor move from frame then into its child, we fire up this frame's onmouseout()
					if (this.onmouseout) this.onmouseout();
				}
				// t exists and is a child. fire up its onmouseenter() 
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

		// assign _mousemove to new child that interects with mouse cursor
		_mousemove = t;

		// if mouse cursor is now hovering over a child (t exists), fire up its onmousemove()
		if (_mousemove)
		{
			if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, dx, dy);
		}		
		// if new _mousemove doesn't exist, mouse cursor is not hovering on any of this frame's children 
		else
		{
			// fire up this frame's mousemove[] events as mouse cursor is hovering in this frame
			this.callEvent("mousemove", {elem: this, name: name, x: mx, y: my, dx: dx, dy: dy});
		}	

		// return this in case parent wants to know if mouse hovers on any of its children
		return _mousemove;
	}		

	/*--------------------------------------------------------------------------------------
    handle event when mouse button is clicked into this frame
	--------------------------------------------------------------------------------------*/
	this.onmousedown = function(mx, my)
	{ 
		// find this frame's top child that mouse clicked and put it on top of its list
		var t = this.findTopChildAtPoint(mx, my, false, true);

		// if this frame's child is clicked, let it recursively find its children that mouse also clicked
		if (t)
		{
			// do this for loop if you want to fire up mousedown event on frame chain from root to top child that is clicked
		//	this.callEvent("mousedown", {elem: this, name: name, x: mx, y: my}); 
			return t.onmousedown(mx, my);
		}
		// if none of this frame's children is clicked, we can conclude that this frame is the "mousedown"
		else
		{
			this.callEvent("mousedown", {elem: this, name: name, x: mx, y: my}); 
			return this;
		}
	}	

	/*--------------------------------------------------------------------------------------
	handle event when mouse button is released while on top of this frame
	--------------------------------------------------------------------------------------*/
	this.onmouseup = function(mx, my)
	{ 
		this.callEvent("mouseup", {elem: this, name: name, x: mx, y: my});
    }		

	
	/*--------------------------------------------------------------------------------------
	handle event when this frame is being dragged by a mouse when it clicks and hold to 
	it dx/dy is the delta movement of mouse between previous and current onmousedrag 
	event occurence
	--------------------------------------------------------------------------------------*/
	this.onmousedrag = function(mx, my, dx, dy)
	{
		if(sx) x += dx;
		if(sy) y += dy;
		this.callEvent("mousedrag", {elem: this, name: name, x: mx, y: my, dx: dx, dy: dy});
	}		

	/*--------------------------------------------------------------------------------------
	handle event when mouse is moved out of this frame's extents
	--------------------------------------------------------------------------------------*/
	this.onmouseleave = function()
	{ 		
		// this event is fired up when mouse cursor leaves this frame but it's possible that mouse also hovers
		// on one of our child, if that's true, then it must be referring to _mousemove. we also fire up its mouseleave recursively
		if(_mousemove)
		{ 
			// fire up onmouseleave() on _mousemove if it exists
			if (_mousemove.onmouseleave) _mousemove.onmouseleave();

			// we must simulate such that if mouse cursor leaves this frame's child, then it must surely hover back to this frame
			// so we fire up this frame's mouseover event 
			if (this.onmouseover) this.onmouseover();
		}
		// at this point if mouse is also hovering in one of our children, it has already fired up its mouseleave event...
		_mousemove = null;

		this.callEvent("mouseleave", {elem: this, name: name});
	}

	/*--------------------------------------------------------------------------------------
	handle event when mouse just moved inside this frame's extents
	--------------------------------------------------------------------------------------*/
	this.onmouseenter = function()
	{ 
		this.callEvent("mouseenter", {elem: this, name: name});
	}	

	/*--------------------------------------------------------------------------------------
	handle event when mouse is move into one of its children
	--------------------------------------------------------------------------------------*/
	this.onmouseout = function()
	{ 
		this.callEvent("mouseout", {elem: this, name: name});
	}	  	

	/*--------------------------------------------------------------------------------------
	handle event when mouse just moved inside this frame's extents
	--------------------------------------------------------------------------------------*/
	this.onmouseover = function()
	{ 
		this.callEvent("mouseover", {elem: this, name: name});
	}	 	

	/*--------------------------------------------------------------------------------------
	
	--------------------------------------------------------------------------------------*/
	if (typeof parent !== 'undefined' && parent){if (parent.addChild){ parent.addChild(this); }}
}


/*------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------------------------------------------*/
Root = function(element, name)
{
	/*--------------------------------------------------------------------------------------
	debug tools
	--------------------------------------------------------------------------------------*/
	this.numPopup = function(){ return popup.numChildren(); }
	this.getPopupHead = function(){ return popup.getHead(); }

	/*--------------------------------------------------------------------------------------
	create frame object
	--------------------------------------------------------------------------------------*/
	Frame.call(this, null, name, 0, 0, 0, 0, false, false);

	/*--------------------------------------------------------------------------------------
	extent property handlers are overriden to make their values always match element extent
	--------------------------------------------------------------------------------------*/
    Object.defineProperty(this, "width", 
    { 
        get: function(){ return element.width; }, 
        set: function(e){}
    });

    // width, height setter fires up resize event handler
    Object.defineProperty(this, "height", 
    { 
        get: function(){ return element.height; }, 
        set: function(e){} 
	});  	

	/*--------------------------------------------------------------------------------------
	x,y property handlers are overriden to make their valuues always 0, 0
	--------------------------------------------------------------------------------------*/
	Object.defineProperty(this, "x", 
	{ 
		configurable: true,
		get: function(){ return 0; }, 
		set: function(e){}
	});

	Object.defineProperty(this, "y", 
	{ 
		configurable: true,
		get: function(){ return 0; }, 
		set: function(e){}
	});	

	/*--------------------------------------------------------------------------------------
	ensures position will always be 0, 0. make sure to bind "this" object to event handler 
	so it recognize the "this" in the function
	--------------------------------------------------------------------------------------*/
	this.addEventListener("move", function(e)
	{
		// set only if != 0 so u don't get into infinite loop bug
		if (e.x != 0) this.x = 0;
		if (e.y != 0) this.y = 0;
	}.bind(this));

	/*--------------------------------------------------------------------------------------
	_mousedown points to a child where the mouse click
	--------------------------------------------------------------------------------------*/
	var _mousedown = null;

	/*--------------------------------------------------------------------------------------
	listen to "mousemove" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousemove", function(e)
	{ 
		// instead of handling this event immediately, let's queue it as task4
		this.queueTask(function()
		{
			// calculate the mouse cursor's relative position (mx, my) to element we are bound to
			var r = element.getBoundingClientRect();
			var mx = e.pageX - r.left; 
			var my = e.pageY - r.top; 
		
			// if a child was clicked clicked to while mouse is moving, it should track mouse movement
			if (_mousedown)
			{
				if(_mousedown.onmousedrag){_mousedown.onmousedrag(mx, my, e.movementX, e.movementY);}
			}
			// recursively find the top frame that mouse cursor intersect
			else
			{
				// let popup manager handle mousemove event first
				if (!popup.onmousemove(mx, my, e.movementX, e.movementY))
				{
					// if none of popup manager's children intersect with mouse, let root handle it
					this.onmousemove(mx, my, e.movementX, e.movementY);
				}
			}
		}.bind(this));
				
	}.bind(this));

    /*--------------------------------------------------------------------------------------
	listen to "mousedown" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousedown", function(e)
	{ 
		// instead of handling this event immediately, let's queue it as task
		this.queueTask(function()
		{
			// calculate the mouse cursor's relative position (mx, my) to element we are bound to
			var r = element.getBoundingClientRect();
			var mx = e.pageX - r.left; 
			var my = e.pageY - r.top; 

			// let's check popup frame first if one of its children captured mouse
			_mousedown = popup.onmousedown(mx, my);

			// if the ones that captured is the popup frame itself, none of its children captured it. let the root handle 
			// mousedown instead
			if (_mousedown == popup)
			{
				// this will recursively find the top frame mouse clicked and down to root
				_mousedown = this.onmousedown(mx, my);
			}
		}.bind(this));
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	since root's extent is expected to be the same as its "parent" element, we don't bother
	setting its width and height property anymore. in fact it's just set to 0,0. so when
	checking for mouse cursor intersect, we now have to use the element's width, height. 
	x,y is also assumed to be always 0,0 because root fills the element.
	--------------------------------------------------------------------------------------*/
	this.setIntersect(function()
	{
		var P = this.getAbsPos();		
		if (0 > P.x + element.width) return false;
		if (0 > P.y + element.height) return false;
		if (0 < P.x) return false;
		if (0 < P.y ) return false;
		return true;
	}.bind(this));

	/*--------------------------------------------------------------------------------------
	listen to "mouseup" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseup", function(e)
	{ 
		// instead of handling this event immediately, let's queue it as task
		this.queueTask(function()
		{
			// calculate the mouse cursor's relative position to element we are bound to
			var r = element.getBoundingClientRect();
			var mx = e.pageX - r.left; 
			var my = e.pageY - r.top; 
					
			// if mouse button clicked into a child...
			if(_mousedown)
			{
				// is mouse cursor still hovering the child it click to?`
				if (_mousedown.intersect)
				{
						// if yes, let the child handle "mouseup" event
						if (_mousedown.intersect(mx, my)){if (_mousedown.onmouseup) _mousedown.onmouseup(mx, my);}		
						
						// otherwise, let the child handle "mouse leave" event
						else
						{ 
							if (_mousedown.onmouseleave) _mousedown.onmouseleave(); 
						}
				}
				// if mouse cursor is now hovering on another child...
				else{if (_mousedown.onmouseleave) _mousedown.onmouseleave();}
			}
			_mousedown = null;
		}.bind(this));
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	root will fire up its 'mouseenter' event once mouse hovers back into the element it's 
	associated with
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseenter", function(e) // __DEBUG__
	{
		this.queueTask(function()
		{		
			this.onmouseenter();
		}.bind(this));		
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	when mouse cursor totally leaves the element the root is associated with, fire up
	'mouseleave' event and it will fire up it up recursively. this will ensure any 
	descendant that is 'mousemove' will fire up its 'mouseleave' event
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mouseleave", function(e) // __DEBUG__
	{
		this.queueTask(function()
		{		
			popup.deactivate(); // __DEBUG__
			popup.onmouseleave(); // __DEBUG__
			this.onmouseleave();
		}.bind(this));		
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	override draw function so we can also draw our popup manager
	--------------------------------------------------------------------------------------*/
	var d = this.draw;
	this.draw = function()
	{
		d.call(this);
		popup.draw();
	}

	/*--------------------------------------------------------------------------------------
	override update function so we can also update our popup manager
	--------------------------------------------------------------------------------------*/
	var u = this.update;
	this.update = function()
	{
		popup.update();
		u.call(this);
	}

	/*--------------------------------------------------------------------------------------
	function to allow application to instance a popup object
	--------------------------------------------------------------------------------------*/
	this.createPopup = function(name, x, y, w, h, sx, sy)
	{
		return new Popup(popup, name, x, y, w, h, sx, sy);		
	}

	/*--------------------------------------------------------------------------------------
	the "root" of popups. it inherits from popup class and overrides certain properties
	and functions to make it behave uniquely as popup manager instead of generic popup
	--------------------------------------------------------------------------------------*/
	function PopupManager(parent, name, x, y, w, h, sx, sy)
	{
		Popup.call(this, parent, name, x, y, w, h, sx, sy);

		//extent property handlers are overriden to make their values always match element extent
		Object.defineProperty(this, "width", 
		{ 
			configurable: true,
			get: function(){ return element.width; }, 
			set: function(e){}
		});

		Object.defineProperty(this, "height", 
		{ 
			configurable: true,
			get: function(){ return element.height; }, 
			set: function(e){} 
		});  	

		// x,y property handlers are overriden to make their values always 0, 0
		Object.defineProperty(this, "x", 
		{ 
			configurable: true,
			get: function(){ return 0; }, 
			set: function(e){}
		});

		Object.defineProperty(this, "y", 
		{ 
			configurable: true,
			get: function(){ return 0; }, 
			set: function(e){}
		});			
	}

	/*--------------------------------------------------------------------------------------
	popup control. defined inside root because we want it to be instance only through root
	as it's always a child of the popup manager. popup manager is not exposed
	--------------------------------------------------------------------------------------*/
	function Popup(parent, name, x, y, w, h, sx, sy)
	{
		// debug functions
		this.getHead = function(){ return head; }

		// popup is a frame 
		Frame.call(this, parent, name, x, y, w, h, sx, sy);
				
		var head = null; // head frame this popup points to, if any		
		var tail = null; // tail frame this popup points to, if any
		var state = false; // is it active or inactive?

		// deactivate this popup's head
		this.deactivateHead = function()
		{
			if (head == null) return;
			else
			{
				// no point trying to deactive a head that is not active anymore
				if(head.active())head.deactivate();
				head = null;
			}
		}	

		// deactivate this popup, also deactivating its head recursively
		this.deactivate = function()
		{
			// remove from popup manager 
			this.remove();
			state = false;

			// if this has head, recursively deactivate it
			this.deactivateHead();

			// does it have tail? set tail.head = null
			if(tail) tail.deactivateHead();
			tail = null;

			// fire up event handler
			this.callEvent("deactivate",{elem: this, name: name});
		}

		// activate another popup as this popup's head
		this.activateHead = function(e)
		{
			// if we're trying to activate a head that is already our head, don't bother
			if(e == head) return;

			// if this has existing head, deactivate it recursively
			this.deactivateHead();

			// set the new head and activate it if it's not yet active
			head = e;
			if(!head.active()) head.activate(this);
		}

		// activate this popup. if tail is not specified, it assumes popup manager as tail 
		this.activate = function(t = null)
		{
			// no tail? let popup manager be tail
			if(!t) t = parent;

			// add as child to popup manager
			this.add();
			state = true;

			// do this to so tail can set this as its head
			t.activateHead(this);
			tail = t;		

			// not necessary but do it anyways
			head = null;	

			// fire up event handler
			this.callEvent("activate",{elem: this, name: name, head: head, tail: tail});
		}

		// check if this is active or not
		this.active = function(){ return state; }

		// deactive its head recursively if it gets clicked
		this.addEventListener("mousedown", function(e)
		{
			this.deactivateHead();
		}.bind(this));

		// constructor. deactivated by default upon instance
		this.addEvent("activate");
		this.addEvent("deactivate");
		this.deactivate();
	}

	/*--------------------------------------------------------------------------------------
	constructor
	--------------------------------------------------------------------------------------*/	
	// create the popup manager. make root parent 
	var popup = new PopupManager(this, name + "_pp", 0, 0, 0, 0, false, false);
	// remove from root children list to make it illegitimate
	popup.remove();
}


/*------------------------------------------------------------------------------------------------------------
slider control element

-   design philosophy
	-	main component 
		-	frame which serves as slider's body
		-	not movable
	-	thumb component
		-	slider frame's child
		-	not movable. movement will be done manually by repositioning based on slider's value range			
		-	if size become the same as slider's, thumb will not be scrollable anymore and slider value
			will not change
		-   thumb size aligns with orientation e.g. if vertical orientation, thumb size = thumb.height
		-   width, height is not check for validity but thumb size is ensure to be <= body size        
    -	min, max, value
		-   setting min/max does not perform sanity check. it's up to user to ensure min/max values are 
			valid
    	-   value(current) are checked if valid. it will always be within min/max range
		-   min/max and value is expected as integers. but it will not be checked. it's up to users 
			to ensure they set values as integers or expect undefined behaviors from slider
   		-   value(current) are checked if valid. it will always be within min/max range
    -   if application requires range to be in decimal solution e.g. -0.01 to +0.01 and index count of 10, 
        it is up to users to inherit this class and wrap functions to manage this        
    -   separate draw events for body and thumb for convenience
		
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
    -   show
        -   if hidden, slider is not drawn nor it receives user input (disabled)
    -   vertical (v)
        -   slider's orientation. 
		-   does not transpose slider's width, height if slider's orientation is changed but it transposes thumb size
-	events
	-	min, max, change
		-	fires up when min, max, or current value has changed
	-	thumbresize
		-	to handle when thumb size changed
	-	drawthumb
		-	to handle drawing thumb

------------------------------------------------------------------------------------------------------------*/
function Slider(parent, name, v, x, y, w, h, t, min, max, show = true)
{
	/*--------------------------------------------------------------------------------------
	thumb is a frame, child of this frame
	--------------------------------------------------------------------------------------*/
	Frame.call(this, parent, name, x, y, w, h, false, false, show);
	var thumb = new Frame(this, name + "_thumb", 0, 0, v? w:t, v? t:h, false, false, show); 

	/* --------------------------------------------------------------------------------------
	internal function that updates the thumb position based on current value
	-------------------------------------------------------------------------------------- */
	var updateThumbPos = function()
	{
        if (v)
        {
			thumb.x = 0;

			// we add these 2 lines to make sure we don't set thumb.y to invalid value. 
			// otherwise, we might have a divide-by-zero on the next line
			if (max - min <= 0){ thumb.y = 0; return; }
			if (h - t <= 0){ thumb.y = 0; return; }

            thumb.y = (current - min) / (max - min) * (h - t);
        }
        else 
        {
            thumb.y = 0;

			// we add these 2 lines to make sure we don't set thumb.x to invalid value. 
			// otherwise, we might have a divide-by-zero on the next line
			if (max - min <= 0){ thumb.x = 0; return; }
			if (w - t <= 0){ thumb.x = 0; return; }

            thumb.x = (current - min) / (max - min) * (w - t);
        }
	}

	/* --------------------------------------------------------------------------------------
    add event handler for drawing the thumb frame. 
	-------------------------------------------------------------------------------------- */
	thumb.addEventListener("draw", function(e)
	{
		e.elem = this;
		e.name = name;
		e.v = v;
		e.value = current;
		e.min = min;
		e.max = max;
		this.callEvent("drawthumb", e);
	}.bind(this));	

	/* --------------------------------------------------------------------------------------
	add event handler for thumb size change
	-------------------------------------------------------------------------------------- */
	thumb.addEventListener("resize", function(e)
	{
		this.callEvent("thumbresize", e);
	}.bind(this));		

	/* --------------------------------------------------------------------------------------
    thumb size is stored in thumb height or width depending on slider orientation
	-------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "thumbsize", 
    {
        get: function(){ return v? thumb.height : thumb.width; }, 
        set: function(e)
        { 
            if (v)
            {
                // if slider's orientation is vertical, thumb width fills slider's width
                thumb.width = this.width;

                // make sure thumb size <= silder.size
                thumb.height = e;
                if (thumb.height > this.height) thumb.height = this.height;

                // once we have valid thumb size, we store it in t as t is used by functions
                // in calculating thumb positions, movement, etc...
                t = thumb.height;
                
                // finally, update thumb position based on new size
                updateThumbPos();		
            }
            else
            {
                // if slider's orientation is horizontal, thumb height fills slider's height
                thumb.height = this.height;

                // make sure thumb size <= body.size
                thumb.width = e;
                if (thumb.width > this.width) thumb.width = this.width;

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
			
			this.callEvent("change", {elem: this, name: name, value: current, min: min, max: max});
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
			
			this.callEvent("min", {elem: this, name: name, value: current, min: min, max: max});
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

			this.callEvent("max", {elem: this, name: name, value: current, min: min, max: max});
		}
	});	

	/* --------------------------------------------------------------------------------------
	snapshot current value and x,y position of thumb when you mousedown on the thumb to be
	as reference (initial value) for mouse drag
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
		var shift = ((v?h:w) - t) / (max - min);			

		// this can happen if thumbsize is at least the size of slider. this will cause divide-by-zero
		// on calculating new current. so we skip and keep current value unchanged instead.
		if(shift <= 0) return;
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = M.current + Math.round( (v?e.y:e.x) / shift);				

	}.bind(this));	

	/* --------------------------------------------------------------------------------------
	when user click (mousedown) on the slider's body where thumb does not occupy, slider 
	forces the thumb to be repositioned where it's center sits on the mouse pointer if
	possible. the center position is with respect to its orientation - meaning, the slider's
	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	this.addEventListener("mousedown", function(e)
	{
		// if min >= max, we'll end up with invalid shift value. let's prevent it and don't
		// bother with updating current value
		if (max - min <= 0) return;

		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = this.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);

		// calculate actual size of 1 shift 
		var shift = ( (v?h:w) - t) / (max - min);			

		if(shift <= 0) return;
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = Math.round( (v?e.y:e.x) / shift) + min;					

	}.bind(this));		

	/* --------------------------------------------------------------------------------------
	when mouse cursor is dragged into slider's body, reposition the thumb so that its center
	sits at	the mouse pointer whenever possible. the center position is with respect to its
	orientation - meaning, the slider's	length 't' is centered. it's thickness is ignored.	
	-------------------------------------------------------------------------------------- */
	this.addEventListener("mousedrag", function(e)
	{		
		// if min >= max, we'll end up with invalid shift value. let's prevent it and don't
		// bother with updating current value
		if (max - min <= 0) return;

		// calculate relative position of mouse cursor with body + thumb's center position
		// note that we ignore slider's orientation and just blindly calculate with thumb'same
		// length on both x and y. this is because only one of them will be used to calculate
		// position and the choice will depend on the slider's orientation
		var P = this.getAbsPos();
		e.x -= (P.x + t/2);
		e.y -= (P.y + t/2);

		// calculate actual size of 1 shift 
		var shift = ( (v?h:w) - t) / (max - min);			

		if(shift <= 0) return;
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.value = Math.round( (v?e.y:e.x) / shift) + min;			

	}.bind(this));		
	
	/* --------------------------------------------------------------------------------------
    setter/getter for orientation
    -------------------------------------------------------------------------------------- */
    Object.defineProperty(this, "vertical", 
    {
        get: function(){ return v; }, 
        set: function(e)
        {
            // don't bother if our orientation is already correct
            if (e == v) return;
            else v = e;

            // set thumb size to ensure thumb <= body.size
            this.thumbsize = t;

            // update thumb position based on body's size and possibly thumbs as well
            updateThumbPos();		
        }
	});	
	
	/* --------------------------------------------------------------------------------------
	update thumb size and position when slider's extent changes
	-------------------------------------------------------------------------------------- */
	this.addEventListener("resize", function(e)
	{
		w = e.w;
		h = e.h;
		this.thumbsize = t; // set thumb size to ensure thumb <= body.size
		updateThumbPos(); // update thumb position based on body's size and possibly thumbs as well

	}.bind(this));

	/* --------------------------------------------------------------------------------------
	update local variable when slider repositions
	-------------------------------------------------------------------------------------- */
	this.addEventListener("move", function(e)
	{
		x = e.x;
		y = e.y;
	});

	/* --------------------------------------------------------------------------------------
    constructor
	-------------------------------------------------------------------------------------- */

	// add events specifically for slider
	this.addEvent("drawthumb");	
	this.addEvent("thumbresize");	
	this.addEvent("change");	
	this.addEvent("min");	
	this.addEvent("max");	

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
	-	drawcontentbegin
		-	fires up inside 'draw' event
		-	provides coords and extent of listbox so you can draw background if needed.
		-	can set draw states for drawing listbox items
	-	drawcontent
		-	fires up after 'drawcontentbegin' inside 'draw'
		-	executed for each list item visible in the ListBox. 
		-	provides the coords and extent for list item to be drawn
	-	drawcontentend
		-	fires up after all 'drawcontent' events 
		-	can restore draw states after drawing contents
	-	drawthumb, drawslider
		- 	you can draw the thumb and background of the slider used as scrollbar 		
	-	select
		-	fires up when an item is selected. passes 's' parameter that holds select index value
	-	thumbresize, sliderresize
		-	fires up when slider and/or its thumb change size
	-	change
		-	fires up when slider value changes e.g. it scrolled

------------------------------------------------------------------------------------------------------------*/
function ListBox(parent, name, x, y, w, h, min = 1, max = 0, show = true)
{
	/* --------------------------------------------------------------------------------------
	properties and their default values
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
	Frame.call(this, parent, name, x, y, w, h, false, false, show);
	var scrollbar = new Slider(this, name + "_sb", true, w - t, 0, t, h, ts, min*res, max*res);

	/*--------------------------------------------------------------------------------------
    handle draw event here 
    --------------------------------------------------------------------------------------*/

	// body is the defacto container. what you draw here is the background of the container itself
	this.addEventListener("draw", function(e)
	{	
		// begin draw event. draw background, start clipping, etc...
		this.callEvent("drawcontentbegin", e);

		// draw each content. this loop will set coordinates and extent value for each item.
		var start = Math.floor((scrollbar.value - scrollbar.min) / res);
		var end = Math.ceil((scrollbar.value > scrollbar.max? scrollbar.max: scrollbar.value) / res);
		for (var i = start; i < end; i++)
		{
			this.callEvent("drawcontent", 
			{
				elem: this, 
				name: name, 
				i: i, // content index
				x: e.x, 
				y: e.y + h/(scrollbar.min/res) * (i - (scrollbar.value - scrollbar.min)/res), 
				w: e.w - (scrollbar.show? t : 0), 
				h: h/(scrollbar.min/res),
				s: (i == select? true: false), // is this content selected?
				m: (i == mouseover? true: false), // is mouse cursor hovering this content?		
				vx: e.vx,
				vy: e.vy,
				vh: e.vh,
				vw: e.vw,		
			});
		}
		// end draw event
		this.callEvent("drawcontentend", e);
	}.bind(this));	

	/*--------------------------------------------------------------------------------------
	drawslider event for drawing slider background
	--------------------------------------------------------------------------------------*/
	scrollbar.addEventListener("draw", function(e)
	{	
		this.callEvent("drawslider", e);
	}.bind(this));	

	/*--------------------------------------------------------------------------------------
	drawthumb event for drawing slider's thumb
	--------------------------------------------------------------------------------------*/
	scrollbar.addEventListener("drawthumb", function(e)
	{	
		this.callEvent("drawthumb", e);
	}.bind(this));	

	/*--------------------------------------------------------------------------------------
	handle event when slider resizes
	--------------------------------------------------------------------------------------*/
	scrollbar.addEventListener("resize", function(e)
	{
		this.callEvent("sliderresize", e);
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	handle event when slider thumb resizes
	--------------------------------------------------------------------------------------*/
	scrollbar.addEventListener("thumbresize", function(e)
	{
		this.callEvent("thumbresize", e);
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	handle event when slider value change
	--------------------------------------------------------------------------------------*/
	scrollbar.addEventListener("change", function(e)
	{
		this.callEvent("change", e);
	}.bind(this));		

	/*--------------------------------------------------------------------------------------
	drag mouse over listbox frame
	--------------------------------------------------------------------------------------*/
	this.addEventListener("mousedrag", function(e)
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
		this.callEvent("select", {elem: this, name: name, s: select});
	}.bind(this));	

	/*--------------------------------------------------------------------------------------
	find the item index where mouse cursor hovers
	--------------------------------------------------------------------------------------*/
	this.addEventListener("mousemove", function(e)
	{
		mouseover = (e.y - e.elem.getAbsPos().y) / (h/scrollbar.min) + (scrollbar.value - scrollbar.min);
		mouseover /= res;
		mouseover = Math.floor(mouseover);
	}.bind(this));	

	/*--------------------------------------------------------------------------------------
	no more mouseover on any item if mouse leaves listbox extent or enter 
	its child (scrollbar)
	--------------------------------------------------------------------------------------*/
	this.addEventListener("mouseleave", function(e){ mouseover = -1;}.bind(this));	
	this.addEventListener("mouseout", function(e){ mouseover = -1; }.bind(this)); 

	/*--------------------------------------------------------------------------------------
	find the item where mouse cursor click and set it as select
	--------------------------------------------------------------------------------------*/
	this.addEventListener("mousedown", function(e)
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
		this.callEvent("select", {elem: this, name: name, s: select});
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
			scrollbar.show = as? (scrollbar.min >= scrollbar.max? false: true): true;		
			onUpdateThumbSize();

			this.callEvent("min", {elem: this, name: name, min: scrollbar.min/res, max: scrollbar.max/res});
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
			scrollbar.show = as? (scrollbar.min >= scrollbar.max? false: true): true;		
			onUpdateThumbSize();

			// if our content size is now smaller than currently selected, let's reset select
			if (scrollbar.max <= select)
			{
				select = -1;
				
				// execute event handlers for select change
				this.callEvent("select", {elem: this, name: name, s: select});
			}

			this.callEvent("max", {elem: this, name: name, min: scrollbar.min/res, max: scrollbar.max/res});
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

	/* --------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------- */
	this.addEventListener("resize", function(e)
	{
		w = e.w;
		h = e.h;
		scrollbar.x = w - t;
		scrollbar.height = h;
		onUpdateThumbSize(); 
	}.bind(this));

	/* --------------------------------------------------------------------------------------
	update local variable when listbox repositions
	-------------------------------------------------------------------------------------- */
	this.addEventListener("move", function(e)
	{
		x = e.x;
		y = e.y;
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
			scrollbar.x = this.width - t;
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
			scrollbar.show = as? (scrollbar.min >= scrollbar.max? false: true): true;		
		} 
	});   

	/*---------------------------------------------------------------------------------------
    constructor
	-------------------------------------------------------------------------------------- */

	// add events specifically for listbox
	this.addEvent("drawcontentbegin");	
	this.addEvent("drawcontentend");	
	this.addEvent("drawcontent");	
	this.addEvent("drawthumb");	
	this.addEvent("drawslider");
	this.addEvent("thumbresize");	
	this.addEvent("sliderresize");
	this.addEvent("select");		
	this.addEvent("min");		
	this.addEvent("max");		
	this.addEvent("change");		
}	

 /*------------------------------------------------------------------------------------------------------------

 ------------------------------------------------------------------------------------------------------------*/
function DropDown(parent, name, x, y, w, h, show = true)
{
	/*---------------------------------------------------------------------------------------
	inherit from frame
	-------------------------------------------------------------------------------------- */
	Frame.call(this, parent, name, x, y, w, h, false, false, show);

	/*---------------------------------------------------------------------------------------
	look for root
	-------------------------------------------------------------------------------------- */
	var r = this;
	while(r.parent) r = r.parent;

	/*---------------------------------------------------------------------------------------
	"close" popup must always have the same extent as our drop down button
	dropdown popup width must also be same
	-------------------------------------------------------------------------------------- */
	this.addEventListener("resize", function(e)
	{
		cpp.width = e.w;
		cpp.height = e.h;
		ddpp.width = e.w;
	});

	/*---------------------------------------------------------------------------------------
	when dropdown is clicked, open the dropdown popup
	-------------------------------------------------------------------------------------- */
	this.addEventListener("mousedown", function(e)
	{ 
		this.activate();
	}.bind(this));	

	/*---------------------------------------------------------------------------------------
	create "close" popup frame
	-------------------------------------------------------------------------------------- */
	var cpp = r.createPopup(name + "_cpp", 0, 0, w, h, false, false);

	/*---------------------------------------------------------------------------------------
	deactivate "close" popup. this will recursively deactivate dropdown popup as well
	-------------------------------------------------------------------------------------- */
	cpp.addEventListener("mousedown", function(e){	cpp.deactivate(); });	

	/*---------------------------------------------------------------------------------------
	create the dropdown popup
	-------------------------------------------------------------------------------------- */
	var ddpp = r.createPopup(name + "_ddpp", 0, 0, w, 200, false, false);

	/*---------------------------------------------------------------------------------------
	handle state change: we refer to dropdown popup's state as our state
	-------------------------------------------------------------------------------------- */
	ddpp.addEventListener("deactivate", function(e){ this.callEvent("deactivate", {elem: this, name: name}); }.bind(this));	
	ddpp.addEventListener("activate", function(e){ this.callEvent("activate", {elem: this, name: name}); }.bind(this));	

	/*---------------------------------------------------------------------------------------
	draw events for popup frames
	-------------------------------------------------------------------------------------- */
	ddpp.addEventListener("draw", function(e){ this.callEvent("drawdropdown", e); }.bind(this));	
	cpp.addEventListener("draw", function(e){ this.callEvent("drawclosebutton", e); }.bind(this));	

	this.getDropDownFrame = function(){ return ddpp; }

	this.activate = function()
	{
		// get abs pos of this frame. we'll use this as position of our popups. 
		// popups are children to popup manager and it's basically a root
		var P = this.getAbsPos();

		// update position and of close popup
		cpp.x = P.x;
		cpp.y = P.y;
		cpp.width = this.width;
		cpp.height = this.height;

		// activate close popup now
		cpp.activate();

		// update dropdown popup position 
		ddpp.x = P.x;
		ddpp.y = P.y + this.height + 5;

		// activate dropdown popup as close popup's head (chain it)
		cpp.activateHead(ddpp);
	}

	this.deactivate = function()
	{
		cpp.deactivate();
	}

	/*---------------------------------------------------------------------------------------
	constructor
	-------------------------------------------------------------------------------------- */

	// we set event listeners to these popups but since they are inactive, update() from 
	// root won't call their updates(). we must force the event listeners to be added now
	// and to do that, force the popups' update()
	ddpp.update();
	cpp.update();

	// add events for dropdown
	this.addEvent("drawclosebutton");	
	this.addEvent("drawdropdown");	
	this.addEvent("activate");	
	this.addEvent("deactivate");	
}



/*------------------------------------------------------------------------------------------------------------
-	is a frame
-	has a popup
-	can have tail
-	can have content

------------------------------------------------------------------------------------------------------------*/
function _myMenuItem(parent, name, x, y, w, h, pp = "right", show = true)
{
	/*---------------------------------------------------------------------------------------
	inherit from frame
	-------------------------------------------------------------------------------------- */
	Frame.call(this, parent, name, x, y, w, h, false, false, show);

	/*---------------------------------------------------------------------------------------
	look for root
	-------------------------------------------------------------------------------------- */
	var r = this;
	while(r.parent) r = r.parent;

	/*---------------------------------------------------------------------------------------
	create the popup 
	-------------------------------------------------------------------------------------- */
	var popup = r.createPopup(name + "_popup", 0, 0, 0, 0, false, false);

	/*---------------------------------------------------------------------------------------
	activate popup when mouse over
	-------------------------------------------------------------------------------------- */
	this.addEventListener("mouseenter", function(e)
	{ 
		if (!active) this.activate();
	}.bind(this));	

	this.addEventListener("mousedown", function(e)
	{ 
		if (!active) this.activate();
	}.bind(this));	

	var tail = null;
	Object.defineProperty(this, "tail", 
	{ 
		get: function(){ return tail; }, 
		set: function(e)
		{ 
			tail = e; 
		}
	});

	/*---------------------------------------------------------------------------------------
	activate popup when mouse over
	-------------------------------------------------------------------------------------- */
	this.activate = function()
	{
		// get abs pos of this frame. we'll use this as position of our popups. 
		var P = this.getAbsPos();

		// update popup position 
		if(pp == "right")
		{
			popup.x = P.x + this.width + 5;
			popup.y = P.y;
		}
		else if(pp == "bottom")
		{
			popup.x = P.x;
			popup.y = P.y + this.height + 5;
		}

		// resize popup so it its contents fit in it
		if(content)
		{
			content.x = 0;
			content.y = 0;
			popup.width = content.width;
			popup.height = content.height;			
		}

		// activate menu popup as close popup's head (chain it)
		popup.activate(tail);
	}	

	/*---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------- */
	var content = null;
	this.setContent = function(f)
	{
		// resize popup so content fills it
		function fitContentInPopup(e)
		{
			popup.width = e.w;
			popup.width = e.w;
			popup.height = e.h;
		}

		// do we have content already? remove it
		if (content)
		{
			content.remove();
			content.parent = null;
			content.removeEventListener("resize", fitContentInPopup);
			content.tail = null;
			content = null;
		}

		// add this frame as popup's child
		f.remove();
		content = f;
		content.parent = popup;
		content.add();
		content.tail = popup;

		// make sure frame is 0,0
		content.x = 0;
		content.y = 0;

		// if frame resize, popup resize too
		content.addEventListener("resize", fitContentInPopup);		
	}	

	/*---------------------------------------------------------------------------------------
	handle state change: we refer to dropdown popup's state as our state
	-------------------------------------------------------------------------------------- */
	var active = false;
	Object.defineProperty(this, "active", { get: function(){ return active; }});	
	popup.addEventListener("deactivate", function(e)
	{ 
		active = false;
		this.callEvent("deactivate", {elem: this, name: name}); 
	}.bind(this));	
	popup.addEventListener("activate", function(e)
	{ 
		active = true;
		this.callEvent("activate", {elem: this, name: name}); 
	}.bind(this));	

	/*---------------------------------------------------------------------------------------
	draw events for popup frames
	-------------------------------------------------------------------------------------- */
	popup.addEventListener("draw", function(e){ this.callEvent("drawpopupmenu", e); }.bind(this));	

	this.deactivate = function()
	{
		popup.deactivate();
	}

	/*---------------------------------------------------------------------------------------
	constructor
	-------------------------------------------------------------------------------------- */

	// we set event listeners to these popups but since they are inactive, update() from 
	// root won't call their updates(). we must force the event listeners to be added now
	// and to do that, force the popups' update()
	popup.update();
	
	//popup.width = 100;
	//popup.height = 200;

	// add events for dropdown
	this.addEvent("drawpopupmenu");	
	this.addEvent("activate");	
	this.addEvent("deactivate");	
}


/*------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------------------------------------------*/
function Menu(parent, name, x = 0, y = 0, w = 100, h = 48, v = false, font = "tahoma", size = 16)
{
	/*---------------------------------------------------------------------------------------
	is a frame
	-------------------------------------------------------------------------------------- */
	Frame.call(this, parent, name, x, y, 0, 0, false, false);

	/*---------------------------------------------------------------------------------------
	menu items container
	-------------------------------------------------------------------------------------- */
	var items = [];
	
	this.addMenu = function(name)
	{
		// create toggle button, as frame

		// create popup 

		// create 'item' object that is constructed from the popup and button


		var item = new Item(this, name, 0, 0, w, h, (v? "right":"bottom"), font, size);
		item.tail = tail;

		if (items.length)
		{
			if (v)
			{
				item.x = 0;
				item.y = items[items.length - 1].y + items[items.length - 1].height;     
			}
			else
			{
				item.x = items[items.length - 1].x + items[items.length - 1].width;     
				item.y = 0;
			}
		}
		else
		{
			item.x = 0;
			item.y = 0;
		}
		items.push(item);                
		if(v)
		{
			var maxWidth = 0;
			for (var i = 0; i < items.length; i++)
			{
				if (items[i].width > maxWidth) maxWidth = items[i].width;
			}
			for (var i = 0; i < items.length; i++)
			{
				items[i].width = maxWidth;
			}
		}
		if(v)
		{
			this.height += item.height;
			this.width = item.width;
		}
		else
		{
			this.height = item.height;
			this.width += item.width;
		}
		return item;
	}

}


/*------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------------------------------------------*/
function Item(parent, name, x, y, w, h, pp = "right", show = true)
{
	/*---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------- */
	this.btn = new Frame(parent, name + '_button', x, y, w, h, show);
	this.addEvent("drawbutton");	
	this.btn.addEventListener("draw", function(e){ this.callEvent("drawbutton", e); });
	
	/*---------------------------------------------------------------------------------------
	look for root
	-------------------------------------------------------------------------------------- */
	var r = this;
	while(r.parent) r = r.parent;

	/*---------------------------------------------------------------------------------------
	create the popup 
	-------------------------------------------------------------------------------------- */
	var popup = r.createPopup(name + "_popup", 0, 0, 0, 0, false, false);

	/*---------------------------------------------------------------------------------------
	inherit from frame
	-------------------------------------------------------------------------------------- */
	Frame.call(this, popup, name, 0, 0, 0, 0, false, false);

	this.addEventListener("resize", function(e)
	{
		popup.width = e.w;
		popup.height = e.h;
	});

	return;
	
	

	/*---------------------------------------------------------------------------------------
	activate popup when mouse over
	-------------------------------------------------------------------------------------- */
	btn.addEventListener("mouseenter", function(e)
	{ 
		if (!active) this.activate();
	}.bind(this));	

	btn.addEventListener("mousedown", function(e)
	{ 
		if (!active) this.activate();
	}.bind(this));	

	var tail = null;
	Object.defineProperty(this, "tail", 
	{ 
		get: function(){ return tail; }, 
		set: function(e)
		{ 
			tail = e; 
		}
	});

	/*---------------------------------------------------------------------------------------
	activate popup when mouse over
	-------------------------------------------------------------------------------------- */
	this.activate = function()
	{
		// get abs pos of this frame. we'll use this as position of our popups. 
		var P = btn.getAbsPos();

		// update popup position 
		if(pp == "right")
		{
			popup.x = P.x + btn.width + 5;
			popup.y = P.y;
		}
		else if(pp == "bottom")
		{
			popup.x = P.x;
			popup.y = P.y + btn.height + 5;
		}

		// resize popup so it its contents fit in it
		if(content)
		{
			content.x = 0;
			content.y = 0;
			this.width = content.width;
			this.height = content.height;			
		}

		// activate menu popup as close popup's head (chain it)
		popup.activate(tail);
	}	

	/*---------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------- */
	var content = null;
	this.setContent = function(f)
	{
		// resize popup so content fills it
		function fitContentInPopup(e)
		{
			popup.width = e.w;
			popup.width = e.w;
			popup.height = e.h;
		}

		// do we have content already? remove it
		if (content)
		{
			content.remove();
			content.parent = null;
			content.removeEventListener("resize", fitContentInPopup);
			content.tail = null;
			content = null;
		}

		// add this frame as popup's child
		f.remove();
		content = f;
		content.parent = popup;
		content.add();
		content.tail = popup;

		// make sure frame is 0,0
		content.x = 0;
		content.y = 0;

		// if frame resize, popup resize too
		content.addEventListener("resize", fitContentInPopup);		
	}	 

	/*---------------------------------------------------------------------------------------
	handle state change: we refer to dropdown popup's state as our state
	-------------------------------------------------------------------------------------- */
	var active = false;
	Object.defineProperty(this, "active", { get: function(){ return active; }});	
	popup.addEventListener("deactivate", function(e)
	{ 
		active = false;
		this.callEvent("deactivate", {elem: this, name: name}); 
	}.bind(this));	
	popup.addEventListener("activate", function(e)
	{ 
		active = true;
		this.callEvent("activate", {elem: this, name: name}); 
	}.bind(this));	

	/*---------------------------------------------------------------------------------------
	draw events for popup frames
	-------------------------------------------------------------------------------------- */
	popup.addEventListener("draw", function(e){ this.callEvent("drawpopupmenu", e); }.bind(this));	

	this.deactivate = function()
	{
		popup.deactivate();
	}

	/*---------------------------------------------------------------------------------------
	constructor
	-------------------------------------------------------------------------------------- */

	// we set event listeners to these popups but since they are inactive, update() from 
	// root won't call their updates(). we must force the event listeners to be added now
	// and to do that, force the popups' update()
	popup.update();
	
	//popup.width = 100;
	//popup.height = 200;

	// add events for dropdown
	this.addEvent("drawpopupmenu");	
	this.addEvent("activate");	
	this.addEvent("deactivate");	
}

/*---------------------------------------------------------------------------------------
menu
-	is a frame
-	has items as children

submenu
-	is a menu
-	parent is a popup
-	has a switch which is a menu item
-	can only be created by menu
-	on create
	-	popup's tail is the menu creator

menuitem



-------------------------------------------------------------------------------------- */



