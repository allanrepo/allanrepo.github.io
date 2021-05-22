import {Vector} from './Vector.js';
import {Matrix} from './Matrix.js';
import {Transform} from './Transform.js';
import {Matrix2} from './Matrix2.js';
import {Vector2} from './Vector2.js';
import {Scene} from './scene.js';
import {OBB} from './OBB.js';
import {ClosestPoint} from './ClosestPoint.js';
import {Intersect} from './Intersect.js';
import {Intersect2D} from './Intersect2D.js';
import {Geometry} from './Geometry.js';
import { Point } from './Point.js';


'use strict';
var scene, sc;
var fps_realtime, fps_logic;


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
    scene.addEvent(InitIntersectConvexPolygon, 0, 1); // 1 time only
    scene.addEvent(DemoIntersectConvexPolygon, 16.67); // 60fps for rendering
    scene.addEvent(logic, 50); // 30 fps for logic
    scene.addEvent(realTime, 1); // event to be in sync with scene's event handler loop (1ms)
    scene.start();	

    scene.demoMatrix0 = new Matrix(3,3).Random();
    scene.demoMatrix1 = new Matrix(3,3).Random();

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
    fps_realtime = e.fps.toFixed(2);
}

function logic(e)
{
    fps_logic = e.fps.toFixed(2);

    scene.rotation += 0.025;
}



function clear(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;    
}

function drawMatrix(m, x, y)
{
    let d = 1;
    for (let i = 0; i < m.m.length; i++)
    {       
        let str = ""; 
        for (let j = 0; j < m.m[i].length; j++)
        {
            if (m.m[i][j] >= 0) str += " ";
            str += m.m[i][j].toFixed(d);
            if (j < m.m[i].length)
            {
                str += "  ";
            }
        }
        scene.drawText(str, x, y, 0, 0, 20, "courier", "white") ;
        y += 40;
    }
}

function drawVector(v, x, y)
{
    scene.drawText("[" + v.v.toString() + "]", x, y, 0, 0, 20, "courier", "white") ;

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
        C: new Vector2(1200, 500),
        U: new Vector2(1, 0),
        V: new Vector2(0, 1),
        uHalfWidth: 100,
        vHalfWidth: 50,
    }        
    obb.U.Normalize();
    obb.V.Normalize();

    let TransformM2D = new Matrix(3,3);    
    // let TranslateM2D = Transform2D.CreateTranslationMatrix2D(800, 350);
    let RotateM2D = Transform2D.CreateRotationMatrix(scene.rotation);
    
    TransformM2D.Multiply(RotateM2D);
    obb.U = Transform2D.Transform(TransformM2D, obb.U);    
    obb.V = Transform2D.Transform(TransformM2D, obb.V);    


    let tr = obb.U.Clone().Multiply(obb.uHalfWidth);
    tr.Add(obb.V.Clone().Multiply(obb.vHalfWidth));
    tr.Add(obb.C);

    let tl = new Vector2(0,0);
    tl.Subtract(obb.U.Clone().Multiply(obb.uHalfWidth));
    tl.Add(obb.V.Clone().Multiply(obb.vHalfWidth));
    tl.Add(obb.C);

    let br = new Vector2(0,0);
    br.Add(obb.U.Clone().Multiply(obb.uHalfWidth));
    br.Subtract(obb.V.Clone().Multiply(obb.vHalfWidth));
    br.Add(obb.C);    

    let bl = new Vector2(0,0);
    bl.Subtract(obb.U.Clone().Multiply(obb.uHalfWidth));
    bl.Subtract(obb.V.Clone().Multiply(obb.vHalfWidth));
    bl.Add(obb.C);    

    let pts =[tr.x, tr.y, tl.x, tl.y, bl.x, bl.y, br.x, br.y];
    scene.drawPolygon(pts, 0, 0, "#777700");

    let f = ClosestPointInOBBToPoint(p, obb);

    scene.drawLine(s0.x, s0.y, s1.x, s1.y, "#ff0000");
    scene.drawLine(c.x, c.y, p.x, p.y, "#555555");
    scene.drawLine(d.x, d.y, p.x, p.y, "#555555");
    scene.drawLine(f.x, f.y, p.x, p.y, "#555555");
    scene.drawCircle(p.x, p.y, 3, "#0000ff");
    scene.drawCircle(c.x, c.y, 3, "#00ffff");
    scene.drawCircle(d.x, d.y, 3, "#00ffff");
    scene.drawCircle(f.x, f.y, 3, "#00ffff");

    let mm = scene.demoMatrix0.Clone();
    scene.demoMatrix1.Identity();
    mm.Multiply(scene.demoMatrix1);    
    // drawMatrix(scene.demoMatrix0, 500, 10);
    // drawMatrix(scene.demoMatrix1, 800, 10);
    // drawMatrix(mm, 1100, 10);

    let translateM = new Matrix(3,3);
    translateM.m[2][0] = 3;
    translateM.m[2][1] = 4;

    let vector = new Matrix(1,3);
    vector.m[0][0] = 1;
    vector.m[0][1] = 3;
    vector.m[0][2] = 1;

    let rslt = vector.Clone();
    rslt.Multiply(translateM);
    drawMatrix(vector, 500, 10);
    drawMatrix(translateM, 800, 10);
    drawMatrix(rslt, 1100, 10);

    // let pt = new Vector2(100, 0);
    // let TransformM2D = new Matrix(3,3);    
    // let TranslateM2D = Matrix.CreateTranslationMatrix2D(800, 350);
    // let RotateM2D = Matrix.CreateRotationMatrix2D(scene.rotation);
    
    // TransformM2D.Multiply(RotateM2D);
    // TransformM2D.Multiply(TranslateM2D);

    // pt = Transform2D(TransformM2D, pt);

    // scene.drawCircle(pt.x, pt.y, 10, "#ff0000");
    
    //scene.Rotate2D = Matrix.CreateRotationMatrix2D();

}

