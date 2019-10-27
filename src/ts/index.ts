import Calculator from "./calculator";
import "../css/style.css";
import "../css/calculator.css";

document.querySelectorAll(".calc").forEach($calc => {
  new Calculator($calc);
});
