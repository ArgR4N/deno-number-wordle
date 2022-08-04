/** @jsx h */
import { h } from "preact";
import { useState, useEffect, useRef, useContext} from "preact/hooks";
import {tw} from '@twind'

//Ts =>
import { NumberSpace, Configuration, getPair, getPrime } from "../routes/index.tsx"
//Components =>
import NumberBox from "./NumberBox.tsx"

//Preact type=>
type StateUpdater<S> = (value: S | ((prevState: S) => S)) => void;

//Const´s =>
const NUMBERS = Array(10).fill('').map((_ , i) => String(i));

interface WordleProps{ 
  CONFIG: Configuration;
  previousGuesses: NumberSpace[][]
  setPreviousGuesses: StateUpdater<NumberSpace[][]>
  actualGuess:  any
  setActualGuess: StateUpdater<any>
}

//Types =>
type Handler = (key: { key: string} ) => void;

//Other Functions =>
const useEventListener = (eventName: string, handler: Handler) => {
  const savedHandler:{ current: Handler } = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: { key : string }) => savedHandler.current(event);
    globalThis.addEventListener(eventName, eventListener);
    return () => {
      globalThis.removeEventListener(eventName, eventListener);
    };
  }, [eventName, globalThis]);
};

//Main function =>  
export default function Wordle( { CONFIG, previousGuesses, setPreviousGuesses, actualGuess, setActualGuess, addChar, delChar, checkRow }:WordleProps ) {
  const { MAX_TRIES, NUMBER_LENGTH, NUMBER } = CONFIG

  //<= States 


  const handler: Handler = ({ key }) => {
    const KeyHandler = {
      'Enter': checkRow,
      'Backspace': delChar,
      'Number': addChar,
    }

    NUMBERS.includes(key) ? KeyHandler['Number'](key)
    : KeyHandler[key](key)

    //Letras especiales =>
      //Espacio -> Chequear que el numero este completo
      //Del -> Chequear qu1e no este vacio y eliminar el ultimo caracter
    //Caracter (Espacio Excluido) -> Chequear que sea numero, y agregarlo a la posicion indicada 

  }
  useEventListener('keydown', handler)

  return <div class={tw` h-full flex flex-col gap-4 p-10  items-center`} >
    {
      previousGuesses.map((guess: NumberSpace[]) => (
        <div class={tw`flex gap-5 `}>
            {
              guess.map((number: NumberSpace) => <NumberBox number={number}/> )
            }
        </div>
      ))
    }
  </div>

}
