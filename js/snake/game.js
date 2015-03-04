"use strict";

/**
 * upgraded by: Branko Bavrljic
 */

var SnakeJs = (function (my) {
    var _private = my._private = my._private || {};
    _private.dependencies = _private.dependencies || {};

    if (!_private.dependencies.game) {
        _private.dependencies.game = true;

        _private.game = (function () {
            var old_document_keydown = null;
            var game_canvas;
            var game_width;
            var game_height;

            var food = {x: 0, y: 0}; //init food object
            var score;
            var keycode;
            var game_on;
            var game_speed;
            var game_loop;

            //note: game width height represents number of playground pixels and not actual canvas px size
            //canvas size is defined beforehand and the game is rendered within it
            function create_new(canvas, gw, gh, gs) {
                if (!canvas || !canvas.getContext('2d')) {
                    end();
                    throw 'Canvas for the SnakeJS game can NOT be undefined!';
                }

                game_canvas = canvas;
                game_width = gw || 45;
                game_height = gh || 45;
                game_speed = gs || 60;

                //Lets add the keyboard controls
                document.body.removeEventListener('scroll', keyboard_controller, false)
                document.body.addEventListener('scroll', keyboard_controller, false);

                if (!old_document_keydown) {
                    old_document_keydown = document.onkeydown;
                    document.onkeydown = function (e) {
                        keyboard_controller(e);
                        if (old_document_keydown) old_document_keydown(e);
                    };
                }

                restart()
            }

            function restart() {
                game_on = false;
                _private.playground.init(game_canvas, game_width, game_height);
                _private.snake.init(5);
                create_food(); //Now we can see the food particle
                //finally lets display the score
                score = 0;

                //initial paint
                if (typeof game_loop != 'undefined') clearInterval(game_loop);
                paint();
            }

            function end() {
                document.body.removeEventListener('scroll', keyboard_controller, false);
                if (typeof game_loop != 'undefined') clearInterval(game_loop);
            }

            //Lets paint the snake now
            function paint() {
                //To avoid the snake trail we need to paint the BG on every frame
                _private.playground.paint();

                //move snake
                _private.snake.move();
                //if it survives,
                if (_private.snake.isAlive()) {
                    //game continues
                    _private.snake.paint()
                } else {
                    //otherwise, game over
                    restart();
                    return;
                }

                //Lets paint the food
                _private.playground.paint_cell(food.x, food.y);
                //Lets paint the score
                var score_text = 'Score: ' + score;
                var keycode_text = 'Keycode: ' + keycode;
                _private.playground.paint_text(score_text, 5, -5);
                _private.playground.paint_text(keycode_text, 5, -15);
            }

            //desired game keyboard controls
            function keyboard_controller(e) {
                var key = e.which;
                keycode = key;

                //space for pause
                if (key == '32') {
                    //Lets move the snake now using a timer which will trigger the paint function
                    //every 60ms
                    if (game_on) {
                        game_on = false;
                        clearInterval(game_loop);
                    }
                    else {
                        game_on = true;
                        game_loop = setInterval(paint, game_speed);
                    }
                }

                if (game_on) {
                    // suicide prevention is integrated into snake.setDirection
                    if (key == '37') _private.snake.setDirection('left');
                    else if (key == '38') _private.snake.setDirection('up');
                    else if (key == '39') _private.snake.setDirection('right');
                    else if (key == '40') _private.snake.setDirection('down');
                }
            }

            function create_food() {
                //reuse already initialized food object
                food.x = Math.round(Math.random() * game_width - 1);
                food.y = Math.round(Math.random() * game_height - 1);
                //This will reposition a cell within playground boundaries
                //note: playground coords go from 0 x 0 to game_width x game_height -1
            }

            function get_food_coords() {
                //deep copy so to protect food object \m/
                return {
                    x: food.x,
                    y: food.y
                }
            }

            function inc_score() {
                score += 1;
            }


            function check_collision_vs_array(x, y, array) {
                //This function will check if the provided x/y coordinates exist
                //in an array of cells or not
                for (var i = 0; i < array.length; i++) {
                    if (array[i].x == x && array[i].y == y)
                        return true;
                }
                return false;
            }

            function check_collision_vs_border(x, y) {
                return x === -1 || x === game_width || y === -1 || y === game_height;
            }

            return {
                'create_new': create_new,
                'restart': restart,
                'end': end,
                'check_collision_vs_array': check_collision_vs_array,
                'check_collision_vs_border': check_collision_vs_border,
                'get_food_coords': get_food_coords,
                'create_food': create_food,
                'inc_score': inc_score
            }

        }());


        //return game controls, this could be its own game module wrapper, but nah...
        my.create_new = _private.game.create_new;
        my.restart = _private.game.restart;
        my.end = _private.game.end;


        (!!_private.LOCK_UP) ? _private.LOCK_UP() : null;

    }

    return my;

}(SnakeJs || {}));
