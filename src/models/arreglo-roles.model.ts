import {Model, model, property} from '@loopback/repository';

@model()
export class ArregloRoles extends Model {
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  roles: string[];


  constructor(data?: Partial<ArregloRoles>) {
    super(data);
  }
}

export interface ArregloRolesRelations {
  // describe navigational properties here
}

export type ArregloRolesWithRelations = ArregloRoles & ArregloRolesRelations;
