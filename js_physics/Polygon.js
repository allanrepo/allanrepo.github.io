import {Vector} from './Vector.js';

class Polygon
{
    constructor(vertices)
    {
        // @TODO: for now we assume vertices is an array of vector points with .x, .y, and .z property as its coordinates
        if (vertices.length < 3)
        {
            throw "invalid vertex size";
        }
        this.vertices = [];
        this.vertices = vertices;
    }

    // does not take into account if polygon is self-intersecting
    IsConvex()
    {

        let foundNegative = false;
        let foundPositive = false;
        for (let i = 0; i < this.vertices.length; i++)
        {
            // get 3 adjacent vertices
            let a = this.vertices[i];
            let b = this.vertices[(i + 1) % this.vertices.length];
            let c = this.vertices[(i + 2) % this.vertices.length];

            Vector.Cross();

            // if 1st pair, establish 

        }
    }

    get area()
    {
        throw "not implemented yet" ;
    }

    get perimeter()
    {
        throw "not implemented yet" ;
    }
}

export {Polygon};