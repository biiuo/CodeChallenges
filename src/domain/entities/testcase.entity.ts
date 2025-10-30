export class Testcase {
  constructor (
    public challengeId: string,
    public caseNumber: number,
    public input: string,
    public output: string,
    public visible: boolean
  ) {}
}