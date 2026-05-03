function lerp(start_value, end_value, t) {
    return start_value + (end_value - start_value) * t;
}

function getRandomInt(min = 0, max = 1) {
    return Math.floor(lerp(min, max, Math.random()));
}

export default { lerp, getRandomInt };