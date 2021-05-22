import {Vector} from './Vector.js';

class ClosestPoint
{
    static LineSegmentToPoint(p, s0, s1)
    {
        // line segment s0->s1
        let S = Vector.Subtract(s1, s0);
        // line segment s0->p
        let P = Vector.Subtract(p ,s0);

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
                return Vector.Add(s0, Vector.Multiply(S, t));
            }
        }
    }

    static OBBToPoint(P, OBB)
    {
        // let this vector be the closest point. initialize it as OBB's center
        let R = OBB.C.Clone();

        // is this 2D or 3D test? or even higher dimension? who cares? we just need to know
        let size = OBB.T.length;

        // project P into each of OBB's arbitrary axis and get its closest point to this axis
        for(let i = 0; i < size; i++)
        {
            // create a vector from obb's center to the point
            let CP = Vector.Subtract(P, OBB.C);

            // get projection length of vector |P-obb.C| with current axis
            let t = CP.Dot(OBB.T[i]);

            // since OBB.T are unit vectors, the projection length t, it's value can be 0 > OBB's halfwidth in this arbitrary axis
            // if it's < -halfwidth or > halfwidth, then P is outside of OBB in this axis  
            if (t > OBB.E.Get(i)) t = OBB.E.Get(i);
            if (t < -OBB.E.Get(i)) t = -OBB.E.Get(i);    

            // now that we know the projection length t, let's get the corresponding vector length of that projection
            let T = Vector.Multiply(OBB.T[i], t);

            // translate our closest point R to this projection. 
            R.Add(T);
        }
        return R;
    }

    static TriangleToPoint(P, A, B, C)
    {
        let AB = Vector.Subtract(B, A);
        let AP = Vector.Subtract(P, A);
        let BA = Vector.Subtract(A, B);
        let BP = Vector.Subtract(P, B);

        let CP = Vector.Subtract(P, C);
        let CA = Vector.Subtract(A, C);
        let AC = Vector.Subtract(C, A);
        
        let BC = Vector.Subtract(C, B);
        let CB = Vector.Subtract(B, C);

        let PA = Vector.Subtract(A, P);
        let PB = Vector.Subtract(B, P);

        let PC = Vector.Subtract(C, P);

        // let s be parametric position of P's projection on AB
        // s = s0/(s0+s1); AB.Dot(AB) = s0+s1
        let s0 = AP.Dot(AB);
        let s1 = BP.Dot(BA);    
        let s = s0 / (s0 + s1);

        // let t be parametric position of P's projection on AC
        // t = t0/(t0+t1); AC.Dot(AC) = t0+t1
        let t0 = AP.Dot(AC);
        let t1 = CP.Dot(CA);    
        let t = t0 / (t0 + t1);

        // check if P is within vertex A voronoi region
        if (s0 <= 0 && t0 <= 0) return A;

        // let u be parametric position of P's projection on BC
        // u = u0/(u0+u1); BC.Dot(BC) = u0+u1
        let u0 = BP.Dot(BC);
        let u1 = CP.Dot(CB);    
        let u = u0 / (u0 + u1);

        // check if P is within vertex B voronoi region
        if (u0 <= 0 && s1 < 0) return B;

        // check if P is within vertex C voronoi region
        if (u1 <= 0 && t1 < 0) return C;

        let An = AB.Cross(AC);
        let cp = An.Dot(PA.Cross(PB));
        if (cp <= 0 && s0 >= 0 && s1 >= 0) 
        {
            return Vector.Add(A, Vector.Multiply(AB, s));
        }

//        let Bn = BC.Cross(BA);
        let an = An.Dot(PB.Cross(PC));
        if (an <= 0 && u0 >= 0 && u1 >= 0) 
        {
            return Vector.Add(B, Vector.Multiply(BC, u));
        }        

//        let Cn = CA.Cross(CB);
        let bn = An.Dot(PC.Cross(PA));
        if (bn <= 0 && t0 >= 0 && t1 >= 0) 
        {
            return Vector.Add(A, Vector.Multiply(AC, t));
        }        




        return P;
    }


    static AABBToPoint(p, aabb)
    {
        let r = new Vector();

        // project box and point into x-axis
        let x = p.x || 0;
        if (x < b.min.x) x = b.min.x;
        if (x > b.max.x) x = b.max.x;

        // project box and point into y-axis
        let y = p.y || 0;
        if (y < b.min.y) y = b.min.y;
        if (y > b.max.y) y = b.max.y;
        
        // project box and point into z-axis
        let z = p.z || 0;
        if (z < b.min.z) z = b.min.z;
        if (z > b.max.z) z = b.max.z;
        
        return new Vector(x, y, z);
    }    
}

export {ClosestPoint};