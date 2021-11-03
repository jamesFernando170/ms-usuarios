import {Entity, hasMany, model, property} from '@loopback/repository';
import {Rol} from './rol.model';
import {UsuarioRol} from './usuario-rol.model';

@model()
export class Usuario extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  celular: string;

  @property({
    type: 'string',
    required: false,
  })
  clave?: string;

  @property({
    type: 'string',
    required: true,
  })
  documento: string;

  @property({
    type: 'string',
    required: true,
  })
  apellidos: string;

  @property({
    type: 'boolean',
    default: true,
  })
  estado?: boolean;

  @property({
    type: 'date',
    required: true,
  })
  fecha_nacimiento: string;

  @hasMany(() => Rol, {through: {model: () => UsuarioRol, keyFrom: 'id_usuario', keyTo: 'id_rol'}})
  tiene_el_rol: Rol[];

  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
