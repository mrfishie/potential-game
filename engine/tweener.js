/**
 * Provides the ability to tween from one value to another over time
 */

var Tweener = window.Tweener || {};

(function() {
    Tweener.to = function(initial, final, duration, callback, finish) {
        duration = new Time(duration);
        
        var currentVal = initial, change = final - initial;
        Loops.addCallback("update", function(delta) {
            var p = 1 / (duration.valueOf() * delta);
            currentVal += change * p;
            if (change < 0) currentVal = Math.max(currentVal, final);
            else currentVal = Math.min(currentVal, final);
            
            callback(currentVal);
            
            if (currentVal === final) {
                if (finish) finish();
                return false;
            }
            return true;
        });
    }
}());