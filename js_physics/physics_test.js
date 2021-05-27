import {Scene} from './scene.js';
import {Triangle} from './2D/Triangle.js';
import {Vector} from './2D/Vector.js';
import {Transform} from './2D/Transform.js';
import {LineSegment} from './2D/LineSegment.js';
import {Particle} from './2D/Particle.js';
import {Force, ForceRegistry} from './2D/Force.js';
import {Physics} from './2D/Physics.js';

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

    // create physics engine with gravity
    scene.world = new Physics(new Vector(0, 100));

    // specify
    scene.addEvent(physics, 33.33); // 60 fps for logic
    scene.addEvent(render, 1); // event to be in sync with scene's event handler loop (1ms)
    scene.start();	

    scene.addEventListener("mousemove", function(e)
    { 
        var r = scene.getBoundingClientRect();
        scene.mx = e.pageX - r.left; 
        scene.my = e.pageY - r.top; 
    });

    scene.particles = [];

    scene.addEventListener("mousedown", function(e)
    { 
        var r = scene.getBoundingClientRect();

        // set num of particles to create from 5-10
        let num = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < num; i++)
        {
            let P = new Particle();
            P.position = new Vector(e.pageX - r.left, e.pageY - r.top);
            P.inverseMass = 1;

            // random x component +/- 50-100;
            let x = (Math.floor(Math.random() * 100) + 10) * (Math.round(Math.random()) * 2 - 1);
            // random y component +/- 100-200;
            let y = (Math.floor(Math.random() * 200) + 10) * (Math.round(Math.random()) * 2 - 1);
            P.velocity = new Vector(x, y);

            // random age 5-8
            P.age = Math.floor(Math.random() * 10) + 3;        

            scene.world.Add(P, true, true);
        }


        // // add particles 
        // let P = new Particle();
        // P.position = new Vector(e.pageX - r.left, e.pageY - r.top);
        // P.inverseMass = 1;
        // P.velocity = new Vector(50, -150);
        // P.age = 5;        
        // scene.world.Add(P, true, true);

        // // add particles 
        // P = new Particle();
        // P.position = new Vector(e.pageX - r.left, e.pageY - r.top);
        // P.inverseMass = 1;
        // P.velocity = new Vector(-50, -150);
        // P.age = 5;        
        // scene.world.Add(P, true, false);
    });    
}

function clear(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Physics(FPS)    :" + scene.fps_physics, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;    
}

function render(e)
{
    clear(e);
    scene.drawText("ForceRegistry Count: " + scene.world.forceRegistry.length, 5, 125, 0,0, 20, "courier", "white") ;    
    scene.drawText("Particle Count: " + scene.world.particles.length, 5, 155, 0,0, 20, "courier", "white") ;    


    for (let i = 0; i < scene.world.particles.length; i++)
    {
        let P = scene.world.particles[i];        
        scene.drawCircle(P.position.x, P.position.y, 10, "#77ff7777");
    }
}

function physics(e)
{
    scene.fps_physics = e.fps.toFixed(2);

    scene.world.Update(1 / e.fps);
}


