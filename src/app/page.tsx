"use client";

import { useState, useReducer, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, RotateCw, CheckCircle, SkipForward, ArrowLeft, Trophy, RefreshCw, Clock, Minus, Users } from "lucide-react";

// Types
type Team = "A" | "B";

interface WordItem {
  text: string;
  done: boolean;
  foundByTeam?: Team;
}

interface GameState {
  words: WordItem[];
  currentWord: string | null;
  currentTeam: Team;
  isPlaying: boolean;
  isSpinning: boolean;
  timeLeft: number;
  timerDuration: number;
  timerActive: boolean;
}

type GameAction =
  | { type: "ADD_WORD"; word: string }
  | { type: "REMOVE_WORD"; word: string }
  | { type: "LOAD_WORDS"; words: WordItem[] }
  | { type: "START_GAME" }
  | { type: "SPIN_WHEEL" }
  | { type: "SELECT_WORD"; word: string }
  | { type: "WORD_FOUND" }
  | { type: "SKIP_WORD" }
  | { type: "TICK" }
  | { type: "TIME_UP" }
  | { type: "RESET_STATUS" }
  | { type: "RESET_SCORES" }
  | { type: "BACK_TO_SETUP" }
  | { type: "SET_TIMER_DURATION"; duration: number }
  | { type: "LOAD_TIMER_DURATION"; duration: number };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_WORD":
      return { ...state, words: [...state.words, { text: action.word, done: false }] };

    case "LOAD_WORDS":
      return { ...state, words: action.words };

    case "REMOVE_WORD":
      return { ...state, words: state.words.filter(w => w.text !== action.word) };

    case "START_GAME":
      return { ...state, isPlaying: true, currentTeam: "A" };

    case "SPIN_WHEEL":
      return { ...state, isSpinning: true, timerActive: false, timeLeft: state.timerDuration };

    case "SELECT_WORD":
      return { ...state, currentWord: action.word, isSpinning: false, timerActive: true, timeLeft: state.timerDuration };

    case "WORD_FOUND":
      return {
        ...state,
        words: state.words.map(w =>
          w.text === state.currentWord ? { ...w, done: true, foundByTeam: state.currentTeam } : w
        ),
        currentWord: null,
        timerActive: false,
        timeLeft: state.timerDuration,
        currentTeam: state.currentTeam === "A" ? "B" : "A",
      };

    case "SKIP_WORD":
      return {
        ...state,
        currentWord: null,
        timerActive: false,
        timeLeft: state.timerDuration,
        currentTeam: state.currentTeam === "A" ? "B" : "A",
      };

    case "TICK":
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) };

    case "TIME_UP":
      return { ...state, timerActive: false };

    case "RESET_STATUS":
      return {
        ...state,
        words: state.words.map(w => ({ ...w, done: false, foundByTeam: undefined })),
        currentWord: null,
        currentTeam: "A",
        isPlaying: false,
        isSpinning: false,
        timeLeft: state.timerDuration,
        timerActive: false,
      };

    case "RESET_SCORES":
      return {
        ...state,
        words: state.words.map(w => ({ ...w, done: false, foundByTeam: undefined })),
        currentTeam: "A",
      };

    case "BACK_TO_SETUP":
      return {
        ...state,
        currentWord: null,
        isPlaying: false,
        isSpinning: false,
        timeLeft: state.timerDuration,
        timerActive: false,
      };

    case "SET_TIMER_DURATION":
      return { ...state, timerDuration: action.duration, timeLeft: action.duration };

    case "LOAD_TIMER_DURATION":
      return { ...state, timerDuration: action.duration, timeLeft: action.duration };

    default:
      return state;
  }
}

