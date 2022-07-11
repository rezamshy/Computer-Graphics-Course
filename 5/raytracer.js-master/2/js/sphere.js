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
