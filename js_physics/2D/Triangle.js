import { Vector } from "./Vector.js";
import { LineSegment } from "./LineSegment.js";

class Triangle
{
    // @TODO: for now assumes a, b, c are objects with .x and .y property
    constructor(a, b, c)
    {
        // ensure 3 arguments are passed. if argument is passed but is null, this detects it as well
        if (a == undefined || b == undefined || c == undefined)
        {
            throw "need 3 vertices to create triangle.";
        }

        // validate by checking if any adjacent edge is collinear. any 
        if (Vector.Cross(Vector.Subtract(a, b),  Vector.Subtract(b, c)) == 0)
        {
            throw "edges must not be collinear to create triangle";
        }
        
        // calculate 2D cross product of triangle edge 'AB' and 'AC' to determine the clockwise orientation of its vertices
        // if ABxAC < 0, it's CCW, otherwise, it's CW
        let ABxAC = Vector.Cross(Vector.Subtract(b, a), Vector.Subtract(c, a));

        // store copies of vertices in CCW orientation
        this.vertices = [
            new Vector(a.x, a.y),
            new Vector(ABxAC < 0? b.x: c.x, ABxAC < 0? b.y: c.y),
            new Vector(ABxAC < 0? c.x: b.x, ABxAC < 0? c.y: b.y),
        ];

        // @TODO: calculate edge normals
        this.normals = [];
        for(let i = 0; i < 3; i++)
        {
            let edge = Vector.Subtract(this.vertices[(i + 1) % 3], this.vertices[i]);
            edge.Normalize();
            this.normals.push(new Vector(-edge.y, edge.x));
        }
    }

    // returns the signed area of triangle. sign depends on the orientation of vertices
    // if vertices sequence is CCW, returns negative; if CW, returns positive
    Area()
    {
        return Vector.Cross(Vector.Subtract(this.vertices[0], this.vertices[1]),  Vector.Subtract(this.vertices[1], this.vertices[2])) / 2;
    }

    Perimeter()    
    {
        let perimeter = 0;
        for (let i = 0; i < 3; i++)
        {
            let e = Vector.Subtract(this.vertices[(i + 1) % this.vertices.length], this.vertices[i]);
            perimeter += e.Magnitude();
        }
        return perimeter;
    }
    
    IsPointIntersect(p)
    {
        // for simplicity and performance, let's create vectors here that we will use
        let AB = Vector.Subtract(this.vertices[1], this.vertices[0]); // triangle edge 'AB'
        let AP = Vector.Subtract(p, this.vertices[0]); // line segment from triangle vertex 'A' to point 'P'
        let BP = Vector.Subtract(p, this.vertices[1]); // line segment from triangle vertex 'B' to point 'P'
        let AC = Vector.Subtract(this.vertices[2], this.vertices[0]); // triangle edge 'AC'
        let CP = Vector.Subtract(p, this.vertices[2]); // line segment from triangle vertex 'C' to point 'P'
        let BC = Vector.Subtract(this.vertices[2], this.vertices[1]); // triangle edge 'BC'

        // calculate 2D cross product of triangle edge 'AB' and 'AC' to determine the clockwise orientation of its vertices
        // if ABxAC < 0, it's CCW, otherwise, it's CW
        let ABxAC = Vector.Cross(AB, AC);

        // calculate 2D cross product of triangle edge 'AB' and segment 'AP'. if it's opposite orientation of ABxAC then P falls within edge 'AB' voronoi region
        let ABxAP = Vector.Cross(AB, AP);        
        if (ABxAC * ABxAP < 0)
        {
            return false;
        }

        // calculate 2D cross product of triangle edge 'BC' and segment 'BP'. if it's opposite orientation of ABxAC then P falls within edge 'BC' voronoi region
        let BCxBP = Vector.Cross(BC, BP);
        if (ABxAC * BCxBP < 0)
        {
            return false;
        }        

        // calculate 2D cross product of triangle edge 'CA' and segment 'CP'. if it's opposite orientation of ABxAC then P falls within edge 'CA' voronoi region
        let CAxCP = Vector.Cross(AC, CP);
        if (ABxAC * CAxCP > 0)
        {
            return false;
        }           

        // if we reach this point, 'P' is inside the triangle
        return true;

        //let Q = this.ClosestPointFromPoint(p);
        //return Vector.Subtract(Q, p).IsZeroVector();
    }

