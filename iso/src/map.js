/*

floor tile
-	selectable
-	does not move
-	always exist for every tile
-	occupies only one tile 
-	snaps to tile so its size is expected to same as tile width/height
-	has different types that allows or blocks different types of object to be placed on top of it

building
-	selectable
-	does not move
- 	depending on size, can occupy multiple tiles
-	any tile it occupies cannot have other objects
-	snaps to tile so it's expected to have width/height with factor of tile width/height

foliage
-	selectable
-	does not move
-	typically small but since it can be placed anywhere in the map, it might occupy multiple tiles
-	automatically removed when buildings are place on its tile or floor tile is replaced by a type that does not allow foliage to be placed
-	can only be placed on floor tiles that are of grass or dirt (full) type

vehicles
-	selectable
-	moves
-	depending on size and position, it may occupy multiple tiles
-	automatically removed when buildings are placed on its tile 
-	automatically removed when its floor tile is replaced by something that does not allow vehicles to be placed
-	can only be placed on floor tiles that are of road type

cars
-	type of vehicle

trains
-	type of vehicle

multi-level roads/railroads
-	



*/

function tilemap(map, tx, ty, tilewidth, tileheight, base)
{
	// make sure map is a 2D array
	// -------------------------------------------------------------------------------------------------------------------------
	if (typeof map === 'undefined'){ throw new Error("map is undefined"); }
	if (map.constructor !== Array){ throw new Error("map is not an array"); }
	if (!map.length){ throw new Error("map does not contain rows"); }
	if (map[0].constructor !== Array){ throw new Error("map is not a 2D array"); }		
	
	// set map information
	// -------------------------------------------------------------------------------------------------------------------------
	this.height = function(){ return (map.length + map[0].length)/2 * tileheight; }
	this.width = function(){ return (map.length + map[0].length)/2 * tilewidth; }
	this.rows = function(){ return map.length; }
	this.cols = function(){ return map[0].length; }
	
	// top-left position of the diamond map
	// -------------------------------------------------------------------------------------------------------------------------
	this.pos = function(x, y){ if (typeof x != 'undefined') tx = x; if (typeof y != 'undefined') ty = y; return { x: tx, y: ty }; }
	this.move = function(x, y){ this.pos(tx + x, ty + y); }		

	// event handlers
	// -------------------------------------------------------------------------------------------------------------------------
	var drawtileEvents = [];
	var predrawEvents = [];
	var postdrawEvents = [];
	this.addEventListener = function(e, f)
	{
		if (e === "drawtile"){ drawtileEvents.push(f); }		
		if (e === "predraw"){ predrawEvents.push(f); }		
		if (e === "postdraw"){ postdrawEvents.push(f); }		
	}
	
	this.removeEventListener = function(e, f)
	{
		if (e === "drawtile"){ for (var i = 0; i < drawtileEvents.length; i++){ if (drawtileEvents[i] == f){ drawtileEvents.splice(i,1); return; }}}			
		if (e === "predraw"){ for (var i = 0; i < predrawEvents.length; i++){ if (predrawEvents[i] == f){ predrawEvents.splice(i,1); return; }}}			
		if (e === "postdraw"){ for (var i = 0; i < postdrawEvents.length; i++){ if (postdrawEvents[i] == f){ postdrawEvents.splice(i,1); return; }}}			
	}	
	
	// draw tile map
	// -------------------------------------------------------------------------------------------------------------------------
	this.draw = function(vp)
	{	
		var row0 = 0, row1 = map.length - 1, col0 = 0, col1 = map[0].length - 1;
				
		if (vp)
		{		
			if (vp.hasOwnProperty("right") && vp.hasOwnProperty("bottom") && vp.hasOwnProperty("left") && vp.hasOwnProperty("top") )
			{
				row0 = this.pickTile(vp.right, vp.top, tx, ty, false, false).row;
				row1 = this.pickTile(vp.left, vp.bottom, tx, ty, false, false).row;
				col0 = this.pickTile(vp.left, vp.top, tx, ty, false, false).col;
				col1 = this.pickTile(vp.right, vp.bottom, tx, ty, false, false).col;
				
				if(row0 < 0) row0 = 0;
				if(row0 >= map.length) return 0;
				if(row1 < 0) return 0;
				if(row1 >= map.length) row1 = map.length - 1;
				if(col0 < 0) col0 = 0;
				if(col0 >= map[0].length) return 0;
				if(col1 < 0) return 0;
				if(col1 >= map[0].length) col1 = map[0].length - 1;						
			}
		}		

		// fire up any event handlers before drawing the map
		for (var i = 0; i < predrawEvents.length; i++){ predrawEvents[i]({ obj: this, row0: row0, row1: row1, col0: col0, col1: col1 }); }
		
		var drawcount = 0;
		for (var row = row0; row <= row1; row++) 
		{
			for (var col = col0; col <= col1; col++) 		
			{
				// initialize tile position at top center of the map as this is our anchor point (top corner of diamond)
				var x = map.length * tilewidth/2;
				var y = 0;
				
				// shift by half tilewidth so when drawing tile, it will be x-centered in current position
				x -= tilewidth/2;
				
				// shift to this tile's row/col position
				x += (col*tilewidth/2 - row*tilewidth/2);
				y += (row * tileheight/2 + col * tileheight/2);
				
				// finally, shift the position by world position
				x += tx;
				y += ty;
				
				// get value of this tile
				var t = map[row][col];

				for (var i = 0; i < drawtileEvents.length; i++)
				{ 
					drawtileEvents[i]({
							obj: this, 
							row: row, col: col,
							tile: t, 
							x: x, y: y, 
							width: tilewidth, height: tileheight
						}); 
				}				
				drawcount++;
			}
		}		
		// fire up event after the drawing the whole map
		for (var i = 0; i < postdrawEvents.length; i++){ postdrawEvents[i]({ obj: this, row0: row0, row1: row1, col0: col0, col1: col1, drawcount: drawcount }); }
		
		return {count: drawcount, row0: row0, col0: col0, row1: row1, col1: col1 };				
	}	
	
	/*-------------------------------------------------------------------------------------------------------------------
	finds the intersection point of 2 lines
	this function is used for projecting a point in the map to its column and width coordinates so the tile that
	intersects with the given point can be identified
	P0-P1 and Q0-Q1 are assumed to be lines P and Q
	it returns an object with x,y parameters as the intersection point. if line is parallel, returns a null object
	-------------------------------------------------------------------------------------------------------------------*/
	var intersectLineLine = function(P0x, P0y, P1x, P1y, Q0x, Q0y, Q1x, Q1y)
	{
		// since we are dealing with screen coordinates, the values are integers
		// so we expect denominator to be integer as well. therefore we can just 
		// compare it to 0 to know if lines are parallel or not (no need to use epsilon)
		var denominator = (P1y - P0y)*(Q1x - Q0x) - (P1x - P0x)*(Q1y - Q0y);
		
		// lines P and Q are parallel to each other
		if (!denominator){ return; }

		var p = ( (P1x - P0x)*(Q0y - P0y) - (P1y - P0y)*(Q0x - P0x) ) / denominator;
		return {x: Q0x + p * (Q1x - Q0x), y:  Q0y + p * (Q1y - Q0y)}		
	}		

	/*-------------------------------------------------------------------------------------------------------------------
	pick tile
	-------------------------------------------------------------------------------------------------------------------*/
	this.pickTile = function(mx, my, checkbase)
	{
		// calculate top coordinate of the map (top corner of the diamond) in map coordinate
		var nx = map.length * tilewidth/2;
		var ny = 0;
		
		// given mouse coordinate is in world coordinate. translate to map coordinate
		mx -= tx;
		my -= ty;		
				
		// define a line from mx, my parallel to map row and project it to line parallel to map column and get their intersection point
		var Pc = intersectLineLine(mx, my, mx + tilewidth, my - tileheight, nx, ny, nx + tilewidth, ny + tileheight);
		
		// define a line from mx, my parallel to map column and project it to line parallel to map row and get their intersection point
		var Pr = intersectLineLine(mx, my, mx - tilewidth, my - tileheight, nx, ny, nx - tilewidth, ny + tileheight);

		// if there's no intersection point(lines are parallel), we can bail out
		if (!Pr || !Pc) return { col: -1, row: -1 };
		
		// find the row and column of the tile that intesect
		var col = Math.floor( (Pc.y - ny) / (tileheight / 2) );
		var row = Math.floor( (Pr.y - ny) / (tileheight / 2) );		
		
		// if we are also checking for intersect on tile's floor height...
		// ------------------------------------------------------------------------------------------------		
		if (checkbase)
		{		
			// if the tile is one column tile outside the map (south-east side), let check if we are intersecting at the base
			if (col == map[0].length)
			{
				// calculate east corner of the map
				var ex = this.width();
				var ey = map[0].length * tileheight/2;
				
				// define a line from map's right corner to bottom corner and find the intersection point with the line between mx, my projected through y-axis
				var Pe = intersectLineLine(mx, my, mx, my - base, ex, ey, ex - tilewidth, ey + tileheight);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pe.y > base) return { col: col, row: row };
				
				// if we are within tile's base, we are in the last column. let's now calculate the row
				col--;
				row = Math.floor( (Pe.y - ey) / (tileheight / 2) );			
			}
			// if the tile is one row tile outside the map (south-west side), let check if we are intersecting at the base
			if (row == map.length)
			{
				// let map.wx, map.wy be the west corner of the map
				var wx = 0;
				var wy = map.length * tileheight/2;

				// get intersection pt between line from west to south corner and line from mx, my projecting vertically
				var Pw = intersectLineLine(mx, my, mx, my - base, wx, wy, wx + tilewidth, wy + tileheight);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pw.y > base)return { col: col, row: row }; 

				// if we are within tile's base, we are in the last column. let's now calculate the row
				row--;
				col = Math.floor( (Pw.y - wy) / (tileheight / 2) );			
			}
		}				
		return { col: col, row: row };
	}
}


