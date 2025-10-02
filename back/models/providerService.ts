import createPool from "../core/db_connection";
import { err } from "../utils/throwError";
import { ExternalUserModel } from "./externalUserModel";


export interface Provider {
  id: number;
  name: string;
  provider_type: string;
  config: Record<string, string>;
  mappings: FieldMapping[];
}

export interface FieldMapping {
  external_field: string;
  internal_claim: string;
  transform?: string;
}

export class ProviderService {

  static async getProvider(providerId: string): Promise<Provider> {
    const connection = await createPool().getConnection();
    try {
      // Get provider info
      const [providerRows] = await connection.query(
        'SELECT id, name, provider_type FROM providers WHERE id = ?',
        [providerId]
      );
      if (providerRows.length === 0) throw new Error(`Provider with id ${providerId} not found`);
      const provider = providerRows[0];

      // Get config
      const [configRows] = await connection.query(
        'SELECT config_key, config_value FROM provider_configs WHERE provider_id = ?',
        [provider.id]
      );

      // Get mappings
      const [mappingRows] = await connection.query(
        'SELECT external_field, internal_claim, transform FROM provider_mappings WHERE provider_id = ?',
        [provider.id]
      );

      return {
        id: provider.id,
        name: provider.name,
        provider_type: provider.provider_type,
        config: Object.fromEntries(configRows.map((row: any) => [row.config_key, row.config_value])),
        mappings: mappingRows.map((row: any) => ({
          external_field: row.external_field,
          internal_claim: row.internal_claim,
          transform: row.transform || undefined
        }))
      };
    } catch (error: any) {
      return err(error)
    } 
    finally {
      connection.release();
    }
  }

  static async createExternalModel(providerOrId: string | Provider): Promise<ExternalUserModel> {
    try {
      let provider: Provider;
      if (typeof providerOrId === 'string') {
        provider = await this.getProvider(providerOrId);
      } else { // todo smth
        provider = providerOrId  
      }
      
      if (provider.provider_type !== 'external_db') {
        throw new Error('Provider is not an external database');
      }

      const requiredConfig = ['db_host', 'db_port', 'db_name', 'db_user', 'db_password', 'user_table'];
      const missing = requiredConfig.filter(key => !provider.config[key]);
      if (missing.length > 0) {
        throw new Error(`Missing required config keys: ${missing.join(', ')}`);
      }

      return new ExternalUserModel({
        db_host: provider.config.db_host,
        db_port: provider.config.db_port,
        db_name: provider.config.db_name,
        db_user: provider.config.db_user,
        db_password: provider.config.db_password,
        user_table: provider.config.user_table,
        mappings: provider.mappings
      });
    } catch (error: any) {
      return err(error)
    }
  }

  static async getProviders() {
    const connection = await createPool().getConnection();
    try {
      // Get provider info
      const [providerRows] = await connection.query(
        'SELECT id, name FROM providers'
      );
      if (providerRows.length === 0) throw new Error(`Providers not found`);

      return providerRows;
    } catch (error: any) {
      return err(error)
    } 
    finally {
      connection.release();
    }
  }

  /**
   * взять данные для подключения к внешней ДБ и мэппинги
   * подключиться к внешней ДБ путём создания инстанса ExternalUserModel
   * получить всех юзеров через ExternalUserModel.getUsers()
   * размэпить полученные столбцы под нужные 
   * вернуть 
   * */
  static async getProviderUsers(providerId: string) {
    try {
      const provider = await this.getProvider(String(providerId))
      const externalUserModel = new ExternalUserModel({
        db_host: provider.config.db_host,
        db_port: provider.config.db_port,
        db_name: provider.config.db_name,
        db_user: provider.config.db_user,
        db_password: provider.config.db_password,
        user_table: provider.config.user_table,
        mappings: provider.mappings
      })
      return await externalUserModel.getUsers()

    } catch (error: any) {
      return err(error)
    }
  }
}
