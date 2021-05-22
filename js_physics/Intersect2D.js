import {OBB} from './OBB.js';
import {Vector} from './Vector.js';
import {Geometry} from './Geometry.js';

class Intersect2D
{
    static TestOBBOBB(A, B)
    {
        // get vertices of A
        let V = A.GetVertices();

        // we only deal with 2D so we expect 4 vertices only
        for(let i = 0; i < 4; i++)
        {
            if (Intersect2D.TestPointOBB(V[i], B)) return true;
        }

        // get vertices of B
        V = B.GetVertices();

        // we only deal with 2D so we expect 4 vertices only
        for(let i = 0; i < 4; i++)
        {
            if (Intersect2D.TestPointOBB(V[i], A)) return true;
        }

        return false;
    }

    static TestPointOBB(P, OBB)
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
            if (t > OBB.E.Get(i)) return false;
            if (t < -OBB.E.Get(i)) return false;    
        }

        return true;        
    }

    static TestOBBOBB2(A, B)
    {
        // use A.U as axis 
        let a = A.E.v[0];

        let B0 = Vector.Multiply(B.T[0], B.E.v[0]);
        B0.Add(Vector.Multiply(B.T[1], B.E.v[1]));
        let b0 = Math.abs(B0.Dot(A.T[0]));
        let B1 = Vector.Multiply(B.T[0], B.E.v[0]);
        B1.Subtract(Vector.Multiply(B.T[1], B.E.v[1]));
        let b1 = Math.abs(B1.Dot(A.T[0]));
        let b = b0 > b1? b0 : b1;

        let P = Vector.Subtract(A.C, B.C);
        let l = Math.abs(P.Dot(A.T[0]));

        if (l > a + b) return false;

        // use A.V as axis 
        a = A.E.v[1];
        b0 = Math.abs(B0.Dot(A.T[1]));
        b1 = Math.abs(B1.Dot(A.T[1]));
        b = b0 > b1? b0 : b1;
        l = Math.abs(P.Dot(A.T[1]));        
        
        if (l > a + b) return false;
        
        // use B.U as axis 
        b = B.E.v[0];

        let A0 = Vector.Multiply(A.T[0], A.E.v[0]);
        A0.Add(Vector.Multiply(A.T[1], A.E.v[1]));
        let a0 = Math.abs(A0.Dot(B.T[0]));
        let A1 = Vector.Multiply(A.T[0], A.E.v[0]);
        A1.Subtract(Vector.Multiply(A.T[1], A.E.v[1]));
        let a1 = Math.abs(A1.Dot(B.T[0]));
        a = a0 > a1? a0 : a1;
        l = Math.abs(P.Dot(B.T[0]));

        if (l > a + b) return false;

        // use B.V as axis 
        b = B.E.v[1];
        a0 = Math.abs(A0.Dot(B.T[1]));
        a1 = Math.abs(A1.Dot(B.T[1]));
        a = a0 > a1? a0 : a1;
        l = Math.abs(P.Dot(B.T[1]));        
        
        if (l > a + b) return false;

        return true;
    }

    static TestConvexPolygonConvexPolygon(A, B)
    {
        // we're performing similar algorithm to both polygons so to avoid duplicating the code, we will put both in an array just iterate through it
        let Polygons = [A, B]

        let axis = null;
        let gap = null;

        for(let i = 0; i < Polygons.length; i++)
        {
            // get reference to current polygon to simplify            
            let P = Polygons[i];

            // quick test. polygon must have minimum 3 vertices
            if (P.length < 3) return false;

            // iterate through each edge of current polygon
            for(let j = 0; j < P.length; j++)
            {
                // get the edge vector
                let E = Vector.Subtract(P[j == P.length - 1? 0 : j + 1], P[j]);                

                // get the "normal" of this edge and normalize it
                let T = new Vector(E.y, -E.x);
                T.Normalize();

                let min = [];
                let max = [];


                // we need to project vertices of both polygons to this edge
                for(let u = 0; u < Polygons.length; u++)
                {
                    let V = Polygons[u];

                    // let's deal with first vertex of current polygon first so we can initialize min/max with valid values
                    min.push(T.Dot(V[0]));
                    max.push(min[u]);
        
                    // now iterate with the remaining vertices of current polygon
                    for(let v = 1; v < V.length; v++)
                    {
                        // project each vertex V of current polygon to current edge normal T and get min/max
                        let r = T.Dot(V[v]);
 
                        // get the min/max
                        min[u] = Math.min(min[u], r);
                        max[u] = Math.max(max[u], r);
                    }
                }

                // evaluate min/max to check if intersect did not occur
                if ((max[0] < min[1]) || (max[1] < min[0]))
                {
                    return null;
                }
                else
                {
                    if(axis == null)
                    {
                        gap = (max[0] >= min[1])? max[0] - min[1] : max[1] - min[0];
                        axis = (max[0] >= min[1])? T : Vector.Multiply(T, -1);
                    }
                    else
                    {
                        let _gap = (max[0] >= min[1])? max[0] - min[1] : max[1] - min[0];
                        if (_gap <= gap)
                        {
                            gap = _gap;
                            axis = (max[0] >= min[1])? T : Vector.Multiply(T, -1);
                        }
                    }
                }
            }            
        }

        return {
            //axis: axis.Normalize(),
            //gap: Math.sqrt(gap)
            axis: axis,
            gap: gap
        };
//        return true;
    }

    static _TestConvexPolygonConvexPolygon(A, B)
    {
        // quick exit if polygon vertex count is not valid
        if (A.length < 3) return false;
        if (B.length < 3) return false;

        // iterate through each edge of polygon A
        for(let v = 0; v < A.length; v++)
        {
            // get the edge vector
            let E = Vector.Subtract(A[v == A.length - 1? 0 : v + 1], A[v]);
            
            // get the "normal" of this edge and normalize it
            let T = new Vector(E.y, -E.x);
            T.Normalize();

            // project the first vertex of polygon A to  initialize min/max
            let minA = T.Dot(A[0]);
            let maxA = minA;

            // iterate through each vertex in polygon A
            for (let i = 1; i < A.length; i++)
            {
                // project each vertex of polygon A to normal T and get min/max
                let r = T.Dot(A[i]);

                minA = Math.min(minA, r);
                maxA = Math.max(maxA, r);
            }

            // project the first vertex of polygon A to initialize min/max
            let minB = T.Dot(B[0]);
            let maxB = minB;

            // iterate through each vertex in polygon A
            for (let i = 1; i < B.length; i++)
            {
                // project each vertex of polygon A to normal T and get min/max
                let r = T.Dot(B[i]);

                minB = Math.min(minB, r);
                maxB = Math.max(maxB, r);
            }

            if ((maxA < minB) || (maxB < minA))
            {
                return false;
            }
            else
            {

            }
        }

        // loop through each edge of polygon B
        for(let v = 0; v < B.length; v++)
        {
            // get the edge vector
            let E = Vector.Subtract(B[v == B.length - 1? 0 : v + 1], B[v]);
            
            // get the "normal" of this edge and normalize it
            let T = new Vector(E.y, -E.x);
            T.Normalize();

            // project the first vertex of polygon A to initialize min/max
            let minA = T.Dot(A[0]);
            let maxA = minA;

            // iterate through each vertex in polygon A
            for (let i = 1; i < A.length; i++)
            {
                // project each vertex of polygon A to normal T and get min/max
                let r = T.Dot(A[i]);

                minA = Math.min(minA, r);
                maxA = Math.max(maxA, r);
            }

            // project the first vertex of polygon A to initialize min/max
            let minB = T.Dot(B[0]);
            let maxB = minB;

            // iterate through each vertex in polygon A
            for (let i = 1; i < B.length; i++)
            {
                // project each vertex of polygon A to normal T and get min/max
                let r = T.Dot(B[i]);

                minB = Math.min(minB, r);
                maxB = Math.max(maxB, r);
            }

            if ((maxA < minB) || (maxB < minA))
            {
                return false;
            }
        }        

        return true;
    }
}

export {Intersect2D};