/*---------------------------------------------------------------------------------------------------------------------------------
tile class implementation
there are 2 version, one loads all tiles to canvas while the other dynamically clips a portion of image and draw as a tile
both seems to work at the same performance
---------------------------------------------------------------------------------------------------------------------------------*/	
function tile(imagefile, row, col, tileheight, tilewidth, base, debug)
{
	"use strict";

	/*------------------------------------------------------------------------
	validate arguments
	------------------------------------------------------------------------*/
	if (typeof imagefile === 'undefined'){ throw new Error("imagefiles passed is undefined"); }
	
	this.rows = function(){ return row; }
	this.cols = function(){ return col; }
	
	/*------------------------------------------------------------------------
	create image object to hold our image file and 
	store tiles to its canvas array
	------------------------------------------------------------------------*/
	var image = new Image();
	image.src = imagefile;	
	image.parent = this;
	
	// calculate total tileheight - height from [0,0] to [n,n]
	image.totaltileheight = col * tileheight/2 + row * tileheight/2;	

	// as this image file is loaded, let's set the canvas size where this image will be loaded
	image.onload = function() 
	{
		// measure offset height. offset height is the height from top of image to top of first tile [0,0]
		this.offsetheight = this.naturalHeight - this.totaltileheight - base;
		
		// create canvas for each tile
		this.tiles = [];
		
		// create canvas to store the whole image. its purpose is to use it for getting image data.
		// original design is to get image data on selected canvas tile but there's an issue with left half side tiles
		// as it seems there's overlapping pixels to their right edge that causes to miss pixel data...
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;		
		this.canvas.getContext("2d").drawImage(this, 0, 0);		
		
		for (var r = 0; r < row; r++)
		{
			// add empty row
			this.tiles.push([]);
			for (var c = 0; c < col; c++)
			{
				// create canvas for this tile
				var canvas = document.createElement("canvas");
				if (!canvas){ throw new Error("Failed to create a canvas for an image object."); }	
				
				// width is...
				if (col - c == row - r) canvas.width = tilewidth;
				else canvas.width = tilewidth / 2;
				
				// height starts from top of image and down to bottom of the tile
				canvas.height = this.offsetheight + tileheight + r * tileheight/2 + c * tileheight/2 + base;
				
				// calculate this tile's top-left position relative to the image
				var x = (row - 1 + c - r) * tilewidth/2; 
				
				// for tiles on the right edge of the [max,max] tile, we draw only the right half side
				if (c == col - 1 && r < row - 1) x += tilewidth/2;
		
				// copy the portion of the image and draw it to this tile's canvas
				canvas.getContext("2d").drawImage(this, x, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height); 		
				
				this.tiles[r].push(canvas);
			}
		}				
		if (this.parent.onload) this.parent.onload();
	}

	/*------------------------------------------------------------------------
	get the canvas height of the tile specified in r,c 
	canvas tile height = image.height - totaltileheight - (r + c) * tileheight/2
	or
	tileheight = image.offsetheight + tileheight + base + (r + c) tileheight/2
	------------------------------------------------------------------------*/
	this.tileheight = function(r, c)
	{ 
		//return image.offsetheight + tileheight * ( 1 + (r + c) / 2 ) + base;
		return image.naturalHeight + tileheight * (1 + (r + c - col - row) / 2 );
	}		
	
	/*------------------------------------------------------------------------
	quickly draw the image for testing purposes
	------------------------------------------------------------------------*/
	this.testdraw = function(scene, x, y )
	{
		scene.drawImage(image, x, ty);
	//	scene.drawRect(x,y,image.width(),image.height(), 0, "rgba(128,128,128,0.5)", 0);
	}
	
	/*------------------------------------------------------------------------
	test draw image in tiled format
	------------------------------------------------------------------------*/
	this.testdrawtile = function(scene, x, y, drawhidden)
	{
		var n = 0;
		for (var r = 0; r < row; r++)
		{
			for (var c = 0; c < col; c++)
			{								
				// calculate the top-left position of the current tile excluding offset height
				var tx = x + (row * tilewidth/2 - tilewidth/2) + c * tilewidth/2 - r * tilewidth/2;			
				var ty = y + r * tileheight/2 + c * tileheight/2;
				
				if (!drawhidden){ if (!this.hidden(r, c)) continue; } 
				
				this.draw(scene, r, c, tx, ty);
				scene.drawRect(tx,ty, tilewidth, tileheight, 0, "rgba(128,128,128,0.5)", 0);
				n++;
			}
		}		
		scene.drawRect(x,y, image.naturalWidth, image.totaltileheight, 0, "rgba(128,128,128,0.5)", 0);
		return n;
	}
	 
	/*------------------------------------------------------------------------
	draw specific tile within the image
	it offsets the y-position such that the x, y is the top-left position of 
	tile excluding offset height. this is to make map engine not to worry
	tile's offset height and just assume all tiles are just tileheight/tilewidth 
	size
	------------------------------------------------------------------------*/
	this.draw = function(scene, r, c, x, y)
	{
		if (this.hidden(r, c)) return;
		
		// calculate y such that the top position to draw the image is the 
		// y-position of tile excluding offset height
		var ty = y - (image.offsetheight +  r * tileheight/2 + c * tileheight/2);
		
		if (c == col - 1 && r < row - 1) x += tilewidth/2;
		
		scene.drawImage(image.tiles[r][c], x, ty);
		//scene.drawRect(x,y,tilewidth, tileheight, 0, "rgba(128,128,128,0.5)", 0);
	}		
	
	/*------------------------------------------------------------------------
	some canvas tiles are overlapped by others, e.g. [1,1] is overlapped by
	[2,2]. overlapped canvas tiles are hidden so we don't need to draw them.
	this function checks for that
	------------------------------------------------------------------------*/
	this.hidden = function(r, c)
	{
		if (r == row - 1){ return false; }
		if (c == col - 1){ return false; }
		return true;
	}
	
	/*------------------------------------------------------------------------
	get pixel data of the specified canvas
	------------------------------------------------------------------------*/
	this.getImageData = function(x, y, w, h, r, c)
	{
		/* 	-- 	this is the original algorithm where it gets imagedata from 
				tile canvas. kinda buggy because we seem to miss a pixel on 
				left half side tile. quick and dirty solution is create a full
				image canvas and use that solely for getting image data
				
		// tiles that are on the right half side has half the width so we "shift" 
		// the x to half the width
		if (c == col - 1 && r < row - 1) x -= tilewidth/2;
		
		// do the magic...
		return image.tiles[r][c].getContext("2d").getImageData(x, y, w, h); 
		*/
		
		x += (row - 1 + c - r) * tilewidth/2; 		
		return image.canvas.getContext("2d").getImageData(x, y, w, h); 		
	} 
}


