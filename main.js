let floorPlan = [];
let consecutiveFloorDiff = 0;
const liftCalls = [];
const runningLiftCalls = [];

function getButtonList(floorCount, floorNumber, liftNum) {
  const upButtonList = `<ul class="button-list"><button onclick="callToFloor(
    ${floorNumber},
    ${liftNum}
  )"><img src="assets/up.png" alt="up"/></button><button class="hidden">d</button></ul>`;

  const downButtonList = `<ul class="button-list"><button class="hidden">u</button><button onclick="callToFloor(
    ${floorNumber},
    ${liftNum}
  )"><img src="assets/down.jpg" alt="down"/></button></ul>`;

  const normalButtonList = `<ul class="button-list"><button onclick="callToFloor(
    ${floorNumber},
    ${liftNum}
  )"><img src="assets/up.png" alt="up"/></button><button onclick="callToFloor(
    ${floorNumber},
    ${liftNum}
  )"><img src="assets/down.jpg" alt="down"/></button></ul>`;

  let buttonList = "";
  switch (floorNumber) {
    case floorCount - 1:
      buttonList = downButtonList;
      break;
    case 0:
      buttonList = upButtonList;
      break;
    default:
      buttonList = normalButtonList;
      break;
  }
  return buttonList;
}

function getLift(liftNum, visibility) {
  return visibility
    ? `<div class="lift" id=lift${liftNum}></div>`
    : `<div class="lift hidden"></div>`;
}

function getCurrentFloor(liftNum) {
  let currentFloor = 0;
  for (let i = 0; i < floorPlan.length; ++i) {
    if (floorPlan[i][liftNum] === 1) {
      currentFloor = i;
    }
  }
  return currentFloor;
}

function initiateFloorPlan() {
  const floorCount = parseInt(document.getElementById("floors").value);
  const liftCount = parseInt(document.getElementById("lifts").value);

  if (isNaN(floorCount) || isNaN(liftCount) || floorCount < 2 || liftCount < 1) {
    alert("Please enter valid numbers for floors and lifts.");
    return;
  }

  floorPlan.push(Array(liftCount).fill(1)); // Initialize lifts on ground floor
  for (let i = 1; i < floorCount; i++) {
    floorPlan.push(Array(liftCount).fill(0));
  }

  // Save current floor plan for debugging
  window.sessionStorage.setItem("floorPlan", JSON.stringify(floorPlan));
}

function setFloorPlan(currentFloorNum, desiredFloorNum, liftNum) {
  floorPlan[currentFloorNum][liftNum] = 0;
  floorPlan[desiredFloorNum][liftNum] = 1;
  window.sessionStorage.setItem("floorPlan", JSON.stringify(floorPlan));
}

function generateLiftPackageArrTemplate(floorCount, floorNum, currentFloor) {
  let liftPackageArr = `<ul class="lift-array">`;
  for (let j = 0; j < currentFloor.length; ++j) {
    let liftPackage = `<ul class="lift-package">`;

    const buttonList = getButtonList(floorCount, floorNum, `${j}`);

    liftPackage += buttonList;
    liftPackage +=
      currentFloor[j] === 1 ? getLift(`${j}`, true) : getLift(`${j}`, false);
    liftPackage += `</ul>`;
    liftPackageArr += liftPackage;
  }
  liftPackageArr += `</ul>`;
  return liftPackageArr;
}

function liftOperation(
  liftElement,
  timeTakenByLift,
  animationDiff,
  currentFloorOfLift,
  desiredFloorNum,
  liftNum
) {
  if (runningLiftCalls.length === 0) {
    return new Promise((resolve) => {
      liftElement.style.setProperty("transition", `all ${timeTakenByLift}s`);

      liftElement.style.setProperty(
        "transform",
        `translate(0, ${animationDiff}px)`
      );

      setTimeout(() => {
        setFloorPlan(currentFloorOfLift, desiredFloorNum, liftNum);

        resolve(`lift${liftNum} moved to floor ${desiredFloorNum}`);
      }, timeTakenByLift * 1000 + 2000);
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        liftElement.style.setProperty("transition", `all ${timeTakenByLift}s`);
        liftElement.style.setProperty(
          "transform",
          `translate(0, ${animationDiff}px)`
        );
        setFloorPlan(currentFloorOfLift, desiredFloorNum, liftNum);

        resolve(`lift${liftNum} moved to floor ${desiredFloorNum}`);
      }, timeTakenByLift * 1000);
    });
  }
}

async function callToFloor(desiredFloorNum, liftNum) {
  const desiredFloorLineRect = document
    .getElementById(desiredFloorNum)
    .getBoundingClientRect();

  const currentFloorOfLift = getCurrentFloor(liftNum);

  const originalFloorOfLiftLineRect = document
    .getElementById(0)
    .getBoundingClientRect();

  const currentFloorOfLiftLineRect = document
    .getElementById(currentFloorOfLift)
    .getBoundingClientRect();

  const animationDiff =
    -1 * (originalFloorOfLiftLineRect.bottom - desiredFloorLineRect.bottom);

  const actualDiff =
    -1 * (currentFloorOfLiftLineRect.bottom - desiredFloorLineRect.bottom);

  const liftElement = document.getElementById(`lift${liftNum}`);

  const timeTakenByLift = Math.abs((2 * actualDiff) / consecutiveFloorDiff);

  liftCalls.push(
    liftOperation(
      liftElement,
      timeTakenByLift,
      animationDiff,
      currentFloorOfLift,
      desiredFloorNum,
      liftNum
    )
  );

  const currentLiftCall = liftCalls.shift();
  runningLiftCalls.push(currentLiftCall);
  const res = await currentLiftCall;
  runningLiftCalls.shift();
  console.log(res);
}

function generateUI() {
  let floors = "";
  for (let i = floorPlan.length - 1; i > -1; --i) {
    const floorNumTemplate = `<small class="floorNumber">${i}</small>`;

    const liftPackageArrTemplate = generateLiftPackageArrTemplate(
      floorPlan.length,
      i,
      floorPlan[i]
    );
    floors += `<div class="line" id=${i}>${floorNumTemplate}${liftPackageArrTemplate}</div>`;
  }
  document.getElementById("floorplan").innerHTML = floors;

  consecutiveFloorDiff = Math.abs(
    document.getElementById(0).getBoundingClientRect().bottom -
      document.getElementById(1).getBoundingClientRect().bottom
  );
}

function resetFloorPlan() {
  document.getElementById("floorplan").innerHTML = "";
}

function resetState() {
  floorPlan = [];
  window.sessionStorage.setItem("floorPlan", floorPlan);
}

function initializeSimulation() {
  resetFloorPlan();
  resetState();
  initiateFloorPlan();
  generateUI();
}
