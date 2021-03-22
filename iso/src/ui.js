/*------------------------------------------------------------------------------------------------------------
action item:
- remove setEventHandlers() as they are now replaced by addEventListeners()
-	make event handlers array so you can add multiple handler for the same event

completed[20180316]
-	element parameter now expects it to be scene and not canvas

completed[20180311]
- 	slider control class implemented
-	mx, my now passed to mousedrag event
-	mouse cursor mx, my is now being passed to onmousedown, onmouseup, mousemove event handlers for 
	frame, root
-	remove findTopAtPoint() and updated findTopChildAtPoint() so it can do the same job as findTopAtPoint()

completed[20180307]
- 	handle mousemove, mouseleave, mouseover event handlers for root and frame class and test them
- 	add name string as property

------------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------------
root element. it all starts here.
- 	this class instantiates the main object in user interface
- 	it binds to an element and resizes itself automatically to fit within its bounds/extent	by 
	listening to the element's "resize" event 
- 	it doesn't need to be rendered as its purpose is for logic use
-	the element it binds to is typically a scene element but it does not expect it to be.
	all it needs is the element's width and height and event handlers
-	it's top-left position is always 0,0 and width, height is always equal to parent's width, heigh 
	as it always fit to fill its parent extents
------------------------------------------------------------------------------------------------------------*/
function root(element, name, debug)
{
	/*--------------------------------------------------------------------------------------
	element is supposed to be a scene but this object does not expect it to be all it
	needs is the width/height of the object it will fit into
	--------------------------------------------------------------------------------------*/
	var w = element?(element.width()? element.width() : 0): 0;
	var h = element?(element.height()? element.height() : 0): 0;
	
	this.width = function(){ return w;}	
	this.height = function(){ return h;}	

	/*--------------------------------------------------------------------------------------
	will handle resize event from the object it binds to as it will resize itself to 
	always fit to it. note that canvas don't fire up resize event so the canvas of the
	scene this object binds to must have a custom event that fires up upon resize 
	--------------------------------------------------------------------------------------*/
	element.addEventListener("resize", function(e)
	{
		w = e?(e.detail.width? e.detail.width : 0): 0;
		h = e?(e.detail.height? e.detail.height : 0): 0;	
		if(debug)console.log("[root, " + name + "] parent resize event triggered: " + w + ", " + h);

		// fire up event handler
		if(eventResize)eventResize(this, w, h); 
		for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i](this, w, h); } 
	}.bind(this));
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var eventDraw = 0;
	var eventMouseDrag = 0;
	var eventMouseOver = 0;
	var eventMouseDown = 0;
	var eventMouseUp = 0;
	var eventMouseLeave = 0;
	var eventMouseMove = 0;
	var eventResize = 0;
	this.setEventHandler = function (e, f)
	{
		if (e === "draw"){ eventDraw = f; }
		if (e === "mousedrag"){ eventMouseDrag = f; }
		if (e === "mouseover"){ eventMouseOver = f; }
		if (e === "mousedown"){ eventMouseDown = f; }
		if (e === "mouseup"){ eventMouseUp = f; }
		if (e === "mouseleave"){ eventMouseLeave = f; }
		if (e === "mousemove"){ eventMouseMove = f; }
		if (e === "resize"){ eventResize = f; }
	}	
	
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	var mousemoveEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
		if (e === "mousemove"){ mousemoveEvents.push(f); }
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
	}	

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.addChild = function(child){ children.push(child); if(child.setParent) child.setParent(this); }
	this.removeChild = function(child)
	{
		for (var i = 0; i < children.length; i++)
		{
			if ( children[i] == child)
			{ 
				children.splice(i, 1); 
				return;
			}
		}
	}
	this.getNumChildren = function(){ return children.length; }
	this.setParent = function(p){ parent = p; }
	
	/*--------------------------------------------------------------------------------------
	this object doesn't really get rendered. its main purpose is to occupy the scene it 
	binds to. this function is used to render its child objects instead. however, an it 
	fires up a render event to allow application option in case users choose to
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{		
		if(eventDraw)eventDraw(this, 0, 0, w, h);
		for (var i = 0; i < drawEvents.length; i++){ drawEvents[i](this, w, h); } 		
		for(var i = 0; i < children.length; i++){if (children[i].draw) children[i].draw();}					
	}
		  
	/*--------------------------------------------------------------------------------------
	tests if mouse cursor is within its bounds (collision detection against mouse)
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
			if (children[i].hide){ if (children[i].hide()) continue; }
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
	_mousemove points to a top child where mouse cursor hovers when mouse button
	is released (mouse over)
	_mousedown points to a child where the mouse cursor hovers when mouse button is pressed
	--------------------------------------------------------------------------------------*/
	var _mousedown = 0;
	var _mousemove = 0;
	
		
	/*--------------------------------------------------------------------------------------
	listen to "mousemove" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousemove", function(e)
	{ 
		// calculate the mouse cursor's relative position to element we are bound to
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
			//var t = this.findTopAtPoint(mx, my);
			var t = this.findTopChildAtPoint(mx, my);		

			// if the top child intersecting with mouse cursor is not the same as the previous child,
			// it means that the mouse cursor is now hovering on a new child. call "mouse leave" event
			// on previous child so it can handle this event
			if (t != _mousemove)
			{ 
				if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave(); }
				
				if(t){ if(t.onmouseover) t.onmouseover(); }				
				// if t does not exist, we mousever in root. trigger event only if root isn't mousemove ui before
				else{ if(_mousemove != this) this.onmouseover(); }
			}		
			
			// update pointer to new child where mouse hovers and call "mouse over" event 
			if (t)_mousemove = t;
			else _mousemove = this;
			if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, e.movementX, e.movementY);}		
		}		
	
	}.bind(this));	
	
	/*--------------------------------------------------------------------------------------
	listen to "mousedown" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	element.addEventListener("mousedown", function(e)
	{ 
		if (debug) console.log("[root, " + name + "] parent mousedown event triggered");
		
		// calculate the mouse cursor's relative position to element we are bound to
		var r = element.getBoundingClientRect();
		var mx = e.pageX - r.left; 
		var my = e.pageY - r.top; 
		
		// find the top ui (including this) that the mouse button has click to and call its event
		//_mousedown = this.findTopAtPoint(mx, my, true);
		_mousedown = this.findTopChildAtPoint(mx, my, true, true);
		if (!_mousedown) _mousedown = this; 
		
		if (debug && _mousedown == this) console.log("[root, " + name + "] mousedown");

		if (_mousedown){ if (_mousedown.onmousedown) _mousedown.onmousedown(mx, my); }
	}.bind(this));		
	
	/*--------------------------------------------------------------------------------------
	listen to "mouseup" event on the element it binds to.
	--------------------------------------------------------------------------------------*/
	document.addEventListener("mouseup", function(e)
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
		_mousedown = 0;
	}.bind(this));			
	
	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{ 
		if(debug)console.log("[root, " + name + "] onmousedrag " + dx + ", " + dy); 
		if(eventMouseDrag)eventMouseDrag(this, mx, my, dx, dy); 
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i](this, mx, my, dx, dy); }
	}	

	// handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		if(debug)console.log("[root, " + name + "] onmousedown "); 
		if(eventMouseDown)eventMouseDown(this, mx, my); 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i](this, mx, my); }
	}	
			
	// handle event when mouse is moving on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		if(debug)console.log("[root, " + name + "] onmouseup "); 
		if(eventMouseUp)eventMouseUp(this, mx, my); 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i](this, mx, my); }
	}	
	
	// handle event when mouse just moved inside this frame's extents
	this.onmouseover = function(){ if(debug)console.log("[root, " + name + "] onmouseover "); if(eventMouseOver)eventMouseOver(this); }	
	
	// handle event when mouse is moving on top of root
	this.onmousemove = function(mx, my, dx, dy)
	{ 
		if(debug)console.log("[root, " + name + "] onmousemove  " + dx + ", " + dy); 
		if(eventMouseMove)eventMouseMove(this, mx, my, dx, dy); 
		for (var i = 0; i < mousemoveEvents.length; i++){ mousemoveEvents[i](this, mx, my, dx, dy); }
	}		
}

