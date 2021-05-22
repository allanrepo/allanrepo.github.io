class Point
{
    static Size = 3;
    constructor(x, y, z, w)
    {
        let s = Point.Size;
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
        let v = new Point();
        return v.Copy(this);
    }    

}

export {Point};