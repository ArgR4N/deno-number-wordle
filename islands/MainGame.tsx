/** @jsx h */
import { h } from "preact";
import { useState, useEffect, useRef, useContext } from "preact/hooks";
import { tw } from "@twind";

import { getEven, getPrime } from "../routes/index.tsx";

//Ts =>
import { NumberSpace, Configuration } from "../routes/index.tsx";
type StateUpdater<S> = (value: S | ((prevState: S) => S)) => void;

//Components =>
import Wordle from "./Wordle.tsx";
import Keyboard from "./Keyboard.tsx";
import Hints from "./Hints.tsx";
//Interfaces =>
interface MainGameProps {
  CONFIG: Configuration;
}

type KeyHandler = (key: string) => void;

//Main function =>
export default function MainGame({ CONFIG }: MainGameProps) {
  const { MAX_TRIES, NUMBER_LENGTH } = CONFIG;

  const [numberState, setNumberState] = useState(0);

  useEffect(() => {
    const fetchDailyRandom = async () => {
      const response = await fetch(
        "https://daily-random.vercel.app/getGlobalNumber"
      );
      const data = await response.json();
      const globalNumber = String(data.globalRandom).slice(0, NUMBER_LENGTH);
      setNumberState(Number(globalNumber));
    };

    fetchDailyRandom();
  }, []);

  //const fullBoard = false //?

  //States =>
  const [alredyWinned, setAlredyWinned] = useState(false);
  const [fullBoard, setFullBoard] = useState(false);
  //Classes =>
  class ActualGuessPair {
    first: number;
    second: number;

    constructor(first: number, second: number) {
      (this.first = first), (this.second = second);
    }

    addFirst(setter: StateUpdater<ActualGuessPair>) {
      this.first < MAX_TRIES - 1 &&
        setter(new ActualGuessPair(this.first + 1, 0));
    }

    addSecond(setter: StateUpdater<ActualGuessPair>) {
      setter(
        new ActualGuessPair(
          this.first,
          NUMBER_LENGTH - 1 > this.second ? this.second + 1 : this.second
        )
      );
    }

    minusSecond(setter: StateUpdater<ActualGuessPair>) {
      setter(
        new ActualGuessPair(
          this.first,
          this.second > 0 ? this.second - 1 : this.second
        )
      );
    }
  }

  const [previousGuesses, setPreviousGuesses] = useState(
    Array(MAX_TRIES)
      .fill("")
      .map((_) =>
        Array(NUMBER_LENGTH)
          .fill("")
          .map((_) => new NumberSpace())
      )
  );

  const [actualGuess, setActualGuess] = useState(new ActualGuessPair(0, 0));

  const delChar: KeyHandler = () => {
    const newGuess = previousGuesses.slice();
    console.log(NUMBER_LENGTH, actualGuess.second);
    if (!previousGuesses[actualGuess.first][actualGuess.second].value) {
      newGuess[actualGuess.first][actualGuess.second - 1].value = "";
      actualGuess.minusSecond(setActualGuess);
    } else newGuess[actualGuess.first][actualGuess.second].value = "";
    setPreviousGuesses(newGuess);
  };
  const addChar: KeyHandler = (key) => {
    if (!previousGuesses[actualGuess.first][actualGuess.second].value) {
      const newGuess = previousGuesses.slice();

      //Working without the setter => ????
      newGuess[actualGuess.first][actualGuess.second].value = key;

      // ¡¡¿¿ => => => setPreviousGuesses(newGuess) <= <= <= ??!!

      setPreviousGuesses(newGuess);

      actualGuess.addSecond(setActualGuess);
    } else {
      //Error -> Full length!
    }
  };

  const restartGame = () => {
    setActualGuess(new ActualGuessPair(0, 0));
    console.log(previousGuesses);
    setPreviousGuesses(
      Array(MAX_TRIES)
        .fill("")
        .map((_) =>
          Array(NUMBER_LENGTH)
            .fill("")
            .map((_) => new NumberSpace())
        )
    );
    setAlredyWinned(false);
    setFullBoard(false);
  };

  const colorNumbers: (guess: NumberSpace[]) => void = (guess) => {
    const objective = String(numberState);
    const newGuess: NumberSpace[] = guess.map((num: NumberSpace, i: number) =>
      num.value == objective[i]
        ? num.ChangeColor("green")
        : objective.includes(num.value)
        ? num.ChangeColor("yellow")
        : num.ChangeColor("red")
    );
    const newGuesses = previousGuesses.slice();
    newGuesses[actualGuess.first] = newGuess;
    setPreviousGuesses(newGuesses);
  };
  const checkFeatures = (n: number): boolean => {
    let lastNumber = Number();
    previousGuesses[actualGuess.first]
      .map((e) => Number(e.value))
      .reverse()
      .forEach((e, i) => (lastNumber += e * Math.pow(10, i)));
    console.log(numberState);
    console.log(
      { pair: getEven(lastNumber), prime: getPrime(lastNumber) },
      getEven(lastNumber) == getEven(numberState),
      getPrime(lastNumber) == getPrime(numberState)
    );
    return (
      getEven(lastNumber) == getEven(numberState) ||
      getPrime(lastNumber) == getPrime(numberState)
    );
  };
  const checkWin: () => boolean = () => {
    if (
      String(previousGuesses[actualGuess.first].map((e) => e.value)) ==
      String(String(numberState).split(""))
    ) {
      //Handle win =>
      return true;
    }
    return false;
  };
  const checkLength: (n: number) => boolean = (n) => {
    let sum = 0;
    previousGuesses[actualGuess.first].forEach((el) => {
      if (el.value) sum++;
    });
    if (actualGuess.first == previousGuesses.length - 1) {
      setFullBoard(true);
    }
    if (checkWin()) {
      setAlredyWinned(true);
    }
    return sum === n;
  };

  const checkRow: KeyHandler = () => {
    if (alredyWinned || fullBoard) return restartGame();
    if (!checkFeatures(numberState) || !checkLength(NUMBER_LENGTH)) {
      return alert(
        "The number must meet one of the two characteristics and have 4 digits"
      );
    } else if (checkLength(NUMBER_LENGTH)) {
      if (checkFeatures(numberState)) console.log("a");
      colorNumbers(previousGuesses[actualGuess.first]);
      actualGuess.addFirst(setActualGuess);
    }
    checkWin() && setAlredyWinned(true);
  };
  return (
    <div class={tw`flex items-center justify-center flex-col `}>
      <Wordle
        CONFIG={CONFIG}
        previousGuesses={previousGuesses}
        setPreviousGuesses={setPreviousGuesses}
        actualGuess={actualGuess}
        setActualGuess={setActualGuess}
        ActualGuessPair={ActualGuessPair}
        addChar={addChar}
        delChar={delChar}
        checkRow={checkRow}
      />
      <span
        class={tw`bg-gray-100 items-center justify-center rounded flex p-2`}
      >
        <Keyboard
          guesses={previousGuesses}
          ActualGuessPair={ActualGuessPair}
          setActualGuess={setActualGuess}
          addChar={addChar}
          delChar={delChar}
          checkRow={checkRow}
        />
        <hr class={tw`border-l-1  border-gray-700 h-12`} />
        <Hints guesses={previousGuesses} CONFIG={CONFIG} />
      </span>
    </div>
  );
}
