import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Flame,
  Gauge,
  MessageSquare,
  Mountain,
  RefreshCw,
  Shield,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Modal } from './Modal.jsx';
import { QUIZ_QUESTIONS, rankVehiclesByMatch } from '../lib/matchmaker.js';
import { formatPrice } from '../lib/catalog.js';
import { getVehiclePhoto } from './VehiclePages.jsx';

const ICON_MAP = {
  Compass,
  Building2,
  Mountain,
  Gauge,
  Zap,
  Flame,
  Shield,
};

export function MatchmakerQuizModal({
  vehicles,
  onClose,
  onDesign,
  onScheduleTestDrive,
  onAskConcierge,
  analysisDelay = 400,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const currentQuestion = QUIZ_QUESTIONS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / QUIZ_QUESTIONS.length) * 100);

  const handleSelectOption = (optionId) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(updatedAnswers);

    if (currentStepIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished all 4 questions -> trigger analysis animation
      setAnalyzing(true);
      window.setTimeout(() => {
        const ranked = rankVehiclesByMatch(vehicles, updatedAnswers);
        setResults(ranked);
        setAnalyzing(false);
      }, analysisDelay);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStepIndex(0);
    setResults(null);
    setAnalyzing(false);
  };

  const topMatch = results?.[0];
  const runnerUp = results?.[1];

  return (
    <Modal
      title="Atelier Lifestyle Matchmaker"
      subtitle="Bespoke vehicle recommendation tailored to your driving philosophy"
      onClose={onClose}
      width="wide"
    >
      <div className="space-y-6">
        {/* Progress bar */}
        {!results && !analyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted">
              <span>Question {currentStepIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span className="text-royal font-mono font-extrabold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-[#edf1f7] rounded-full overflow-hidden">
              <div
                className="h-full bg-royal transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Analyzing transition screen */}
        {analyzing ? (
          <div className="py-16 text-center space-y-4 animate-fade">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-4 border-royal/20 border-t-royal animate-spin mx-auto" />
              <Sparkles className="absolute inset-0 m-auto text-royal animate-pulse" size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Analyzing Atelier Telemetry</h3>
            <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
              Evaluating chassis dynamics, interior craftsmanship, and propulsion curves against your driving profile...
            </p>
          </div>
        ) : results ? (
          /* Results View */
          <div className="space-y-6 animate-fade">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-[#172338] to-[#253959] text-white p-5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#a8bcd6] uppercase block">
                  ALGORITHM SYNTHESIS COMPLETE
                </span>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Your Bespoke Atelier Match
                </h3>
                <p className="text-xs text-[#cedae8] mt-0.5">
                  Curated based on your preference for {answers.purpose} driving and {answers.powertrain} propulsion.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 rounded-2xs text-xs font-bold transition shrink-0"
              >
                <RefreshCw size={13} /> Retake Quiz
              </button>
            </div>

            {/* Primary Hero Recommendation */}
            {topMatch && (
              <div className="border-2 border-royal/30 bg-white rounded-xs shadow-md overflow-hidden relative">
                {/* Match percentage badge */}
                <div className="absolute top-4 right-4 z-10 bg-royal text-white px-3.5 py-1.5 rounded-full font-mono text-xs font-black shadow-lg flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>{topMatch.score}% MATCH</span>
                </div>

                <div className="flex flex-col md:flex-row">
                  {/* Vehicle Media */}
                  <div className="md:w-5/12 bg-[#f4f7fb] p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#e5ebf3] relative">
                    <img
                      src={getVehiclePhoto(topMatch.vehicle)}
                      alt={`${topMatch.vehicle.make} ${topMatch.vehicle.model}`}
                      className="max-h-52 w-full object-contain p-2 hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Vehicle Content & Match Reasons */}
                  <div className="md:w-7/12 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold tracking-widest text-royal uppercase">
                          PRIMARY RECOMMENDATION · {topMatch.vehicle.category}
                        </span>
                      </div>
                      <h4 className="font-display text-2xl font-bold text-ink mt-1">
                        {topMatch.vehicle.make} {topMatch.vehicle.model}
                      </h4>
                      <p className="font-mono text-sm font-bold text-ink/80 mt-1">
                        Starting from {formatPrice(topMatch.vehicle.price)}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#edf1f7]">
                        <span className="text-[10px] font-extrabold tracking-wider text-[#6a7c93] uppercase block mb-2">
                          Why this vehicle matches your lifestyle:
                        </span>
                        <ul className="space-y-2 text-xs text-[#48566a]">
                          {topMatch.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={15} className="text-[#3c825b] shrink-0 mt-0.5" />
                              <span className="leading-snug">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 pt-4 border-t border-[#edf1f7] flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onDesign?.(topMatch.vehicle);
                        }}
                        className="btn btn-primary text-xs font-bold"
                      >
                        Design in 3D <ArrowRight size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onScheduleTestDrive?.(topMatch.vehicle);
                        }}
                        className="btn btn-light text-xs font-bold"
                      >
                        <Calendar size={14} className="text-royal" /> Schedule Test Drive
                      </button>

                      {onAskConcierge && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onAskConcierge(
                              topMatch.vehicle,
                              `I just matched ${topMatch.score}% with the ${topMatch.vehicle.make} ${topMatch.vehicle.model} on the Lifestyle Quiz. Could you share more details about its performance, options, and availability?`
                            );
                          }}
                          className="btn btn-light text-xs font-bold"
                          title="Ask Concierge about this match"
                        >
                          <MessageSquare size={14} className="text-royal" /> Ask Concierge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Runner-Up Alternate Recommendation */}
            {runnerUp && (
              <div className="border border-[#dfe4ec] bg-[#fbfcfd] p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-white border border-[#e2e7ef] rounded-2xs flex items-center justify-center shrink-0">
                    <img
                      src={getVehiclePhoto(runnerUp.vehicle)}
                      alt={runnerUp.vehicle.model}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted uppercase">Alternative Character</span>
                      <span className="text-[10px] font-mono font-extrabold bg-[#edf2f8] text-[#334661] px-2 py-0.5 rounded-full">
                        {runnerUp.score}% Match
                      </span>
                    </div>
                    <h5 className="font-display text-base font-bold text-ink">
                      {runnerUp.vehicle.make} {runnerUp.vehicle.model}
                    </h5>
                    <span className="text-xs text-muted">From {formatPrice(runnerUp.vehicle.price)} · {runnerUp.vehicle.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDesign?.(runnerUp.vehicle);
                    }}
                    className="btn btn-light text-xs font-bold"
                  >
                    Explore Alternative <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Question Form View */
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-royal uppercase block">
                STEP {currentQuestion.step} OF 4
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mt-1">
                {currentQuestion.title}
              </h3>
              <p className="text-xs text-muted mt-1">{currentQuestion.subtitle}</p>
            </div>

            {/* Visual Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                const IconComponent = option.icon ? ICON_MAP[option.icon] || Sparkles : Sparkles;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-4 text-left border rounded-xs transition-all relative flex flex-col justify-between min-h-[110px] ${
                      isSelected
                        ? 'border-royal bg-royal/5 ring-2 ring-royal/20 shadow-sm'
                        : 'border-[#dfe4ec] bg-white hover:border-[#a9bbd4] hover:bg-[#fafbfd]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                            isSelected ? 'bg-royal text-white' : 'bg-[#eef2f7] text-[#55677e]'
                          }`}
                        >
                          <IconComponent size={16} />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-royal text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-sm font-bold text-ink">
                        {option.label}
                      </h4>
                      <p className="text-xs text-[#5e6d82] mt-1 leading-relaxed">
                        {option.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Navigation footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#edf1f7]">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
                >
                  <ArrowLeft size={15} /> Previous Question
                </button>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-muted">Click an option to proceed to the next question</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
