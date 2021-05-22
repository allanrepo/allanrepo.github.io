import {Point} from './Point.js';

class Vector
{    
    static Size = 3;
    constructor(x, y, z, w)
    {
        let s = Vector.Size;
        this.v = new Float32Array(s);
        if (s >= 1) this.v[0] = x || 0;
        if (s >= 2) this.v[1] = y || 0;
        if (s >= 3) this.v[2] = z || 0;
        if (s >= 4) this.v[3] = w || 0;
        for(let i = 4; i < this.v.length; i++)
        {
            this.v[i] = v.v[i];
        }
    }  
    
    Get(i)
    {
        if (this.v.length <= i)
        {
            throw "error getting property: " + i + " is not valid index";
        }
        return this.v[i] || 0;
    }

    Set(i, n)
    {
        if (this.v.length <= i)
        {
            throw "error setting property: " + i + " is not valid index";
        }
        this.v[i] = n;
    }        

    get x()
    {
        return this.Get(0);
    }

    set x(v)
    {
        this.Set(0, v);
    }

    get y()
    {
        return this.Get(1);
    }

    set y(v)
    {
        this.Set(1, v);
    }

    get z()
    {
        return this.Get(2);
    }

    set z(v)
    {
        this.Set(2, v);
    }

    get w()
    {
        return this.Get(3);
    }
    
    set w(v)
    {
        this.Set(3, v);
    }

    Copy(v)
    {
        for(let i = 0; i < this.v.length; i++)
        {
            this.v[i] = v.v[i];
        }
        return this;
    }

    Clone()
    {
        let v = new Vector();
        return v.Copy(this);
    }    

    Add(v)
    {
        for(let i = 0; i < this.v.length; i++)
        {
            this.v[i] += (v.v[i] || 0);
        }
        return this;
    }

    Subtract(v)
    {
        for(let i = 0; i < this.v.length; i++)
        {
            this.v[i] -= (v.v[i] || 0);
        }
        return this;
    }

    Multiply(f)
    {
        if(isFinite(f))
        {
            for(let i = 0; i < this.v.length; i++)
            {
                this.v[i] *= f;
            }
        }
        return this;
    }

    Magnitude()
    {
        return Math.sqrt(this.MagnitudeSquared());
    }

    MagnitudeSquared()
    {
        let v = 0;
        for(let i = 0; i < this.v.length; i++)
        {
            v += (this.v[i] * this.v[i]);
        }
        return v;
    }

    Distance(v)
    {
        return Math.sqrt(this.DistanceSquared(v));        
    }

    DistanceSquared(v)
    {
        let r = this.Clone();
        r.Subtract(v);

        return r.MagnitudeSquared();
    }

    Dot(v)
    {
        let r = 0;
        for(let i = 0; i < this.v.length; i++)
        {
            r += (this.v[i] * v.v[i]);
        }   
        return r;
    }

    Normalize()
    {
        let d = this.MagnitudeSquared();
        // @TODO: must compare to a very small value than 0
        if (d > 0)
        {
            d = Math.sqrt(d);
            for(let i = 0; i < this.v.length; i++)
            {
                this.v[i] /= d;
            }
        }        
        return this;
    }

    Cross(V)
    {
        return new Vector(
            this.y*V.z - V.y*this.z,
            this.z*V.x - V.z*this.x,
            this.x*V.y - V.x*this.y,
        );
    }

    IsZeroVector()
    {
        for(let i = 0; i < this.v.length; i++)
        {
            if (this.v[i] != 0)
            {
                return false;
            }
        }
        return true;
    }

    static Cross(U, V)
    {
        return new Vector(
           U.y*V.z - V.y*U.z,
           U.z*V.x - V.z*U.x,
           U.x*V.y - V.x*U.y,
        );
    }

    static Add(U, V)
    {
        let W = U.Clone();
        return W.Add(V);
    }    

    static Subtract(U, V)
    {
        let W = U.Clone();
        return W.Subtract(V);
    }

    static Multiply(U, f)
    {
        let W = U.Clone();
        return W.Multiply(f);
    }
}

export {Vector};