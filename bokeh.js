
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
};

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var settings = {
    'basic': {
        'emission_rate': 4,
        'min_life': 5,
        'life_range': 1,
        'min_angle': 0,
        'angle_range': 360,
        'min_speed': 10,
        'speed_range': 15,
        'min_size': 30,
        'size_range': 100,
        'color': '151,242,201'
        //'color': '127,239,189'
    }
};

function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
    return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
}

var Particle = function(x, y, angle, speed, life, size) {

    /* the particle's position */
    this.pos = {
        x: x || 0,
        y: y || 0
    };

    /* set specified or default values */
    this.speed = speed || 5;
    this.life = life || 1;
    this.size = size || 2;
    this.lived = 0;

    /* the particle's velocity */
    var radians = angle * Math.PI / 180;

    this.vel = {
        x: Math.cos(radians) * speed,
        y: -Math.sin(radians) * speed
    };
};

var Emitter = function(x, y, settings) {

    /* the emitter's position */
    this.pos = {
        x: x,
        y: y
    };

    /* set specified values */
    this.settings = settings;

    /* How often the emitter needs to create a particle in milliseconds */
    this.emission_delay = 1000 / settings.emission_rate;

    this.last_update = 0;
    this.last_emission = 0;

    /* the emitter's particle objects */
    this.particles = [];
};

Emitter.prototype.update = function() {

    /* set the last_update variable to now if it's the first update */
    if (!this.last_update) {
        this.last_update = Date.now();
        return;
    }

    /* get the current time */
    var time = Date.now();

    /* work out the milliseconds since the last update */
    var dt = time - this.last_update;

    /* add them to the milliseconds since the last particle emission */
    this.last_emission += dt;

    /* set last_update to now */
    this.last_update = time;

    /* check if we need to emit a new particle */
    if (this.last_emission > this.emission_delay) {

        /* find out how many particles we need to emit */
        var i = Math.floor(this.last_emission / this.emission_delay);

        /* subtract the appropriate amount of milliseconds from last_emission */
        this.last_emission -= i * this.emission_delay;

        while (i--) {

            /* calculate the particle's properties based on the emitter's settings */
            this.particles.push(
                new Particle(
                    Math.floor(Math.random() * canvas.width) + 1,
                    Math.floor(Math.random() * canvas.height) + 1,
                    this.settings.min_angle + Math.random() * this.settings.angle_range,
                    this.settings.min_speed + Math.random() * this.settings.speed_range,
                    this.settings.min_life + Math.random() * this.settings.life_range,
                    this.settings.min_size + Math.random() * this.settings.size_range
                )
            );
        }
    }

    /* convert dt to seconds */
    dt /= 1000;

    /* loop through the existing particles */
    var i = this.particles.length;

    while (i--) {
        var particle = this.particles[i];

        /* skip if the particle is dead */
        if (particle.dead) {
            /* remove the particle from the array */
            this.particles.splice(i, 1);
            continue;   
        }

        /* add the seconds passed to the particle's life */
        particle.lived += dt;

        /* check if the particle should be dead */
        if (particle.lived >= particle.life) {
            particle.dead = true;
            continue;
        }

        /* calculate the particle's new position based on the seconds passed */
        particle.pos.x += particle.vel.x * dt;
        particle.pos.y += particle.vel.y * dt;

        /* draw the particle */

        if (particle.lived >= (particle.life-2)) {
            // If particle is within 2 seconds of death, fade out
            ctx.fillStyle = 'rgba(' + this.settings.color + ','+easeOutCubic(particle.lived, 0, particle.life-particle.lived, particle.life)/2+')';
        } else if (particle.lived <= 2) {
            // If particle is within 2 seconds of birth, fade in
            ctx.fillStyle = 'rgba(' + this.settings.color + ','+(easeOutCubic(particle.lived, 0, particle.lived, 2)/2)+')';
        } else {
            ctx.fillStyle = 'rgba(' + this.settings.color + ',1)';
        }

        var x = particle.pos.x;
        var y = particle.pos.y;

        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
};

var emitter = new Emitter(canvas.width/2, canvas.height/2, settings.basic);

function loop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighten";
    ctx.rect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = '#C9D33E';
    
    // createRadialGradient(x0, y0, r0, x1, y1, r1);
    var gradient = ctx.createRadialGradient(0,0,0,0,0,canvas.width);
    gradient.addColorStop(0,"rgb(127,239,189)");
    gradient.addColorStop(1,"rgb(127,239,189)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    emitter.update();

    requestAnimFrame(loop);
}

loop();