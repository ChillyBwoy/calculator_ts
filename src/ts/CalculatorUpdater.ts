import {Updater} from "./store";

export type CalculatoreOperator = "+" | "-" | "*" | "/" | "%" | "noop";

export type CalculatorAction = "=" | "." | "clear" | "sign";

export type CalculatorInput =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | ".";

export type Action =
  | {type: "@calculator/input"; value: CalculatorInput}
  | {type: "@calculator/operator"; operator: CalculatoreOperator}
  | {type: "@calculator/action"; action: CalculatorAction};

export interface State {
  stack: [number | null, CalculatoreOperator, number | null];
  display: string;
  value: number | null;
}

class CalculateUpdater implements Updater<State, Action> {
  private math(op: CalculatoreOperator, a: number, b: number): number {
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
  }

  init(): State {
    return {
      display: "0",
      stack: [null, "noop", null],
      value: null
    };
  }

  update(state: State, action: Action): State {
    const {stack, value} = state;
    const [operandLeft, operator, operandRight] = stack;

    switch (action.type) {
      case "@calculator/input": {
        if (operator === "noop") {
          const v = parseFloat(`${operandLeft || 0}${action.value}`);
          return {
            ...state,
            display: `${v}`,
            stack: [v, operator, operandRight]
          };
        }

        if (value !== null) {
          const v = parseFloat(`${action.value}`);
          return {
            ...state,
            value: null,
            display: `${v}`,
            stack: [v, operator, operandRight]
          };
        } else {
          const v = parseFloat(`${operandRight || 0}${action.value}`);
          return {
            ...state,
            value: null,
            display: `${v}`,
            stack: [operandLeft, operator, v]
          };
        }
      }

      case "@calculator/operator": {
        return {
          ...state,
          value: null,
          stack: [operandLeft, action.operator, null]
        };
      }

      case "@calculator/action": {
        switch (action.action) {
          case "clear": {
            return this.init();
          }

          case "sign": {
            if (operator === null) {
              if (operandLeft && operandLeft !== 0) {
                return {
                  ...state,
                  display: `${-1 * operandLeft}`,
                  stack: [-1 * operandLeft, "noop", null]
                };
              }
            }

            if (operandRight && operandRight !== 0) {
              return {
                ...state,
                display: `${-1 * operandRight}`,
                stack: [operandLeft, operator, -1 * operandRight]
              };
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

            const v = this.math(operator, operandLeft, operandRight);
            return {
              ...state,
              display: `${v}`,
              value: v,
              stack: [v, operator, operandRight]
            };
          }

          default: {
            return state;
          }
        }
      }
    }
  }
}

export default CalculateUpdater;
