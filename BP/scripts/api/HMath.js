<<<<<<< HEAD
function lerp(start_value, end_value, t) {
    return start_value + (end_value - start_value) * t;
}

function getRandomInt(min = 0, max = 1) {
    return Math.floor(lerp(min, max, Math.random()));
}

=======
function lerp(start_value, end_value, t) {
    return start_value + (end_value - start_value) * t;
}

function getRandomInt(min = 0, max = 1) {
    return Math.floor(lerp(min, max, Math.random()));
}

>>>>>>> 97914f8 (Update: Spearsand lang)
export default { lerp, getRandomInt };