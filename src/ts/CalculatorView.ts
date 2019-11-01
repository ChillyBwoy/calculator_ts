import {Storage} from "./store";
import {
  State,
  Action,
  CalculatoreOperator,
  CalculatorAction,
  CalculatorInput
} from "./CalculatorUpdater";

class CalculatorView {
  private $display: Element;
  private $buttonClear: Element;

  constructor(private $root: Element, private store: Storage<State, Action>) {
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
    this.store.subscribe(this.update);
  }

  private handleClick = (event: Event) => {
    const target = <HTMLButtonElement>event.target;
    if (!target) {
      return;
    }

    switch (target.dataset.calType) {
      case "input": {
        this.handlePressInput(target);
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
    const action = target.dataset.value as CalculatorAction;
    this.store.dispatch({
      type: "@calculator/action",
      action
    });
  }

  private handlePressInput(target: HTMLButtonElement) {
    const value = <CalculatorInput>target.dataset.value;
    this.store.dispatch({
      type: "@calculator/input",
      value
    });
  }

  private handlePressOperator(target: HTMLButtonElement) {
    const operator = target.dataset.value as CalculatoreOperator;
    this.store.dispatch({
      type: "@calculator/operator",
      operator
    });
  }

  update = (state: State) => {
    const {display} = state;
    this.$display.innerHTML = display;

    if (!state.stack[1]) {
      this.$buttonClear.innerHTML = "AC";
    } else {
      this.$buttonClear.innerHTML = "C";
    }
  };
}

export default CalculatorView;
