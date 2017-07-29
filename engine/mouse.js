/**
 * Mouse Handler
 *
 * Handles mouse presses and locations
 */

var Mouse = window.Mouse || {};
(function() {
    
    window.addEventListener('load', function() {
        document.addEventListener('mousemove', function(e) {
            Mouse.position = new Position(e.clientX, e.clientY);
        });
        document.addEventListener('mousedown', function(e) {
            Mouse.pressed = true;
        });
        document.addEventListener('mouseup', function(e) {
            Mouse.pressed = false;
        });
    });
    
    Mouse.position = new Position(0, 0);
    Mouse.pressed = false;
}());