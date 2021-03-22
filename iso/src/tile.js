/*------------------------------------------------------------------------
action items:


completed:
-	implemented a function that identifies the multi-tile object the 
	specified tile is part of.
-	optimized multi-tile rendering by drawing only half the image on some tile.
-	on tile algorithm using tiled canvas, another canvas is created where the whole
	image is stored. its purpose is to use it for getting image data. original plan
	is to get image data on selected canvas tile but there's an issue with left half 
	side tiles as it seems there's overlapping pixels to their right edge that 
	causes to miss pixel data...
- 	all 4 rectangle clip corners now check for intersection with tile depth only. 
	previously bottom corners check for intersection at pixel level on full tile image
	but observed that it's not necessary. just add the necessary depth shift based 
	on maxtileheight as was originally done anyways.
	
completed[20180316]
-	implemented a class that stores tile image. previously using sprite class
	but not anymore. it also holds multi-tile images such as buildings
-	rename thickness property to base
-	tilewidth now specifically defined by application and not taken from tile
	object. this allow tilemap class to calculate map information independent
	from tile object
- 	completely remove the old tile class code
- 	a function now wraps updating map's top, west, east corner position 
	calculation when changing map's center position. it makes sense because
	map corner positions change when center positions change
- 	there's no distinction between tile and building objects anymore. they are
	both tiles now. map[][] now contains an array of values which specifies
	tile index, tile index row/col (if draing multi-tile such as buildings), 
	etc...
-	remove tile2 class implementation. it's n old version using sprite class
	and calls scene.getCanvas() to draw tile. this is suspected to cause 
	slow down in frame rate
- 	sprite array removed and replaced with tile class array
-	maxtileheight now taken from the new tile class
	
completed[20180307]
-	write descriptions/comment of most functions
- 	make center position class member and add setter to it

------------------------------------------------------------------------*/

/*------------------------------------------------------------------------
tile map class

m_sprites[]
- this array holds a list of sprite objects 

m_sprites[?]
- sprite that stores the image of a tile. 
- has fix width but can have varying height
- has 2 properties common to all tile image regardless of height
	- baseHeight, floorHeight
- a typical tile image is shown below 

							1		-----------------|			
						1       1							
					1               1       
				1                       1 			base height
				1   1               1   1       
				1   1   1       1   1   1
	|--------		1   1   1   1   1     -----------|
 floor height			1   1   1
	|-------------			1
	
- some tile images are taller, because they contain something on top of their base

                            0       --------------------------------------|
                        0       0
                    0       0   0
				0		0	 	0	-----------------|			
				0	0           1							       actual height
				0	0       1       1       
				1   0   1               1 		 base height
				1   1               1   1       
				1   1   1       1   1   1
	|--------		1   1   1   1   1     -----------|
floor height			1   1   1
	|-------------			1          -----------------------------------|
	
- regardless of differences in height, their floorHeight and baseHeight values are the same
- when rendering a map, all tiles are aligned with their baseHeights so each tile will be vertically shifted
  depending on their actual 
- below show how 3 tiles with varying height are arranged to align at their base heights...                                                      
   
                                                                          0    
				0                                                     0       0
			0       0                                            0               0
		0       0   0                                            0   0               0
	0		0	 	0            			 1		          	 0		 0 		 0   0
	0	0           1			 		 1       1		      	 0	         0  	 0
	0	0       1       1        	 1               1        	 1           0       0
	1   0   1               1    1                       1    1      1       0       1
	1   1               1   1    1   1               1   1    1  1       1   0   1   1
	1   1   1       1   1   1    1   1   1       1   1   1    1  1   1       1   1   1
		1   1   1   1   1        	 1   1   1   1   1        	 1   1   1   1   1    
			1   1   1            		 1   1   1            		 1   1   1 
				1                			 1	              			 1	 
 
 
map[][]
- a 2D array that contains tile map to be drawn as isometric map
- map contains a set of integer values in format as shown below...
- 	[
	[0,0,0,0],
	[1,1,1,1],
  	[2,2,2,2],
	[3,3,3,3],
	]
- the values represent the index of tile sprite to be used in drawing  the map e.g. '1' is tiles[1]
- the 2D array is arrange as below...
		0000
		1111
		2222
		3333
- and will be rendered in isometric form by shifting it clockwise by 45 degreess, as shown below...
			0 
		   1 0 
		  2 1 0 
		 3 2 1 0 
		  3 2 1
		   3 2 
			3 

-----------------------------------------------------------------------*/

