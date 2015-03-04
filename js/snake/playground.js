"use strict";

/**
 * upgraded by: Branko Bavrljic
 */

var SnakeJs = (function (my) {
    var _private = my._private = my._private || {};
    _private.dependencies = _private.dependencies || {};

    if (!_private.dependencies.playground) {
        _private.dependencies.playground = true;


        _private.playground = (function () {
            var ctx;
            var pg_width; //number of fields horizontally (or number of columns)
            var pg_height; //number of fields vertically (or number of rows)

            var w; //width
            var h; //height

            //Lets save the cell width in a variable for easy control
            var cw;
            var ch;

            function init(canvas, gw, gh) {
                ctx = canvas.getContext("2d");
                pg_width = gw;
                pg_height = gh;

                w = canvas.width;
                h = canvas.height;

                //Lets save the cell width in a variable for easy control
                cw = w / pg_width;
                ch = h / pg_height;
            }

            function paint() {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = 'black';
                ctx.strokeRect(0, 0, w, h);
            }

            //generic function to paint cells
            function paint_cell(x, y) {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * cw, y * ch, cw, ch);
                ctx.strokeStyle = 'white';
                ctx.strokeRect(x * cw, y * ch, cw, ch);
            }

            //fixme: add out of bounds draw prevention
            function paint_text(text, x, y) {
                if (!text) return;

                x = x || 1;
                y = y || 1;

                if (x < 0) x += w;
                if (y < 0) y += h;

                ctx.fillText(text, x, y);
            }

            return {
                'init': init,
                'paint': paint,
                'paint_cell': paint_cell,
                'paint_text': paint_text
            }
        }());


        (!!_private.LOCK_UP) ? _private.LOCK_UP() : null;
    }

    return my;

}(SnakeJs || {}));
