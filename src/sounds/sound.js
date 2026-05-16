import correctFile
from "../assets/correct.mp3";

import wrongFile
from "../assets/wrong.mp3";

import warningFile
from "../assets/warning.mp3";

import winFile
from "../assets/win.mp3";

import loseFile
from "../assets/lose.mp3";

export const correctSound =
  new Audio(correctFile);

export const wrongSound =
  new Audio(wrongFile);

export const warningSound =
  new Audio(warningFile);

  export const winSound =
  new Audio(winFile);

export const loseSound =
  new Audio(loseFile);
  
correctSound.volume = 0.7;

wrongSound.volume = 0.7;

warningSound.volume = 0.5;

winSound.volume = 0.7;

loseSound.volume = 0.7;
