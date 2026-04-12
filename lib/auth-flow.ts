export const REGISTER_ROLE_VALUES = ["ETUDIANT", "CONTRIBUTEUR"] as const;
export type RegisterRole = (typeof REGISTER_ROLE_VALUES)[number];

export type EducationLevel = "COLLEGE" | "LYCEE" | "UNIVERSITE" | "FORMATION";
export type GradeLevel =
  | "3EME"
  | "TERMINALE"
  | "L1"
  | "L2"
  | "L3"
  | "M1"
  | "M2";

export function mapOnboardingLevelToAcademicProfile(level: string) {
  switch (level) {
    case "Collège (BEPC)":
      return {
        educationLevel: "COLLEGE" as EducationLevel,
        gradeLevel: "3EME" as GradeLevel,
        schoolLevel: level,
      };
    case "Lycée Série C":
    case "Lycée Série A/D":
      return {
        educationLevel: "LYCEE" as EducationLevel,
        gradeLevel: "TERMINALE" as GradeLevel,
        schoolLevel: level,
      };
    case "Supérieur":
      return {
        educationLevel: "UNIVERSITE" as EducationLevel,
        schoolLevel: level,
      };
    default:
      return {};
  }
}

export function mapAcademicProfileToOnboardingLevel(profile: {
  educationLevel?: string | null;
  schoolLevel?: string | null;
}) {
  if (profile.schoolLevel === "Collège (BEPC)") {
    return "Collège (BEPC)";
  }

  if (profile.schoolLevel === "Lycée Série A/D") {
    return "Lycée Série A/D";
  }

  if (profile.educationLevel === "COLLEGE") {
    return "Collège (BEPC)";
  }

  if (profile.educationLevel === "UNIVERSITE") {
    return "Supérieur";
  }

  return "Lycée Série C";
}