/*---------------------------------------------------------------------------------------------------------------------------------
tile class implementation
---------------------------------------------------------------------------------------------------------------------------------*/	
function tilemap(scene, map, cx, cy, depth, base, tilewidth, debug )
{
	"use strict";

	/*------------------------------------------------------------------------
	 private members
	------------------------------------------------------------------------*/
	var tiles = [];
	var maxtileheight = 0;

	/*------------------------------------------------------------------------
	// validate arguments
	------------------------------------------------------------------------*/
	
	// check if scene is valid
	if (typeof scene === 'undefined'){ throw new Error("scene passed is undefined"); }
	if (typeof scene === scene){ throw new Error("scene passed is undefined"); }

	// make sure map is a 2D array
	if (typeof map === 'undefined'){ throw new Error("map is undefined"); }
	if (map.constructor !== Array){ throw new Error("map is not an array"); }
	if (!map.length){ throw new Error("map does not contain rows"); }
	if (map[0].constructor !== Array){ throw new Error("map is not a 2D array"); }
	
	/*------------------------------------------------------------------------
	store map information
	------------------------------------------------------------------------*/	

	// calculate the total height and width of the map
	map.height = (map.length + map[0].length)/2 * depth;
	map.width = (map.length + map[0].length)/2 * tilewidth;	

	var updateMapPos = function()
	{
		// tile map is shaped as diamond with 4 corners - top, bottom, left right. 
		// let nx, ny be the top corner of the map
		map.nx = cx - map.width/2.0;
		map.ny = cy - map.height/2.0;
		map.nx += map.length/2 * tilewidth;	

		// east corner
		map.ex = cx + map.width/2;
		map.ey = cy - map.height/2.0 + map[0].length/2 * depth;

		// west corner
		map.wx = cx - map.width/2;
		map.wy = cy - map.height/2.0 + map.length/2 * depth;
	}
	
	// set the center of the map where it will be rendered
	this.setCenterPos = function(x, y){ cx = x; cy = y; updateMapPos();	}
	this.getCenterPos = function(){ return { x: cx, y: cy }; }
	this.moveCenterPos = function(x, y){ this.setCenterPos(cx + x, cy + y); }		
	
	// update map positions
	updateMapPos();
	
	/*------------------------------------------------------------------------
	load image files into tile objects, as our tile image list
	------------------------------------------------------------------------*/
	this.addTile = function(imagefile, row, col)
	{
		var t = new tile(imagefile, row, col, depth, tilewidth, base, debug);
		tiles.push(t);
		t.onload = function()
		{
			if (maxtileheight < this.tileheight(row - 1, col - 1)){ maxtileheight = this.tileheight(row - 1, col - 1); }
			if (debug) console.log("max tile height: " + maxtileheight);
		}
	}				
	
	/*--------------------------------------------------------------------------------------
	assign event handlers
	--------------------------------------------------------------------------------------*/
	var eventpredrawtile = 0;
	var eventpostdrawtile = 0;
	var eventpostdraw = 0;
	var eventdrawtile = 0;
	this.setEventHandler = function (e, f)
	{
		if (e === "draw"){ eventdrawtile = f; }
		if (e === "predrawtile"){ eventpredrawtile = f; }
		if (e === "postdrawtile"){ eventpostdrawtile = f; }
		if (e === "postdraw"){ eventpostdraw = f; }
	}	
	
	/*-------------------------------------------------------------------------------------------------------------------
	draw map with given tiles in diamond orientation where the square 2D map array is turned 45 degrees clockwise.
	renders only tiles that are at least partially visible outside clip region.
	renders only rows and columns of map that are partially visible outside clip region.
	-------------------------------------------------------------------------------------------------------------------*/
	this.drawMapDiamondCW45 = function(clip)	
	{			
		var result = {};
		result.totalrow = map.length;
		result.totalcol = map[0].length;
		var row0 = 0, row1 = map.length - 1, col0 = 0, col1 = map[0].length - 1;
		
		if (clip)
		{		
			if (clip.hasOwnProperty("right") && clip.hasOwnProperty("bottom") && clip.hasOwnProperty("left") && clip.hasOwnProperty("top") )
			{
				var n = Math.floor( (maxtileheight - base) / depth );

				row0 = this.getTileFromPtMapDiamondCW45(clip.right, clip.top, true, false).row;
				row1 = this.getTileFromPtMapDiamondCW45(clip.left, clip.bottom + (n * depth), true, false).row;
				col0 = this.getTileFromPtMapDiamondCW45(clip.left, clip.top, true, false).col;
				col1 = this.getTileFromPtMapDiamondCW45(clip.right, clip.bottom + (n * depth), true, false).col;
				
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
		result.row0 = row0;
		result.row1 = row1;
		result.col0 = col0;
		result.col1 = col1;
		
		// loop through each row of the 2D array 'map'
		result.drawcount = 0;
		for (var row = row0; row <= row1; row++) 
		{
			// loop through each tile (column) in the current row of the 2D array 'map'
			for (var col = col0; col <= col1; col++) 
			{
				// check if any of the tile map data is invalid, value that does not exist in our tile graphics array
				if(map[row][col] >= tiles.length || map[row][col] < 0) continue;
				if (!tiles.length) continue;
				var t = map[row][col][0];
				var r = map[row][col][1];
				var c = map[row][col][2];
				if (!tiles[t].hidden(r, c)) continue;
				
				// reference position (+map.nx)
				// shift to center tile image horizontally (-width/2)
				// shift next adjacent(row) tile to the right by half the tile width (+x*width/2)
				// shift tile to the left by half the width for every row (-y*width/2)
				var x = map.nx - tilewidth/2 + col*tilewidth/2 - row*tilewidth/2;
				
				// reference position (+map.ny) as top position of this tile
				// tile image height may vary but tile mapping height is always fixed at depth so shift image to always align it with depth (-(height-depth))
				// shift next adjacent(row tile) down by half the tile depth (+x*depth/2)
				// shift tile down by half the depth for every row (+y*depth/2)
				// shift tile down by base (+base)
				var y = map.ny + row * depth/2 + col * depth/2;
				
				// don't render any tile that is fully outside of the canvas extents
				if(clip)
				{
					if (clip.hasOwnProperty("right")){ if (x > clip.right) continue; }
					if (clip.hasOwnProperty("bottom")){ if (y - (tiles[t].tileheight(r,c) - base - depth) > clip.bottom){ continue; } }
					if (clip.hasOwnProperty("left")){ if (x + tilewidth < clip.left) continue; }
					if (clip.hasOwnProperty("top")){ if (y + depth + base < clip.top) continue; }
				}				
		
				// draw the tile
				if (eventpredrawtile) eventpredrawtile(this, row, col, x, y);
				tiles[t].draw(scene, r, c, x, y);
				
				// do any post draw tile stuff here
				if (eventpostdrawtile) eventpostdrawtile(this, row, col, x, y);				
				
				// count how many tiles are drawn
				result.drawcount++;
			}
		}		
		
		if (eventpostdraw){ eventpostdraw(this, map.nx - map.length/2 * tilewidth, map.ny, map.width, map.height );	}
		return result;		
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
	get the relative position of px, px from map[row][col] where tx, ty is the top corner of the map
	returns the x,y which is the relative position of px, py from map[row][col]'s top-left position
	also returns map[row][col]'s information (width, height, value, etc...)
	-------------------------------------------------------------------------------------------------------------------*/	
	var getRelPosOfPointFromTile = function(px, py, row, col, usedepth)
	{		
		var w, h;		
		if (row < 0 || col < 0 || col >= map[0].length || row >= map.length || usedepth)
		{
			w = tilewidth; 
			h = depth + base;
		}
		else
		{
			w = tilewidth;
			var t = map[row][col][0];
			var r = map[row][col][1];
			var c = map[row][col][2];
			h = tiles[t].tileheight(r, c);
		}
			
		// get intersected tile's top-left position from the map
		var x = map.nx - w/2 + col*w/2 - row*w/2;
		var y = map.ny - (h - depth) + col*depth/2 + row*depth/2 + base;			

		return { x: px - x, y: py - y };		
	}			
		
	/*-------------------------------------------------------------------------------------------------------------------
	tests a given pt mx, my if intersects with any of the tile in map
	uses an algorithm where it does not need to sort through every tile in map array to find the intersected tile
	also has option to check for intersection with tile base and full height	
	-------------------------------------------------------------------------------------------------------------------*/	
	this.getTileFromPtMapDiamondCW45 = function(mx, my, 					// position to check which tile it intersects
												checkbase = true, 		// also include tile's base in checking for intersect
												checktotalheight = true		// also include tile's full height in checking for intersect
												)	
	{		
		var result = {};
		result.ptintersect = { x: mx, y: my };
		result.intersectedtiles = [];
	
		// define a line from mx, my parallel to map row and project it to line parallel to map column and get their intersection point
		var Pc = intersectLineLine(mx, my, mx + tilewidth, my - depth, map.nx, map.ny, map.nx + tilewidth, map.ny + depth);
		
		// define a line from mx, my parallel to map column and project it to line parallel to map row and get their intersection point
		var Pr = intersectLineLine(mx, my, mx - tilewidth, my - depth, map.nx, map.ny, map.nx - tilewidth, map.ny + depth);

		// if there's no intersection point(lines are parallel), we can bail out
		if (!Pr || !Pc) return;
		
		result.colintersect = Pc;
		result.rowintersect = Pr;
		
		// find the row and column of the tile that intesect
		var col = Math.floor( (Pc.y - map.ny) / (depth / 2) );
		var row = Math.floor( (Pr.y - map.ny) / (depth / 2) );
		
		// if we are also checking for intersect on tile's floor height...
		// ------------------------------------------------------------------------------------------------		
		if (checkbase)
		{		
			// if the tile is one column tile outside the map (south-east side), let check if we are intersecting at the base
			if (col == map[0].length)
			{
				// let map.ex, map.ey be the east corner of the map
				map.ex = cx + map.width/2;
				map.ey = cy - map.height/2.0 + map[0].length/2 * depth;
				result.colintersect = { x: map.ex, y: map.ey };
				
				// define a line from map's right corner to bottom corner and find the intersection point with the line between mx, my projected through y-axis
				var Pe = intersectLineLine(mx, my, mx, my - base, map.ex, map.ey, map.ex - tilewidth, map.ey + depth);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pe.y > base){ result.row = row; result.col = col; return result; } 
				result.ptintersect = { x: Pe.x, y: Pe.y };
				
				// if we are within tile's base, we are in the last column. let's now calculate the row
				col--;
				row = Math.floor( (Pe.y - map.ey) / (depth / 2) );			
			}
			// if the tile is one row tile outside the map (south-west side), let check if we are intersecting at the base
			if (row == map.length)
			{
				// let map.wx, map.wy be the west corner of the map
				map.wx = cx - map.width/2;
				map.wy = cy - map.height/2.0 + map.length/2 * depth;
				result.rowintersect = { x: map.wx, y: map.wy };

				var Pw = intersectLineLine(mx, my, mx, my - base, map.wx, map.wy, map.wx + tilewidth, map.wy + depth);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pw.y > base){ result.row = row; result.col = col; return result; } 
				result.ptintersect = { x: Pw.x, y: Pw.y };				

				// if we are within tile's base, we are in the last column. let's now calculate the row
				row--;
				col = Math.floor( (Pw.y - map.wy) / (depth / 2) );			
			}
		}
		
		// at this point, if the intersected tile map is beyond our map array, let's bail
		if (row > map.length - 1 || col > map[0].length - 1){ result.row = row; result.col = col; return result; } 
	
		// if we ignore tiles' actual height, we just check if intersected tile is within map, bail out if not.
		// --------------------------------------------------------------------------------------------------------
		if (!checktotalheight){ result.row = row; result.col = col; return result; }		

		// if we reach this point, we're required to check for tiles with actual total height
		// --------------------------------------------------------------------------------------------------------

		// let's count how many tiles to check based on highest(tallest) tile
		var n = Math.floor( (maxtileheight - base) / depth );
		
		// let's copy a reference to the intersected tile
		var trow = row, tcol = col;
		// identify the tiles that are below the intersected tile that may hold tiles high enough that it intersects as well
		for (var i = 0; i <= n; i++)
		{			
			if (tcol + i >= map[0].length || trow + i >= map.length || tcol + i < 0 || trow + i < 0) continue;
			result.intersectedtiles.push( { row: trow + i, col: tcol + i } );
			
			// let's get the relative position of mx, my from this tile's top-left position
			var J = getRelPosOfPointFromTile(mx, my, trow + i, tcol + i);
			var t = map[trow + i][tcol + i][0];
			var r = map[trow + i][tcol + i][1];
			var c = map[trow + i][tcol + i][2];			
			
			// if image data is transparent, we don't have intersect 
			//if (!tiles[t].intersect(J.x, J.y, r, c)) continue;
			var imgData = tiles[t].getImageData(J.x, J.y, 1, 1, r, c);
			if (imgData.data[3] === 0) continue;						
		
			// if we reach this point, this tile intersects with mx, my. check if this is the tile closest to view
			if (trow + i > row || tcol + i > col){ row = trow + i; col = tcol + i; }				
		}

		// get the width of the intersected tile and relative position of mx, my from it.
		var T = getRelPosOfPointFromTile(mx, my, trow, tcol);
		
		// identify the tiles that are adjacent to intersected tiles
		for (var i = 0; i < n; i++)
		{
			// check which adjacent side are we going to test for intersection
			var cs, rs;
			(T.x > tilewidth/2) ? (cs = 1, rs = 0) : (cs = 0, rs = 1);
				
			if (tcol + i + cs < map[0].length && trow + i  + rs < map.length && tcol + i + cs >= 0 && trow + i + rs >= 0)
			{	
				result.intersectedtiles.push( { row: trow + i + rs, col: tcol + i + cs } );
	
				// let's get the relative position of mx, my from this tile's top-left position
				var J = getRelPosOfPointFromTile(mx, my, trow + i + rs, tcol + i + cs);
				var t = map[trow + i + rs][tcol + i + cs][0];
				var r = map[trow + i + rs][tcol + i + cs][1];
				var c = map[trow + i + rs][tcol + i + cs][2];			
			
				// if image data is transparent, we don't have intersect 
				//if (!tiles[t].intersect(J.x, J.y, r, c)) continue;
				var imgData = tiles[t].getImageData(J.x, J.y, 1, 1, r, c);
				if (imgData.data[3] === 0) continue;								
				
				if (trow + i + rs > row || tcol + i + cs > col){ row = trow + i + rs; col = tcol + i + cs; }			
			}
		}		
		
		// if we reach this point, we already find the tile that intersect with mx, my and closest to view
		// --------------------------------------------------------------------------------------------------------
		result.row = row; 
		result.col = col; 
		return result;
	}	 	
	
	/*-------------------------------------------------------------------------------------------------------------------
	tests a given pt mx, my if intersects with any of the tile in map
	uses an algorithm where it does not need to sort through every tile in map array to find the intersected tile
	-------------------------------------------------------------------------------------------------------------------*/	
	this.getTileFromPtInMapDiamondCW45 = function(mx, my, 					// position to check which tile it intersects
												  checkbase = true, 		// also include tile's base in checking for intersect
												  debug)	
	{				
		// define a line from mx, my parallel to map row and project it to line parallel to map column and get their intersection point
		var Pc = intersectLineLine(mx, my, mx + tilewidth, my - depth, map.nx, map.ny, map.nx + tilewidth, map.ny + depth);
		
		// define a line from mx, my parallel to map column and project it to line parallel to map row and get their intersection point
		var Pr = intersectLineLine(mx, my, mx - tilewidth, my - depth, map.nx, map.ny, map.nx - tilewidth, map.ny + depth);

		// if there's no intersection point(lines are parallel), we can bail out
		if (!Pr || !Pc) return;
		
		// find the row and column of the tile that intesect
		var col = Math.floor( (Pc.y - map.ny) / (depth / 2) );
		var row = Math.floor( (Pr.y - map.ny) / (depth / 2) );
		
		// if we are also checking for intersect on tile's floor height...
		// ------------------------------------------------------------------------------------------------		//var M = { x: mx, y: my };
		if (checkbase)
		{		
			// if the tile is one column tile outside the map (south-east side), let check if we are intersecting at the base
			if (col == map[0].length)
			{
				// define a line from map's right corner to bottom corner and find the intersection point with the line between mx, my projected through y-axis
				var Pe = intersectLineLine(mx, my, mx, my - base, map.ex, map.ey, map.ex - tilewidth, map.ey + depth);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pe.y > base) return {row: row, col: col};  
				
				// if we are within tile's base, we are in the last column. let's now calculate the row
				col--;
				row = Math.floor( (Pe.y - map.ey) / (depth / 2) );			
			}
			// if the tile is one row tile outside the map (south-west side), let check if we are intersecting at the base
			if (row == map.length)
			{
				var Pw = intersectLineLine(mx, my, mx, my - base, map.wx, map.wy, map.wx + tilewidth, map.wy + depth);		
				
				// if our mx, my is too far below the tile, we can bail out
				if (my - Pw.y > base) return {row: row, col: col}; 

				// if we are within tile's base, we are in the last column. let's now calculate the row
				row--;
				col = Math.floor( (Pw.y - map.wy) / (depth / 2) );			
			}
		}
		
		 return {row: row, col: col};
	}	
	
	/*-------------------------------------------------------------------------------------------------------------------
	assuming the tile in the map coordinate row, col is a multi-tile object, find the map coordinate of it's [0,0]
	and [max, max].	these information is useful for identifying the location of all the tiles this multi-tile object 
	occupies in the	map.
	if row, col is invalid, returns nothing
	-------------------------------------------------------------------------------------------------------------------*/	
	this.pickTileFromTileInMapDiamondCW45 = function(row, col)
	{
		var result = {};
		
		// validate r, c
		if ( row < 0 || row >= map.length || col < 0 || col >= map[0].length) return;
		
		// get tile index
		var t = map[row][col][0];
		if (t < 0 || t >= tiles.length) return;
		
		// get the locaton of this tile's [0, 0] in the map
		result.row0 = row - map[row][col][1];
		result.col0 = col - map[row][col][2];
				
		// get the location of this tile's [max, max] in the map
		result.row1 = result.row0 + tiles[t].rows() - 1;
		result.col1 = result.col0 + tiles[t].cols() - 1;
		
		// validate results
		if (result.row0 < 0 || result.row0 >= map.length) return;
		if (result.row1 < 0 || result.row1 >= map.length) return;
		if (result.col0 < 0 || result.col0 >= map[0].length) return;
		if (result.col1 < 0 || result.col1 >= map[0].length) return;

		// if we reach this point, our result is valid
		return result;
	}
	
	/*-------------------------------------------------------------------------------------------------------------------
	
	-------------------------------------------------------------------------------------------------------------------*/	
	this.getNeighborTilesFromPickedTile = function(mx, my, row, col, r, c)
	{
		var result = [];
		var rs, re, cs, ce;
		
		// if r is odd
		if (r % 2)
		{
			rs = row - Math.floor(r / 2);
			re = row + Math.floor(r / 2);
		}
		// if r is even
		else
		{
			// get relative position of point from this tile
			var T = getRelPosOfPointFromTile(mx, my, row, col, true);
						
			// get dot product 
			var dot = -depth * T.x + tilewidth * T.y;			
			
			// if dot product > 0 
			if (dot >= 0)
			{
				rs = row - Math.floor(r / 2) + 1;
				re = row + Math.floor(r / 2);
			}			
			// if dot product < 0
			else
			{
				rs = row - Math.floor(r / 2);
				re = row + Math.floor(r / 2) - 1;
			}						
		}
		
		// if c is odd
		if (c % 2)
		{
			cs = col - Math.floor(c / 2);
			ce = col + Math.floor(c / 2);
		}		
		// if c is even
		else
		{
			// get relative position of point from this tile
			var T = getRelPosOfPointFromTile(mx, my, row, col, true);
						
			// get dot product 
			var dot = depth * (T.x - tilewidth) + tilewidth * T.y;			
			
			// if dot product > 0 
			if (dot >= 0)
			{
				cs = col - Math.floor(c / 2) + 1;
				ce = col + Math.floor(c / 2);
			}			
			// if dot product < 0
			else
			{
				cs = col - Math.floor(c / 2);
				ce = col + Math.floor(c / 2) - 1;
			}				
		}
		
		for (var i = rs; i <= re; i++)
		{
			for (var j = cs; j <= ce; j++)
			{
				result.push({ row: i, col: j});
			}
		}
		return result;
	}
 }

