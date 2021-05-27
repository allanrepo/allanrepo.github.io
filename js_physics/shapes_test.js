import {Scene} from './scene.js';
import {Triangle} from './2D/Triangle.js';
import {Vector} from './2D/Vector.js';
import {Transform} from './2D/Transform.js';
import {LineSegment} from './2D/LineSegment.js';

var scene;

window.onload = function()
{
    init();
}

function init()
{	
    // create scene object
    scene = new Scene("sim_canvas");	
    scene.clear();
    scene.setBackgroundColor("#777777");
    scene.autofit = true;


    // specify
    scene.addEvent(demoTriangle, 16.67); // 30 fps for logic
    scene.addEvent(logic, 50); // 30 fps for logic
    scene.addEvent(realTime, 1); // event to be in sync with scene's event handler loop (1ms)
    scene.start();	

    scene.rotation = 0.0;

    scene.addEventListener("mousemove", function(e)
    { 
        var r = scene.getBoundingClientRect();
        scene.mx = e.pageX - r.left; 
        scene.my = e.pageY - r.top; 
    });
}

function realTime(e)
{
    scene.fps_realtime = e.fps.toFixed(2);
}

function logic(e)
{
    scene.fps_logic = e.fps.toFixed(2);
    scene.rotation += 0.025;
}


function clear(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + scene.fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + scene.fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;    
}

function demo(e)
{
    clear(e);
}


function demoLineSegment(e)
{
    clear(e);

    let A = new Vector(0, 0);
    let B = new Vector(0, 200);
    let P = new Vector(scene.mx, scene.my);

    Transform.Rotate(B, scene.rotation);
    Transform.Translate([A,B], new Vector(400, 400));

    let L = new LineSegment(A, B);
    let Q = L.ClosestPointFromPoint(P);

    scene.drawLine(A.x, A.y, B.x, B.y, "#0000ff");
    scene.drawLine(Q.x, Q.y, P.x, P.y, "#ffffaa");
}

function demoTriangle(e)
{
    clear(e);

    let A = new Vector(200, -100);
    let B = new Vector(-200, -100);
    let C = new Vector(0, 200);
    let P = new Vector(scene.mx, scene.my);
    let T = new Vector(600, 500);

    Transform.Rotate([A, B, C], scene.rotation);
    Transform.Translate([C, B, A], T);

    let tri = new Triangle(C, A, B);
    let Q = tri.ClosestPointFromPoint(P);
    let isIntersect = tri.IsPointIntersect(P);

    scene.drawPolygon(tri.ToArray(), 0, 0, "#ff770077");  
    scene.drawText( A.x.toFixed(1) + ", " + A.y.toFixed(1), A.x, A.y, 0, 0, 16, "courier", "white") ;    
    scene.drawText( B.x.toFixed(1) + ", " + B.y.toFixed(1), B.x, B.y, 0, 0, 16, "courier", "white") ;    
    scene.drawText( C.x.toFixed(1) + ", " + C.y.toFixed(1), C.x, C.y, 0, 0, 16, "courier", "white") ;    
    scene.drawText( "Area: " + tri.Area().toFixed(1), T.x, T.y, 0, 0, 16, "courier", "white") ;    
    scene.drawText( "Perimeter: " + tri.Perimeter().toFixed(1), T.x, T.y + 16, 0, 0, 16, "courier", "white") ;    

    scene.drawLine(Q.x, Q.y, P.x, P.y, "#ffffaa");
    scene.drawCircle(P.x, P.y, 3, "#FF0000");
    scene.drawCircle(Q.x, Q.y, 3, "#FF0000");
    if (isIntersect) scene.drawCircle(Q.x, Q.y, 6, "#77ff00");
}
