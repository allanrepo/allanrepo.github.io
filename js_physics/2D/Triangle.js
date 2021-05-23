import { Vector } from "./Vector.js";

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

        this.vertices = [a, b, c];
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
        throw "IsPointIntersect() not implemented yet.";
    }

    DistanceFromPoint(p)
    {
        throw "DistanceFromPoint() not implemented yet.";
    }

    ToArray()
    {

    }
}

export {Triangle};