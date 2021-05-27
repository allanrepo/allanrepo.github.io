import {Force, ForceRegistry, Gravity, Drag} from './Force.js';

class Physics
{
    constructor(gravity)
    {
        this.gravity = new Gravity(gravity);
        this.drag = new Drag(0.01, 0.01);
        this.particles = [];
        this.forceRegistry = new ForceRegistry();
    }    

    Update(t)
    {
        // apply gravity force to particles
        this.forceRegistry.ApplyForces();

        // apply drag force to particles        

        let  deadParticles = [];
        for (let i= 0; i < this.particles.length; i++)
        {
            // update each particle
            this.particles[i].Integrate(t);

            // if particle is dead, remove it and unregister from force registry
            if (this.particles[i].age <= 0)
            {
                deadParticles.push(this.particles[i]);
                this.forceRegistry.Unregister(this.particles[i]);
            }            
        }

        // remove any dead particle
        while(deadParticles.length)
        {
            for (let i = 0; i < this.particles.length; i++)
            {
                if (deadParticles[0] == this.particles[i])
                {
                    this.particles.splice(i,1);
                    break;
                }
            }
            deadParticles.shift();
        }        
    }

    Add(particle, hasGravity, hasDrag)
    {
        this.particles.push(particle);

        // put gravity in this particle
        if (hasGravity) this.forceRegistry.Register(particle, this.gravity);

        // put drag in this particle
        if(hasDrag) this.forceRegistry.Register(particle, this.drag);
    }
}

export {Physics};