function VectorClassTest(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;

    Vector.Size = 3;

    // line segment - scale, rotate, translate, draw
    let S0 = new Vector(-1,0);
    let S1 = new Vector( 1,0);
    S0.Multiply(100);
    S1.Multiply(100);
    let SRotationM = Transform3D.CreateRotationMatrix(scene.rotation);
    let STranslationM = Transform3D.CreateTranslationMatrix(new Vector(200, 300, 0));
    let STransform = SRotationM.Clone();
    STransform.Multiply(SRotationM);
    STransform.Multiply(STranslationM);
    Transform3D.Transform(STransform, S0);
    Transform3D.Transform(STransform, S1);
    scene.drawLine(S0.x, S0.y, S1.x, S1.y, "#ff0000");

    // mouse cursor circle
    let P = new Vector(scene.mx, scene.my, 0);
    scene.drawCircle(P.x, P.y, 3, "#0000ff");

    // AABB - scale, rotate, translate, draw

    // closest point in AABB to point

    // OBB - scale, rotate, translate, draw
    let obb = 
    {
        C: new Vector(0, 0, 0),
        U: new Vector(1, 0, 0),
        V: new Vector(0, 1, 0),
        W: new Vector(0, 0, 1),
        u: 100,
        v: 50,
        w: 20,
    }      
    let Useg = obb.U.Clone();
    let Vseg = obb.V.Clone();

    obb.tl = obb.C.Clone();
    obb.tl.Subtract( Vector.Multiply(obb.U, obb.u) );
    obb.tl.Add( Vector.Multiply(obb.V, obb.v) );
    obb.tr = obb.C.Clone();
    obb.tr.Add( Vector.Multiply(obb.U, obb.u) );
    obb.tr.Add( Vector.Multiply(obb.V, obb.v) );
    obb.bl = obb.C.Clone();
    obb.bl.Subtract( Vector.Multiply(obb.U, obb.u) );
    obb.bl.Subtract( Vector.Multiply(obb.V, obb.v) );
    obb.br = obb.C.Clone();
    obb.br.Add( Vector.Multiply(obb.U, obb.u) );
    obb.br.Subtract( Vector.Multiply(obb.V, obb.v) );



    let obbRotationM = Transform3D.CreateRotationMatrix(scene.rotation/2);
    Transform3D.Transform(obbRotationM, obb.U);
    Transform3D.Transform(obbRotationM, obb.V);
    let obbTranslationM = Transform3D.CreateTranslationMatrix(new Vector(800, 400, 0));
    let obbTransform = obbRotationM.Clone();
    obbTransform.Multiply(obbTranslationM);
    Transform3D.Transform(obbTransform, obb.C);
    Transform3D.Transform(obbTransform, obb.tl);
    Transform3D.Transform(obbTransform, obb.tr);
    Transform3D.Transform(obbTransform, obb.bl);
    Transform3D.Transform(obbTransform, obb.br);

       
    let pts =[obb.tr.x, obb.tr.y, obb.tl.x, obb.tl.y, obb.bl.x, obb.bl.y, obb.br.x, obb.br.y];
    scene.drawPolygon(pts, 0, 0, "#777700");

    // closest point in line segment to point
    let A = ClosestPointInLineSegmentToPoint(P, S0, S1);
    scene.drawLine(P.x, P.y, A.x, A.y, "#555555");
    scene.drawCircle(A.x, A.y, 3, "#00ffff");    

    // closest point in OBB to point
    let B = ClosestPointInOBBToPoint(P, obb);
    scene.drawLine(P.x, P.y, B.x, B.y, "#555555");
    scene.drawCircle(B.x, B.y, 3, "#00ffff");    

    Useg.Multiply(obb.u);
    Transform3D.Transform(obbRotationM, Useg);
    Transform3D.Transform(obbTranslationM, Useg);
    scene.drawLine(Useg.x, Useg.y, obb.C.x, obb.C.y, "#ff0000");
    Vseg.Multiply(obb.v);
    Transform3D.Transform(obbRotationM, Vseg);
    Transform3D.Transform(obbTranslationM, Vseg);
    scene.drawLine(Vseg.x, Vseg.y, obb.C.x, obb.C.y, "#ff00ff");
}

