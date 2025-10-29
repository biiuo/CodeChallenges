export class CreateCourseDTO {
    code:string
    name:string
    period:string
    professorCode?:string[]
}

export class UpdateCourseDto {
  code?: string;
  name?: string;
  period?: string;
  professorCode?: string[];

}