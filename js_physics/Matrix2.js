class Matrix2
{
    constructor(m)
    {
        this.n = []
        for (let i = 0; i < 3; i++)
        {            
            this.n[i] = new Float32Array(3);
        }

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
        for (let i = 0; i < this.n.length; i++)
        {
            for (let j = 0; j < this.n[i].length; j++)
            {
                this.n[i][j] = m.n[i][j] || 0;
            }
        }
        return this;
    }

    Clone()
    {
        return new Matrix2(this);
    }

    Identity()
    {
        for (let i = 0; i < this.n.length; i++)
        {
            for (let j = 0; j < this.n[i].length; j++)
            {
                if (i == j)this.n[i][j] = 1;
                else this.n[i][j] = 0;
            }
        }
        return this;
    }

    Add(m)
    {
        for (let i = 0; i < this.n.length; i++)
        {
            for (let j = 0; j < this.n[i].length; j++)
            {
                this.n[i][j] += m.n[i][j] || 0;
            }
        }        
        return this;
    }

    Multiply(m)
    {
        return this;
    }
}


export {Matrix2};