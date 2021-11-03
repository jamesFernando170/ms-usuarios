import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {Configuracion} from '../Llaves/configuracion';
import {NotificacionCorreo} from '../models/notificacion-correo.model';
import {NotificacionSms} from '../models/notificacion-sms.model';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */

  EnviarCorreo(datos: NotificacionCorreo) {
    let url = `${Configuracion.urlCorreo}?destino=${datos.destinatario}&asunto=${datos.asunto}&mensaje=${datos.mensaje}&hash=${Configuracion.hashNotificacion}`;
    fetch(url)
      .then((res: any) => {
        console.log(res.text());
      })
  }

  EnviarSms(datos: NotificacionSms) {
    let url = `${Configuracion.urlSms}?destino=${datos.destino}&mensaje=${datos.mensaje}&hash=${Configuracion.hashNotificacion}`;
    fetch(url)
      .then((res: any) => {
        console.log(res.text());
      })
  }
}
