import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Configuracion} from '../Llaves/configuracion';
import {Credenciales, Usuario, UsuarioRol} from '../models';
import {RolRepository, UsuarioRepository} from '../repositories';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class SesionUsuariosService {
  constructor(
    @repository(UsuarioRepository)
    private usuarioRepository: UsuarioRepository,
    @repository(RolRepository)
    private rolRepository: RolRepository,
  ) { }

  /*
   * Add service methods here
   */

  async IdentificarUsuario(credenciales: Credenciales) {
    console.log("2" + credenciales.usuario);
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.usuario,
        clave: credenciales.clave
      }
    });
    console.log(usuario?.nombre, usuario?.apellidos);

    return usuario;
  }

  // No deja crear varios tokens o solucion desde el frontend
  async GenerarToken(datos: Usuario, ObjrolesUsuario: UsuarioRol[], seleccionado: string | undefined): Promise<string> {
    let token = "";
    let objeto = ObjrolesUsuario.find(usuarioRol => usuarioRol.id_rol === seleccionado);
    let id_rol = objeto?.id_rol;
    console.log("ssasd" + id_rol);


    if (id_rol === undefined) {
      console.log("ERROR");

      return "ERROR ROL NO VALIDO";
    } else {
      let url = `${Configuracion.url_crear_token}?${Configuracion.arg_nombre}=${datos.nombre}&${Configuracion.arg_id_persona}=${datos._id}&${Configuracion.arg_rol}=${id_rol}`;
      await fetch(url)
        .then(async (res: any) => {
          token = await res.text();
        });
      console.log("GENERADO" + token);

      return token;
    }

  }
}
