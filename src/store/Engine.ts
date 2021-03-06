import { StrictSessionRegister } from '../session/Session';
import { Register } from './Register';

export type EngineOptions = {};

/**
 * Definición de la db o entidad para almacenar
 */
export declare class Engine {
  constructor(options?: EngineOptions);
  deleteById(sessionId: string): Promise<boolean>;
  deleteByIds?(sessionIds: string[]): Promise<boolean>;
  deleteByUserId(userId: string): Promise<boolean>;
  update(register: Register, sets: any): Promise<Register>;
  findById(sessionId: string): Promise<Register>;
  findByUserId(userId: string): Promise<Register[]>;
  create(sessionRegister: StrictSessionRegister): Promise<Register>;
  [property: string]: any;
}
