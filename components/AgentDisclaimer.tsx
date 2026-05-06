import { AGENT_CALL_DISCLAIMER } from "@/lib/compliance/tpmo";

export function AgentDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs text-slate-600 mt-2 ${className}`}
      data-testid="agent-call-disclaimer"
    >
      {AGENT_CALL_DISCLAIMER}
    </p>
  );
}