    // @TODO: assumes p is object with .x and .y property
    // vertices doesn't matter if they are CW or CCW oriented. this algorithm doesn't care
    // the word 'orientation' is thrown around in this implementation. what i am referring to is the sequence of our triangle's vertex
    // if it's arranged in either CW or CCW direction.
    ClosestPointFromPoint(p)
    {
        // for simplicity and performance, let's create vectors here that we will use
        let AB = Vector.Subtract(this.vertices[1], this.vertices[0]); // triangle edge 'AB'
        let BA = Vector.Subtract(this.vertices[0], this.vertices[1]); // triangle edge 'BA'
        let AP = Vector.Subtract(p, this.vertices[0]); // line segment from triangle vertex 'A' to point 'P'
        let BP = Vector.Subtract(p, this.vertices[1]); // line segment from triangle vertex 'B' to point 'P'
        let AC = Vector.Subtract(this.vertices[2], this.vertices[0]); // triangle edge 'AC'
        let CA = Vector.Subtract(this.vertices[0], this.vertices[2]); // triangle edge 'CA'
        let CP = Vector.Subtract(p, this.vertices[2]); // line segment from triangle vertex 'C' to point 'P'
        let BC = Vector.Subtract(this.vertices[2], this.vertices[1]); // triangle edge 'BC'
        let CB = Vector.Subtract(this.vertices[1], this.vertices[2]); // triangle edge 'CB'
        
        // let s be parametric position of P's projection on AB
        // s = s0/(s0+s1); Dot(AB, AB) = s0+s1
        let s0 = Vector.Dot(AP, AB);
        let s1 = Vector.Dot(BP, BA);    
        let s = s0 / (s0 + s1);

        // let t be parametric position of P's projection on CA
        // t = t0/(t0+t1); Dot(CA, CA) = t0+t1
        let t0 = Vector.Dot(CP, CA);
        let t1 = Vector.Dot(AP, AC);    
        let t = t0 / (t0 + t1);

        // check if P is within vertex A voronoi region
        if (s0 < 0 && t1 < 0) return this.vertices[0].Clone();

        // let u be parametric position of P's projection on BC
        // u = u0/(u0+u1); Dot(BC, BC) = u0+u1
        let u0 = Vector.Dot(BP, BC);
        let u1 = Vector.Dot(CP, CB);    
        let u = u0 / (u0 + u1);   

        // check if P is within vertex B voronoi region
        if (u0 < 0 && s1 < 0) return this.vertices[1].Clone();

        // check if P is within vertex C voronoi region
        if (u1 < 0 && t0 < 0) return this.vertices[2].Clone();

        // calculate 2D cross product of triangle edge 'AB' and 'AC' to determine the clockwise orientation of its vertices
        // if ABxAC < 0, it's CCW, otherwise, it's CW
        let ABxAC = Vector.Cross(AB, AC);

        // calculate 2D cross product of triangle edge 'AB' and segment 'AP'. if it's opposite orientation of ABxAC then P falls within edge 'AB' voronoi region
        let ABxAP = Vector.Cross(AB, AP);        
        if (ABxAC * ABxAP < 0)
        {
            return Vector.Add(this.vertices[0], Vector.Multiply(AB, s));
        }

        // calculate 2D cross product of triangle edge 'BC' and segment 'BP'. if it's opposite orientation of ABxAC then P falls within edge 'BC' voronoi region
        let BCxBP = Vector.Cross(BC, BP);
        if (ABxAC * BCxBP < 0)
        {
            return Vector.Add(this.vertices[1], Vector.Multiply(BC, u));
        }        

        // calculate 2D cross product of triangle edge 'CA' and segment 'CP'. if it's opposite orientation of ABxAC then P falls within edge 'CA' voronoi region
        let CAxCP = Vector.Cross(AC, CP);
        if (ABxAC * CAxCP > 0)
        {
            return Vector.Add(this.vertices[2], Vector.Multiply(CA, t));
        }           

        // if we reach this point, 'P' is inside the triangle
        return p;
    }

    ToArray()
    {
        return [
            this.vertices[0].x,
            this.vertices[0].y,
            this.vertices[1].x,
            this.vertices[1].y,
            this.vertices[2].x,
            this.vertices[2].y,
        ];
    }
}

export {Triangle};