import {Matrix} from './Matrix.js';

class Transform3D
{
    static CreateTranslationMatrix(v)
    {
        let t = new Matrix(4,4); 
        t.m[3][0] = v.x || 0;
        t.m[3][1] = v.y || 0;
        t.m[3][2] = v.z || 0;
        return t;
    }

    static CreateRotationMatrix(r)
    {
        let t = new Matrix(4,4);        
        t.m[0][0] = Math.cos(r);
        t.m[0][1] = Math.sin(r);
        t.m[1][0] = -Math.sin(r);
        t.m[1][1] = Math.cos(r);
        return t;        
    }

    static CreateRotationMatrixX(r)
    {
        let t = new Matrix(4,4);        
        return t;        
    }

    static CreateRotationMatrixY(r)
    {
        let t = new Matrix(4,4);        
        return t;        
    }

    static CreateRotationMatrixZ(r)
    {
        let t = new Matrix(4,4);        
        t.m[0][0] = Math.cos(r);
        t.m[0][1] = Math.sin(r);
        t.m[1][0] = -Math.sin(r);
        t.m[1][1] = Math.cos(r);
        return t;        
    }
    


    static Transform(m, v)
    {
        let vm = new Matrix(1, 4);
        vm.m[0][0] = v.x || 0;
        vm.m[0][1] = v.y || 0;
        vm.m[0][2] = v.z || 0;
        vm.m[0][3] = 1;
    
        vm.Multiply(m);
        v.x = vm.m[0][0];
        v.y = vm.m[0][1];
        v.z = vm.m[0][2];
        return v; 
    }   
    
    static Translate(t, v)
    {
        // create translate matrix
        // if V is array, translate all its indices and transform
        if(Array.isArray(v))
        {

        }
        else
        {

        }
    }

    static RotateZ(r, v)
    {
        // create translate matrix Z
        // if V is array, rotate all its indices and transform
    }

    static RotateY(r, v)
    {
        // create translate matrix Y
        // if V is array, rotate all its indices and transform
    }

    static RotateX(r, v)
    {
        // create translate matrix X
        // if V is array, rotate all its indices and transform
    }    
}

export {Transform3D};