/*------------------------------------------------------------------------------------------------------------
frame element. 
- 	typically used as container for control elements such as buttons, text box, list box, and drop downs
- 	can be drag around via mouse within the bounds of its parent, typically root element
- 	to draw, attach a draw event handler 
------------------------------------------------------------------------------------------------------------*/
function frame(parent, name, x, y, w, h, sx, sy, hide, debug)
{
	if (typeof parent !== 'undefined' && parent){if (parent.addChild){ parent.addChild(this); }}

	/*--------------------------------------------------------------------------------------
	holds child objects. bottom child is at start of array, and top child is at the end
	--------------------------------------------------------------------------------------*/
	var children = [];	
	this.setParent = function(p){ parent = p; }
	this.addChild = function(child){ children.push(child); if(child.setParent) child.setParent(this); }
	this.removeChild = function(child){ for (var i = 0; i < children.length; i++){ if ( children[i] == child){ children.splice(i, 1); return;} }}
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
			if (children[i].hide){ if (children[i].hide()) continue; }
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
	var eventDraw = 0;
	var eventMouseDrag = 0;
	var eventMouseOver = 0;
	var eventMouseDown = 0;
	var eventMouseUp = 0;
	var eventMouseLeave = 0;
	var eventMouseMove = 0;
	var eventResize = 0;
	this.setEventHandler = function (e, f)
	{
		if (e === "draw"){ eventDraw = f; }
		if (e === "mousedrag"){ eventMouseDrag = f; }
		if (e === "mouseover"){ eventMouseOver = f; }
		if (e === "mousedown"){ eventMouseDown = f; }
		if (e === "mouseup"){ eventMouseUp = f; }
		if (e === "mouseleave"){ eventMouseLeave = f; }
		if (e === "mousemove"){ eventMouseMove = f; }
		if (e === "resize"){ eventResize = f; }
	}
	
	var resizeEvents = [];
	var drawEvents = [];
	var mouseupEvents = [];
	var mousedownEvents = [];
	var mouseleaveEvents = [];
	var mousedragEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "resize"){ resizeEvents.push(f); }		
		if (e === "draw"){ drawEvents.push(f); }		
		if (e === "mouseup"){ mouseupEvents.push(f); }		
		if (e === "mousedown"){ mousedownEvents.push(f); }		
		if (e === "mouseleave"){ mouseleaveEvents.push(f); }		
		if (e === "mousedrag"){ mousedragEvents.push(f); }
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "resize"){ for (var i = 0; i < resizeEvents.length; i++){ if (resizeEvents[i] == f){ resizeEvents.splice(i,1); return; }}}			
		if (e === "draw"){ for (var i = 0; i < drawEvents.length; i++){ if (drawEvents[i] == f){ drawEvents.splice(i,1); return; }}}			
		if (e === "mouseup"){ for (var i = 0; i < mouseupEvents.length; i++){ if (mouseupEvents[i] == f){ mouseupEvents.splice(i,1); return; }}}			
		if (e === "mousedown"){ for (var i = 0; i < mousedownEvents.length; i++){ if (mousedownEvents[i] == f){ mousedownEvents.splice(i,1); return; }}}			
		if (e === "mouseleave"){ for (var i = 0; i < mouseleaveEvents.length; i++){ if (mouseleaveEvents[i] == f){ mouseleaveEvents.splice(i,1); return; }}}			
		if (e === "mousedrag"){ for (var i = 0; i < mousedragEvents.length; i++){ if (mousedragEvents[i] == f){ mousedragEvents.splice(i,1); return; }}}			
	}	
	
	/*--------------------------------------------------------------------------------------
	draw function
	option to set draw event handler 
	--------------------------------------------------------------------------------------*/
	this.draw = function()
	{
		if (hide) return;
		var P = this.getAbsPos();
		if(eventDraw)eventDraw(this, P.x, P.y, w, h);		
		for (var i = 0; i < drawEvents.length; i++) drawEvents[i](this, P.x, P.y, w, h);
		for (var i = 0; i < children.length; i++){ if (children[i].draw) children[i].draw(); }				
	}

	/*--------------------------------------------------------------------------------------
	_mousemove points to a top child where mouse cursor hovers when mouse button
	is released (mouse over)
	--------------------------------------------------------------------------------------*/
	var _mousemove = 0;	
	
	// handle event when this frame is being dragged by a mouse when it clicks and hold to it
	// dx/dy is the delta movement of mouse between previous and current onmousedrag event occurence
	this.onmousedrag = function(mx, my, dx, dy)
	{
		if(sx) x += dx;
		if(sy) y += dy;
		if(debug)console.log("[frame, " + name + "] onmousedrag " + dx + ", " + dy);
		if(eventMouseDrag)eventMouseDrag(this, mx, my, dx, dy);
		for (var i = 0; i < mousedragEvents.length; i++){ mousedragEvents[i](this, mx, my, dx, dy); }
	}	
	
	// handle event when mouse is moving on top of this frame
	this.onmousemove = function(mx, my, dx, dy)
	{
		var t = this.findTopChildAtPoint(mx, my);		

		// if the top child intersecting with mouse cursor is not the same as the previous child,
		// it means that the mouse cursor is now hovering on a new child. call "mouse leave" event
		// on previous child so it can handle this event
		if (t != _mousemove)
		{ 
			if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave(); }
			if(t){ if(t.onmouseover) t.onmouseover(); }				
		}		
		
		// update pointer to new child where mouse hovers and call "mouse over" event 
		_mousemove = t;
		if (_mousemove){if(_mousemove.onmousemove) _mousemove.onmousemove(mx, my, dx, dy);}		
		
		// fire up event handler
		if(debug)console.log("[frame, " + name + "] onmousemove " + dx + ", " + dy);
		if(eventMouseMove)eventMouseMove(this, mx, my, dx, dy); 
	}	

	// handle event when mouse is moved out of this frame's extents
	this.onmouseleave = function()
	{ 
		if(_mousemove){ if(_mousemove.onmouseleave) _mousemove.onmouseleave();}
		_mousemove = 0;
		
		if(debug)console.log("[frame, " + name + "] onmouseleave");
		if(eventMouseLeave)eventMouseLeave(this); 
		for (var i = 0; i < mouseleaveEvents.length; i++){ mouseleaveEvents[i](this); }
	}

	// handle event when mouse just moved inside this frame's extents
	this.onmouseover = function()
	{ 
		if(debug)console.log("[frame, " + name + "] onmouseover"); 
		if(eventMouseOver)eventMouseOver(this); 
	}	
	
	// handle event when mouse button is clicked into this frame
	this.onmousedown = function(mx, my)
	{ 
		if(debug)console.log("[frame, " + name + "] onmousedown"); 
		if(eventMouseDown)eventMouseDown(this, mx, my); 
		for (var i = 0; i < mousedownEvents.length; i++){ mousedownEvents[i](this, mx, my); }
	}
		
	// handle event when mouse is moving on top of this frame
	this.onmouseup = function(mx, my)
	{ 
		if(debug)console.log("[frame, " + name + "] onmouseup"); 
		if(eventMouseUp)eventMouseUp(this, mx, my); 
		for (var i = 0; i < mouseupEvents.length; i++){ mouseupEvents[i](this, mx, my); }
	}	

	// setters and getters
	// --------------------------------------------------------------------------------------
	this.width = function(){ return w;}	
	this.height = function(){ return h;}
	this.setPos = function(px, py){ x = px; y = py;}
	this.movePos = function(dx, dy){ x += dx; y += dy; }
	this.getPos = function(){ return { x: x, y: y }; }	
	this.hide = function(state){ if (state) hide = state; return hide; }
	this.setSize = function(pw, ph)
	{ 
		w = pw; h = ph; 
		if(eventResize)eventResize(this, w, h); 
		for (var i = 0; i < resizeEvents.length; i++){ resizeEvents[i](this, w, h); }	
	}
}

