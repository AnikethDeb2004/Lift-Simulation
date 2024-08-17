document.getElementById('startSimulation').addEventListener('click', startSimulation);

function startSimulation() {
  const floors = Math.min(parseInt(document.getElementById('floors').value), 10);
  const lifts = parseInt(document.getElementById('lifts').value);

  const floorsContainer = document.getElementById('floorsContainer');
  floorsContainer.innerHTML = '';

  for (let i = 0; i < floors; i++) {
    const floor = document.createElement('div');
    floor.classList.add('floor');
    floor.dataset.floorNumber = i;

    const buttons = document.createElement('div');
    buttons.classList.add('buttons');

    const buttonUp = document.createElement('div');
    buttonUp.classList.add('button-up');
    buttonUp.textContent = 'Up';
    if (i !== floors - 1) {
      buttonUp.addEventListener('click', () => callLift(i, 'up'));
      buttons.appendChild(buttonUp);
    }

    const buttonDown = document.createElement('div');
    buttonDown.classList.add('button-down');
    buttonDown.textContent = 'Down';
    if (i !== 0) {
      buttonDown.addEventListener('click', () => callLift(i, 'down'));
      buttons.appendChild(buttonDown);
    }

    const floorLine = document.createElement('div');
    floorLine.classList.add('floor-line');

    const floorLabel = document.createElement('div');
    floorLabel.classList.add('floor-label');
    floorLabel.textContent = `Floor ${i + 1}`;

    floor.appendChild(buttons);
    floor.appendChild(floorLine);

    for (let j = 0; j < lifts; j++) {
      if (i === 0) {
        const lift = document.createElement('div');
        lift.classList.add('lift');
        lift.dataset.liftId = j;
        lift.dataset.currentFloor = 0;
        floor.appendChild(lift);
      }
    }

    floor.appendChild(floorLabel);
    floorsContainer.appendChild(floor);
  }

  document.getElementById('config').classList.add('hidden');
  document.getElementById('simulation').classList.remove('hidden');
}

function callLift(targetFloor, direction) {
  const lifts = document.querySelectorAll('.lift');

  let nearestLift = null;
  let minDistance = Infinity;

  lifts.forEach(lift => {
    const currentFloor = parseInt(lift.dataset.currentFloor);
    const distance = Math.abs(currentFloor - targetFloor);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLift = lift;
    }
  });

  if (nearestLift) {
    moveLift(nearestLift, targetFloor);
  }
}

function moveLift(lift, targetFloor) {
  const currentFloor = parseInt(lift.dataset.currentFloor);
  const floorsContainer = document.getElementById('floorsContainer');
  const floorHeight = floorsContainer.firstElementChild.getBoundingClientRect().height;

  lift.style.transform = `translateY(-${targetFloor * floorHeight}px)`;
  lift.dataset.currentFloor = targetFloor;

  setTimeout(() => {
    openLiftDoors(lift);
  }, Math.abs(currentFloor - targetFloor) * 2000);
}

function openLiftDoors(lift) {
  lift.style.backgroundColor = 'green';

  setTimeout(() => {
    closeLiftDoors(lift);
  }, 2500);
}

function closeLiftDoors(lift) {
  lift.style.backgroundColor = '#007bff';
}