function TriangleDemo(e)
{
    scene.clear();
    scene.drawText("Render(FPS)   :" + e.fps.toFixed(2), 5, 5, 0,0, 20, "courier", "white") ;
    scene.drawText("Logic(FPS)    :" + fps_logic, 5, 35, 0,0, 20, "courier", "white") ;
    scene.drawText("Real Time(FPS):" + fps_realtime, 5, 65, 0,0, 20, "courier", "white") ;
    scene.drawText("Mouse: " + scene.mx + ", " + scene.my, 5, 95, 0,0, 20, "courier", "white") ;
    
    Vector.Size = 3;

    // point as mouse cursor
    let P = new Vector(scene.mx, scene.my, 0);

    // triangle vertices
    let A = new Vector(300, 100, 0);
    let B = new Vector(900, 200, 0);
    let C = new Vector(650, 800, 0);

    // draw polygon
    let pts = [A.x, A.y, B.x, B.y, C.x, C.y];
    scene.drawPolygon(pts, 0, 0, "#777700");    

    // let AB be base
    let AB = Vector.Subtract(B, A);
    //scene.drawLine(A.x, A.y, B.x, B.y, "#111111", 5);

    // get closest point in along AB line to C
    let AC = Vector.Subtract(C, A);
    let t = AC.Dot(AB);
    t = t / AB.MagnitudeSquared();
    let T = Vector.Add(A, Vector.Multiply(AB,t));

    // draw the "height" which is projection of C to "base" AB
    //scene.drawLine(C.x, C.y, T.x, T.y, "#007700", 2);

    let ABC = Geometry.GetTriangleArea(A,B,C);
    let ABP = Geometry.GetTriangleArea(A,B,P);
    let BCP = Geometry.GetTriangleArea(B,C,P);
    let CAP = Geometry.GetTriangleArea(C,A,P);
    let ab = ABP/ABC;
    let bc = BCP/ABC;
    let ca = CAP/ABC;
    let to = ab + bc + ca;

    // print base, height, area
    let base = AB.Magnitude();
    let height = Vector.Subtract(T, C).Magnitude();
    scene.drawText("Height: " + height.toFixed(2), 5, 125, 0,0, 20, "courier", "white") ;
    scene.drawText("Base: " + base.toFixed(2), 5, 155, 0,0, 20, "courier", "white") ;
    scene.drawText("Area: " + (base * height / 2).toFixed(2), 5, 185, 0,0, 20, "courier", "white") ;
    scene.drawText("A", A.x - 20, A.y - 10, 0,0, 20, "courier", "white") ;
    scene.drawText("B", B.x + 20, B.y - 10, 0,0, 20, "courier", "white") ;
    scene.drawText("C", C.x - 10, C.y + 20, 0,0, 20, "courier", "white") ;
    scene.drawText("Area: " + (ABP).toFixed(2), 580, 130, 0,0, 20, "courier", "white") ;
    scene.drawText("ab: " + ab.toFixed(2) , 580, 160, 0,0, 20, "courier", "white") ;
    scene.drawText("Area: " + (CAP).toFixed(2), 280, 450, 0,0, 20, "courier", "white") ;
    scene.drawText("ca: " + ca.toFixed(2) , 280, 480, 0,0, 20, "courier", "white") ;
    scene.drawText("Area: " + (BCP).toFixed(2), 800, 500, 0,0, 20, "courier", "white") ;
    scene.drawText("bc: " + bc.toFixed(2) , 800, 530, 0,0, 20, "courier", "white") ;
    scene.drawText("to: " + to.toFixed(2) , P.x + 20, P.y, 0,0, 20, "courier", "white") ;

    scene.drawLine(A.x, A.y, P.x, P.y, "#007700", 2);
    scene.drawLine(B.x, B.y, P.x, P.y, "#007700", 2);
    scene.drawLine(C.x, C.y, P.x, P.y, "#007700", 2);

    let barycentric = Geometry.GetBarycentricCoordsPointInTriangle(P, A, B, C);
    scene.drawText("u: " + barycentric.u.toFixed(2) , 5, 215, 0,0, 20, "courier", "white") ;
    scene.drawText("v: " + barycentric.v.toFixed(2) , 5, 245, 0,0, 20, "courier", "white") ;
    scene.drawText("w: " + barycentric.w.toFixed(2) , 5, 275, 0,0, 20, "courier", "white") ;
    
    // draw point
    scene.drawCircle(P.x, P.y, 5, Intersect.TestPointTriangle(P, A, B, C)? "#ff0000":"#77ff77");    

    let nPBC = Vector.Subtract(B, P).Cross(Vector.Subtract(C, P));
    let nABC = Vector.Subtract(B, A).Cross(Vector.Subtract(C, A));
    let aPBC = nPBC.Dot(nABC.Normalize());
    scene.drawText("w: " + aPBC.toFixed(2) , 5, 305, 0,0, 20, "courier", "white") ;
    drawVector(nPBC, 5, 335);
    drawVector(nABC, 5, 365);

    let Q = ClosestPoint.TriangleToPoint(P, A, B, C);
    scene.drawCircle(Q.x, Q.y, 5, "#ff0000");    
    scene.drawLine(Q.x, Q.y, P.x, P.y, "#333333", 2);
}

