/**
 * Domain Entity - Teacher
 */
export class Teacher {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly schoolId: string,
    public readonly mobile: string | null,
    public readonly subjectsTaught: string | null,
    public readonly isLeaveApprover: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Get subjects as array
   */
  getSubjects(): string[] {
    if (!this.subjectsTaught) return [];
    return this.subjectsTaught.split(",").map(s => s.trim());
  }

  /**
   * Domain method: Check if teacher teaches a subject
   */
  teachesSubject(subject: string): boolean {
    return this.getSubjects().some(s => s.toLowerCase() === subject.toLowerCase());
  }
}
