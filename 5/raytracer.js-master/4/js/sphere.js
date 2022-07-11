function Sphere(cen, rad, material) {
    this.center = cen;
    this.radius = rad;
    this.material = material;
}

Sphere.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        const oc = ray.origin().subtract(this.center);
        const a = ray.direction().dot(ray.direction());
        const b = oc.dot(ray.direction());
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b*b - a*c;
        if (discriminant > 0) {
            let temp = (-b - Math.sqrt(discriminant)) / a;
            if (temp < tMax && temp > tMin) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                this.get_sphere_uv(hitRec);
                hitRec.material = this.material;
                return true;
            }
            temp = (-b + Math.sqrt(discriminant)) / a;
            if (temp < tMax && temp > tMin) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (hitRec.p.subtract(this.center).divide(this.radius));
                this.get_sphere_uv(hitRec);
                hitRec.material = this.material;
                return true;
            }
        }
        return false;
    }
    , get_sphere_uv: function(hitRec) {
        // p: a given point on the sphere of radius one, centered at the origin.
        // u: returned value [0,1] of angle around the Y axis from X=-1.
        // v: returned value [0,1] of angle from Y=-1 to Y=+1.
        //     <1 0 0> yields <0.50 0.50>       <-1  0  0> yields <0.00 0.50>
        //     <0 1 0> yields <0.50 1.00>       < 0 -1  0> yields <0.50 0.00>
        //     <0 0 1> yields <0.25 0.50>       < 0  0 -1> yields <0.75 0.50>
        
        let theta = Math.acos(-hitRec.p.y);
        let phi = Math.atan2(-hitRec.p.z, hitRec.p.x) + Math.PI;
        hitRec.u = phi / (2*Math.PI);
        hitRec.v = theta / Math.PI;
    }
};

function Disk(cen, rad, normal, material) {
    this.center = cen;
    this.radius = rad;
    this.normal = normal;
    this.material = material;
}

Disk.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        let temp = ((this.center.subtract(ray.origin())).dot(this.normal)) / (ray.direction().dot(this.normal));
        let p = ray.origin().subtract(this.center).add(ray.direction().multiply(temp));
        const discriminant = p.dot(p);
        if (discriminant <= (this.radius*this.radius) && this.normal.dot(ray.direction())<=0) {
            if (temp < tMax && temp > tMin) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (this.normal.unit());
                hitRec.material = this.material;
                return true;
            }
        }
        return false;
    }
};


function Cylinder(c1, c2, rad, material) {
    this.c1 = c1;
    this.c2 = c2;
    this.radius = rad;
    this.material = material;
}

Cylinder.prototype = {
    hit: function (ray, tMin, tMax, hitRec) {
        const co = ray.origin().subtract(this.c1);
        const l = this.c2.subtract(this.c1).unit();
        const kkll = ray.direction().subtract(l.multiply(ray.direction().dot(l)));
        const a = kkll.dot(kkll);
        const b = 2 * co.dot(kkll) - 2 * l.multiply(co.dot(l)).dot(kkll);
        const c = co.dot(co) + l.multiply(co.dot(l)).dot(l.multiply(co.dot(l))) - 2 * co.dot(l.multiply(co.dot(l))) - (this.radius * this.radius);
        const discriminant = b*b - 4*a*c;
        if (discriminant > 0) {
            let temp = (-b - Math.sqrt(discriminant)) / (2 * a);
            let m = co.dot(l) + ray.direction().multiply(temp).dot(l);
            let p = co.add(ray.direction().multiply(temp)).subtract(l.multiply(m));
            let c2c1 = (this.c2.subtract(this.c1)).length();

            if (temp < tMax && temp > tMin && m > 0 && m < c2c1) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (p.unit());
                hitRec.material = this.material;
                return true;
            }
            temp = (-b + Math.sqrt(discriminant)) / (2 * a);
            m = co.dot(l) + ray.direction().multiply(temp).dot(l);
            p = co.add(ray.direction().multiply(temp)).subtract(l.multiply(m));

            if (temp < tMax && temp > tMin && m > 0 && m < c2c1) {
                hitRec.t = temp;
                hitRec.p = ray.pointAtParameter(hitRec.t);
                hitRec.normal = (p.negative().unit());
                hitRec.material = this.material;
                return true;
            }
            return false;
        }
        return false;
    }
}