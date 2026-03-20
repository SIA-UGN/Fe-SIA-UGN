'use client';

interface ProgressStepperProps {
  currentStep: number;
}

const STEPS = ['Pengajuan', 'Review Dosen', 'Penetapan Pembimbing', 'Bimbingan Aktif', 'Sidang TA'];

export const ProgressStepper = ({ currentStep }: ProgressStepperProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-8">Progress Bimbingan</h3>

      {/* Stepper */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300" aria-hidden="true" />

        {/* Steps */}
        <div className="flex items-start justify-between relative z-10">
          {STEPS.map((step, idx) => {
            const stepNumber = idx + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 flex-shrink-0 border-4 transition-all ${
                    isActive
                      ? 'bg-[#16A34A] border-[#16A34A]'
                      : isCompleted
                        ? 'bg-[#16A34A] border-[#16A34A]'
                        : 'bg-white border-gray-300'
                  }`}
                >
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : isCompleted ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{stepNumber}</span>
                  )}
                </div>

                {/* Label */}
                <p
                  className={`text-sm font-semibold text-center px-2 ${
                    isActive || isCompleted ? 'text-[#16A34A]' : 'text-gray-400'
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
