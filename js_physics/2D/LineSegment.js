import { Vector } from "./Vector.js";

class LineSegment 
{
    // @TODO: for now assumes a, b are objects with .x and .y property
    constructor(a, b)
    {
        // ensure 3 arguments are passed. if argument is passed but is null, this detects it as well
        if (a == undefined || b == undefined)
        {
            throw "need 2 vertices to create line segment.";
        }

        // a and b must not be the same
        if (Vector.Subtract(b, a).IsZeroVector())
        {
            throw "can't create line segment if 2 vertices are the same.";
        }

        // store copies of vertices
        this.vertices = [
            new Vector(a.x, a.y),
            new Vector(b.x, b.y)
        ];
    }

    // @TODO: assumes p is object with .x and .y property
    ClosestPointFromPoint(p)
    {
        // line segment s0->s1
        let S = Vector.Subtract(this.vertices[1], this.vertices[0]);
        // line segment s0->p
        let P = Vector.Subtract(p , this.vertices[0]);

        // length of projection of P to S
        let t = Vector.Dot(P, S);

        // if t = 0, P is perpendicular to S
        // if t < 0, p's projection is outside of S on s0 side
        if (t <= 0)
        {
            return new Vector().Copy(this.vertices[0]);
        }
        else
        {
            let lengthSqrdS = Vector.Dot(S, S);

            // dot product of same vector results in the vector's magnitude^2
            // if t > S.Dot(S), P projects outside S on s1 side
            if (t >= lengthSqrdS)
            {
                return new Vector().Copy(this.vertices[1]);
            }
            else
            {
                // if we reach this point, closest point is within line segment S
                t = t / lengthSqrdS;

                // closest point = s0 + S * t (parametric representation of line)
                return Vector.Add(this.vertices[0], Vector.Multiply(S, t));
            }
        }        
    }

    ToArray()
    {
        return [
            this.vertices[0].x,
            this.vertices[0].y,
            this.vertices[1].x,
            this.vertices[1].y,
        ];
    }    
}

export {LineSegment};