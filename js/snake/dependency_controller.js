"use strict";

/**
 * add description
 *
 * author: Branko Bavrljic
 */

var SnakeJs = (function (my) {
    var _private = my._private = my._private || {};
    _private.dependencies = _private.dependencies || {};

    var DEPENDENCY_AMOUNT = 4; //keep this number in check.


    if (!_private.dependencies.dependency_controler) {
        _private.dependencies.dependency_controler = true;

        var _seal = my._seal = my._seal || function () {
            delete my._private;
            delete my._seal;
            delete my._unseal;
        };
        //not really used, but left in codebase for convenience
        var _unseal = my._unseal = my._unseal || function () {
            my._private = _private;
            my._seal = _seal;
            my._unseal = _unseal;
        };
        // permanent access to _private, _seal, and _unseal, not so permanent out of the module


        _private.LOCK_UP = function () {
            var dep_len = Object.keys(_private.dependencies).length;
            if (dep_len === DEPENDENCY_AMOUNT) {
                _seal();
                my.loaded = true;
            } else {
                if (dep_len > DEPENDENCY_AMOUNT) {
                    throw 'Dependency management broke for SnakeJs';
                }
            }
        };

        (!!_private.LOCK_UP) ? _private.LOCK_UP() : null;

    }


    return my;

}(SnakeJs || {}));
