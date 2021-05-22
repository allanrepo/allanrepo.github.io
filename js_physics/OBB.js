import {Vector} from './Vector.js';
import {Matrix} from './Matrix.js';
import {Transform} from './Transform.js';

class OBB
{
    constructor(w, h, d)
    {
        Vector.Size = 3;
        this.C = new Vector();
        this.E = new Vector(w, h, d);
        this.T = [
            new Vector(1, 0, 0),
            new Vector(0, 1, 0),
            new Vector(0, 0, 1),
        ];
        Matrix.Row = 4;
        Matrix.Col = 4;
        this.MatrixTransform = new Matrix();
        this.MatrixTransformT = new Matrix();
    }

    get U()
    {
        return this.T[0];
    }
    get V()
    {
        return this.T[1];
    }
    get W()
    {
        return this.T[2];
    }

    Clone()
    {
        let r = new OBB();
        r.C = this.C.Clone();
        r.E = this.E.Clone();
        for(let i = 0; i < this.T.length; i++)
        {
            r.T.push(this.T[i].Clone());
        }
        r.MatrixTransform = this.MatrixTransform.Clone();
        r.MatrixTransformT = this.MatrixTransformT.Clone();
        return r;
    }

    Transform()
    {
        this.T = [
            new Vector(1, 0, 0),
            new Vector(0, 1, 0),
            new Vector(0, 0, 1),
        ];
        this.C = new Vector();  
        
        this.C = Transform.Transform(this.MatrixTransform, this.C);
        for(let i = 0; i < this.T.length; i++)
        {
            this.T[i] = Transform.Transform(this.MatrixTransformT, this.T[i]);
        }

        // this.V = [
        //     new Vector(-this.E.x, -this.E.y,  this.E.z), // top-left-front
        //     new Vector( this.E.x, -this.E.y,  this.E.z), // top-right-front 
        //     new Vector( this.E.x,  this.E.y,  this.E.z), // btm-right-front 
        //     new Vector(-this.E.x,  this.E.y,  this.E.z), // btm-left-front 
        //     new Vector(-this.E.x, -this.E.y, -this.E.z), // top-left-back
        //     new Vector( this.E.x, -this.E.y, -this.E.z), // top-right-back 
        //     new Vector( this.E.x,  this.E.y, -this.E.z), // btm-right-back 
        //     new Vector(-this.E.x,  this.E.y, -this.E.z), // btm-left-back 
        // ];      
        // for(let i = 0; i < this.V.length; i++)
        // {
        //     this.V[i] = Transform.Transform(this.MatrixTransform, this.V[i]);
        // }
        //this.MatrixTransform.Identity();
        //this.MatrixTransformT.Identity();
    }

    get topLeftFrontVertex()
    {

    }

    get topRightFrontVertex()
    {

    }

    get bottomLeftFrontVertex()
    {

    }

    get bottomRightFrontVertex()
    {

    }

    get topLeftBackVertex()
    {

    }

    get topRightBackVertex()
    {

    }

    get bottomLeftBackVertex()
    {

    }

    get bottomRightBackVertex()
    {

    }

    get allVertices()
    {

    }


    GetVertices()
    {
        let U = Vector.Multiply(this.T[0], this.E.x);
        let V = Vector.Multiply(this.T[1], this.E.y);
        let W = Vector.Multiply(this.T[2], this.E.z);        
        return [
            this.C.Clone().Subtract(U).Subtract(V).Add(W), // top-left-front
            this.C.Clone().Add(U).Subtract(V).Add(W),// top-right-front
            this.C.Clone().Add(U).Add(V).Add(W),// btm-right-front
            this.C.Clone().Subtract(U).Add(V).Add(W),// btm-left-front
            this.C.Clone().Subtract(U).Subtract(V).Subtract(W),// top-left-back
            this.C.Clone().Add(U).Subtract(V).Subtract(W),// top-right-back 
            this.C.Clone().Add(U).Add(V).Subtract(W),// btm-right-back
            this.C.Clone().Subtract(U).Add(V).Subtract(W),// btm-left-back
        ];
    }

    RotateZ(r)
    {
        let M = Transform.CreateRotationMatrixZ(r);
        this.MatrixTransform.Multiply(M);
        this.MatrixTransformT.Multiply(M);
    }

    RotateX(r)
    {
        let M = Transform.CreateRotationMatrixX(r);
        this.MatrixTransform.Multiply(M);
        this.MatrixTransformT.Multiply(M);
    }

    RotateY(r)
    {
        let M = Transform.CreateRotationMatrixY(r);
        this.MatrixTransform.Multiply(M);
        this.MatrixTransformT.Multiply(M);
    }

    Translate(v)
    {
        let M = Transform.CreateTranslationMatrix(v);
        this.MatrixTransform.Multiply(M);
    }
}

export { OBB };