/*------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------------------------------------------*/
function slider(parent, name, vertical, x, y, w, h, t, min, max, hide, debug)
{
	var body = new frame(parent, "body", x, y, w, h, false, false, hide, debug);
	var thumb = new frame(body, "thumb", 0, 0, vertical? w:t, vertical? t:h, false, hide, debug); 
	
	// initialize current value to min 
	var current = min;	
		
	// updates the thumb position based on current value
	// --------------------------------------------------------------------------------------
	var updateThumbPos = function()
	{
		if (vertical) thumb.setPos(0, (current - min) / (max - min) * (h - t) );
		else thumb.setPos( (current - min) / (max - min) * (w - t), 0);
	}
	
	// update thumb position based on current value
	updateThumbPos();	
	
	/* --------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------- */
	this.get = function(){ return current; }
	
	this.set = function(curr)
	{		
		current = curr;
		if (current > max) current = max;
		if (current < min) current = min;
		
		// update thumb position based on current value
		updateThumbPos();		
	}	
	
	// draw body
	// --------------------------------------------------------------------------------------
	body.setEventHandler("draw", function(elem, x, y, w, h) 
	{
		if (hide) return;
		var P = elem.getAbsPos();
		if(eventDraw)eventDraw(this, P.x, P.y, w, h, vertical);		
	}.bind(this));
	
	// draw thumb
	// --------------------------------------------------------------------------------------
	thumb.setEventHandler("draw", function(elem, x, y, w, h) 
	{
		if (hide) return;
		var P = elem.getAbsPos();
		if(eventDrawThumb)eventDrawThumb(this, P.x, P.y, w, h, vertical);		
	}.bind(this));
	
	/* --------------------------------------------------------------------------------------
	thumb is set to be not draggable so we can manage its mouse drag movement here
	its movement shift snaps to slider's shift index
	-------------------------------------------------------------------------------------- */
	var M;
	thumb.setEventHandler("mousedrag",function(elem, mx, my, dx, dy)
	{
		// calculate relative position of mouse cursor with thumb
		var P = body.getAbsPos();
		mx -= M.x;
		my -= M.y;
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( M.current + Math.round( (vertical?my:mx) / shift) );			
		
	}.bind(this));
	
	/* --------------------------------------------------------------------------------------
	snapshot current value and mouse cursor on mousedown to be used as reference for 
	mouse drag
	-------------------------------------------------------------------------------------- */
	thumb.setEventHandler("mousedown", function(elem, mx, my)
	{
		M = { x: mx, y: my, current: current };
	});			
	
	/* --------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------- */
	body.setEventHandler("mousedown", function(elem, mx, my)
	{
		// calculate relative position of mouse cursor with body
		var P = body.getAbsPos();
		mx -= (P.x + t/2);
		my -= (P.y + t/2);
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( Math.round( (vertical?my:mx) / shift) + min );			
		
	}.bind(this));	
	
	/* --------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------- */
	body.setEventHandler("mousedrag", function(elem, mx, my, dx, dy)
	{		
		// calculate relative position of mouse cursor with body
		var P = body.getAbsPos();
		mx -= (P.x + t/2);
		my -= (P.y + t/2);
		
		// calculate actual size of 1 shift 
		var shift = ( ( vertical?h:w) - t) / (max - min);			
		
		// calculate which value is closest to the point, set current, and set new position of thumb
		this.set( Math.round( (vertical?my:mx) / shift) + min );			
		
	}.bind(this));	
	
	/* --------------------------------------------------------------------------------------
	let us take over body's mouse events
	-------------------------------------------------------------------------------------- */
	body.setEventHandler("mouseover", function(elem){ if(eventMouseOver)eventMouseOver(this); }.bind(this));		
	body.setEventHandler("mouseleave", function(elem){ if(eventMouseLeave)eventMouseLeave(this); }.bind(this));		
	
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var eventDraw = 0;
	var eventDrawThumb = 0;
	var eventMouseDrag = 0;
	var eventMouseOver = 0;
	var eventMouseDown = 0;
	var eventMouseUp = 0;
	var eventMouseLeave = 0;
	var eventMouseMove = 0;
	this.setEventHandler = function (e, f)
	{
		if (e === "draw"){ eventDraw = f; }
		if (e === "drawthumb"){ eventDrawThumb = f; }
		if (e === "mousedrag"){ eventMouseDrag = f; }
		if (e === "mouseover"){ eventMouseOver = f; }
		if (e === "mousedown"){ eventMouseDown = f; }
		if (e === "mouseup"){ eventMouseUp = f; }
		if (e === "mouseleave"){ eventMouseLeave = f; }
		if (e === "mousemove"){ eventMouseMove = f; }
		if (e === "resize"){ eventResize = f; }
	}	

	this.hide = function(state)
	{ 
		if (state)
		{
			hide = state; 
			thumb.hide(state);
			body.hide(state);
		}
		return hide; 
	}
}
