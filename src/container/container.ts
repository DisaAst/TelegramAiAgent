import { IContainer } from './types';

export class Container implements IContainer {
  private dependencies = new Map<symbol, () => any>();
  private instances = new Map<symbol, any>();

  bind<T>(token: symbol, factory: () => T): void {
    this.dependencies.set(token, factory);
  }

  get<T>(token: symbol): T {
    // Return cached instance if exists
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    // Create new instance
    const factory = this.dependencies.get(token);
    if (!factory) {
      throw new Error(`No binding found for token: ${token.toString()}`);
    }

    const instance = factory();
    this.instances.set(token, instance);
    return instance;
  }

  resolve<T>(constructor: new (...args: any[]) => T): T {
    return new constructor();
  }

  clear(): void {
    this.dependencies.clear();
    this.instances.clear();
  }
}

export const container = new Container(); 