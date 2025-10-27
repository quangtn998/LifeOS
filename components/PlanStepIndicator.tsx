import React from 'react';

interface PlanStepIndicatorProps {
  currentStep: 1 | 2;
  totalSteps: 2;
}

const PlanStepIndicator: React.FC<PlanStepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${
            step === currentStep
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50'
              : step < currentStep
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {step < currentStep ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 mx-1 transition-all ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-700'
            }`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm text-gray-400">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
};

export default PlanStepIndicator;
