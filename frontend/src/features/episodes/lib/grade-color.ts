export type GradeColor = "green" | "yellow" | "red" | "none";

// Grades range 0-1. >= GREEN: pass, <= RED: fail, between: marginal.
export const GRADE_GREEN_THRESHOLD = 0.8;
export const GRADE_RED_THRESHOLD = 0.5;

export function getGradeColor(grade: number | null | undefined): GradeColor {
  if (grade === null || grade === undefined) {
    return "none";
  }
  if (grade >= GRADE_GREEN_THRESHOLD) {
    return "green";
  }
  if (grade <= GRADE_RED_THRESHOLD) {
    return "red";
  }
  return "yellow";
}
