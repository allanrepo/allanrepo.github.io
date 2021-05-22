class Matrix
{
    static Row = 4;
    static Col = 4;

    constructor(m)
    {
        this.row = Matrix.Row;
        this.col = Matrix.Col;
        this.m = [];
        for(let i = 0; i < this.row; i++)
        {
            this.m[i] = new Float32Array(this.col);
        }
        if (Array.isArray(m))
        {
            let j = 0;
            for (let i = 0; i < this.m.length; i++)
            {
                for (let j = 0; j < this.m[i].length; j++)
                {
                    if (j < m.length)
                    {
                        m.m[i][j] = m[j];
                        j++;
                    }
                    else
                    {
                        return;
                    }
                }
            }
        }
        else
        {
            this.Identity();
        }
    }

    Set(r,c, n)
    {
        this.m[r][c] = n;
    }

    Get(r,c)
    {
        return this.m[r][c] || 0;
    }

    Clone()
    {
        let m = new Matrix(this.row, this.col);
        for (let i = 0; i < this.m.length; i++)
        {
            for (let j = 0; j < this.m[i].length; j++)
            {
                m.m[i][j] = this.m[i][j];
            }
        }
        return m;
    }

    Identity()
    {
        for (let i = 0; i < this.m.length; i++)
        {
            for (let j = 0; j < this.m[i].length; j++)
            {
                if (i == j)this.m[i][j] = 1;
                else this.m[i][j] = 0;
            }
        }
        return this;        
    }

    Random()
    {
        for (let i = 0; i < this.m.length; i++)
        {
            for (let j = 0; j < this.m[i].length; j++)
            {
                this.m[i][j] = Math.floor(Math.random() * 10);
            }
        }
        return this;        
    }

    Transpose()
    {
        let m = new Matrix(this.col, this.row);

        for (let i = 0; i < this.m.length; i++)
        {
            for (let j = 0; j < this.m[i].length; j++)
            {
                m.m[j][i] = this.m[i][j];
            }
        }
        this.m = m.m;
        return this;
    }

    Multiply(m)
    {
        if (this.col != m.row)
        {
            throw "both matrix does not meet requirement to multiply";
        }

        let n = new Matrix(this.row, m.col);      

        // row
        for (let i = 0; i < n.m.length; i++)
        {
            // col
            for (let j = 0; j < n.m[i].length; j++)
            {
                n.m[i][j] = 0;
                for (let k = 0; k < this.col; k++) 
                {
                    n.m[i][j] += (this.m[i][k] * m.m[k][j]);
                }
            }
        }        
        this.m = n.m;
        return this;
    }

    Inverse()
    {
        if (this.col != m.row)
        {
            throw "both matrix does not meet requirement to inverse";
        }        
        
    }

    static Multiply(m, n)
    {
        let r = m.Clone();
        r.Multiply(n);
    }
}


export { Matrix};