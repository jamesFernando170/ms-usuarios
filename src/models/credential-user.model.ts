import {Model, model, property} from '@loopback/repository';

@model()
export class CredentialUser extends Model {
  @property({
    type: 'string',
    required: true,
  })
  username: string;


  constructor(data?: Partial<CredentialUser>) {
    super(data);
  }
}

export interface CredentialUserRelations {
  // describe navigational properties here
}

export type CredentialUserWithRelations = CredentialUser & CredentialUserRelations;
