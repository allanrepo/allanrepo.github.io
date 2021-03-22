/*--------------------------------------------------------------------------------------------------
 create tile buttons
--------------------------------------------------------------------------------------------------*/
function createTileButton(scene, parent, x, y, w, h, sprite, tile, response)
{
	// draw event
	//----------------------------------------------------------------------------
	var draw = function(elem, x, y, w, h) 
	{
		scene.getCanvas().getContext("2d").shadowBlur=0;
		scene.getCanvas().getContext("2d").shadowColor="black";

		if (elem.mouseover) scene.getCanvas().getContext("2d").fillStyle= "rgba(192,192,192," + 1 + ")";
		else scene.getCanvas().getContext("2d").fillStyle= "rgba(192,192,192," + elem.onMouseOverAnim.get() + ")";
	
		if (elem.mousedown)	scene.getCanvas().getContext("2d").fillRect(x , y, w, h);				
		else scene.getCanvas().getContext("2d").fillRect(x, y, w, h);			
	
		var factor = w/sprite.width() < h/sprite.height() ? w/sprite.width(): h/sprite.height();
		var sw = sprite.width() * factor;
		var sh = sprite.height() * factor;
		var sx = w > sw? (w - sw)/2 : 0;
		var sy = h > sh? (w - sh)/2 : 0;
		
		if (elem.mouseover) scene.getCanvas().getContext("2d").globalAlpha = 1;		
		else scene.getCanvas().getContext("2d").globalAlpha = elem.onMouseOverAnim.get();		
		
		if (elem.mousedown) sprite.drawClip(scene.getCanvas(), 0, 0, sprite.width(), sprite.height(), x + sx + 2, y + sy + 2, sw, sh)
		else sprite.drawClip(scene.getCanvas(), 0, 0, sprite.width(), sprite.height(), x + sx, y + sy, sw, sh)

		scene.getCanvas().getContext("2d").globalAlpha = 1;	
	
		//scene.drawText(tile, x + 5,y + 5, "16px courier", "rgba(0,0,0," + elem.onMouseOverAnim.get() + ")");
		//scene.drawText(elem.onMouseOverAnim.get() + ", " + tile, x + 5,y + 5, "16px courier", "rgb(255,255,0)");
	}		

	// button behavior on mouse interaction
	//----------------------------------------------------------------------------
	var over = function(elem){ elem.mouseover = true; }
	var leave = function(elem){ elem.mouseover = false;  elem.mousedown = false; }	
	var down = function(elem){ elem.mousedown = true; }
	var up = function(elem)
	{ 
		elem.mousedown = false; 				
		if (response){ if(typeof response === 'function' ){ response(tile); }}				
	}			

	// button constructor
	//----------------------------------------------------------------------------
	var b = new frame(parent, x, y, w, h, false, false);
	b.setEventHandler("draw", draw);
	b.setEventHandler("mouseover", over);
	b.setEventHandler("mouseleave", leave);				
	b.setEventHandler("mousedown", down);
	b.setEventHandler("mouseup", up);				
	b.onMouseOverAnim = new sequencer(20, [0, 0.05,0.1,0.15, 0.2,0.25, 0.3,0.35, 0.4, 0.45,0.5,0.55, 0.6,0.65, 0.7,0.75, 0.8,0.85,0.9,0.95,1.0], scene);
	//b.onMouseOverAnim = new sequencer(20, [0, 0.05,0.1,0.15, 0.2,0.25, 0.3,0.35, 0.4, 0.45,0.5,0.55,], scene);
	b.onMouseOverAnim.loop(false);
	b.mouseover = false;
	b.mousedown = false;			
	return b;
}	

