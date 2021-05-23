import {Scene} from './scene.js';
import {Triangle} from './2D/Triangle.js';
import {Vector} from './2D/Vector.js';
import {Transform} from './2D/Transform.js';

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
    scene.addEvent(demo, 16.67); // 30 fps for logic
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

    // test 2d vector class
    let A = new Vector(100, 0);
    let B = new Vector(-100, 0);
    let P = new Vector(0, 0);

    // transform points A and B
    Transform.Rotate(A, scene.rotation);
    Transform.Rotate([B], scene.rotation);
    Transform.Translate([A, B], new Vector(300, 300));
    Transform.Translate(P, new Vector(scene.mx, scene.my));

    let C = Vector.Subtract(P, A);
    let mag = C.Magnitude();
    C = Vector.Multiply(C, 0.5);
    C = Vector.Add(A, C);
    let N = Vector.Subtract(P, A);
    N = N.Normalize();

    scene.drawText( A.x.toFixed(2) + ", " + A.y.toFixed(2), A.x, A.y, 0, 0, 20, "courier", "white") ;    
    scene.drawText( P.x.toFixed(2) + ", " + P.y.toFixed(2), P.x, P.y - 20, 0, 0, 20, "courier", "white") ;    
    scene.drawText( mag.toFixed(2) + " (magnitude)", C.x + 200, C.y, 0, 0, 20, "courier", "white") ;    
    scene.drawText( N.x.toFixed(2) + ", " + N.y.toFixed(2) + "(normal)", C.x + 200, C.y - 20, 0, 0, 20, "courier", "white") ;    

    scene.drawLine(A.x, A.y, B.x, B.y, "#00ff00");
    scene.drawLine(A.x, A.y, P.x, P.y, "#ff0000");

    let U = new Vector(500, 500);
    let V = new Vector(800, 500);

    scene.drawLine(U.x, U.y, V.x, V.y, "#0000ff");
    scene.drawLine(V.x, V.y, P.x, P.y, "#0000ff");
    scene.drawLine(P.x, P.y, U.x, U.y, "#0000ff");
    let tri = new Triangle(U, V, P);
    scene.drawText( U.x.toFixed(2) + ", " + U.y.toFixed(2), U.x, U.y, 0, 0, 20, "courier", "white") ;    
    scene.drawText( V.x.toFixed(2) + ", " + V.y.toFixed(2), V.x, V.y - 20, 0, 0, 20, "courier", "white") ;    
    scene.drawText( "Area: " + tri.Area().toFixed(2), U.x, U.y + 20, 0, 0, 20, "courier", "white") ;    
    scene.drawText( "Perimeter: " + tri.Perimeter().toFixed(2), U.x, U.y + 40, 0, 0, 20, "courier", "white") ;    
}
