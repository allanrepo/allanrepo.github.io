import { ForceRegistry } from './Force.js';
import {Vector} from './Vector.js';

class Particle
{
    constructor()
    {
        this.position = new Vector();
        this.velocity = new Vector();
        this.acceleration = new Vector();
        this.inverseMass = 1;
//        this.damping = .9;
        this.Age = 0;
        this.forces = new Vector();
    }

    Integrate(t)
    {
        if(this.inverseMass == 0)
        {
            return;
        }

        // update position with current velocity
        this.position = Vector.Add(this.position, Vector.Multiply(this.velocity, t));

        // update velocity with current acceleration + accumulated acceleration from outside forces
        this.velocity = Vector.Add(this.velocity, Vector.Multiply(this.acceleration, t));


        // *note that particle has current acceleration. if in this time-step a set of outside force is applied to this 
        // particle, e.g. collision, gravity, drag, etc... we update our current velocity with the resulting acceleration 
        // from these forces here as well

        // calculate the acceleration based on the accumulated force applied to this particle, with respect to its mass
        let accelerationAccumulated = Vector.Multiply(this.forces, this.inverseMass);

        // update velocity accumulated acceleration from outside forces
        this.velocity = Vector.Add(this.velocity, Vector.Multiply(accelerationAccumulated, t));

        // apply drag to velocity
//        this.velocity = Vector.Multiply(this.velocity, Math.pow(this.damping, t));

        // clear outside forces after applying it
        this.forces.Zero();

        // age this particle
        this.age -= t;
    }

    AddForce(force)
    {
        this.forces = Vector.Add(this.forces, force);
    }
}

class ParticleEngine
{
    constructor()
    {
        this.particles = [];

        this.forceRegistry = new ForceRegistry();        
    }

}

export {Particle, ParticleEngine};