/*---------------------------------------------------------------------------------------------------------------------------------
             1  
          1     1
	   1           1
	1                 1
	1  1                 1
    1     1                 1
    1        1           1  1
	1		    1     1     1 
	1			   1        1 --------------- l (left, y-coordinate)
	   1		   1        1 
		  1		   1        1 --------------- r (right y-coordinate)
		     1     1     1
			    1  1  1
				   1
				   |
				   ----------- b(bottom, x-coordinate)				   
---------------------------------------------------------------------------------------------------------------------------------*/	
function movingtile(imagefile, l, b, r, x, y)
{
	// create image, canvas objects for this object
	// -----------------------------------------------------------------------------------
	var image = new Image();
	image.src = imagefile;
	image.parent = this;
	
	// handle onload event for the sprite object
	image.onload = function()
	{		
		// create canvas for this tile
		this.canvas = document.createElement("canvas");
		if (!this.canvas){ throw new Error("Failed to create a canvas for an image object."); }	

		// set the canvas size based on the actual size of the image
		this.canvas.width = this.naturalWidth;
		this.canvas.height = this.naturalHeight;			
		
		// finally let's draw this image into its canvas
		this.canvas.getContext("2d").drawImage(this, 0, 0);

		// fire up event handler for this, if any		
		if (this.parent.onload) this.parent.onload();
	}		
	
	// draw object for testing
	// -----------------------------------------------------------------------------------
	this.drawtest = function (scene)
	{
		if (!image.canvas) return;
		
		scene.drawImage(image, x, y);				
		scene.drawCircle(x, y + l, 2, "rgb(255,255,255)");
		scene.drawCircle(x + image.canvas.width, y + r, 2, "rgb(255,255,255)");
		scene.drawCircle(x + b, y + image.canvas.height, 2, "rgb(255,255,255)");
	}
	
	// accessors, gettors
	// -----------------------------------------------------------------------------------
	this.l = function(){ return l; }
	this.b = function(){ return b; }
	this.r = function(){ return r; }
	this.width = function(){ return image.canvas? image.canvas.width : 0; }
	this.height = function(){ return image.canvas? image.canvas.height : 0; }	
	this.setpos = function(px, py){ x = px; y = py; }
	
	// list all tiles in map that this object intersected
	// btile, ltile, rtile are arrays that keeps the tile coordinates that our object's
	// 'b', 'l', and 'r' points interestect. it will be used as reference in draw
	// function
	// tiles where this object intersects in map are also stored in list so we'll
	// know which tiles to remove when we replace it with new ones
	// -----------------------------------------------------------------------------------
	var tiles = [];
	var btile, ltile, rtile;
	this.getIntersectedTilesFromMap = function(tmap)
	{		
		// quickie checkpoints
		if ( !(tmap instanceof tilemap) ) return;
		if (!image.canvas) return;
	
		// get tiles that intersects with key points in our object
		ltile = tmap.getTileFromPtMapDiamondCW45(x, y + l, false, false);
		rtile = tmap.getTileFromPtMapDiamondCW45(x + this.width(), y + r, false, false);
		btile = tmap.getTileFromPtMapDiamondCW45(x + b, y + this.height(), false, false);		
		
		// remove prev tiles from map
		while (tiles.length)
		{
			var p = tiles.pop();
			var row = p[0];
			var col = p[1];						
			tmap.removeMovingTileToMap(this, row, col);
		}
		
		//tmap.addThisToMap(this, ltile.row, ltile.col); tiles.push([ltile.row, ltile.col]);
		//tmap.addThisToMap(this, rtile.row, rtile.col); tiles.push([rtile.row, rtile.col]);
		//tmap.addThisToMap(this, btile.row, btile.col); tiles.push([btile.row, btile.col]);

		// btile.row > rtile.row, btile.col > ltile.col
		for(var row = rtile.row; row <= btile.row; row++){ tmap.addMovingTileToMap(this, row, btile.col); tiles.push([row, btile.col]); }
		for(var col = ltile.col; col <  btile.col; col++){ tmap.addMovingTileToMap(this, btile.row, col); tiles.push([btile.row, col]); }		
	}
	
	// draw a part of the object within the given tile in the map
	// row, col is passed so we can find out if we are rendering part of the object 
	// where our "b" coordinate sits at the "bottom-middle" tile
	// -----------------------------------------------------------------------------------
	this.draw = function(scene, px, py, tilewidth, tileheight, row, col)
	{	
		// quick checkpoints
		if (!image.canvas) return;
		
		// tile where the "bottom" point of the image intersect is considered to be the "middle" of this object
		// tiles on the left and right side of the middle of this object will be rendered in half while the middle object is rendered in full
		
		// tiles on the left side will have their left half rendered, while tiles on right side will have their right half rendered
		// so if it's right side tile, we shift px by tilewidth/2 to force it to start rendering at the right half 
		px += (row < btile.row)? tilewidth/2 : 0;
		
		// if it's middle tile, we render full tile, otherwise, render half (left or right)
		var tw = tilewidth;
		tw = (row == btile.row && col == btile.col)? tilewidth : tilewidth/2;
				
		var sx = (x > px? 0:(px - x));
		var tx = (x > px? x : px);
		var sw = this.width() - sx > tw - (tx - px)? tw - (tx - px): this.width() - sx;
		var tw = sw;		
		var sy = 0;
		var sh = this.height() > tileheight + (py - y) ? tileheight + (py - y) : this.height();
		var ty = y;
		var th = sh;	

		// if source width is < 0, there's nothing to draw
		if (sw < 0) return; 
		
		//scene.drawRect(	tx, ty, tw, th, 0, "rgba(128,128,192,0.5)");
		scene.drawImageRegionToTarget( image.canvas, sx, sy, sw, sh, tx, ty, tw, th ); 
	}
	
	
	// set absolute position
}



 