/*---------------------------------------------------------------------------------------------------------------------------------
tile class implementation
there are 2 version, one loads all tiles to canvas while the other dynamically clips a portion of image and draw as a tile
both seems to work at the same performance
---------------------------------------------------------------------------------------------------------------------------------*/	
function tile(imagefile, row, col, depth, tilewidth, base, debug)
{
var use_canvas_version = true;

if (use_canvas_version)
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
	
	// calculate total depth - height from [0,0] to [n,n]
	image.totaldepth = col * depth/2 + row * depth/2;	

	// as this image file is loaded, let's set the canvas size where this image will be loaded
	image.onload = function() 
	{
		// measure offset height. offset height is the height from top of image to top of first tile [0,0]
		this.offsetheight = this.naturalHeight - this.totaldepth - base;
		
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
				canvas.height = this.offsetheight + depth + r * depth/2 + c * depth/2 + base;
				
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
	canvas tile height = image.height - totaldepth - (r + c) * depth/2
	or
	tileheight = image.offsetheight + depth + base + (r + c) depth/2
	------------------------------------------------------------------------*/
	this.tileheight = function(r, c)
	{ 
		//return image.offsetheight + depth * ( 1 + (r + c) / 2 ) + base;
		return image.naturalHeight + depth * (1 + (r + c - col - row) / 2 );
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
				var ty = y + r * depth/2 + c * depth/2;
				
				if (!drawhidden){ if (!this.hidden(r, c)) continue; } 
				
				this.draw(scene, r, c, tx, ty);
				scene.drawRect(tx,ty, tilewidth, depth, 0, "rgba(128,128,128,0.5)", 0);
				n++;
			}
		}		
		scene.drawRect(x,y, image.naturalWidth, image.totaldepth, 0, "rgba(128,128,128,0.5)", 0);
		return n;
	}
	 
	/*------------------------------------------------------------------------
	draw specific tile within the image
	it offsets the y-position such that the x, y is the top-left position of 
	tile excluding offset height. this is to make map engine not to worry
	tile's offset height and just assume all tiles are just depth/tilewidth 
	size
	------------------------------------------------------------------------*/
	this.draw = function(scene, r, c, x, y)
	{
		// calculate y such that the top position to draw the image is the 
		// y-position of tile excluding offset height
		var ty = y - (image.offsetheight +  r * depth/2 + c * depth/2);
		
		if (c == col - 1 && r < row - 1) x += tilewidth/2;
		
		scene.drawImage(image.tiles[r][c], x, ty);
		//scene.drawRect(x,y,tilewidth, depth, 0, "rgba(128,128,128,0.5)", 0);
	}		
	
	/*------------------------------------------------------------------------
	some canvas tiles are overlapped by others, e.g. [1,1] is overlapped by
	[2,2]. overlapped canvas tiles are hidden so we don't need to draw them.
	this function checks for that
	------------------------------------------------------------------------*/
	this.hidden = function(r, c)
	{
		if (r == row - 1){ return true; }
		if (c == col - 1){ return true; }
		return false;
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
else
{
	"use strict";

	/*------------------------------------------------------------------------
	validate arguments
	------------------------------------------------------------------------*/
	if (typeof imagefile === 'undefined'){ throw new Error("imagefiles passed is undefined"); }
	
	/*------------------------------------------------------------------------
	create image object to hold our image file 
	------------------------------------------------------------------------*/
	var image = new Image();
	image.src = imagefile;
	image.parent = this;
	image.totaldepth = col * depth/2 + row * depth/2;	
		
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
		
		this.offsetheight = this.naturalHeight - this.totaldepth - base;
		if (this.parent.onload) this.parent.onload();
		if (debug) console.log("[tile] %s (%dx%d) is loaded as building.", this.src, this.naturalWidth, this.naturalHeight);
		if (debug) console.log("[tile] total depth: %d, offset height: %d.", this.totaldepth, this.offsetheight);
	}			
	
	/*------------------------------------------------------------------------
	get the canvas height of the tile specified in r,c 
	canvas tile height = image.height - totaldepth - (r + c) * depth/2
	or
	tileheight = image.offsetheight + depth + base + (r + c) depth/2
	------------------------------------------------------------------------*/
	this.tileheight = function(r, c)
	{ 
		//return image.offsetheight + depth * ( 1 + (r + c) / 2 ) + base;
		return image.naturalHeight + depth * (1 + (r + c - col - row) / 2 );
	}	
	
	/*------------------------------------------------------------------------
	quickly draw the image for testing purposes
	------------------------------------------------------------------------*/
	this.testdraw = function(scene, x, y )
	{
		scene.drawImage(image.canvas, x, y);
		//scene.drawRect(x,y,image.width(),image.height(), 0, "rgba(128,128,128,0.5)", 0);
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
				var ty = y + r * depth/2 + c * depth/2;

				if (!drawhidden){ if (!this.hidden(r, c)) continue; } 

				this.draw(scene, r, c, tx, ty);				
				scene.drawRect(tx,ty, tilewidth, depth, 0, "rgba(128,128,128,0.5)", 0);
				n++;
			}
		}		
		scene.drawRect(x,y, image.naturalWidth, image.totaldepth, 0, "rgba(128,128,128,0.5)", 0);
		return n;
	}
	 
	/*------------------------------------------------------------------------
	draw specific tile within the image
	------------------------------------------------------------------------*/
	this.draw = function(scene, r, c, x, y)
	{
		var sx = (row - 1 + c - r) * tilewidth/2; 
		var sy = 0;
		
		var sw = tilewidth;
		var sh = this.tileheight(r, c);
		
		y -= (image.offsetheight +  r * depth/2 + c * depth/2);
				
		scene.drawImageRegionToTarget(image.canvas, sx, sy, sw, sh, x, y, sw, sh);
		//scene.drawRect(x,y,sw,sh, 0, "rgba(128,128,128,0.5)", 0);
	}			
	
	/*------------------------------------------------------------------------
	some canvas tiles are overlapped by others, e.g. [1,1] is overlapped by
	[2,2]. overlapped canvas tiles are hidden so we don't need to draw them.
	this function checks for that
	------------------------------------------------------------------------*/
	this.hidden = function(r, c)
	{
		if (r == row - 1){ return true; }
		if (c == col - 1){ return true; }
		return false;
	}	
	
	/*------------------------------------------------------------------------
	get pixel data in specified area of the canvas
	------------------------------------------------------------------------*/
	this.getImageData = function(x, y, w, h, r, c)
	{
		x += (row - 1 + c - r) * tilewidth/2; 		
		return image.canvas.getContext("2d").getImageData(x, y, w, h); 
	} 
}
}

