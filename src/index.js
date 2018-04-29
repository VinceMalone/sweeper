import 'focus-visible';

import {createGame} from 'bombsweeper';
import classNames from 'classnames';
import {html, render} from 'lit-html/lib/lit-extended';
import {repeat} from 'lit-html/lib/repeat';

import {
  bomb as bombIcon,
  flag as flagIcon,
  restart as restartIcon,
} from './icons';
import styles from './index.css';

let bombFrequency = .15;
let columns = 20;
let rows = 20;

const getGame = () => createGame({
  determineBomb: () => Math.random() <= bombFrequency,
  size: [columns, rows],
});

let game = getGame();

console.log(game);

const actions = {
  mark: index => {
    game.mark(index);
    renderGame();
  },
  reveal: index => {
    game.reveal(index);
    renderGame();
  },
  restart: () => {
    game = getGame();
    renderGame();
  },
  changeBombFrequency: value => {
    const clamp = (min, max, n) => Math.min(Math.max(n, min), max);
    bombFrequency = clamp(0, 100, Number.isNaN(value) ? 0 : value) / 100;
    actions.restart();
  },
  changeColumns: count => {
    columns = Number.isNaN(count) ? 20 : count;
    actions.restart();
  },
  changeRows: count => {
    rows = Number.isNaN(count) ? 20 : count;
    actions.restart();
  },
};

window.addEventListener('keydown', evt => {
  if (evt.getModifierState('Alt') && evt.code === 'KeyR') {
    actions.restart();
    return;
  }

  const cell = evt.target.closest('[data-cell]');
  if (cell != null) {
    const index = parseInt(cell.dataset.cell);
    const lastIndex = rows * columns - 1;
    switch (evt.code) {
      case 'ArrowUp': {
        const nextIndex = index < columns ? lastIndex + 1 - columns + index : index - columns;
        const neighbor = document.querySelector(`[data-cell="${nextIndex}"]`);
        if (neighbor != null) {
          neighbor.focus();
        }
        break;
      }
      case 'ArrowDown': {
        const nextIndex = index > lastIndex - rows ? rows - (lastIndex - index + 1) : index + columns;
        const neighbor = document.querySelector(`[data-cell="${nextIndex}"]`);
        if (neighbor != null) {
          neighbor.focus();
        }
        break;
      }
      case 'ArrowLeft': {
        const nextIndex = index > 0 ? index - 1 : lastIndex;
        const neighbor = document.querySelector(`[data-cell="${nextIndex}"]`);
        if (neighbor != null) {
          neighbor.focus();
        }
        break;
      }
      case 'ArrowRight': {
        const nextIndex = index < lastIndex ? index + 1 : 0;
        const neighbor = document.querySelector(`[data-cell="${nextIndex}"]`);
        if (neighbor != null) {
          neighbor.focus();
        }
        break;
      }
    }
    return;
  }
});

const gridTemplate = ({cells, columnCount, rowCount, gameOver, gameWon}) => html`
  <main class$="${styles.container}">
    <header class$="${styles.toolbar}">
      <h1 class$="${styles.heading}">
        ${!gameOver ? 'Bombsweeper!' : gameWon ? 'You win' : 'You died'}
      </h1>
      <div class$="${styles['input-setting']}">
        <label for="frequency">Bomb frequency</label>
        <input
          type="number"
          id="frequency"
          min="0"
          max="100"
          on-change="${evt => actions.changeBombFrequency(evt.target.valueAsNumber)}"
          value="${bombFrequency * 100}"
        />
      </div>
      <div class$="${styles['input-setting']}">
        <label for="columns">Columns</label>
        <input
          type="number"
          id="columns"
          min="1"
          on-change="${evt => actions.changeColumns(evt.target.valueAsNumber)}"
          value="${columnCount}"
        />
      </div>
      <div class$="${styles['input-setting']}">
        <label for="rows">Rows</label>
        <input
          type="number"
          id="rows"
          min="1"
          on-change="${evt => actions.changeRows(evt.target.valueAsNumber)}"
          value="${rowCount}"
        />
      </div>
      <button
        aria-label="Restart"
        class$="${styles['toolbar-btn']}"
        on-click="${actions.restart}"
      >${restartIcon}</button>
    </header>
    <div class$="${styles.grid}" style="--column-count: ${columnCount}; --row-count: ${rowCount};">
      ${repeat(cells, ({index}) => index, ({bomb, index, marked, neighborBombCount, revealed}) => html`
        <button
          class$="${classNames(styles.cell, {
            [styles.revealed]: revealed,
            [styles['bad-mark']]: marked && !bomb && gameOver,
          })}"
          TODO-disabled="${gameOver}"
          on-click="${evt => evt.getModifierState('Alt') ? actions.mark(index) : actions.reveal(index)}"
          data-cell$="${index}"
        >
          ${marked ? flagIcon
            : !revealed ? null
            : bomb ? bombIcon
            : neighborBombCount > 0 ? neighborBombCount
            : null}
        </button>
      `)}
    </div>
  </main>
`;

function renderGame() {
  render(gridTemplate(game), document.body);
}

renderGame();
