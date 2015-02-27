//"use strict";

var snakejs = function () {
    //Canvas stuff
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var gw = 45;
    var gh = 45;

    //Lets save the cell width in a variable for easy control
    var cw = w / gw;
    var ch = h / gh;
    var food;
    var score;
    var keycode;
    var game_on = false;
    var game_speed = 60;
    var game_loop;

    var menu = (function () {

    }());

    // all hail snake control object!
    var snake = (function () {
        var snake_array; //an array of cells to make up the snake
        var direction; // string, one of: left, right, up or down
        var is_alive;

        function init(length) {
            is_alive = true; //raise da snake from the grips of dooom
            direction = "right"; //also set default direction of movement
            length = length || 5; //default length of the snake

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
            if (check_border_collision(nx, ny) || check_collision(nx, ny, snake_array)) {
                is_alive = false;
                return;
            }

            //Lets write the code to make the snake eat the food
            //The logic is simple
            //If the new head position matches with that of the food,
            //Create a new head instead of moving the tail
            if (check_collision(nx, ny, [food])) {
                var tail = {x: nx, y: ny};
                score++;
                //Create new food
                create_food();
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
                paint_cell(c.x, c.y);
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

        //food
    }());

    var game = (function () {
        //playground
        //menu
        //snake
        //run
    });

    function init() {

        snake.init(5);
        create_food(); //Now we can see the food particle
        //finally lets display the score
        score = 0;

        //initial paint
        game_on = false;
        if (typeof game_loop != 'undefined') clearInterval(game_loop);
        paint();
    }

    init();


    //Lets create the food now
    function create_food() {
        food = {
            x: Math.round(Math.random() * gw - 1),
            y: Math.round(Math.random() * gh - 1)
        };
        //This will create a cell within playground boundaries
        //note: playground coords go from 0 x 0 to gw x gh
    }

    //Lets paint the snake now
    function paint() {
        //To avoid the snake trail we need to paint the BG on every frame
        draw_playground();

        //move snake
        snake.move();
        //if it survives,
        if (snake.isAlive()) {
            //game continues
            snake.paint()
        } else {
            //otherwise, game over
            init();
            return;
        }

        //Lets paint the food
        paint_cell(food.x, food.y);
        //Lets paint the score
        var score_text = 'Score: ' + score;
        var keycode_text = 'Keycode: ' + keycode;
        ctx.fillText(score_text, 5, h - 5);
        ctx.fillText(keycode_text, 5, h - 15);
    }

    function draw_playground() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, w, h);
    }

    //Lets first create a generic function to paint cells
    function paint_cell(x, y) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x * cw, y * ch, cw, ch);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x * cw, y * ch, cw, ch);
    }

    function check_collision(x, y, array) {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y)
                return true;
        }
        return false;
    }

    function check_border_collision(x, y) {
        return x === -1 || x === gw || y === -1 || y === gh;
    }

    //Lets add the keyboard controls now, via chaining!
    old_document_keydown = document.onkeydown;
    document.onkeydown = function (e) {
        snake_keyboard_controller(e);
        if (old_document_keydown) old_document_keydown(e);
    };

    //The snake is now keyboard controllable
    function snake_keyboard_controller(e) {
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

};

/*
 move intention
 > new head to be
 >> check hit
 >> check food
 >>> move
 * */