/*-----------------------------------------------------------------------------------
action items:

-----------------------------------------------------------------------------------*/


/////////////////////////////////////////////////////////////////////////////////////////////////
// sequencer class
/////////////////////////////////////////////////////////////////////////////////////////////////
function sequencer(m_interval, seq, scene, loop = true)
{
	// private members
	var m_frames = [];
	var m_index = 0; 
	var m_prev;
	var m_isFirst = true;
	var m_intID;
	var m_reverse = false;
	
	// set interval to valid value (>0) or 1000ms by default
	this.setInterval = function(t){ (typeof t !== 'undefined' && t && t > 0)? m_interval = t: m_interval = 1000; }					

	// queue frame index's at the end of sequencer list. if array is passed, add the array, otherwise add single
	this.queue = function(seq)
	{
		if (typeof seq === 'undefined' || !seq) return;
		if (seq.constructor !== Array){ m_frames.push(seq) }		
		else { for (i = 0; i < seq.length; i++) m_frames.push(seq[i]); }
	}
	
	// this is the class constructor part. it's self explanatory what it does...
	this.setInterval(m_interval);
	this.queue(seq);		
	
	// returns the value of the current index in sequencer
	this.get = function()
	{ 
		if (m_index > m_frames.length - 1) throw new Error("frame index is invalid.");
		else return m_frames[m_index]; 
	}	
	
	// reset value to either beginning or the end
	this.reset = function(end)
	{
		if(end) m_index = m_frames.length -1;
		else m_index = 0;
	}
	
	this.reverse = function(state){ m_reverse = state; }

	// returnts the number of frames in sequencer
	this.length = function(){ return m_frames.length; }
	
	// enables/disable loop. also returns loop status. 
	this.loop = function(t){ if (typeof t !== 'undefined'){ loop = t; } return loop; }
	
	// this is the private function that is called in loop to update sequencer
	// it is to be passed to a scene that has event loop manager capability
	var m_updateEvent = function(step)
	{		
		if (m_reverse)
		{
			m_index -= step;
			if (m_index < 0)
			{
				if (loop){ m_index = m_index % m_frames.length + m_frames.length; }
				else{ m_index = 0;  this.stop(); }
			}
		}
		else
		{
			m_index += step;
			if (m_index >= m_frames.length)
			{
				if (loop){ m_index = m_index % m_frames.length; }
				else
				{ 
					m_index = m_frames.length  - 1; 
					this.stop(); 
				}
			}
		}
	}.bind(this);
	
	// activates sequencer to run. if we'er bound to a scene, we let scene run loop for us. otherwise, we use setInterval
	this.start = function()
	{	
		// if we have scene object, use it to run our sequencer
		if (scene)
		{
			// if scene object has addEvent()
			if (scene.addEvent)
			{
				scene.addEvent(m_updateEvent, m_interval);
				return;
			}
		}
		
		// if we don't have access to scene object, we run sequencer ourselves using setInterval	
		// note we set interval to half our sequencer interval to ensure step accuracy
		m_intID = setInterval(function()
		{			
			// do nothing if there's no interval set
			if (m_interval <= 0) return;
			
			// snapshot time
			var now = new Date().getTime();

			// is this the first time this function is called?
			if (m_isFirst)
			{
				m_isFirst = false;
				m_prev = now;
				m_index = 0;
				return;
			}				
			
			// get delta time between now and previous interval timestamp			
			// if delta is > interval, calculate the step to update our sequencer 
			// now if resulting sequencer index is beyond sequencer length, 
			// we either loop back or move to end and stop depending on our loop state
			if (now - m_prev > m_interval)
			{
				var step = Math.floor((now - m_prev)/m_interval);
				m_index += step;			
				if (m_index >= m_frames.length)
				{
					if (loop){ m_index = m_index % m_frames.length; }
					else{ m_index = m_frames.length  - 1; }
				}			
				m_prev += (step * m_interval);
			}			
			
		}, m_interval/2);			
	}
	
	// stop the sequencer
	this.stop = function()
	{
		if(scene) scene.removeEvent(m_updateEvent);
		else clearInterval(m_intID);
	}
}