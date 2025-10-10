export interface IBiodata {
  _id?: string;
  surname: string;
  firstname: string;
  othernames: string;
  gender: string;
  marital: string;
  birthDate: string;
  families: string;
  disease: string;
  others?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
