const currentDisplay = document.querySelector("#current-display");
const previousDisplay = document.querySelector("#previous-display");
const keys = document.querySelector(".calculator__keys");

let currentValue = "0";
let previousValue = null;
let selectedOperation = null;
let shouldStartNewValue = false;
let hasError = false;
let historyLine = "";

function updateDisplay() {
  currentDisplay.textContent = currentValue;
  currentDisplay.classList.toggle("display__current--message", hasError);

  if (selectedOperation && previousValue !== null) {
    previousDisplay.textContent = `${previousValue} ${selectedOperation}`;
  } else {
    previousDisplay.textContent = historyLine;
  }
}

function enterNumber(number) {
  if (hasError) {
    clearCalculator();
  }

  if (shouldStartNewValue) {
    currentValue = number === "." ? "0." : number;
    shouldStartNewValue = false;
  } else if (number === ".") {
    if (!currentValue.includes(".")) {
      currentValue += ".";
    }
  } else {
    currentValue = currentValue === "0" ? number : currentValue + number;
  }

  updateDisplay();
}

function chooseOperation(operation) {
  if (hasError) {
    return;
  }

  if (previousValue !== null && !shouldStartNewValue) {
    const result = calculate(
      Number(previousValue),
      Number(currentValue),
      selectedOperation
    );

    if (result === null) {
      return;
    }

    currentValue = result;
  }

  previousValue = currentValue;
  selectedOperation = operation;
  shouldStartNewValue = true;
  historyLine = "";
  updateDisplay();
}

function calculate(firstNumber, secondNumber, operation) {
  let result;

  switch (operation) {
    case "+":
      result = firstNumber + secondNumber;
      break;
    case "−":
      result = firstNumber - secondNumber;
      break;
    case "×":
      result = firstNumber * secondNumber;
      break;
    case "÷":
      if (secondNumber === 0) {
        showError("Cannot divide by zero");
        return null;
      }
      result = firstNumber / secondNumber;
      break;
    default:
      return null;
  }

  if (!Number.isFinite(result)) {
    showError("Result is too large");
    return null;
  }

  // Limit floating-point noise, such as showing 0.30000000000000004.
  return Number(result.toPrecision(12)).toString();
}

function showError(message) {
  currentValue = message;
  previousValue = null;
  selectedOperation = null;
  shouldStartNewValue = true;
  hasError = true;
  historyLine = "";
  updateDisplay();
}

function calculateResult() {
  if (selectedOperation === null || previousValue === null || hasError) {
    return;
  }

  const firstNumber = Number(previousValue);
  const secondNumber = Number(currentValue);
  const operation = selectedOperation;
  const result = calculate(firstNumber, secondNumber, operation);

  if (result === null) {
    return;
  }

  historyLine = `${previousValue} ${operation} ${currentValue} =`;
  currentValue = result;
  previousValue = null;
  selectedOperation = null;
  shouldStartNewValue = true;
  updateDisplay();
}

function deleteLastDigit() {
  if (hasError) {
    clearCalculator();
    return;
  }

  if (shouldStartNewValue) {
    currentValue = "0";
    shouldStartNewValue = false;
  } else if (
    currentValue.length === 1 ||
    (currentValue.length === 2 && currentValue.startsWith("-"))
  ) {
    currentValue = "0";
  } else {
    currentValue = currentValue.slice(0, -1);
  }

  updateDisplay();
}

function clearCalculator() {
  currentValue = "0";
  previousValue = null;
  selectedOperation = null;
  shouldStartNewValue = false;
  hasError = false;
  historyLine = "";
  updateDisplay();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
  } else if (button.dataset.operation) {
    chooseOperation(button.dataset.operation);
  } else if (button.dataset.action === "clear") {
    clearCalculator();
  } else if (button.dataset.action === "delete") {
    deleteLastDigit();
  } else if (button.dataset.action === "equals") {
    calculateResult();
  }
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) {
    enterNumber(event.key);
  } else if (event.key === "+") {
    chooseOperation("+");
  } else if (event.key === "-") {
    chooseOperation("−");
  } else if (event.key === "*") {
    chooseOperation("×");
  } else if (event.key === "/") {
    event.preventDefault();
    chooseOperation("÷");
  } else if (event.key === "Enter" || event.key === "=") {
    calculateResult();
  } else if (event.key === "Backspace") {
    deleteLastDigit();
  } else if (event.key === "Escape") {
    clearCalculator();
  }
});

updateDisplay();
