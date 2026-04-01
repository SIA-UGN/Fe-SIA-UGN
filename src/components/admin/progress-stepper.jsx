export default function ProgressStepper({ currentStep = 1, steps = [] }) {
  return (
    <section className="overflow-x-auto">
      <div className="min-w-[760px] px-4 py-4">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < currentStep;
            const isActive = stepNumber === currentStep;

            return (
              <div key={step.label} className="relative text-center">
                {index < steps.length - 1 ? (
                  <span
                    className="absolute left-[50%] top-4 h-[2px] w-full"
                    style={{ backgroundColor: isComplete ? '#015023' : '#e5e7eb' }}
                    aria-hidden="true"
                  />
                ) : null}

                <div
                  className="relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: isActive || isComplete ? '#015023' : '#fff',
                    borderColor: isActive || isComplete ? '#015023' : '#d1d5db',
                    color: isActive || isComplete ? '#fff' : '#9ca3af',
                  }}
                >
                  {stepNumber}
                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#4b5563]">{step.label}</p>
                <p className="mt-1 text-[10px] leading-tight text-[#9ca3af]">{step.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
