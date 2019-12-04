(function () {
  'use strict';

  var CalculatorView = (function () {
      function CalculatorView($root, store) {
          var _this = this;
          this.$root = $root;
          this.store = store;
          this.handleClick = function (event) {
              var target = event.target;
              if (!target) {
                  return;
              }
              switch (target.dataset.calType) {
                  case "input": {
                      _this.handlePressInput(target);
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
          this.store.subscribe(this.update);
      }
      CalculatorView.prototype.handlePressAction = function (target) {
          var action = target.dataset.value;
          this.store.dispatch({
              type: "@calculator/action",
              action: action
          });
      };
      CalculatorView.prototype.handlePressInput = function (target) {
          var value = target.dataset.value;
          this.store.dispatch({
              type: "@calculator/input",
              value: value
          });
      };
      CalculatorView.prototype.handlePressOperator = function (target) {
          var operator = target.dataset.value;
          this.store.dispatch({
              type: "@calculator/operator",
              operator: operator
          });
      };
      return CalculatorView;
  }());

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

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  var CalculateUpdater = (function () {
      function CalculateUpdater() {
      }
      CalculateUpdater.prototype.math = function (op, a, b) {
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
                  throw new Error("Not implemented");
              case "noop":
                  throw new Error("No operation provided");
          }
      };
      CalculateUpdater.prototype.init = function () {
          return {
              display: "0",
              stack: [null, "noop", null],
              value: null
          };
      };
      CalculateUpdater.prototype.update = function (state, action) {
          var stack = state.stack, value = state.value;
          var _a = __read(stack, 3), operandLeft = _a[0], operator = _a[1], operandRight = _a[2];
          switch (action.type) {
              case "@calculator/input": {
                  if (operator === "noop") {
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
              case "@calculator/operator": {
                  if (operandLeft === null) {
                      return state;
                  }
                  return __assign(__assign({}, state), { value: null, stack: [operandLeft, action.operator, null] });
              }
              case "@calculator/action": {
                  switch (action.action) {
                      case "clear": {
                          return this.init();
                      }
                      case "sign": {
                          if (operator === null) {
                              if (operandLeft && operandLeft !== 0) {
                                  return __assign(__assign({}, state), { display: "" + -1 * operandLeft, stack: [-1 * operandLeft, "noop", null] });
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
                          var v = this.math(operator, operandLeft, operandRight);
                          return __assign(__assign({}, state), { display: "" + v, value: v, stack: [v, operator, operandRight] });
                      }
                      default: {
                          return state;
                      }
                  }
              }
          }
      };
      return CalculateUpdater;
  }());

  var Store = (function () {
      function Store(updater) {
          this.updater = updater;
          this.subscribers = [];
          this.state = updater.init();
      }
      Store.prototype.subscribe = function (listener) {
          var _this = this;
          this.subscribers.push(listener);
          listener(this.state);
          return function () {
              _this.subscribers = _this.subscribers.filter(function (s) { return s === listener; });
          };
      };
      Store.prototype.notify = function () {
          var _this = this;
          console.log(JSON.stringify(this.state, null, 2));
          this.subscribers.forEach(function (s) { return s(_this.state); });
      };
      Store.prototype.dispatch = function (action) {
          console.log(action);
          this.state = this.updater.update(this.state, action);
          this.notify();
      };
      Store.prototype.getState = function () {
          return this.state;
      };
      return Store;
  }());

  document.querySelectorAll(".calc").forEach(function ($calc) {
      var store = new Store(new CalculateUpdater());
      new CalculatorView($calc, store);
  });

}());
//# sourceMappingURL=bundle.js.map
