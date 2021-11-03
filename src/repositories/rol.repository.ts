import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Rol, RolRelations, Permiso, PermisoRol} from '../models';
import {PermisoRolRepository} from './permiso-rol.repository';
import {PermisoRepository} from './permiso.repository';

export class RolRepository extends DefaultCrudRepository<
  Rol,
  typeof Rol.prototype._id,
  RolRelations
> {

  public readonly tiene_permisos: HasManyThroughRepositoryFactory<Permiso, typeof Permiso.prototype._id,
          PermisoRol,
          typeof Rol.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermisoRolRepository') protected permisoRolRepositoryGetter: Getter<PermisoRolRepository>, @repository.getter('PermisoRepository') protected permisoRepositoryGetter: Getter<PermisoRepository>,
  ) {
    super(Rol, dataSource);
    this.tiene_permisos = this.createHasManyThroughRepositoryFactoryFor('tiene_permisos', permisoRepositoryGetter, permisoRolRepositoryGetter,);
    this.registerInclusionResolver('tiene_permisos', this.tiene_permisos.inclusionResolver);
  }
}
