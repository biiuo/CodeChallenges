export interface createCourseDTO {
    nrc:string
    name:string
    period:string
    group:string
    proffesorNrc?:string[]
}

export interface updateCourseDto {
  nrc?: string;
  name?: string;
  period?: string;
  group?: string;
  professorNrc?: string[];

}
