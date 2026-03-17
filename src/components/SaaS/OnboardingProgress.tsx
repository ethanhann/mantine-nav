'use client';

export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
}

export interface OnboardingProgressProps {
  steps: OnboardingStep[];
  variant?: 'bar' | 'ring' | 'checklist';
  collapsible?: boolean;
  onComplete?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function OnboardingProgress({
  steps,
  variant = 'bar',
  dismissible = false,
  onDismiss,
}: OnboardingProgressProps) {
  const completed = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (variant === 'checklist') {
    return (
      <div role="group" aria-label="Onboarding progress">
        <div style={{ fontSize: '0.8em', fontWeight: 600, marginBottom: 4 }}>
          {completed} of {total} complete
          {dismissible && <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>}
        </div>
        {steps.map((step) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8em', padding: '2px 0' }}>
            <span aria-hidden="true">{step.completed ? '✓' : '○'}</span>
            {step.href ? <a href={step.href}>{step.label}</a> : step.label}
          </div>
        ))}
      </div>
    );
  }

  // Bar variant
  return (
    <div role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label="Onboarding progress">
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', marginBottom: 4 }}>
        <span>{completed} of {total} complete</span>
        {dismissible && <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8em' }}>✕</button>}
      </div>
      <div style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#6366f1', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}
