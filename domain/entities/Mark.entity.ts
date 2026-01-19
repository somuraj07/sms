/**
 * Domain Entity - Mark/Grade
 */
export class Mark {
  constructor(
    public readonly id: string,
    public readonly subject: string,
    public readonly marks: number,
    public readonly totalMarks: number,
    public readonly grade: string | null,
    public readonly suggestions: string | null,
    public readonly examId: string,
    public readonly studentId: string,
    public readonly classId: string,
    public readonly teacherId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Calculate percentage
   */
  getPercentage(): number {
    if (this.totalMarks === 0) return 0;
    return (this.marks / this.totalMarks) * 100;
  }

  /**
   * Domain method: Calculate grade based on percentage
   */
  static calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
  }

  /**
   * Domain method: Check if marks are valid
   */
  static isValidMarks(marks: number, totalMarks: number): boolean {
    return marks >= 0 && totalMarks > 0 && marks <= totalMarks;
  }
}
