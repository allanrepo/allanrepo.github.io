class Vector
{    
    // @TODO: assumes x, y are numeric values representing vector component. plan to accept array, or vector object to copy it
    constructor(x, y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }  
    
    // assumes v is an object with x, y property. 
    Copy(v)
    {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    Clone()
    {
        return new Vector().Copy(this);
    }    

    MagnitudeSquared()
    {
        return Vector.Dot(this, this);
    }

    Magnitude()
    {
        return Math.sqrt(this.MagnitudeSquared());
    }

    Zero()
    {
        this.x = 0;
        this.y = 0;
    }

    IsZeroVector()
    {
        // @TODO: probably consider very small value rathen than 0?
        return (this.x == 0) && (this.y == 0);
    }

    // if U and V is perpendicular, returns 0
    static Dot(U, V)
    {
        return U.x * V.x + U.y * V.y;
    }

    // cross product in 2D returns scalar which is the signed magnitude of the vector perpendicular to U and V
    // if U and V is parallel, returns 0
    static Cross(U, V)
    {
        return U.x * V.y - V.x * U.y;
    }

    Normalize()
    {
        let d = this.MagnitudeSquared();
        // @TODO: must compare to a very small value than 0
        if (d > 0)
        {
            d = Math.sqrt(d);
            this.x /= d;
            this.y /= d;
        }        
        return this;
    }

    static Add(U, V)
    {
        return new Vector(U.x + V.x, U.y + V.y)
    }    

    static Subtract(U, V)
    {
        return new Vector(U.x - V.x, U.y - V.y)
    }

    static Multiply(U, f)
    {
        return new Vector(U.x * f, U.y * f);
    }
}

export {Vector};