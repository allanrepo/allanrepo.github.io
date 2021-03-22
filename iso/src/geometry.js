var __EPSILON__ = 0.00001;

/*---------------------------------------------------------------------------------------------------------------------------------
vector class
---------------------------------------------------------------------------------------------------------------------------------*/	
function vector(x, y)
{
	// accessor to x, y
	this.x = function(v){ if (typeof v == 'number') x = v; return x; }
	this.y = function(v){ if (typeof v == 'number') y = v; return y; }
	
	// if no arguments passed. reset x,y to 0
	if (typeof x == 'undefined' && typeof y == 'undefined'){ x = 0; y = 0; }
	
	// if first argument is a vector object, copy it into this vector. ignores second argument
	if (x instanceof vector){ x = this.x(); y = this.y(); }
	
	// if first argument isn't vector, check if x, y arguments are numbers
	if (typeof x != 'number') x = 0;	
	if (typeof y != 'number') y = 0;	
	
	// mathematical functions
    this.magnitude = function(){ return Math.sqrt(x*x + y*y); }

    
    this.getDistanceFrom = function(V){ return this.sub(V).magnitude(); }
    this.getVectorFrom = function(V){ return this.sub(V); }    
    this.getPerpendicular = function(t){ return new Vector2(-this.y, this.x); }

    this.sub = function(V){ return new Vector2(this.x - V.x, this.y - V.y); }   
    this.add = function(V){ return new Vector2(this.x + V.x, this.y + V.y); }           
    this.dot = function(V){ return (this.x*V.x + this.y*V.y); }
    this.mul = function(a){ return new Vector2(this.x*a, this.y*a); }
    this.div = function(a){ return new Vector2(this.x/a, this.y/a); }               

    this.normalize = function()
    {
	m = this.magnitude();
	this.copy(this.div(m));
	return this;
    }
    
    this.set = function(V, y)
    {
	if (typeof y == 'undefined')
	{
	    this.x = V.x;
	    this.y = V.y;
	}
	else
	{
	    this.x = V;
	    this.y = y;	    
	}
	return this;
    }    
    
    this.translate = function(V, y)
    {
	if (typeof y == 'undefined')
	{
	    this.x += V.x;
	    this.y += V.y;
	}
	else
	{
	    this.x += V;
	    this.y += y;	    
	}
	return this;
    }
    
    this.rotate = function(r)
    {
	r = r*Math.PI/180;
	var x = this.x;
	var y = this.y;
	this.x = x*Math.cos(r) - y*Math.sin(r);
	this.y = y*Math.cos(r) + x*Math.sin(r);
	return this;
    }
    
    this.copy = function(V)
    {
	this.x = V.x;
	this.y = V.y;
	return this;
    }    
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// check for collision between 2 moving circles
// returns the t from circle's movement vector P(t) = P0 + t(P1-P0)
// note that t is same for both circle's movement because time is constant for both
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function collisionMovingCircles(P0, P1, p, Q0, Q1, q)
{
    var Vp = P1.sub(P0);
    var Vq = Q1.sub(Q0); 
    var A = P0.sub(Q0);
    var B = Vp.sub(Vq);
    
    // this algorithm only deals with circles that are not initially overlapping
    // or colliding, so if they are initially overlapping, let's exit
    var d2 = (p+q)*(p+q);
    var A2 = A.dot(A);
    if (A2-d2 < 0){ return 0xffff; }
    
    // if both circles are not initially overlapping and moving in parallel direction
    // then they will never collide
    var B2 = B.dot(B);
    if (B2 < __EPSILON__) return 0xffff;
    
    // if both circles are not initially overlapping and moving away from each other
    // then they will never collide
    var AB = A.dot(B);
    if (AB >= 0){ return 0xffff; }

    // if radical of quadratic equation is <0, no collision occured
    var rad = AB*AB - B2*(A2 - d2);
    if ( rad < 0) return 0xffff;
    
    var rslt = (-AB - Math.sqrt(rad)) / B2;
    if (rslt < 0 || rslt > 1) return 0xffff;
    else return rslt;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// returns a reflection of the vector P with respect to normal N
// used for calculating the new velocity of a moving ball after it collide with wall
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function getReflectVector(N, P)
{
    var np = N.dot(P);
    np *= -1;
    var nn = N.dot(N);
    np /= nn;
    
    var A = N;
    A = A.mul(np);
    N.copy(A);
    A = A.add(A);
    A = A.add(P);
    
    return A;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// calculates the new velocities of 2 moving balls after it collide with each other
// it is derived from conservation of momentum and coefficient of restitution
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function responseMovingCircles(Pv, Qv, Px, Qx, mp, mq, e, Pvo, Qvo)
{
    // we don't deal with objects w/o mass
    if ((mp + mq) <= __EPSILON__){ return; }
    
    // calculate normal N
    var N = Px.sub(Qx);
    N.normalize();
    
    // calculate tangent T
    var T = N.getPerpendicular();
    
    // calculate vn's
    var vpn = Pv.dot(N);
    var vqn = Qv.dot(N);
	
    // calculate vt's
    var vpt = Pv.dot(T);
    var vqt = Qv.dot(T);

    // calculate new vn's
    var vpnr = (e*mq*vqn - e*mq*vpn + mp*vpn + mq*vqn) / (mq + mp);
    var vqnr = vpnr + e*vpn - e*vqn;
    
    // calculate new vt's (tangential forces does not change so...)
		
    // calculate new V's            
    Pvo.copy(N.mul(vpnr).add(T.mul(vpt)));
    Qvo.copy(N.mul(vqnr).add(T.mul(vqt)));
}

//////////////////////////////////////////////////////////////////
// - check if line segment and circle intersects
// - returns true if intersection is found, false if not
// - 2 possible intersection may occur, the one near to S0 will be
// referenced
//////////////////////////////////////////////////////////////////
function intersectLineSegmentCircle(S0, S1, C, r, Out)
{   
    // translate line segment into circle's coordinate system
    var T = S1.sub(C);
    var T0 = S0.sub(C);
    
    // get line segment's vector
    T = T.sub(T0);
    
    // circle equation x*x + y*y = r*r where r =radius, x/y within its coordinate's origin
    // line segment equation O(t) = T0 + t(T) where t = 0~1 and O(t) is any pt within the segment
    // substituting O(t) to circle's equation to solve for t and we end up with a quadratic equation
    // at*t + bt + c = 0 and a, b and c are defined as below
    var a = T.dot(T);
    var b = 2 * T0.dot(T);
    var c = T0.dot(T0) - r*r;
    
    // solving for determinant, we can determine if there is intersection
    var d = b*b - 4*a*c;
    
    // if d<0 then there is no intersection
    if (d<0){ return false; }
    else
    {
        var sqrt_d = Math.sqrt(d);
        var tn = (-b - sqrt_d)/(2*a);
        var tp = (-b + sqrt_d)/(2*a);
        
        // the -sqrt(d) is the intersection pt closer to S0 so we consider checking it first
        if (tn>0 && tn<1)
        {	    
	    if (typeof Out != 'undefined')
	    {
		// S(t) = S0 + t(S1 - S0)
		Out.O.copy(S0.add(S1.mul(tn).sub(S0.mul(tn))));
		Out.t = tn;
	    }
            return true;
        }                
        if (tp>0 && tp<1)
        {
	    if (typeof Out != 'undefined')
	    {
		// S(t) = S0 + t(S1 - S0)
		Out.O.copy(S0.add(S1.mul(tp).sub(S0.mul(tp))));
		Out.t = tp;
	    }	    
            return true;
        }
        // no intersection 
        return false;
    }            
}

//////////////////////////////////////////////////////////////////
// - check if 2 line segments intersect
// - returns true if intersection is found, false if not
// - outputs reference to intersection point
// - outputs reference to s and t of S and T line segment
//////////////////////////////////////////////////////////////////
function intersectLineSegments2D(S0, S1, T0, T1, Out)
{
    // equations of 2 line segments where R(t) is where they intersect
    // R = S0 + s(S1-S0)
    // R = T0 + t(T1-T0)
    // solving for for s and t and we come up with 2 equations where
    // d is common denominator, rn is r's numerator and sn is s' numerator
    
    var sn = (S0.y - T0.y) * (T1.x - T0.x) - (S0.x - T0.x) * (T1.y - T0.y);
    var d = (S1.x - S0.x) * (T1.y - T0.y) - (S1.y - S0.y) * (T1.x - T0.x);
    var tn = (S0.y - T0.y) * (S1.x - S0.x) - (S0.x - T0.x) * (S1.y - S0.y);

    // if both are parallel
    if ( Math.abs(d) < __EPSILON__){ return false; }
    
    var s = sn/d;
    var t = tn/d;
    
    if (s < 0){ return false; }
    if (s > 1){ return false; }
    if (t < 0){ return false; }
    if (t > 1){ return false; }

    if (typeof Out != 'undefined')
    {
	Out.s = s;
	Out.t = t;
	Out.O.copy(S0.add( S1.sub(S0).mul(s)));
    }

    return true;
}

//////////////////////////////////////////////////////////////////
// - find the pt in line segment that is nearest to the given pt
// - returns reference to the nearest pt in line segment
//////////////////////////////////////////////////////////////////
function nearestPtLineSegmentPoint(V0, V1, p)
{
    // create vector to represent the line segment and save its magnitude for use later
    var V = new Vector2(V1.x - V0.x, V1.y - V0.y);           
    var Vmag = V.magnitude();
    
    // create vector to represent distance between point and one of the line segment's end
    var Q = new Vector2(p.x - V0.x, p.y - V0.y);

    // normalize V and calculate dot product with Q to get lengh of projection of point P to line segment
    V.normalize();
    var Vproj = V.dot(Q);
    
    // if projection is longer than line segment's magnitude then nearest point in segment is V1
    if (Vproj > Vmag){ return V1; }           
    
    // if projection is < 0 then nearest point in segment is V0
    if (Vproj < 0){ return V0; }
    
    // if projection is within V's length then nearest point is somewhere in between
    V = V.mul(Vproj);
    return V.add(V0);           
}        