import {Geometry} from './Geometry.js';

class Intersect
{
    static TestPointTriangle(P, A, B, C)
    {
        let r = Geometry.GetBarycentricCoordsPointInTriangle(P, A, B, C);
        if(r.u < 0) return false;
        if(r.v < 0) return false;
        if(r.w < 0) return false;
        return true;
    }
}

export { Intersect };