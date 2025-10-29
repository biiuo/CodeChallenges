export class CreateCourseDTO {
    code:string
    name:string
    period:string
    group:string
    professorCode?:string[]
}

export class UpdateCourseDto {
  code?: string;
  name?: string;
  period?: string;
  group?: string;
  professorCode?: string[];

}