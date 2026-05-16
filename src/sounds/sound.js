import correctFile
from "../assets/correct.mp3";

import wrongFile
from "../assets/wrong.mp3";

import warningFile
from "../assets/warning.mp3";

export const correctSound =
  new Audio(correctFile);

export const wrongSound =
  new Audio(wrongFile);

export const warningSound =
  new Audio(warningFile);

correctSound.volume = 0.7;

wrongSound.volume = 0.7;

warningSound.volume = 0.5;