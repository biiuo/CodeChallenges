export class CreateCourseDTO {
    nrc:string
    name:string
    period:string
    group:string
    proffesorNrc?:string[]
}

export class UpdateCourseDto {
  nrc?: string;
  name?: string;
  period?: string;
  group?: string;
  professorNrc?: string[];

}