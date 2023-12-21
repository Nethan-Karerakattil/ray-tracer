const canvas = document.querySelector("#c");
const ctx = canvas.getContext("2d");

/* Classes */
class ColorBuffer {
    constructor(width, height){
        this.buffer = ctx.createImageData(canvas.width, canvas.height);
        this.width = width;
        this.height = height;
    }

    write(pos, color){
        if(!color[3]) color[3] = 255;

        let location = (pos[0] * 4) + (pos[1] * canvas.width * 4);
        this.buffer.data[location + 0] = color[0];
        this.buffer.data[location + 1] = color[1];
        this.buffer.data[location + 2] = color[2];
        this.buffer.data[location + 3] = color[3];
    }

    read(pos) {
        let location = (pos[0] * 4) + (pos[1] * canvas.width * 4);
        
        return [
            buffer.data[location + 0],
            buffer.data[location + 1],
            buffer.data[location + 2],
            buffer.data[location + 3]
        ]
    }

    draw() {
        ctx.putImageData(this.buffer, 0, 0);
    }
}

class vec3 {
    constructor(v){
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
    }

    length_squared(){
        return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
    }

    length() {
        return Math.sqrt(this.length_squared());
    }
}

class Ray {
    constructor(origin, direction){
        this.origin = origin;
        this.direction = direction;
    }

    at(t){
        return vec_int_mult(vec_vec_add(this.origin, this.direction), t);
    }
}

const Color = vec3;
const Point3 = vec3;

/* Util */
function vec_int_add(v, t){
    let nv = new vec3([v.x, v.y, v.z]);
    let nt = structuredClone(t);

    return new vec3([
        nt + nv.x,
        nt + nv.y,
        nt + nv.z
    ])
}

function vec_int_sub(v, t){
    let nv = new vec3([v.x, v.y, v.z]);
    let nt = structuredClone(t);

    return new vec3([
        nt - nv.x,
        nt - nv.y,
        nt - nv.z
    ])
}

function vec_int_div(v, t){
    let nv = new vec3([v.x, v.y, v.z]);
    let nt = structuredClone(t);

    return vec_int_mult(v, 1/t)
}

function vec_int_mult(v, t){
    let nv = new vec3([v.x, v.y, v.z]);
    let nt = structuredClone(t);

    return new vec3([
        nt * nv.x,
        nt * nv.y,
        nt * nv.z
    ])
}


function vec_vec_add(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);

    return new vec3([
        nu.x + nv.x,
        nu.y + nv.y,
        nu.z + nv.z
    ])
}

function vec_vec_sub(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);
    
    return new vec3([
        nu.x - nv.x,
        nu.y - nv.y,
        nu.z - nv.z
    ])
}

function vec_vec_div(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);
    
    return new vec3([
        nu.x / nv.x,
        nu.y / nv.y,
        nu.z / nv.z
    ])
}

function vec_vec_mult(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);
    
    return new vec3([
        nu.x * nv.x,
        nu.y * nv.y,
        nu.z * nv.z
    ])
}

function vec_vec_dot(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);
    
    return nu.x * nv.x + nu.y * nv.y + nu.z * nv.z;
}

function vec_vec_cross(u, v){
    let nu = new vec3([u.x, u.y, u.z]);
    let nv = new vec3([v.x, v.y, v.z]);
    
    return new vec3([
        nu.y * nv.z - nu.z * nv.y,
        nu.z * nv.x - nu.x * nv.z,
        nu.x * nv.y - nu.y * nv.x
    ])
}

function unit_vector(v){
    let nv = new vec3([v.x, v.y, v.z]);

    return vec_int_div(nv, nv.length());
}

/* Variables */
let aspect_ratio = 16 / 9;
let image_width = 400;
let image_height = image_width / aspect_ratio;

let focal_length = 1;
let viewport_height = 2;
let viewport_width = viewport_height * (image_width / image_height);
let camera_center = new Point3([0, 0, 0]);

let viewport_u = new vec3([viewport_width, 0, 0]);
let viewport_v = new vec3([0, -viewport_height, 0]);

let pixel_delta_u = vec_int_div(viewport_u, image_width);
let pixel_delta_v = vec_int_div(viewport_v, image_height);

let viewport_upper_left = vec_vec_sub(
    vec_vec_sub(camera_center, new vec3([0, 0, focal_length])),
    vec_vec_sub(vec_int_div(viewport_u, 2), vec_int_div(viewport_v, 2))
);

let pixel00_loc = vec_vec_mult(
    vec_int_add(viewport_upper_left, 0.5),
    vec_vec_add(pixel_delta_u, pixel_delta_v)
);

/* Render */
canvas.width = image_width;
canvas.height = (image_height < 1) ? 1 : image_height;

const screen = new ColorBuffer(canvas.width, canvas.height);

function ray_color(r){
    let unit_direction = unit_vector(r.direction);
    let a = 0.5 * (unit_direction.y + 1);

    return vec_vec_add(
        vec_int_mult(new Color([0.8, 0.9, 1]), (1 - a)),
        vec_int_mult(new Color([0, 0.9, 1]), a)
    );
}

for(let y = 0; y < canvas.height; y++){
    for(let x = 0; x < canvas.width; x++){
        let pixel_center = vec_vec_add(
            pixel00_loc, vec_vec_add(
                vec_int_mult(pixel_delta_u, x),
                vec_int_mult(pixel_delta_v, y)
            )
        );

        let ray_direction = vec_vec_sub(pixel_center, camera_center);
        let r = new Ray(camera_center, ray_direction);

        let pixel_color = ray_color(r);

        screen.write([x, y], [
            pixel_color.x * 255.999,
            pixel_color.y * 255.999,
            pixel_color.z * 255.999
        ]);
    }
}

screen.draw();