/**
 * Domain Entity - Class
 */
export class Class {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly section: string | null,
    public readonly schoolId: string,
    public readonly teacherId: string | null,
    public readonly createdAt: Date
  ) {}

  /**
   * Domain method: Check if class has a teacher assigned
   */
  hasTeacher(): boolean {
    return this.teacherId !== null;
  }
}