function MatrixOperationDemo(e)
{
    clear(e);

    Matrix.Row = 4;
    Matrix.Col = 4;
    let A = new Matrix();
    let B = Transform.CreateRotationMatrixZ(30 * Math.PI / 180);
    let C = Matrix.Multiply(A, B);

    drawMatrix(A, 300, 10);
    drawMatrix(B, 800, 10);
    drawMatrix(B, 300, 200);
}

function DemoOBB(e)
{
    clear(e);

    // 0th obb 
    let obb0 = new OBB(100, 80);
    obb0.RotateZ(30 * Math.PI / 180);
    obb0.Translate(new Vector(550, 650));
    obb0.Transform();

    // 1st obb 
    let obb1 = new OBB(70, 40);
    obb1.RotateZ(scene.rotation);
    obb1.Translate(new Vector(scene.mx, scene.my));
    obb1.Transform();
    
    // 2nd obb for overlap test
    let obb2 = new OBB(100, 50, 0);
    obb2.RotateZ(scene.rotation);
    obb2.Translate(new Vector(200,300));
    obb2.Transform();

    // 3rd obb for overlap test as well
    let obb3 = new OBB(80, 60, 0);
    obb3.RotateZ(-scene.rotation * 2);
    obb3.Translate(new Vector(350, 320));
    obb3.Transform();

    // test for obb to obb overlap
    let isObb2ObbContact = Intersect2D.TestOBBOBB(obb2, obb3);

    // test for obb to obb overlap
    let isObb2ObbContact1 = Intersect2D.TestOBBOBB2(obb1, obb0);    

    // draw 2nd obb
    let V = obb2.GetVertices();
    let pts = [V[0].x, V[0].y, V[1].x, V[1].y, V[2].x, V[2].y, V[3].x, V[3].y];
    scene.drawPolygon(pts, 0, 0, isObb2ObbContact?"#aaaaaa77":"#009999");        
    scene.drawCircle(obb2.C.x, obb2.C.y, 5, "#eeeeee");   

    // draw 3rd obb
    V = obb3.GetVertices();
    pts = [V[0].x, V[0].y, V[1].x, V[1].y, V[2].x, V[2].y, V[3].x, V[3].y];
    scene.drawPolygon(pts, 0, 0, isObb2ObbContact?"#aaaaaa77":"#999900");      
    scene.drawCircle(obb3.C.x, obb3.C.y, 5, "#eeeeee");   
    scene.drawLine(obb2.C.x, obb2.C.y, obb3.C.x, obb3.C.y, "#333333");

    // draw 0th obb
    V = obb0.GetVertices();
    pts = [V[0].x, V[0].y, V[1].x, V[1].y, V[2].x, V[2].y, V[3].x, V[3].y];
    scene.drawPolygon(pts, 0, 0, isObb2ObbContact1?"#aaaaaa77":"#ffff0077");        
    scene.drawCircle(obb0.C.x, obb0.C.y, 5, "#eeeeee");   

    // draw 1st obb
    V = obb1.GetVertices();
    pts = [V[0].x, V[0].y, V[1].x, V[1].y, V[2].x, V[2].y, V[3].x, V[3].y];
    scene.drawPolygon(pts, 0, 0, isObb2ObbContact1?"#aaaaaa77":"#ff770077");        
    scene.drawCircle(obb1.C.x, obb1.C.y, 5, "#eeeeee");   

    // get closest point on 1st obb
    let P = new Vector(scene.mx, scene.my);
    let C = ClosestPoint.OBBToPoint(P,obb2);
    scene.drawCircle(C.x, C.y, 5, "#eeeeee");   
    scene.drawLine(C.x, C.y, P.x, P.y, "#333333");

    // get closest point on 2nd obb
    C = ClosestPoint.OBBToPoint(P,obb3);
    scene.drawCircle(C.x, C.y, 5, "#eeeeee");   
    scene.drawLine(C.x, C.y, P.x, P.y, "#333333");
}

