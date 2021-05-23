import {Matrix} from './Matrix.js';

// @TODO: calculations are done using generic matrix class. try to replace with 3x3 matrix class for better performance
class Transform
{    
    // @TODO: assumes T is object with .x and .y components to translate U
    static Translate(U, v)
    {
        // is U array?
        let A = Array.isArray(U)? U : [U];

        // create translation matrix
        let t = new Matrix(3,3); 
        t.m[2][0] = v.x || 0;
        t.m[2][1] = v.y || 0;

        for (let i = 0; i < A.length; i++)
        {
            // transform it
            let vm = new Matrix(1, 3);
            vm.m[0][0] = A[i].x || 0;
            vm.m[0][1] = A[i].y || 0;
            vm.m[0][2] = 1;
        
            vm.Multiply(t);
            A[i].x = vm.m[0][0];
            A[i].y = vm.m[0][1];
        }

        // returns array if passed an array of objects. otherwise, return just the object
        U = Array.isArray(U)? A : A[0];
        return U;
    }

    static Rotate(U, r)
    {
        // is U array?
        let A = Array.isArray(U)? U : [U];

        // create rotation matrix
        let t = new Matrix(3,3);        
        t.m[0][0] = Math.cos(r);
        t.m[0][1] = Math.sin(r);
        t.m[1][0] = -Math.sin(r);
        t.m[1][1] = Math.cos(r);

        for (let i = 0; i < A.length; i++)
        {
            // transform it
            let vm = new Matrix(1, 3);
            vm.m[0][0] = A[i].x || 0;
            vm.m[0][1] = A[i].y || 0;
            vm.m[0][2] = 1;
        
            vm.Multiply(t);
            A[i].x = vm.m[0][0];
            A[i].y = vm.m[0][1];
        }

        // returns array if passed an array of objects. otherwise, return just the object
        U = Array.isArray(U)? A : A[0];
        return U;
    }

}

export {Transform};