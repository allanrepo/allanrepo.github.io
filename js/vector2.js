class Vector2
{
    constructor(x, y)
    {
        if (typeof x === 'object')
        {
            this.x = x.x || 0;
            this.y = x.y || 0;
        }
        else
        {
            if (y === undefined)
            {
                y = x;
            }
            this.x = x || 0;
            this.y = y || 0;
        }
    }

    Copy(v)
    {
        this.x = v.x || 0;
        this.y = v.y || 0;
        return this;
    }

    Clone()
    {
        return new Vector2(this);
    }

    Add(x, y)
    {
        if(typeof x === 'object')
        {
            this.x += x.x || 0;
            this.y += x.y || 0;
        }
        else
        {
            this.x += x || 0;
            this.y += y || 0;
        }
        return this;
    }
    
    Subtract(x, y)
    {
        if(typeof x === 'object')
        {
            this.x -= x.x || 0;
            this.y -= x.y || 0;
        }
        else
        {
            this.x -= x || 0;
            this.y -= y || 0;
        }
        return this;
    }    

    Scale(f)
    {
        if(isFinite(f))
        {
            this.x *= f;
            this.y *= f;
        }
        return this;
    }

    MagnitudeSquared()
    {
        return this.x * this.x + this.y * this.y;
    }

    Magnitude()
    {
        return Math.sqrt(this.MagnitudeSquared());
    }

    DistanceSquared(x, y)
    {
        let dx = this.x;
        let dy = this.y;
        if(typeof x === 'object')
        {
            dx -= x.x || 0;
            dy -= x.y || 0;
        }
        else
        {
            dx -= x || 0;
            dy -= y || 0;
        }
        return dx * dx + dy * dy;
    }

    Distance(x, y)
    {
        return Math.sqrt(this.DistanceSquared(x, y));
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

    Dot(x, y)
    {
        let dx = this.x;
        let dy = this.y;
        if(typeof x === 'object')
        {
            dx *= x.x || 0;
            dy *= x.y || 0;
        }
        else
        {
            dx *= x || 0;
            dy *= y || 0;
        }
        return dx + dy;
    }

    static Subtract(a, b)
    {
        let r = a.Clone();
        r.Subtract(b);
        return r;
    }

    static Add(a, b)
    {
        let r = a.Clone();
        r.Add(b);
        return r;
    }
};



export {Vector2};