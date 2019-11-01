import "../css/style.css";
import "../css/calculator.css";

import CalculatorView from "./CalculatorView";
import CalculateUpdater from "./CalculatorUpdater";
import Store from "./Store";

document.querySelectorAll(".calc").forEach($calc => {
  const store = new Store(new CalculateUpdater());
  new CalculatorView($calc, store);
});
