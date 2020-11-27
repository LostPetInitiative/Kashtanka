const EarthSphereRadius = 6371.009 // km (for the WGS84 ellipsoid). See https://en.wikipedia.org/wiki/Great-circle_distance

export function geodistance(lat1_deg:number, lon1_deg:number, lat2_deg:number, lon2_deg:number) {
    const deg2rad = (degrees:number) => degrees / 180.0 * Math.PI

    const lambdaHalfDiff = deg2rad(lon1_deg - lon2_deg) * 0.5
    const phi_1 = deg2rad(lat1_deg)
    const phi_2 = deg2rad(lat2_deg)
    const phiHalfDiff = (phi_1 - phi_2) * 0.5
    const lambdaSin = Math.sin(lambdaHalfDiff)
    const phiSin = Math.sin(phiHalfDiff)
    const a = Math.max(0.0,Math.min(1.0, phiSin*phiSin + Math.cos(phi_1)*Math.cos(phi_2)*lambdaSin*lambdaSin))

    const centralAngle = 2.0 * Math.asin(Math.sqrt(a))
    return EarthSphereRadius * centralAngle
}

export function cosSimilarity(x:number[], y:number[]) {
    if(x.length !== y.length) {
        throw "vectors of different length";
    }
    const N = x.length;
    var pairwiseMulSum = 0;
    var xSqr = 0;
    var ySqr = 0;
    for(var i=0;i<N;i++) {
        pairwiseMulSum += x[i]*y[i]
        xSqr += x[i]*x[i]
        ySqr += y[i]*y[i]
    }

    return pairwiseMulSum/(Math.sqrt(xSqr)*Math.sqrt(ySqr))
}