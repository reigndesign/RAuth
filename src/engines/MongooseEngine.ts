import { Document, Model } from 'mongoose';
import { StrictSessionRegister } from '../session/Session';
import { ConnectionStore } from '../store/ConnectionStore';
import { Engine } from '../store/Engine';
import { Register } from '../store/Register';

declare global {
  interface EngineNames {
    'Mongoose': typeof MongooseEngine;
  }
}

interface RegisterDoc extends Document {}

export class MongooseEngine implements Engine {
  model: Model<RegisterDoc, {}>;
  constructor({ model }: { model?: Model<RegisterDoc> } = {}) {
    if (!model) {
      throw new Error('Require Model');
    }

    this.model = model;
  }
  async deleteById(sessionId: string): Promise<boolean> {
    await this.model.deleteOne({ sessionId });
    return true;
  }

  async deleteByIds(sessionIds: string[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    await this.model.deleteMany({ userId }).lean();
    return true;
  }

  async update(register: Register, sets: any): Promise<Register> {
    return <any>this.model.findOneAndUpdate(
      {
        sessionId: register.sessionId,
      },
      {
        $set: sets,
      },
      {
        new: true,
      },
    ).lean();
  }

  async findById(sessionId: string): Promise<Register> {
    return <any>this.model.findOne({ sessionId }).lean();
  }

  async findByUserId(userId: string): Promise<Register[]> {
    return <any>this.model.find({ userId }).lean();
  }

  async create(sessionRegister: StrictSessionRegister): Promise<Register> {
    const doc = await this.model.create(sessionRegister);
    return <any>doc.toJSON();
  }
}

ConnectionStore.add('Mongoose', MongooseEngine);