function tileSelectorUI(scene, parent, wb, hb, margin, onSelectTileEventHandler, imagelist)
{
	/*----------------------------------------------------------------------------
	handle event when one of the tileset button is clicked
	----------------------------------------------------------------------------*/
	var activeTileList = [];
	var onTileSetButtonClick = function(t)
	{
		console.log("onTileSetButtonClick: " + t);
		
		// find a tileset with value of 't'
		for (var i = 0; i < tilesets.length; i++)
		{
			// found a tileset we're looking for
			if (tilesets[i].tile == t)
			{
				addTileButtons(tilesets[i].list);
				break;				
			}
		}	
	}
	
	/*----------------------------------------------------------------------------
	add tiles to our frame
	----------------------------------------------------------------------------*/
	var addTileButtons = function(list)
	{
		// remove any active tile buttons in our frame
		removeTileButtons();

		for (var i = 0; i < list.length; i++)
		{
			// skip values outside of our tile list
			if (list[i] >= tiles.length) continue;
			
			// let's make the index easier to type...
			var m = list[i];

			// add this button to our frame
			f.addChild(tiles[m].button);

			// reposition this child to our frame
			var x = (activeTileList.length % tilesets.length) * (wb + margin) + margin;
			var y = Math.floor( activeTileList.length / tilesets.length) * (hb + margin) + margin;
			tiles[m].button.setPos(x, y);
			
			// make it visible
			tiles[m].button.onMouseOverAnim.stop();
			tiles[m].button.onMouseOverAnim.reverse(false);
			tiles[m].button.onMouseOverAnim.start();	
			
			// increment 
			activeTileList.push(tiles[m].button);					
		}
		
		// let's now resize our frame to fit tile buttons aligned with tilesets
		resizeFrame();					
	}
	
	/*----------------------------------------------------------------------------
	remove active tiles from our frame
	----------------------------------------------------------------------------*/	
	var removeTileButtons = function()
	{
		// remove tile buttons and clear our active list
		for (var i = 0; i < activeTileList.length; i++)
		{ 
			f.removeChild(activeTileList[i]); 
			
			// reset it's animation too
			activeTileList[i].onMouseOverAnim.stop();
			activeTileList[i].onMouseOverAnim.reset();
		}
		activeTileList.length = 0;
	}
	
	/*----------------------------------------------------------------------------
	add tileset
	----------------------------------------------------------------------------*/
	var tilesets = [];	
	this.add = function(tile, list)
	{
		// if tile is invalid (value does not exist in tile list, don't add this
		if (tile > tiles.length)
		{
			console.log("invalid tile: " + tile + ", tile length: " + tiles.length);
			return;
		}
		
		// each tileset must have unique value. if a similar tileset already exist, remove this existing one
		for (var i = 0; i < tilesets.length; i++)
		{ 
			if (tilesets[i].tile == tile)
			{ 
				f.removeChild(tilesets[i].button);
				tilesets.splice(i,1); 
				break; 
			}
		}
		
		// the tile list must have unique numbers. any duplicate must be removed
		// the tile must also have a value that exist in our tile list, or it will be removed
		console.log(list);
		for (var i = 0; i < list.length; i++)
		{
			// if this tile is invalid(value outside of tiles list), remove it
			if (list[i] >= tiles.length)	
			{ 
				list.splice(i,1); 
				i--; 
				continue; 
			}

			// at this point, our list[i] is valid, so we compare it with the rest of the array
			for (var j = i + 1; j < list.length; j++)
			{
				// this succeeding tile in array is a duplicate, remove it
				// also, if this succeeding tile in array is invalid value, remove it
				if (list[i] == list[j] || list[j] >= tiles.length)
				{
					list.splice(j,1);
					j--;
					continue;
				}
			}
		}
		console.log(list);
		
		// add this tileset 
		var tileset = {};
		tileset.tile = tile;
		tileset.list = list;
		tilesets.push(tileset);		

		// create button for this tileset
		//tileset.sprite = new sprite(imagelist[tile]);
		tileset.button = createTileButton(scene, f, 0, 0, wb, hb, tiles[tileset.tile].sprite, tileset.tile, onTileSetButtonClick);
				
		// with new tileset added, resize our frame to fit the new tileset button
		resizeFrame();	

		console.log("tileset " + tile + " added, numTiles: " + tilesets.length);
	}
	
	
	/*----------------------------------------------------------------------------
	update when tileset is added
	----------------------------------------------------------------------------*/
	var resizeFrame = function()
	{
		var nrows = Math.ceil( activeTileList.length / tilesets.length ) + 1;
		var hf = nrows * (hb + margin) + margin + ((nrows > 1)? 20: 0);
		var wf = (wb + margin) * tilesets.length + margin;
		f.setSize(wf,hf);
		
		console.log("resizeFrame() executed...");
	}	
	
	/*----------------------------------------------------------------------------
	our main event handlers
	----------------------------------------------------------------------------*/
	
	// if parent UI resize, reposition to bottom-right of it
	var onParentResize = function(elem, w, h){ f.setPos(w - f.width(), h - f.height()); }
	
	// if our frame resizes, reposition it to bottom-right of parent UI
	var onFrameResize = function(elem, w, h)
	{
		// reposition our frame to bottom-right of parent UI
		f.setPos(parent.width() - w, parent.height() - h);
		
		// reposition tileset buttons to bottom row of our frame
		for (var i = 0; i < tilesets.length; i++)
		{
			var bx = margin + (wb + margin) * i;
			var by = f.height() - hb - margin;
			tilesets[i].button.setPos(bx, by);
		}	

		console.log("frame resized...");		
	}
	
	// draw our frame
	var onFrameDraw = function(elem, x, y, w, h) 
	{
		scene.getCanvas().getContext("2d").shadowBlur=0;
		scene.getCanvas().getContext("2d").shadowColor="black";
		scene.getCanvas().getContext("2d").fillStyle= "rgba(255,255,255," + 0.1 + ")";
	//	scene.getCanvas().getContext("2d").fillRect(x, y, w, h);				
	}	
	
	// hovering over our frame makes tileset buttons appear
	var onFrameMouseOver = function(elem)
	{ 
		for(var i = 0; i < tilesets.length; i++)
		{
			tilesets[i].button.onMouseOverAnim.stop();
			tilesets[i].button.onMouseOverAnim.reverse(false);
			tilesets[i].button.onMouseOverAnim.start();		
		}		
	}		
	
	// hovering out of our frame makes tileset buttons disappear
	var onFrameMouseLeave = function(elem)
	{
		for(var i = 0; i < tilesets.length; i++)
		{
			tilesets[i].button.onMouseOverAnim.stop();
			tilesets[i].button.onMouseOverAnim.reverse(true);
			tilesets[i].button.onMouseOverAnim.start();		
		}			

		// remove all tile button children		
		removeTileButtons();
		
		// calculate width and height of our frame and resize it
		// this event will also automatically reposition tileset buttons
		resizeFrame();		
	}	
	
	/*----------------------------------------------------------------------------
	constructor
	----------------------------------------------------------------------------*/
	// create frame and add to parent, then update 
	var f = new frame(parent, 0, 0, 0, 0, false, false);
	parent.setEventHandler("resize", onParentResize);
	f.setEventHandler("resize", onFrameResize);
	f.setEventHandler("draw", onFrameDraw);
	f.setEventHandler("mouseover", onFrameMouseOver);
	f.setEventHandler("mouseleave", onFrameMouseLeave);
	
	// create a tile list and its buttons
	var tiles = [];
	for (var i = 0; i < imagelist.length; i++)
	{
		var tile = {};
		tile.sprite = new sprite(imagelist[i]);
		tile.button = createTileButton(scene, 0, 0, 0, wb, hb, tile.sprite, i, onSelectTileEventHandler);
		tiles.push(tile);
	}
	
	console.log("numTiles: " + tiles.length);	
}


