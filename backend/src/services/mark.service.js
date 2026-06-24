import AssessmentScheme from "../models/AssessmentScheme.js";

export const calculateTotal = async (
  grade,
  assignment,
  quiz,
  mid,
  final
) => {
  const scheme = await AssessmentScheme.findOne({
    grade,
    isActive: true,
  });

  if (!scheme) {
    throw new Error("No assessment scheme found for grade");
  }

  const total =
    (assignment * scheme.assignmentWeight) / 100 +
    (quiz * scheme.quizWeight) / 100 +
    (mid * scheme.midWeight) / 100 +
    (final * scheme.finalWeight) / 100;

  return Number(total.toFixed(2));
};
