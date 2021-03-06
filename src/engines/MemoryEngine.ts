import { Engine } from '../store/Engine';
import { ConnectionStore } from '../store/ConnectionStore';
import { Register } from '../store/Register';
import { StrictSessionRegister } from '../session/Session';
import uuid = require('uuid');

declare global {
  interface EngineNames {
    'Memory': typeof MemoryEngine;
  }
}

export class MemoryEngine implements Engine {
  private memory: Map<string, Register>;

  constructor(option?: any) {
    this.memory = new Map();
  }

  async deleteById(sessionId: string): Promise<boolean> {
    return this.memory.delete(sessionId);
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const sessions = [...this.memory.entries()].filter(([, entry]) => {
      return entry.userId === userId;
    });

    return sessions.every(([sessionId]) => this.memory.delete(sessionId));
  }

  async deleteByIds(sessionIds: string[]): Promise<boolean> {
    const results = await Promise.all(sessionIds.map(
      sessionId => this.deleteById(sessionId),
    ));

    return results.every(result => result);
  }

  async update(register: Register, sets: any): Promise<Register> {
    if (!register.sessionId) return register;

    const registerValue: Register = <Register>this.memory.get(register.sessionId);

    this.memory.set(register.sessionId, {
      ...registerValue,
      ...sets,
    });

    return <Register>this.memory.get(register.sessionId);
  }

  async findById(sessionId: string): Promise<Register> {
    return <Register>this.memory.get(sessionId);
  }

  async findByUserId(userId: string): Promise<Register[]> {
    return [...this.memory.values()].filter(register => register.userId === userId);
  }

  async create(sessionRegister: StrictSessionRegister): Promise<Register> {
    const sessionId = sessionRegister.sessionId || uuid();
    this.memory.set(sessionId, {
      sessionId,
      ...sessionRegister,
    });
    return <Register>this.memory.get(sessionId);
  }
}

ConnectionStore.add('Memory', MemoryEngine);
