import {Vector} from './Vector.js';
import {Matrix} from './Matrix.js';

const USE_VECTOR = true;

class Geometry
{
    // given triangle ABC, point P in the same plane as triangle can be expressed as
    // P = uA + vB + wC where u + v + w = 1. u, v, w are barycentric coordinates of P
    // using the 2 equations, we can combine to P = (1 - v - w)A + vB + wC
    // and simplify to P = A + v(B - A) + w(C - A)
    // P now looks like where at point A, project line segments along |BA| and |CA| to P
    // rearrange to look like this v(B - A) + w(C - A) = (P - A)
    // let's make it more visually clear...
    // L = B - A 
    // M = C - A 
    // N = P - A
    // vL + wM = N
    // create 2 equations by multiplying above by L and M
    // v(L.L) + w(M.L) = N.L
    // v(L.M) + w(M.M) = N.M
    // this looks like 2x2 matrix now and can be solved using cramer's rule
    //     |N.L M.L|     |L.L N.L|
    //     |N.M M.M|     |L.M N.M|
    // v = --------- w = ---------
    //     |L.L M.L|     |L.L M.L| 
    //     |L.M M.M|     |L.M M.M|
    //
    // v = [(N.L)(M.M) - (M.L)(N.M)] /[(L.L)(M.M) - (M.L)(L.M)]
    // w = [(L.L)(N.M) - (N.L)(L.M)] /[(L.L)(M.M) - (M.L)(L.M)]
    // u = 1 - v - w
    static GetBarycentricCoordsPointInTriangle(P, A, B, C)
    {
        if(true)
        {
            let L = Vector.Subtract(B, A);
            let M = Vector.Subtract(C, A);
            let N = Vector.Subtract(P, A);

            let nl = N.Dot(L);
            let mm = M.Dot(M);
            let ml = M.Dot(L);
            let nm = N.Dot(M);
            let ll = L.Dot(L);
            let lm = L.Dot(M);

            let denom = ll*mm - ml*lm;
            let v = (nl*mm - ml*nm) / denom;
            let w = (ll*nm - nl*lm) / denom;
            let u = 1 - v - w;
            return { u: u, v: v, w: w};
        }
        else
        {

        }
    }

    // supports 2D and 3D vertices     
    static GetTriangleArea(A, B, C)
    {
        // faster method, using vector
        if (USE_VECTOR)
        {
            let AB = Vector.Subtract(B, A);
            let AC = Vector.Subtract(C, A);
            let ABxAC = AB.Cross(AC);
            return AB.Magnitude() / 2;
        }
        // using b*h/2 formula. slow
        else
        {
            // set AB as base
            let AB = Vector.Subtract(B, A);

            // get projection of AC to AB
            let AC = Vector.Subtract(C, A);
            let t = AC.Dot(AB);
            t = t / AB.MagnitudeSquared();
            let T = Vector.Add(A, Vector.Multiply(AB,t));    

            // calculate base, height
            let base = AB.Magnitude();
            let height = Vector.Subtract(T, C).Magnitude();

            // calculate area
            return base * height / 2;
        }
    }    

    static GetSignedTriangleArea(A, B, C)
    {
        let AB = Vector.Subtract(B, A);
        let AC = Vector.Subtract(C, A);
        let ABxAC = AB.Cross(AC);
        let ABn = AB.Clone().Normalize();
    }
}

export {Geometry};