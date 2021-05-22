import {Scene} from './scene.js';

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
}
