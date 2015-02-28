"use strict";

/**
 * based on: http://thecodeplayer.com/walkthrough/html5-game-tutorial-make-a-snake-game-using-html5-canvas-jquery
 * upgraded by: Branko Bavrljic
 */

var snakejs = (function () {

    // all hail snake control object!
    var snake = (function () {
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
            if (game.check_collision_vs_border(nx, ny) || game.check_collision_vs_array(nx, ny, snake_array)) {
                is_alive = false;
                return;
            }

            //Lets write the code to make the snake eat the food
            //The logic is simple
            //If the new head position matches with that of the food,
            //Create a new head instead of moving the tail
            if (game.check_collision_vs_array(nx, ny, [game.get_food_coords()])) {
                var tail = {x: nx, y: ny};
                game.inc_score();
                //Create new food
                game.create_food();
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
                playground.paint_cell(c.x, c.y);
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

    var playground = (function () {
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

    var game = (function () {
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

            //Lets add the keyboard controls now, via chaining!
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
            playground.init(game_canvas, game_width, game_height);
            snake.init(5);
            create_food(); //Now we can see the food particle
            //finally lets display the score
            score = 0;

            //initial paint
            if (typeof game_loop != 'undefined') clearInterval(game_loop);
            paint();
        }

        function end() {
            //restore page's keydown
            if (!!old_document_keydown) {
                document.onkeydown = old_document_keydown;
            }

            if (typeof game_loop != 'undefined') clearInterval(game_loop);
        }

        //Lets paint the snake now
        function paint() {
            //To avoid the snake trail we need to paint the BG on every frame
            playground.paint();

            //move snake
            snake.move();
            //if it survives,
            if (snake.isAlive()) {
                //game continues
                snake.paint()
            } else {
                //otherwise, game over
                restart();
                return;
            }

            //Lets paint the food
            playground.paint_cell(food.x, food.y);
            //Lets paint the score
            var score_text = 'Score: ' + score;
            var keycode_text = 'Keycode: ' + keycode;
            playground.paint_text(score_text, 5, -5);
            playground.paint_text(keycode_text, 5, -15);
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
                if (key == '37') snake.setDirection('left');
                else if (key == '38') snake.setDirection('up');
                else if (key == '39') snake.setDirection('right');
                else if (key == '40') snake.setDirection('down');
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

    //return game control object, this could be its own module, but nah...
    return (function () {
        var newGame = game;
        return {
            'create_new': newGame.create_new,
            'restart': newGame.restart,
            'end': newGame.end
        }
    }());

}());
