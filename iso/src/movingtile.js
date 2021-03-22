
/*---------------------------------------------------------------------------------------------------------------------------------
sw - southwest, row++, x--
ne - northeast, row--, x++
se - southeast, col++, x++
nw - northwest, col--, x--
---------------------------------------------------------------------------------------------------------------------------------*/	
function mobile(imagefile, r, c, tilewidth, depth, base, map, v, dir)
{	
	// initial position of this object relative to it's row/col position in tile map
	// -----------------------------------------------------------------------------------
	var x, y;
	var initPos = function(){ x = tilewidth/2; y = depth/2; }
	initPos();

	// try to remove this mobile from specified tile in map; 
	// -----------------------------------------------------------------------------------
	var removeFromThisTile = function(row, col)
	{
		if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return;		
		for (var i = 0; i < map[row][col][4].length; i++)
		{
			if (map[row][col][4][i] == this)
			{ 
				map[row][col][4].splice(i, 1); 
				i--;
			}			
		}
	}.bind(this);
	
	// try to add this mobile from specified tile in map; 
	// -----------------------------------------------------------------------------------
	var addToThisTile = function(row, col)
	{
		if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return;		
		map[row][col][4].push(this);				
	}.bind(this);
	
	// set speed
	// -----------------------------------------------------------------------------------
	this.speed = function(tv)
	{	
		if (typeof tv != 'undefined')
		{
			removeFromThisTile(r,c);
			removeFromThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
			v = tv;
			addToThisTile(r,c);
			addToThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
		}		
		return v; 
	}	
	// call this to automatically include this object in tiles that will draw it
	this.speed(v);

	// set path
	// -----------------------------------------------------------------------------------
	this.path = function(tpath)
	{
		if (typeof tpath != 'undefined')
		{
			removeFromThisTile(r,c);
			removeFromThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
			dir = tpath;
			addToThisTile(r,c);
			addToThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
		}		
		return dir; 		
	}
	
	// load image
	// -----------------------------------------------------------------------------------
	var image = new Image();
	image.src = imagefile;
	image.parent = this;
	image.offsetheight = 0;
	
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

		// let's store the offset height
		this.offsetheight = image.canvas.height - depth - base;
		
		// fire up event handler for this, if any		
		if (this.parent.onload) this.parent.onload();
	}		
	
	// control movement state of this object
	// -----------------------------------------------------------------------------------
	var move = true;
	this.move = function(state){ if( typeof state != 'undefined')move = state; console.log(move); return move; }

	
	var normalize = function(v)
	{
		var m = Math.sqrt(v.x*v.x + v.y*v.y);
		v.x /= m;
		v.y /= m; 
		return v;
	}

	// accessor to this object's row/col position in the tile map
	this.row = function(row){ if(row){ r = row;} return r; }
	this.col = function(col){ if(col){ c = col;} return c; }
		
	/*-------------------------------------------------------------------------
	sw - southwest, row++, x--
	ne - northeast, row--, x++
	se - southeast, col++, x++
	nw - northwest, col--, x--
	-------------------------------------------------------------------------*/	
	var prev;
	var first = true;
	this.update = function(now)
	{
		// first attempt
		if (first){ prev = now; first = false; return; }
		
		// if paused
		if (!move){ prev = now; }

		// calculate unit movement
		var se = {x: tilewidth/depth, y: depth/depth}
		
		// update 
		x += se.x * ( v * (now - prev) ); 
		y += se.y * ( v * (now - prev) ); 
		prev = now;
		
		
		
		// direction = northeast or southeast
		if (x > tilewidth/2 && v >= 0) 
		{
			if ((r - 1 < 0 && dir == "row") || (c + 1 > map[0].length - 1 && dir == "col") ){ initPos(); }
			else
			{			
				removeFromThisTile(r,c);
				removeFromThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
				
				r += ((dir == "row")?( (v < 0)? 1: -1) : 0);
				c += ((dir == "col")?( (v < 0)? -1: 1) : 0);				
				
				addToThisTile(r, c);
				addToThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
				
				x -= tilewidth/2;
				y -= depth/2;
			}			
		}		
		
		// direction = southwest or northwest
		if (x < tilewidth/2 && v < 0) 
		{
			if ( (r + 1 >= map.length && dir == "row") || (c - 1 < 0 && dir == "col") ){ initPos(); }
			else
			{			
				removeFromThisTile(r,c);
				removeFromThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	

				r += ((dir == "row")?( (v < 0)? 1: -1) : 0);
				c += ((dir == "col")?( (v < 0)? -1: 1) : 0);				

				addToThisTile(r, c);
				addToThisTile(r + ((dir == "row")?( (v < 0)? -1:1) : 0), c + ((dir =="col")?( (v < 0)? 1:-1 ) : 0) );	
				x += tilewidth/2;
				y += depth/2;
			}			
		}
		
	}

	/*---------------------------------------------------------------------------------------------------------------------------------
	sw - southwest, row++, x--
	-	
	ne - northeast, row--, x++
	se - southeast, col++, x++
	nw - northwest, col--, x--
	---------------------------------------------------------------------------------------------------------------------------------*/		
	this.draw = function(scene, nx, ny, row, col)
	{
		if (!image.canvas) return;

		// using these for debug purposes to shift the position of the object when rendering
		var dx = 24
		var dy = 12;
		
		// get the absolute top-left position of this tile with reference to map's top corner coordinate
		var px = nx - tilewidth/2 + col * tilewidth/2 - row * tilewidth/2;
		var py = ny + row * depth/2 + col * depth/2 - image.offsetheight;
		
		var sx, sy;
		var sw; 
		var tx, ty, tw;
		var sh = image.canvas.height, th = image.canvas.height;
		
		// se, leading
		// x = [0, tw/2], w = [tw/2, tw]
		// -------------------------------------------------------------------
		if ( row == r && col == c && v >= 0 && dir == "col" )
		{
			sx = tilewidth/2 - x - dx;
			sy = 0;
			sw = tilewidth/2 + x; 
			tx = px;
			ty = py - depth/2 + y - dy;
			tw = tilewidth/2 + x;
			
			scene.drawRect(	tx, ty, tw, th, 0, "rgba(192,128,128,0.5)");
			scene.drawImageRegionToTarget(	image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}
		
		// se, trailing
		// x = [0, tw/2], w = [tw/2, tw]
		// -------------------------------------------------------------------
		if ( row == r && col == c - 1 && v >= 0 && dir == "col" )
		{
			sx = 0 - dx;
			sy = 0;
			sw = tilewidth/2 - x; 
			tx = px + x;
			ty = py + y - dy;
			tw = tilewidth/2 - x;
			
			scene.drawRect(	tx, ty, tw, th, 0, "rgba(128,128,128,0.5)");
			scene.drawImageRegionToTarget(	image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}		

		// nw, leading
		// x = [tw, tw/2], w = [tw/2, 0]
		// -------------------------------------------------------------------
		if ( row == r && col == c && v < 0 && dir == "col" )
		{
			if (col == map[0].length - 1) // draw full tile if it's on max col
			{
				sx = tilewidth - x - dx;
				sy = 0;
				sw = x; 
				tx = px;
				ty = py + depth/2 - y - dy;
				tw = x + tilewidth/2;
			}
			else
			{
				sx = 0 - dx;
				sy = 0;
				sw = tilewidth - x; 
				tx = px + x - tilewidth/2;
				ty = py - depth/2 + y - dy;
				tw = tilewidth - x;
			}
			scene.drawRect(	tx, ty, tw, th, 0, "rgba(192,128,128,0.5)");
			scene.drawImageRegionToTarget( image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}

		// nw, trailing
		// x = [tw, tw/2], w = [tw/2, 0], y = [d, d/2]
		// -------------------------------------------------------------------
		if ( row == r && col == c + 1 && v < 0 && dir == "col" )
		{
			sx = tilewidth - x - dx;
			sy = 0;
			sw = x; 
			tx = px;
			ty = py - depth + y - dy;
			tw = x ;

			scene.drawRect(	tx, ty, tw, th, 0, "rgba(128,128,128,0.5)");
			scene.drawImageRegionToTarget( image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}
		
		// draw the leading tile when it's travelling southwest. 		
		// x = [tw, tw/2], w = [tw/2, tw]
		// -------------------------------------------------------------------
		if ( row == r && col == c && v < 0 && dir == "row" )
		{			
			sx = 0 + dx;
			sy = 0;
			sw = tilewidth - x + tilewidth/2; 
			tx = px - tilewidth/2 + x;
			ty = py + depth/2 - y - dy;
			tw = tilewidth - x + tilewidth/2;
			scene.drawRect(	tx, ty, tw, th, 0, "rgba(192,128,128,0.5)");
			scene.drawImageRegionToTarget(	image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}
		
		// draw the trailing tile when it's travelling southwest. 		
		// x = [tw, tw/2], w = [tw/2, 0]
		// -------------------------------------------------------------------
		if ( row == r - 1 && col == c && v < 0 && dir == "row" ) // sw, x = [tw, tw/2], trailing tile
		{			
			sx = tilewidth + tilewidth/2 - x + dx;
			sy = 0;
			sw = x - tilewidth/2; 
			tx = px + tilewidth/2;
			ty = py + depth - y - dy;
			tw = x - tilewidth/2;
			scene.drawRect(	tx, ty, tw, th, 0, "rgba(128,128,128,0.5)");
			scene.drawImageRegionToTarget(	image, sx, sy, sw, sh, tx, ty, tw, th ); 											
		}		
		
		// draw the leading tile when it's travelling northeast. 		
		// x = [0, tw/2], w = [0, tw/2]
		// -------------------------------------------------------------------
		if ( row == r && col == c && v >= 0 && dir == "row" )
		{			
			if (row == map.length - 1) // draw full tile if it's on max row
			{
				sx = tilewidth/2 - x + dx;
				sy = 0;
				sw = tilewidth/2 + x; 
				tx = px;
				ty = py + depth/2 - y - dy;
				tw = tilewidth/2 + x;
			}
			else
			{
				sx = tilewidth - x + dx;
				sy = 0;
				sw = x; 
				tx = px + tilewidth/2;
				ty = py + depth/2 - y - dy;
				tw = x;
			}
			//scene.drawRect(	tx, ty, tw, th, 0, "rgba(192,128,128,0.5)");
			scene.drawImageRegionToTarget( image, sx, sy, sw, sh, tx, ty, tw, th ); 
		}		
		
		// draw the trailing tile when it's travelling northeast. 		
		// x = [tw, tw/2], w = [tw, tw/2]
		// -------------------------------------------------------------------
		if ( row == r + 1 && col == c && v >= 0 && dir == "row" )
		{			
			sx = 0 + dx;
			sy = 0;
			sw = tilewidth - x; 
			tx = px + x;
			ty = py - y - dy;
			tw = tilewidth - x;
			//scene.drawRect(	tx, ty, tw, th, 0, "rgba(128,128,128,0.5)");
			scene.drawImageRegionToTarget( image, sx, sy, sw, sh, tx, ty, tw, th );
		}				

		//scene.drawText(r + ", " + c + ", v: " + v, px + x, py - y, "16px courier", "rgb(255,255,255)");			
	}
	

/*
	this.draw = function(scene, nx, ny, row, col)
	{
		if (!image.canvas) return;

		if ( row == r && col == c && (dir == "se" || dir == "nw") )
		{
			var px = nx - tilewidth/2 + c * tilewidth/2 - r * tilewidth/2 - tilewidth/2;
			var py = ny + r * depth/2 + c * depth/2 - image.offsetheight - depth/2;

			scene.drawRect(px + x, py + y, tilewidth, image.canvas.height, 0, "rgba(192,128,128,0.5)");
			
			scene.drawImageRegionToTarget(	image, 
											0, 0, 
											image.canvas.width, image.canvas.height, 
											px + x, py + y, 
											tilewidth, image.canvas.height);
											
			scene.drawText(r + ", " + c + ", v: " + v, px, py);
			scene.drawText("SE and NW", px, py + 25);
		}	

		if ( row == r && col == c )
		{
			var px = nx - tilewidth/2 + col * tilewidth/2 - row * tilewidth/2;
			var py = ny + row * depth/2 + col * depth/2 - image.offsetheight;
			
			if (v < 0)
			{
				scene.drawRect(	px - tilewidth/2 + x, py + depth/2 - y, 
								tilewidth - x + tilewidth/2,  image.canvas.height, 
								0, "rgba(192,128,128,0.5)");
				
				scene.drawImageRegionToTarget(	image, 
												0, 0, 
												tilewidth - x + tilewidth/2, image.canvas.height, 
												px - tilewidth/2 + x, py + depth/2 - y, 
												tilewidth - x + tilewidth/2, image.canvas.height);
												
			}
			else if (v >= 0)
			{
				scene.drawRect(	px + tilewidth/2, py + depth/2 - y, 
								x,  image.canvas.height, 
								0, "rgba(192,128,128,0.5)");
				
				scene.drawImageRegionToTarget(	image, 
												image.canvas.width - x, 0, 
												x, image.canvas.height, 
												px + tilewidth/2, py + depth/2 - y, 
												x, image.canvas.height);				
			}			
			scene.drawText(r + ", " + c + ", v: " + v, px + x, py - y, "16px courier", "rgb(255,255,255)");			
		}		
		
		if ( row == r + 1 && col == c && v >= 0 ) // ne, x = [0, tw/2], trailing tile
		{
			var px = nx - tilewidth/2 + col * tilewidth/2 - row * tilewidth/2;
			var py = ny + row * depth/2 + col * depth/2 - image.offsetheight;
			
			scene.drawRect(	px + x, py - y, 
							tilewidth - x,  image.canvas.height, 
							0, "rgba(128,128,128,0.5)");	

			scene.drawImageRegionToTarget(	image, 
											0, 0, 
											tilewidth - x, image.canvas.height, 
											px + x, py - y, 
											tilewidth - x, image.canvas.height);
		}

		if ( row == r - 1 && col == c && v < 0 ) // sw, x = [tw, tw/2], trailing tile
		{
			var px = nx - tilewidth/2 + col * tilewidth/2 - row * tilewidth/2;
			var py = ny + row * depth/2 + col * depth/2 - image.offsetheight;
			
			scene.drawRect(	px + tilewidth/2, py - y + depth, 
							x -tilewidth/2,  image.canvas.height, 
							0, "rgba(128,128,128,0.8)");	
								
			console.log(y)

			scene.drawImageRegionToTarget(	image, 
											tilewidth + tilewidth/2 - x, 0, 
											x- tilewidth/2, image.canvas.height, 
											px + tilewidth/2, py + depth - y, 
											x -tilewidth/2,  image.canvas.height);
											
		}

	}
*/
}

