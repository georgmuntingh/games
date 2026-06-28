// Pure, dependency-free scoring helpers for the bot-detection game.
// Positive class = "bot" (the thing we are trying to detect).
//
//   TP: predicted bot,   actually bot   (correct catch)
//   FP: predicted bot,   actually human (false accusation)
//   FN: predicted human, actually bot   (missed bot)
//   TN: predicted human, actually human (correct pass)

export function emptyTally() {
  return { tp: 0, fp: 0, fn: 0, tn: 0 };
}

// Mutates and returns the tally. `predictedBot` / `actualBot` are booleans.
export function record(tally, predictedBot, actualBot) {
  if (predictedBot && actualBot) tally.tp += 1;
  else if (predictedBot && !actualBot) tally.fp += 1;
  else if (!predictedBot && actualBot) tally.fn += 1;
  else tally.tn += 1;
  return tally;
}

// Safe division: returns null when the denominator is 0 so callers can render "—".
function ratio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export function metrics(tally) {
  const { tp, fp, fn, tn } = tally;
  const total = tp + fp + fn + tn;
  const precision = ratio(tp, tp + fp);
  const recall = ratio(tp, tp + fn);
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
  return {
    total,
    accuracy: ratio(tp + tn, total),
    precision,
    recall,
    f1,
  };
}

// Formats a metric in [0,1] as a percent string, or "—" when null.
export function formatPercent(value) {
  return value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`;
}
