/* Controlador gestiona los usuarios creados*/
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Configuracion} from '../Llaves/configuracion';
import {CambioClave, CredencialesLogin, NotificacionCorreo, Usuario} from '../models';
import {CredencialesRecuperarClave} from '../models/credenciales-recuperar-clave.model';
import {NotificacionSms} from '../models/notificacion-sms.model';
//import {NotificacionCorreo, Usuario} from '../models';
import {RolRepository, UsuarioRepository, UsuarioRolRepository} from '../repositories';
import {AdministradorClavesService, NotificacionesService, SesionUsuariosService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(UsuarioRolRepository)
    public usuarioRolRepository: UsuarioRolRepository,
    @repository(RolRepository)
    public rolRepository: RolRepository,
    @service(AdministradorClavesService)
    public servicioClaves: AdministradorClavesService,
    @service(NotificacionesService)
    public servivioNotificaciones: NotificacionesService,
    @service(SesionUsuariosService)
    private sesionUsuariosService: SesionUsuariosService,
  ) { }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    let clave = this.servicioClaves.CrearClaveAleatoria();

    let claveCifrada = this.servicioClaves.CifrarTexto(clave);
    usuario.clave = claveCifrada

    let usuarioCreado = await this.usuarioRepository.create(usuario);
    console.log(usuarioCreado);


    if (usuarioCreado) {
      // enviar clave por Correo o mensaje
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.correo;
      datos.asunto = Configuracion.asuntoCreacionUsuario;
      datos.mensaje = `Hola ${usuario.nombre} <br/> ${Configuracion.mensajeCreacionUsuario} ${clave}`
      this.servivioNotificaciones.EnviarCorreo(datos)
    }
    return usuarioCreado;
  }

  @post('/buscarUser')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async createUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario | null> {
    let clave = this.servicioClaves.CrearClaveAleatoria();

    let claveCifrada = this.servicioClaves.CifrarTexto(clave);
    usuario.clave = claveCifrada

    let usuarioCEncontrado = await this.usuarioRepository.findOne({
      where: {
        nombre: usuario.nombre
      }
    });
    console.log(usuarioCEncontrado);


    /*    if (usuarioCreado) {
         let datos = new NotificacionCorreo();
         datos.destinatario = usuario.correo;
         datos.asunto = Configuracion.asuntoCreacionUsuario;
         datos.mensaje = `Hola ${usuario.nombre} <br/> ${Configuracion.mensajeCreacionUsuario} ${clave}`
         this.servivioNotificaciones.EnviarCorreo(datos)
       } */
    return usuarioCEncontrado;
  }

  @post('/usuarioJurado')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async createJurado(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    let clave = this.servicioClaves.CrearClaveAleatoria();

    let claveCifrada = this.servicioClaves.CifrarTexto(clave);
    usuario.clave = claveCifrada

    let usuarioCreado = await this.usuarioRepository.create(usuario);

    if (usuarioCreado) {
      // enviar clave por Correo o mensaje
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.correo;
      datos.asunto = Configuracion.asuntoCreacionUsuario;
      datos.mensaje = `Hola ${usuario.nombre} <br/> ${Configuracion.mensajeCreacionUsuario} ${clave}`
      this.servivioNotificaciones.EnviarCorreo(datos)
      let url = `${Configuracion.urlA??adirRolJurado}?${Configuracion.arg_id_usuario}=${usuarioCreado._id}&${Configuracion.arg_id_rol}=${Configuracion.idDeRolJurado}`
      let usuarioRol = null;
      await fetch(url)
        .then(async (res: any) => {
          usuarioRol = await res;
        })

    }
    return usuarioCreado;
  }


  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/lista-usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    let usuario = this.usuarioRepository.findById(id, filter);
    console.log("USER" + usuario);
    return usuario;
  }

  @get('/usuarios-correo/{correo}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findBycorreito(
    @param.path.string('correo') correo: string
  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: correo
      }
    });

    return usuario;
  }

  @get('/usuarios-correo2/{correo}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findBycorreito2(
    @param.path.string('correo') correo: string
  ): Promise<Usuario | null | string> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: correo
      }
    });

    if (usuario) {
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario?.correo;
      datos.asunto = Configuracion.asuntoInvitacion;
      datos.mensaje = `Hola ${usuario.nombre} <br/> ${Configuracion.mensajeInvitacion}`
      this.servivioNotificaciones.EnviarCorreo(datos)
    }

    return usuario;
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
    content: { //coloque esto
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<any> {
    await this.usuarioRepository.replaceById(id, usuario); // coloque el return
    return usuario
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificaci??n de usuarios',
    content: {'application/json': {schema: getModelSchemaRef(CredencialesLogin)}},
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredencialesLogin, {
            title: 'Identificar Usuario'
          }),
        },
      },
    })
    credenciales: CredencialesLogin,
  ): Promise<object | null> {
    console.log(credenciales.usuario, credenciales.clave);
    let usuario = await this.sesionUsuariosService.IdentificarUsuario(credenciales);
    let tk = "";
    let ObjrolesUsuario = [];
    console.log(usuario);

    if (usuario) {
      console.log("SI LO ENCONTRO PIROBO" + usuario.nombre, usuario.clave);

      usuario.clave = "";
      ObjrolesUsuario = await this.usuarioRolRepository.find({
        where: {
          id_usuario: usuario._id
        }
      });
      console.log(ObjrolesUsuario);
      let seleccionadoObj = await ObjrolesUsuario.find(elemento => elemento.id_rol == credenciales.rol);//"616dad9c8858b727d83b3390" IDAdminRol
      console.log("eiconmewmoimc" + seleccionadoObj);

      if (seleccionadoObj) {
        let seleccionado = seleccionadoObj?.id_rol
        tk = await this.sesionUsuariosService.GenerarToken(usuario, ObjrolesUsuario, seleccionado)
        console.log("TOKEN" + tk);
      }
    }
    if (tk === "") {
      return {
        tokens: "",
        usuario: null
      }
    }
    return {
      tokens: tk,
      usuario: usuario
    };
  }

  @post('/cambiar-clave')
  @response(200, {
    description: 'Cambio de clave de usuarios',
    content: {'application/json': {schema: getModelSchemaRef(CambioClave)}},
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CambioClave, {
            title: 'Cambio de clave del Usuario'
          }),
        },
      },
    })
    credencialesClave: CambioClave,
  ): Promise<Boolean> {
    let usuario = await this.servicioClaves.CambiarClave(credencialesClave);
    console.log("USUARIO" + usuario);
    if (usuario) {
      //Notificacion por correo o sms
      let datos = new NotificacionCorreo();
      datos.destinatario = usuario.correo;
      datos.asunto = Configuracion.asuntoCambioClave;
      datos.mensaje = `Hola ${usuario.nombre} <br/> ${Configuracion.mensajeCambioClave}`
      this.servivioNotificaciones.EnviarCorreo(datos)
    }
    return usuario != null;
  }

  @post('/recuperar-clave')
  @response(200, {
    description: 'Recuperar clave de usuarios',
    content: {'application/json': {schema: {}}},
  })
  async recuperarClave(
    @requestBody({
      content: {
        'application/json': {
        },
      },
    })
    credenciales: CredencialesRecuperarClave,
  ): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo
      }
    });
    if (usuario) {
      //Notificacion sms de la nueva contrase??a
      let clave = this.servicioClaves.CrearClaveAleatoria();
      console.log(clave);
      let claveCifrada = this.servicioClaves.CifrarTexto(clave);
      usuario.clave = this.servicioClaves.CifrarTexto(clave);
      await this.usuarioRepository.updateById(usuario._id, usuario)
      console.log(claveCifrada);
      let datos = new NotificacionSms();
      datos.destino = usuario.celular;
      datos.mensaje = `Hola ${usuario.nombre} ${Configuracion.mensajeRecuperarClave} ${clave}`
      this.servivioNotificaciones.EnviarSms(datos)
    }
    return usuario
  }
}


