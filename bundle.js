(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function createStore(update, initialState) {
        var subscribers = [];
        var state = __assign({}, initialState);
        return {
            getState: function () {
                return state;
            },
            dispatch: function (action) {
                state = update(state, action, initialState);
                subscribers.forEach(function (s) { return s(state); });
            },
            subscribe: function (listener) {
                subscribers.push(listener);
                listener(state);
                return function () {
                    subscribers = subscribers.filter(function (s) { return s === listener; });
                };
            }
        };
    }

    function math(op, a, b) {
        switch (op) {
            case "+":
                return a + b;
            case "-":
                return a - b;
            case "*":
                return a * b;
            case "/":
                return a / b;
            case "%":
                return a;
        }
    }
    var calculate = function (state, action, initialState) {
        var stack = state.stack, value = state.value;
        var operandLeft = stack[0], operator = stack[1], operandRight = stack[2];
        switch (action.type) {
            case "@calc/digit": {
                if (!operator) {
                    var v = parseFloat("" + (operandLeft || 0) + action.value);
                    return __assign(__assign({}, state), { display: "" + v, stack: [v, operator, operandRight] });
                }
                if (value !== null) {
                    var v = parseFloat("" + action.value);
                    return __assign(__assign({}, state), { value: null, display: "" + v, stack: [v, operator, operandRight] });
                }
                else {
                    var v = parseFloat("" + (operandRight || 0) + action.value);
                    return __assign(__assign({}, state), { value: null, display: "" + v, stack: [operandLeft, operator, v] });
                }
            }
            case "@calc/operator": {
                return __assign(__assign({}, state), { value: null, stack: [operandLeft, action.operator, null] });
            }
            case "@calc/action": {
                switch (action.action) {
                    case "clear": {
                        return initialState;
                    }
                    case "sign": {
                        if (operator === null) {
                            if (operandLeft && operandLeft !== 0) {
                                return __assign(__assign({}, state), { display: "" + -1 * operandLeft, stack: [-1 * operandLeft, null, null] });
                            }
                        }
                        if (operandRight && operandRight !== 0) {
                            return __assign(__assign({}, state), { display: "" + -1 * operandRight, stack: [operandLeft, operator, -1 * operandRight] });
                        }
                        return state;
                    }
                    case ".": {
                        return state;
                    }
                    case "=": {
                        if (!operator || !operandLeft || !operandRight) {
                            return state;
                        }
                        var v = math(operator, operandLeft, operandRight);
                        return __assign(__assign({}, state), { display: "" + v, value: v, stack: [v, operator, operandRight] });
                    }
                    default: {
                        return state;
                    }
                }
            }
        }
    };
    var store = createStore(calculate, {
        display: "0",
        stack: [null, null, null],
        value: null
    });
    var Calculator = /** @class */ (function () {
        function Calculator($root) {
            var _this = this;
            this.$root = $root;
            this.handleClick = function (event) {
                var target = event.target;
                if (!target) {
                    return;
                }
                switch (target.dataset.calType) {
                    case "number": {
                        _this.handlePressNumber(target);
                        break;
                    }
                    case "action": {
                        _this.handlePressAction(target);
                        break;
                    }
                    case "operator": {
                        _this.handlePressOperator(target);
                        break;
                    }
                }
            };
            this.update = function (state) {
                var display = state.display;
                _this.$display.innerHTML = display;
                console.log(state.stack, state.value);
                if (!state.stack[1]) {
                    _this.$buttonClear.innerHTML = "AC";
                }
                else {
                    _this.$buttonClear.innerHTML = "C";
                }
            };
            this.$root.querySelector('[data-cal-type="display"]');
            this.$root.addEventListener("click", this.handleClick);
            var $display = this.$root.querySelector('[data-cal-type="display"]');
            if (!$display) {
                throw new Error("no display found");
            }
            this.$display = $display;
            var $buttonClear = this.$root.querySelector('[data-cal-type="action"][data-value="clear"]');
            if (!$buttonClear) {
                throw new Error("no clear button found");
            }
            this.$buttonClear = $buttonClear;
            store.subscribe(this.update);
        }
        Calculator.prototype.handlePressAction = function (target) {
            var action = target.dataset.value;
            store.dispatch({
                type: "@calc/action",
                action: action
            });
        };
        Calculator.prototype.handlePressNumber = function (target) {
            var raw = target.dataset.value || "0";
            var value = parseInt(raw, 10);
            store.dispatch({
                type: "@calc/digit",
                value: value
            });
        };
        Calculator.prototype.handlePressOperator = function (target) {
            var operator = target.dataset.value;
            store.dispatch({
                type: "@calc/operator",
                operator: operator
            });
        };
        return Calculator;
    }());

    document.querySelectorAll(".calc").forEach(function ($calc) {
        new Calculator($calc);
    });

}());
