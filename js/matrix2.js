class Matrix2
{
    constructor(m)
    {
        if (m)
        {
            this.Copy(m);
        }
        else
        {
            //  Default to identity
            this.Identity();
        }
    }

    Copy(m)
    {
        this.m00 = m.m00 || 0.0;
        this.m01 = m.m01 || 0.0;
        this.m10 = m.m10 || 0.0;
        this.m11 = m.m11 || 0.0;
        return this;
    }

    Clone()
    {
        return new Matrix2(this);
    }

    Identity()
    {
        this.m00 = 1.0;
        this.m01 = 0.0;
        this.m10 = 0.0;
        this.m11 = 1.0;
    }
}


export {Matrix2};