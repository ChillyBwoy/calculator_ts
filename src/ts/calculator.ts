import {createStore, Update} from "./store";

type CalcKeyboardOperator = "+" | "-" | "*" | "/" | "%";

type CalcKeyboardAction = "=" | "." | "clear" | "sign";

type CalcAction =
  | {type: "@calc/digit"; value: number}
  | {type: "@calc/operator"; operator: CalcKeyboardOperator}
  | {type: "@calc/action"; action: CalcKeyboardAction};

interface CalcState {
  stack: [number | null, CalcKeyboardOperator | null, number | null];
  display: string;
  value: number | null;
}

function math(op: CalcKeyboardOperator, a: number, b: number): number {
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

const calculate: Update<CalcState, CalcAction> = (
  state,
  action,
  initialState
) => {
  const {stack, value} = state;
  const [operandLeft, operator, operandRight] = stack;

  switch (action.type) {
    case "@calc/digit": {
      if (!operator) {
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

    case "@calc/operator": {
      return {
        ...state,
        value: null,
        stack: [operandLeft, action.operator, null]
      };
    }

    case "@calc/action": {
      switch (action.action) {
        case "clear": {
          return initialState;
        }

        case "sign": {
          if (operator === null) {
            if (operandLeft && operandLeft !== 0) {
              return {
                ...state,
                display: `${-1 * operandLeft}`,
                stack: [-1 * operandLeft, null, null]
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

          const v = math(operator, operandLeft, operandRight);
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
};

const store = createStore<CalcState, CalcAction>(calculate, {
  display: "0",
  stack: [null, null, null],
  value: null
});

class Calculator {
  private $display: Element;
  private $buttonClear: Element;

  constructor(private $root: Element) {
    this.$root.querySelector('[data-cal-type="display"]')!;
    this.$root.addEventListener("click", this.handleClick);

    const $display = this.$root.querySelector('[data-cal-type="display"]');
    if (!$display) {
      throw new Error("no display found");
    }
    this.$display = $display;

    const $buttonClear = this.$root.querySelector(
      '[data-cal-type="action"][data-value="clear"]'
    );
    if (!$buttonClear) {
      throw new Error("no clear button found");
    }
    this.$buttonClear = $buttonClear;

    store.subscribe(this.update);
  }

  private handleClick = (event: Event) => {
    const target = <HTMLButtonElement>event.target;
    if (!target) {
      return;
    }

    switch (target.dataset.calType) {
      case "number": {
        this.handlePressNumber(target);
        break;
      }

      case "action": {
        this.handlePressAction(target);
        break;
      }

      case "operator": {
        this.handlePressOperator(target);
        break;
      }

      default:
        break;
    }
  };

  private handlePressAction(target: HTMLButtonElement) {
    const action = target.dataset.value as CalcKeyboardAction;
    store.dispatch({
      type: "@calc/action",
      action
    });
  }

  private handlePressNumber(target: HTMLButtonElement) {
    const raw = target.dataset.value || "0";
    const value = parseInt(raw, 10);

    store.dispatch({
      type: "@calc/digit",
      value
    });
  }

  private handlePressOperator(target: HTMLButtonElement) {
    const operator = target.dataset.value as CalcKeyboardOperator;
    store.dispatch({
      type: "@calc/operator",
      operator
    });
  }

  private update = (state: CalcState) => {
    const {display} = state;
    this.$display.innerHTML = display;

    console.log(state.stack, state.value);

    if (!state.stack[1]) {
      this.$buttonClear.innerHTML = "AC";
    } else {
      this.$buttonClear.innerHTML = "C";
    }
  };
}

export default Calculator;
