/* Controlador gestiona la asignacion de los roles a los usuarios*/
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
  response
} from '@loopback/rest';
import {
  ArregloRoles, Rol, Usuario,
  UsuarioRol
} from '../models';
import {RolRepository, UsuarioRepository, UsuarioRolRepository} from '../repositories';
import {SesionUsuariosService} from '../services';

export class UsuarioRolController {
  constructor(
    @repository(UsuarioRepository) protected usuarioRepository: UsuarioRepository,
    @repository(UsuarioRolRepository) protected UsuarioRolRepository: UsuarioRolRepository,
    @repository(RolRepository) protected RolRepository: RolRepository,
    @service(SesionUsuariosService) private sesionUsuarioSerive: SesionUsuariosService
  ) { }

  @get('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Array of Usuario has many Rol through UsuarioRol',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Rol)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Rol>,
  ): Promise<Rol[]> {
    return this.usuarioRepository.tiene_el_rol(id).find(filter);
  }

  @post('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'create a Rol model instance',
        content: {'application/json': {schema: getModelSchemaRef(Rol)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Usuario.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {
            title: 'NewRolInUsuario',
            exclude: ['_id'],
          }),
        },
      },
    }) rol: Omit<Rol, '_id'>,
  ): Promise<Rol> {
    return this.usuarioRepository.tiene_el_rol(id).create(rol);
  }

  //**Nuevo*/
  @patch('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Usuario.Rol PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Rol, {partial: true}),
        },
      },
    })
    rol: Partial<Rol>,
    @param.query.object('where', getWhereSchemaFor(Rol)) where?: Where<Rol>,
  ): Promise<Count> {
    return this.usuarioRepository.tiene_el_rol(id).patch(rol, where);
  }

  @del('/usuarios/{id}/rols', {
    responses: {
      '200': {
        description: 'Usuario.Rol DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Rol)) where?: Where<Rol>,
  ): Promise<Count> {
    return this.usuarioRepository.tiene_el_rol(id).delete(where);
  }


  @post('/usuario-rol', {
    responses: {
      '200': {
        description: 'create a instance of Rol with a usuario',
        content: {'application/json': {schema: getModelSchemaRef(UsuarioRol)}},
      },
    },
  })
  async crearRelacion(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UsuarioRol, {
            title: 'NewUsuarioRol',
            exclude: ['_id'],
          }),
        },
      },
    }) datos: Omit<UsuarioRol, '_id'>,
  ): Promise<UsuarioRol | null> {
    let registro = await this.UsuarioRolRepository.create(datos);
    return registro;
  }

  @post('/asociar-usuario-roles/{id}', {
    responses: {
      '200': {
        description: 'create a instance of Rol with a usuario',
        content: {'application/json': {schema: getModelSchemaRef(UsuarioRol)}},
      },
    },
  })
  async crearRelaciones(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArregloRoles, {}),
        },
      },
    }) datos: ArregloRoles,
    @param.path.string('id') id_usuario: typeof Usuario.prototype._id
  ): Promise<Boolean> {
    if (datos.roles.length > 0) {
      datos.roles.forEach(async (id_rol: string) => {
        let existe = await this.UsuarioRolRepository.findOne({
          where: {
            id_rol: id_rol,
            id_usuario: id_usuario
          }
        })
        if (!existe) {
          this.UsuarioRolRepository.create({
            id_rol: id_rol,
            id_usuario: id_usuario
          });
        }

      });
      return true;
    }
    return false;
  }

  @del('/usuario-rols/{id}')
  @response(204, {
    description: 'UsuarioRol2 DELETE success',
  })
  async EliminarRolUsuario(
    @param.path.string('id_usuario') id_usuario: string,
    @param.path.string('id_rol') id_rol: string): Promise<Boolean> {
    let reg = await this.UsuarioRolRepository.findOne({
      where: {
        id_rol: id_rol,
        id_usuario: id_usuario
      }
    });
    if (reg) {
      await this.UsuarioRolRepository.deleteById(reg._id);
      return true
    }
    return false;
  }

  @get('/usuario-rols-idUsuario/{id_usuario}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UsuarioRol, {includeRelations: true}),
      },
    },
  })
  async findByIdUsuario(
    @param.path.string('id_usuario') id_usuario: string
  ): Promise<UsuarioRol[] | null> {
    let usuarioRol = await this.UsuarioRolRepository.find({
      where: {
        id_usuario: id_usuario
      }
    });
    return usuarioRol;
  }
}
