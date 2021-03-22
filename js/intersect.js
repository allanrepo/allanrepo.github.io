import {Vector2} from './Vector2.js';

function ClosestPointInLineSegmentToPoint(p, s0, s1)
{
    // line segment s0->s1
    let S = Vector2.Subtract(s1, s0);
    // line segment s0->p
    let P = Vector2.Subtract(p ,s0);

    // length of projection of P to S
    let t = P.Dot(S);

    // if t = 0, P is perpendicular to S
    // if t < 0, p's projection is outside of S on s0 side
    if (t <= 0)
    {
        return s0;
    }
    else
    {
        let lengthSqrdS = S.Dot(S);

        // dot product of same vector results in the vector's magnitude^2
        // if t > S.Dot(S), P projects outside S on s1 side
        if (t >= lengthSqrdS)
        {
            return s1;
        }
        else
        {
            // if we reach this point, closest point is within line segment S
            t = t / lengthSqrdS;

            // closest point = s0 + S * t (parametric representation of line)
            return Vector2.Add(s0, S.Scale(t));
        }
    }
}

// AABB represented with min and max vertices
function ClosestPointInAABBToPoint(p, b)
{
    let d = new Vector2();

    // project box and point into x-axis
    let x = p.x;
    if (x < b.min.x) x = b.min.x;
    if (x > b.max.x) x = b.max.x;

    // project box and point into y-axis
    let y = p.y;
    if (y < b.min.y) y = b.min.y;
    if (y > b.max.y) y = b.max.y;
    
    return new Vector2(x, y);
}

function ClosestPointInOBBToPoint(p, obb)
{
    // obb.c; // as vector2; box' center
    // obb.u; // as vector2; box' orthogonal unit vector 
    // obb.v;
    // obb.uHalfWidth;
    // obb.vHalfWidth;
}

export 
{
    ClosestPointInLineSegmentToPoint, 
    ClosestPointInAABBToPoint,
    ClosestPointInOBBToPoint
};