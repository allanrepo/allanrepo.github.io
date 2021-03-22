import {Vector2} from './Vector2.js';
import {Scene} from './scene.js';
import {ClosestPointInAABBToPoint, ClosestPointInLineSegmentToPoint} from './intersect.js';


'use strict';
var scene, sc;
var fps_realtime, fps_logic;

function init()
{	
    // create scene object
    scene = new Scene("sim_canvas");	
    scene.clear();
    scene.setBackgroundColor("#777777");
    scene.autofit = true;

    // add loop functions on our scene and start it
    scene.addEvent(DemoClosestPointOnLineSegmentToPoint, 16.67); // 60fps for rendering
    scene.addEvent(logic, 33.33); // 30 fps for logic
    scene.addEvent(realTime, 1); // event to be in sync with scene's event handler loop (1ms)
    scene.start();	
    
    scene.addEventListener("mousemove", function(e)
    { 
        var r = scene.getBoundingClientRect();
        scene.mx = e.pageX - r.left; 
        scene.my = e.pageY - r.top; 
    });
}

function realTime(e)
{
    fps_realtime = e.fps.toFixed(2);
}


function logic(e)
{
    fps_logic = e.fps.toFixed(2);
}

window.onload = function()
{
    init();
}

// demo to test Vector2 class
function DemoTestVector2(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;

    // blue line points
    let b1 = new Vector2(400, 400);
    let b2 = new Vector2(scene.mx, scene.my);
    let b = b1.Clone();
    b.Subtract(b2);

    // red line points
    let r1 = b1.Clone();
    let r2 = new Vector2(800, 500);
    let r = r1.Clone();
    r.Subtract(r2);

    // line segment intersect            
    scene.drawLine(b1.x, b1.y, b2.x, b2.y, "#0000ff");
    scene.drawLine(r1.x, r1.y, r2.x, r2.y, "#ff0000");

    // red length
    scene.drawText(r1.Distance(r2), r2.x + 20, r2.y + 20, 0,0, 20, "courier", "white") ;
    scene.drawText(r.Magnitude(), r2.x + 20, r2.y + 50, 0,0, 20, "courier", "white") ;
    r.Normalize();
    scene.drawText(r.x + ", " + r.y, r2.x + 20, r2.y + 80, 0,0, 20, "courier", "white") ;

    // blue length
    scene.drawText(b1.Distance(b2.x, b2.y), b2.x + 20, b2.y + 20, 0,0, 20, "courier", "white") ;
    scene.drawText(b.Magnitude(), b2.x + 20, b2.y + 50, 0,0, 20, "courier", "white") ;
    scene.drawText(Math.sqrt(b.Dot(b)), b2.x + 20, b2.y + 80, 0,0, 20, "courier", "white") ;
    b.Normalize();
    scene.drawText(b.x + ", " + b.y, b2.x + 20, b2.y + 110, 0,0, 20, "courier", "white") ;

    scene.drawText(b.Dot(r), b1.x + 20, b1.y + 20, 0,0, 20, "courier", "white") ;
}

// function Demo
function DemoClosestPointOnLineSegmentToPoint(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;

    // line segment
    let s0 = new Vector2(400, 400);
    let s1 = new Vector2(800, 500);

    // point
    let p = new Vector2(scene.mx, scene.my);

    // closest point
    let c = ClosestPointInLineSegmentToPoint(p, s0, s1);

    // AABB 
    let aabb = new Object();
    aabb.min = new Vector2(300, 600);
    aabb.max = new Vector2(600, 800);
    let d = ClosestPointInAABBToPoint(p, aabb);
    scene.drawRectangle(aabb.min.x, aabb.min.y, aabb.max.x - aabb.min.x, aabb.max.y - aabb.min.y, "#007700");

    // OBB
    let obb = 
    {
        C = new Vector2(1200, 500),
        U = new Vector2(1, 0),
        V = new Vector2(0, 1),
        uHalfWidth = 200,
        vHalfWidth = 100,
    }        

    scene.drawLine(s0.x, s0.y, s1.x, s1.y, "#ff0000");
    scene.drawLine(c.x, c.y, p.x, p.y, "#555555");
    scene.drawLine(d.x, d.y, p.x, p.y, "#555555");
    scene.drawCircle(p.x, p.y, 3, "#0000ff");
    scene.drawCircle(c.x, c.y, 3, "#00ffff");
    scene.drawCircle(d.x, d.y, 3, "#00ffff");
}