function UtilVectorsToArray(A)
{
    let B = [];
    for(let i = 0; i < A.length; i++)
    {
        B.push(A[i].x);
        B.push(A[i].y);
    }
    return B;
}

function UtilTranslateVectors(A, t)
{
    let M = Transform.CreateTranslationMatrix(t);
    for(let i = 0; i < A.length; i++)
    {
        Transform.Transform(M, A[i]);
    }
}

function UtilRotateZVectors(A, r)
{
    let M = Transform.CreateRotationMatrixZ(r);
    for(let i = 0; i < A.length; i++)
    {
        Transform.Transform(M, A[i]);
    }
}

function generateSymmetricConvexPolygonVertices(n, r)
{
    let vertices = [];
    for (let i = 0; i < n; i++)
    {        
        let angle = (Math.PI * 2) * i / n;
        vertices.push( new Vector(Math.sin(angle) * r, Math.cos(angle) * r) );
    }
    return vertices;
}


function InitIntersectConvexPolygon()
{
    // create polygon A object
    scene.polygonA = [new Vector(-50, -150), new Vector(50, -150), new Vector(50, 150), new Vector(-50, 150)];

    // move polygon A to initial position
    UtilTranslateVectors(scene.polygonA, new Vector(800, 500));

    // create polygon B object
    scene.polygonB = [new Vector(-200, -20), new Vector(200, -20), new Vector(200, 20), new Vector(-200, 20)];
}

function DemoIntersectConvexPolygon(e)
{
    clear(e);

    // deep copy polygon B vectors
    let B = scene.polygonB.map(v => v.Clone());

    // rotate polygonB vertices here (if you want) before you move it to mouse cursor position
//    UtilRotateZVectors(B, scene.rotation);
    //UtilRotateZVectors(B, 10);

    // make polygon B follow mouse cursor by translating it
    UtilTranslateVectors(B, new Vector(scene.mx, scene.my));

    // move polygon A vertices to its current position

    // check for collision with polygon B

    // move polygon A vertices again based on displacement resulting from collision with polygon B

    let A = scene.polygonA;

    let rslt = Intersect2D.TestConvexPolygonConvexPolygon(A, B);

    if(rslt)
    {
        UtilTranslateVectors(B, rslt.axis.Multiply(rslt.gap));
    }    

    rslt = Intersect2D.TestConvexPolygonConvexPolygon(A, B);

    // draw polygons
    scene.drawPolygon(UtilVectorsToArray(A), 0, 0, (rslt != null)?"#ffffff77":"#ff770077");  
    scene.drawPolygon(UtilVectorsToArray(B), 0, 0, (rslt != null)?"#ffffff77":"#77ff7777");  
    
}
