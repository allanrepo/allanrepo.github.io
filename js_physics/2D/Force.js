import {Particle} from './Particle.js';
import {Vector} from './Vector.js';
class Force
{
    constructor()
    {

    }
}

class ForceRegistry
{
    constructor()
    {
        this.particleForcePair = [];
    }

    get length()
    {
        return this.particleForcePair.length;
    }

    ApplyForces()
    {
        for(let i = 0; i < this.particleForcePair.length; i++)
        {
            this.particleForcePair[i].force.Add(this.particleForcePair[i].particle);
        }
    }

    Register(particle, force)
    {
        this.particleForcePair.push(
            {
                particle: particle,
                force: force
            }
        );
    }

    Unregister(particle, force)
    {
        // list particle/force pair in the registry list that matches 
        let removeThese = [];
        for(let i = 0; i < this.particleForcePair.length; i++)
        {
            let isForceFound = (force == undefined)? true : (this.particleForcePair[i].force == force);
            if (isForceFound && this.particleForcePair[i].particle == particle)
            {
                removeThese.push(this.particleForcePair[i]);
            }
        }

        // remove whatever we found
        while(removeThese.length)
        {
            for(let i = 0; i < this.particleForcePair.length; i++)
            {
                if (removeThese[0] == this.particleForcePair[i])
                {
                    this.particleForcePair.splice(i,1);
                    break;
                }                
            }
            removeThese.shift();
        }
    }
}

class Gravity extends Force
{
    constructor(gravity)
    {
        super();
        this.gravity = gravity; // acceleration
    }    
    
    Add(particle)
    {
        // if the particle has infinite mass, no point adding force to it.
        if (particle.inverseMass > 0)
        {
            // add F = ma 
            let force = Vector.Multiply(this.gravity, 1 / particle.inverseMass);
            particle.AddForce(force);
        }
    }
}

class Drag extends Force
{
    constructor(k1, k2)
    {
        super();
        this.k1 = k1;
        this.k2 = k2;
    }

    Add(particle)
    {
        let force = particle.velocity.Clone();
        let dU = force.Magnitude();
        dU = this.k1 * dU + this.k2 * dU * dU; 
        force.Normalize();
        force = Vector.Multiply(force, -dU);
        particle.AddForce(force);
    }
}

export {Force, ForceRegistry, Gravity, Drag};