/* ---------------------------------------------------------------------------------------------
draw rounded corner frame 
--------------------------------------------------------------------------------------------- */
function drawRoundCornerRectangle(scene, x, y, w, h, r)
{
	var ctx = scene.getCanvas().getContext("2d");
	ctx.beginPath();			
	ctx.moveTo(x + r, y + 0);
	ctx.lineTo(x + w - r, y + 0);
	ctx.arcTo(x + w, y + 0, x + w, y + r, r);
	ctx.lineTo(x + w, y + h - r);
	ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
	ctx.lineTo(x + r, y + h);
	ctx.arcTo(x + 0, y + h, x + 0, y + h - r, r);
	ctx.lineTo(x + 0, y + r);
	ctx.arcTo(x + 0, y + 0, x + r, y + 0, r);
	ctx.fill();		
}

/* ---------------------------------------------------------------------------------------------
create map editor UI 
--------------------------------------------------------------------------------------------- */
function mapEditorUI(parent, name, scene, w, h, m, r, hide, debug)
{
	// reposition body when screen or body itself resizes
	// -----------------------------------------------------------------------------------
	var onBodyResize = function(elem, w, h)
	{
		body.setPos( (parent.width() - body.width()) / 2, parent.height() - body.height() - m );
	}
		
	// constructor
	// -----------------------------------------------------------------------------------
	var body = new frame(parent, name, 0, 0, 0, 0, false, false, hide, debug);
	if (parent) parent.addEventListener("resize", onBodyResize);
	body.addEventListener("resize", onBodyResize);
	body.addEventListener("draw", function(elem, x, y, w, h)
	{
		scene.getCanvas().getContext("2d").fillStyle = "rgba(164,164,164,1)";
		drawRoundCornerRectangle(scene, x, y, w, h,r + m);
	});
	
	
	// add child buttons and resize body to fit them
	// -----------------------------------------------------------------------------------
	var btns = [];
	this.add = function(name, color, onmouseup)
	{
		var btn = new frame(body, name, m + btns.length * (w + m), m, w, h, false, false, hide, debug);
		btn.addEventListener("mouseup", onmouseup);
		btn.addEventListener("mousedown", function(elem){ elem.state = true; });
		btn.addEventListener("mouseup", function(elem){ elem.state = false; });
		btn.addEventListener("mouseleave", function(elem){ elem.state = false; });
		
		btn.addEventListener("draw", function(elem, x, y, w, h)
		{
			scene.getCanvas().getContext("2d").fillStyle = color;
			if (elem.state) drawRoundCornerRectangle(scene, x + 1, y + 1, w - 2, h - 2, r - 1);
			//if (elem.state) drawRoundCornerRectangle(scene, x + 2, y + 2, w, h, w/2);
			else drawRoundCornerRectangle(scene, x, y, w, h, r);
		});
		
		btns.push(btn);
		body.setSize( btns.length * (w + m) + m, h + m * 2 );
	}
}



