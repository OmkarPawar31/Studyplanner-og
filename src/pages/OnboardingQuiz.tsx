import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../contexts/PlannerContext';
import { questionBank } from '../data/questions';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  SparklesIcon,
  LoaderIcon,
  CheckIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  SchoolIcon,
  AwardIcon,
} from 'lucide-react';

type Phase = 'selection' | 'running' | 'submitting';

export function OnboardingQuiz() {
  const navigate = useNavigate();
  const { regenerate, recordAttempt, now } = usePlanner();

  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedSubjectId, setSelectedSubjectId] = useState<'math' | 'chem' | 'hist'>('math');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Quiz state
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  const subjectMetadata = {
    math: {
      name: 'Linear Algebra',
      topics: 'Eigenvalues, Vector spaces, Determinants',
      description: 'Matrices, linear maps, eigenvalues, and basis sets.',
      icon: GraduationCapIcon,
      accent: 'moss',
    },
    chem: {
      name: 'Organic Chemistry',
      topics: 'Reaction mechanisms, Stereochemistry, Spectroscopy',
      description: 'Carbon structures, organic reactions, and analysis.',
      icon: SchoolIcon,
      accent: 'clay',
    },
    hist: {
      name: 'Modern History',
      topics: 'Cold War, Decolonisation, Industrial change',
      description: 'Global geopolitical history and social transitions.',
      icon: BookOpenIcon,
      accent: 'sand',
    },
  };

  const levels = [
    {
      id: 'beginner' as const,
      name: 'Beginner',
      description: 'I am starting from scratch or need a basic refresher.',
      badge: 'Level 1',
    },
    {
      id: 'intermediate' as const,
      name: 'Intermediate',
      description: 'I understand core concepts but want to practice application.',
      badge: 'Level 2',
    },
    {
      id: 'advanced' as const,
      name: 'Advanced',
      description: 'I am confident and looking for stretch challenges.',
      badge: 'Level 3',
    },
  ];

  const shuffleOptions = (question: any) => {
    const paired = question.options.map((option: string, index: number) => ({
      option,
      correct: index === question.answerIndex,
    }));
    const mixed = [...paired].sort(() => Math.random() - 0.5);
    return {
      ...question,
      options: mixed.map((entry) => entry.option),
      answerIndex: mixed.findIndex((entry) => entry.correct),
    };
  };

  const handleStartQuiz = () => {
    const levelToDifficulty = {
      beginner: 'core',
      intermediate: 'applied',
      advanced: 'stretch',
    };
    const targetDifficulty = levelToDifficulty[selectedLevel];
    const pool = questionBank.filter((q) => q.subjectId === selectedSubjectId);

    // Prioritize target difficulty, shuffle, and slice 3
    const sorted = [...pool].sort((a, b) => {
      if (a.difficulty === targetDifficulty && b.difficulty !== targetDifficulty) return -1;
      if (a.difficulty !== targetDifficulty && b.difficulty === targetDifficulty) return 1;
      return 0;
    });

    const selectedQuestions = sorted.slice(0, 3).map(shuffleOptions);

    setQuestions(selectedQuestions);
    setAnswers([]);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setStartedAt(Date.now());
    setPhase('running');
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    const nextAnswers = [...answers, selectedAnswer];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);

    if (currentIdx + 1 >= questions.length) {
      handleFinish(nextAnswers);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleFinish = async (finalAnswers: number[]) => {
    setPhase('submitting');

    let correctCount = 0;
    const perTopic: Record<string, { correct: number; total: number }> = {};

    questions.forEach((question, idx) => {
      const isCorrect = finalAnswers[idx] === question.answerIndex;
      if (isCorrect) correctCount += 1;
      
      const current = perTopic[question.topic] || { correct: 0, total: 0 };
      perTopic[question.topic] = {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
      };
    });

    const confidenceMap = {
      beginner: 2,
      intermediate: 3,
      advanced: 4,
    };
    const initialConfidence = confidenceMap[selectedLevel] as 1 | 2 | 3 | 4 | 5;

    const selectedMeta = subjectMetadata[selectedSubjectId];
    const planInput = {
      subjects: [
        {
          id: selectedSubjectId,
          name: selectedMeta.name,
          examDate: format(addDays(now, 10), 'yyyy-MM-dd'),
          confidence: initialConfidence,
          topics: selectedMeta.topics,
        },
      ],
      hoursPerDay: 4,
      startTime: '08:30',
      days: 7,
      restDay: 'sun' as const,
    };

    // Keep active loading for 2 seconds to make database writes look substantial
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save placement quiz attempt
    recordAttempt({
      id: `onboarding-${Date.now()}`,
      subjectId: selectedSubjectId,
      date: format(now, 'yyyy-MM-dd'),
      correct: correctCount,
      total: questions.length,
      perTopic,
      seconds: Math.round((Date.now() - startedAt) / 1000),
    });

    // Generate schedule
    regenerate(planInput);

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paper px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <AnimatePresence mode="wait">
          {phase === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="rounded-card border border-ink-line bg-paper-raised p-6 shadow-card sm:p-8"
            >
              <div className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-moss-soft text-moss">
                  <AwardIcon className="h-6 w-6" />
                </span>
                <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
                  Set Up Your Learning Journey
                </h1>
                <p className="mt-2 text-sm text-ink-muted sm:text-base">
                  Choose a subject and level to generate a short placement quiz.
                  This helps us weight your initial study slots.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {/* Subject Selector */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    1. Select Subject
                  </h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {Object.entries(subjectMetadata).map(([id, meta]) => {
                      const Icon = meta.icon;
                      const isSelected = selectedSubjectId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedSubjectId(id as any)}
                          className={`flex flex-col items-start rounded-card border p-4 text-left transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-moss/20 ${
                            isSelected
                              ? 'border-moss bg-moss-soft/40 shadow-sm'
                              : 'border-ink-line hover:border-ink-muted bg-paper-raised hover:bg-paper/30'
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isSelected ? 'bg-moss text-paper' : 'bg-paper-sunk text-ink-soft'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="mt-4 font-semibold text-[15px] text-ink">
                            {meta.name}
                          </span>
                          <span className="mt-1 text-xs text-ink-muted line-clamp-2">
                            {meta.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level Selector */}
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    2. Select Initial Proficiency
                  </h2>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {levels.map((lvl) => {
                      const isSelected = selectedLevel === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setSelectedLevel(lvl.id)}
                          className={`flex flex-col items-start rounded-card border p-4 text-left transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-moss/20 ${
                            isSelected
                              ? 'border-moss bg-moss-soft/40 shadow-sm'
                              : 'border-ink-line hover:border-ink-muted bg-paper-raised hover:bg-paper/30'
                          }`}
                        >
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              isSelected
                                ? 'bg-moss text-paper'
                                : 'bg-paper-sunk text-ink-muted'
                            }`}
                          >
                            {lvl.badge}
                          </span>
                          <span className="mt-3 font-semibold text-[15px] text-ink">
                            {lvl.name}
                          </span>
                          <span className="mt-1 text-xs text-ink-muted leading-relaxed">
                            {lvl.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-ink-line pt-6">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="flex h-11 items-center justify-center gap-2 rounded-card bg-moss px-6 text-sm font-semibold text-paper-raised transition-[background-color,transform] duration-150 ease-out hover:bg-moss-hover active:translate-y-px"
                >
                  Start Placement Quiz
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'running' && questions.length > 0 && (
            <motion.div
              key="running"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="rounded-card border border-ink-line bg-paper-raised shadow-card"
            >
              {/* Quiz Header */}
              <div className="flex items-center justify-between border-b border-ink-line px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-ink-muted">
                    Placement Quiz · Question {currentIdx + 1} of {questions.length}
                  </p>
                  <p className="mt-0.5 font-semibold text-ink text-sm">
                    {subjectMetadata[selectedSubjectId].name} ({selectedLevel})
                  </p>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                  {questions.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-colors duration-200 ease-out ${
                        i < currentIdx
                          ? 'bg-moss'
                          : i === currentIdx
                          ? 'bg-ink'
                          : 'bg-paper-sunk'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Quiz Body */}
              <div className="px-6 py-8">
                <p className="text-xs uppercase font-semibold text-moss">
                  Topic: {questions[currentIdx].topic}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl">
                  {questions[currentIdx].prompt}
                </h2>

                <div className="mt-6 flex flex-col gap-3">
                  {questions[currentIdx].options.map((option: string, idx: number) => {
                    const isSelected = selectedAnswer === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAnswer(idx)}
                        className={`flex w-full items-center justify-between rounded-card border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 ease-out ${
                          isSelected
                            ? 'border-moss bg-moss-soft/40 text-ink'
                            : 'border-ink-line hover:border-ink-muted bg-paper-raised text-ink-soft hover:bg-paper/30'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <CheckIcon className="h-4 w-4 text-moss" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Footer */}
              <div className="flex justify-end border-t border-ink-line px-6 py-4">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="flex h-10 items-center justify-center gap-2 rounded-card bg-moss px-5 text-sm font-semibold text-paper-raised transition-[background-color,opacity,transform] duration-150 ease-out hover:bg-moss-hover active:translate-y-px disabled:opacity-50 disabled:pointer-events-none"
                >
                  {currentIdx + 1 === questions.length ? 'Submit Quiz' : 'Next Question'}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="rounded-card border border-ink-line bg-paper-raised p-8 text-center shadow-card sm:p-12"
            >
              <LoaderIcon className="mx-auto h-10 w-10 animate-spin text-moss" />
              <h2 className="mt-6 font-display text-3xl text-ink">
                Generating Your Custom Schedule
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                Analyzing quiz response, establishing topic weights, and preparing your weekly study calendar...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