export default function HomePage() {
  const [state, dispatch] = useReducer(gameReducer, {
    words: [],
    currentWord: null,
    currentTeam: "A" as Team,
    isPlaying: false,
    isSpinning: false,
    timeLeft: 60,
    timerDuration: 60,
    timerActive: false,
  });

  const [inputValue, setInputValue] = useState("");

  // Computed values
  const remainingWords = state.words.filter(w => !w.done);
  const foundWords = state.words.filter(w => w.done);
  const teamAWords = state.words.filter(w => w.foundByTeam === "A");
  const teamBWords = state.words.filter(w => w.foundByTeam === "B");

  // Load words and timer duration from localStorage on mount
  useEffect(() => {
    const savedWords = localStorage.getItem("timesup-words");
    if (savedWords) {
      const parsed = JSON.parse(savedWords);
      // Handle migration from old format (string[]) to new format (WordItem[])
      if (parsed.length > 0 && typeof parsed[0] === "string") {
        dispatch({ type: "LOAD_WORDS", words: parsed.map((text: string) => ({ text, done: false })) });
      } else {
        dispatch({ type: "LOAD_WORDS", words: parsed });
      }
    }
    const savedDuration = localStorage.getItem("timesup-duration");
    if (savedDuration) {
      dispatch({ type: "LOAD_TIMER_DURATION", duration: parseInt(savedDuration, 10) });
    }
  }, []);

  // Save words to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timesup-words", JSON.stringify(state.words));
  }, [state.words]);

  // Save timer duration to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("timesup-duration", state.timerDuration.toString());
  }, [state.timerDuration]);

  // Timer effect
  useEffect(() => {
    if (!state.timerActive) return;

    if (state.timeLeft === 0) {
      dispatch({ type: "TIME_UP" });
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timerActive, state.timeLeft]);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch({ type: "ADD_WORD", word: inputValue.trim() });
      setInputValue("");
    }
  };

  const handleSpin = () => {
    dispatch({ type: "SPIN_WHEEL" });

    // Simulate spinning animation duration
    setTimeout(() => {
      const randomWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
      dispatch({ type: "SELECT_WORD", word: randomWord.text });
    }, 2000);
  };

  // Victory condition
  const hasWon = remainingWords.length === 0 && foundWords.length > 0;

  if (!state.isPlaying) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
              Time&apos;s Up!
            </h1>
            <p className="text-lg text-black">
              Ajoutez des mots et commencez la partie !
            </p>
          </motion.div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-black">Définir les mots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAddWord} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Entrez un mot ou un nom..."
                  className="flex-1 text-lg text-black"
                  autoFocus
                />
                <Button type="submit" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter
                </Button>
              </form>

              {/* Timer duration selector */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-black">Durée du timer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => dispatch({ type: "SET_TIMER_DURATION", duration: Math.max(10, state.timerDuration - 10) })}
                    disabled={state.timerDuration <= 10}
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4 text-black" />
                  </Button>
                  <span className="text-2xl font-bold text-purple-600 min-w-[80px] text-center">
                    {state.timerDuration}s
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => dispatch({ type: "SET_TIMER_DURATION", duration: Math.min(180, state.timerDuration + 10) })}
                    disabled={state.timerDuration >= 180}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4 text-black" />
                  </Button>
                </div>
              </div>

              {/* Team scores */}
              {foundWords.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-black">Scores</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: "RESET_SCORES" })}
                      className="gap-2 text-black"
                    >
                      <RefreshCw className="w-4 h-4 text-black" />
                      Reset scores
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-semibold text-blue-700">Équipe A</span>
                      <p className="text-2xl font-bold text-blue-700">{teamAWords.length} pts</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="font-semibold text-orange-700">Équipe B</span>
                      <p className="text-2xl font-bold text-orange-700">{teamBWords.length} pts</p>
                    </div>
                  </div>
                </div>
              )}

              {state.words.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-black">
                      Mots ({remainingWords.length} restants / {state.words.length} total)
                    </h3>
                    {foundWords.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch({ type: "RESET_STATUS" })}
                        className="gap-2 text-black"
                      >
                        <RefreshCw className="w-4 h-4 text-black" />
                        Tout reset
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {state.words.map((word, index) => (
                        <motion.div
                          key={word.text}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            word.foundByTeam === "A"
                              ? "bg-blue-100 border-blue-300"
                              : word.foundByTeam === "B"
                              ? "bg-orange-100 border-orange-300"
                              : "bg-linear-to-r from-purple-100 to-pink-100 border-purple-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${word.done ? "line-through" : ""} ${
                              word.foundByTeam === "A" ? "text-blue-700" : word.foundByTeam === "B" ? "text-orange-700" : "text-black"
                            }`}>
                              {word.text}
                            </span>
                            {word.foundByTeam && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                word.foundByTeam === "A" ? "bg-blue-500 text-white" : "bg-orange-500 text-white"
                              }`}>
                                {word.foundByTeam}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {word.done && (
                              <CheckCircle className={`w-5 h-5 ${
                                word.foundByTeam === "A" ? "text-blue-600" : word.foundByTeam === "B" ? "text-orange-600" : "text-green-600"
                              }`} />
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => dispatch({ type: "REMOVE_WORD", word: word.text })}
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {remainingWords.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Button
                    size="lg"
                    onClick={() => dispatch({ type: "START_GAME" })}
                    className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                  >
                    Commencer le jeu
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasWon) {
    const winner = teamAWords.length > teamBWords.length ? "A" : teamBWords.length > teamAWords.length ? "B" : null;
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Trophy className={`w-32 h-32 mx-auto mb-6 ${
            winner === "A" ? "text-blue-500" : winner === "B" ? "text-orange-500" : "text-yellow-500"
          }`} />
          <h1 className="text-5xl font-bold text-black mb-2">
            {winner ? `Équipe ${winner} gagne !` : "Égalité !"}
          </h1>
          <p className="text-xl text-black mb-6">
            Tous les mots ont été trouvés !
          </p>

          {/* Final scores */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className={`p-4 rounded-lg border-2 ${winner === "A" ? "bg-blue-100 border-blue-500" : "bg-blue-50 border-blue-200"}`}>
              <span className="font-bold text-lg text-blue-700">Équipe A</span>
              <p className="text-3xl font-bold text-blue-700">{teamAWords.length} pts</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${winner === "B" ? "bg-orange-100 border-orange-500" : "bg-orange-50 border-orange-200"}`}>
              <span className="font-bold text-lg text-orange-700">Équipe B</span>
              <p className="text-3xl font-bold text-orange-700">{teamBWords.length} pts</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => dispatch({ type: "RESET_STATUS" })}
              className="gap-2"
            >
              <RotateCw className="w-5 h-5" />
              Rejouer
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => dispatch({ type: "BACK_TO_SETUP" })}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "BACK_TO_SETUP" })}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="text-center">
            <p className="text-sm text-black">Restants</p>
            <p className="text-2xl font-bold text-black">{remainingWords.length}</p>
          </div>
        </div>

        {/* Team scores and current team */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg border-2 ${state.currentTeam === "A" ? "bg-blue-100 border-blue-500" : "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-lg ${state.currentTeam === "A" ? "text-blue-700" : "text-blue-600"}`}>Équipe A</span>
              {state.currentTeam === "A" && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Tour</span>}
            </div>
            <p className="text-3xl font-bold text-blue-700">{teamAWords.length} pts</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${state.currentTeam === "B" ? "bg-orange-100 border-orange-500" : "bg-orange-50 border-orange-200"}`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-lg ${state.currentTeam === "B" ? "text-orange-700" : "text-orange-600"}`}>Équipe B</span>
              {state.currentTeam === "B" && <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Tour</span>}
            </div>
            <p className="text-3xl font-bold text-orange-700">{teamBWords.length} pts</p>
          </div>
        </div>

        {/* Roulette */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 mb-6">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Wheel visualization */}
              <div className="relative mx-auto w-full max-w-md aspect-square">
                <motion.div
                  animate={state.isSpinning ? { rotate: 360 * 5 } : {}}
                  transition={state.isSpinning ? { duration: 2, ease: "easeOut" } : {}}
                  className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-blue-500 shadow-2xl flex items-center justify-center"
                >
                  <div className="bg-white rounded-full w-[85%] h-[85%] flex items-center justify-center p-8">
                    <AnimatePresence mode="wait">
                      {state.currentWord ? (
                        <motion.p
                          key={state.currentWord}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="text-3xl md:text-5xl font-bold text-black text-center wrap-break-word"
                        >
                          {state.currentWord}
                        </motion.p>
                      ) : state.isSpinning ? (
                        <motion.p
                          key="spinning"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-2xl text-black"
                        >
                          ...
                        </motion.p>
                      ) : (
                        <motion.p
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xl text-black"
                        >
                          Tournez la roulette !
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full shadow-lg border-4 border-white" />
                </div>
              </div>

              {/* Timer */}
              {state.timerActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <motion.p
                      animate={state.timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className={`text-6xl font-bold ${
                        state.timeLeft <= 10 ? "text-red-600" : "text-black"
                      }`}
                    >
                      {state.timeLeft}s
                    </motion.p>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(state.timeLeft / state.timerDuration) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${
                        state.timeLeft <= 10
                          ? "bg-linear-to-r from-red-500 to-red-600"
                          : "bg-linear-to-r from-purple-500 to-pink-500"
                      }`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!state.currentWord && !state.isSpinning && (
                  <Button
                    size="lg"
                    onClick={handleSpin}
                    disabled={remainingWords.length === 0}
                    className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 text-lg py-6"
                  >
                    <RotateCw className="w-5 h-5" />
                    Tourner la roulette
                  </Button>
                )}

                {state.currentWord && !state.isSpinning && (
                  <>
                    <Button
                      size="lg"
                      onClick={() => dispatch({ type: "WORD_FOUND" })}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Trouvé !
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => dispatch({ type: "SKIP_WORD" })}
                      className="gap-2 flex-1"
                    >
                      <SkipForward className="w-5 h-5" />
                      Passer
                    </Button>
                  </>
                )}
              </div>

              {/* Time up notification */}
              {state.timeLeft === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-100 border-2 border-red-300 rounded-lg p-4"
                >
                  <p className="text-red-700 font-bold text-xl">Temps écoulé !</p>
                  <p className="text-red-600 text-sm">Passez au mot suivant ou marquez-le comme trouvé</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
