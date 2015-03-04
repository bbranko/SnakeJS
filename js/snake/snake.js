"use strict";

/**
 * based on: http://thecodeplayer.com/walkthrough/html5-game-tutorial-make-a-snake-game-using-html5-canvas-jquery
 * upgraded by: Branko Bavrljic
 */

var SnakeJs = (function (my) {
    var _private = my._private = my._private || {};
    _private.dependencies = _private.dependencies || {};


    if (!_private.dependencies.snake) {
        _private.dependencies.snake = true;


        // all hail snake control object!
        _private.snake = (function () {
            var snake_array; //an array of cells to make up the snake
            var direction; // string, one of: left, right, up or down
            var is_alive;

            function init(length) {
                length = length || 5; //default length of the snake
                direction = "right"; //also set default direction of movement
                is_alive = true; //raise da snake from the grips of dooom

                snake_array = []; //Empty array to start with
                for (var i = length - 1; i >= 0; i--) {
                    //This will create a horizontal snake starting from the top left
                    snake_array.push({x: i, y: 0});
                }
            }

            //FIXME add is_alive checks before any action!
            //snake movement logic
            function move() {
                //Pop out the tail cell and place it infront of the head cell
                var nx = snake_array[0].x;
                var ny = snake_array[0].y;

                //These were the position of the head cell.
                //We will increment it to get the new head position
                //Lets add proper direction based movement now
                if (direction == "right") nx++;
                else if (direction == "left") nx--;
                else if (direction == "up") ny--;
                else if (direction == "down") ny++;

                //Lets add the game over clauses now
                //This will restart the game if the snake hits the wall
                //Lets add the code for body collision
                //Now if the head of the snake bumps into its body, the game will restart
                if (_private.game.check_collision_vs_border(nx, ny) || _private.game.check_collision_vs_array(nx, ny, snake_array)) {
                    is_alive = false;
                    return;
                }

                //Lets write the code to make the snake eat the food
                //The logic is simple
                //If the new head position matches with that of the food,
                //Create a new head instead of moving the tail
                if (_private.game.check_collision_vs_array(nx, ny, [_private.game.get_food_coords()])) {
                    var tail = {x: nx, y: ny};
                    _private.game.inc_score();
                    //Create new food
                    _private.game.create_food();
                }
                else {
                    var tail = snake_array.pop(); //pops out the last cell
                    tail.x = nx;
                    tail.y = ny;
                }
                //The snake can now eat the food.

                snake_array.unshift(tail); //puts back the tail as the first cell

            }

            function paint() {
                for (var i = 0; i < snake_array.length; i++) {
                    var c = snake_array[i];
                    _private.playground.paint_cell(c.x, c.y);
                }
            }

            function isAlive() {
                return !!is_alive;
            }

            function setDirection(d) {
                //suicide prevention
                if ((direction === 'left' && d != 'right')
                    || (direction === 'up' && d != 'down')
                    || (direction === 'right' && d != 'left')
                    || (direction === 'down' && d != 'up'))

                    direction = d;
            }

            //expose snake api
            return {
                'init': init,
                'move': move,
                'paint': paint,
                'isAlive': isAlive,
                'setDirection': setDirection
            }
        }());


        (!!_private.LOCK_UP) ? _private.LOCK_UP() : null;
    }

    return my;

}(SnakeJs || {}));
