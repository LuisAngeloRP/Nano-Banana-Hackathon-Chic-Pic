import { Garment, Model, StyledLook } from '@/types';
import { migrateGarmentsList } from './migrationUtils';

// Simulación de almacenamiento local hasta integrar una base de datos
export class LocalStorage {
  private static getItems<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  private static setItems<T>(key: string, items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Gestión de prendas
  static getGarments(): Garment[] {
    const rawGarments = this.getItems<any>('chic-pic-garments');
    // Migrar prendas del formato anterior al nuevo si es necesario
    return migrateGarmentsList(rawGarments);
  }

  static addGarment(garment: Omit<Garment, 'id' | 'createdAt'>): Garment {
    const newGarment: Garment = {
      ...garment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    const garments = this.getGarments();
    garments.push(newGarment);
    this.setItems('chic-pic-garments', garments);
    return newGarment;
  }

  static deleteGarment(id: string): void {
    const garments = this.getGarments().filter(g => g.id !== id);
    this.setItems('chic-pic-garments', garments);
  }

  static updateGarment(id: string, updatedGarment: Garment): void {
    const garments = this.getGarments();
    const index = garments.findIndex(g => g.id === id);
    if (index !== -1) {
      garments[index] = { ...updatedGarment, id };
      this.setItems('chic-pic-garments', garments);
    }
  }

  // Gestión de modelos
  static getModels(): Model[] {
    return this.getItems<Model>('chic-pic-models');
  }

  static addModel(model: Omit<Model, 'id' | 'createdAt'>): Model {
    const newModel: Model = {
      ...model,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    const models = this.getModels();
    models.push(newModel);
    this.setItems('chic-pic-models', models);
    return newModel;
  }

  static deleteModel(id: string): void {
    const models = this.getModels().filter(m => m.id !== id);
    this.setItems('chic-pic-models', models);
  }

  static updateModel(id: string, updatedModel: Model): void {
    const models = this.getModels();
    const index = models.findIndex(m => m.id === id);
    if (index !== -1) {
      models[index] = { ...updatedModel, id };
      this.setItems('chic-pic-models', models);
    }
  }

  // Gestión de looks estilizados
  static getStyledLooks(): StyledLook[] {
    return this.getItems<StyledLook>('chic-pic-styled-looks');
  }

  static addStyledLook(look: Omit<StyledLook, 'id' | 'createdAt'>): StyledLook {
    const newLook: StyledLook = {
      ...look,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    const looks = this.getStyledLooks();
    looks.push(newLook);
    this.setItems('chic-pic-styled-looks', looks);
    return newLook;
  }

  static deleteStyledLook(id: string): void {
    const looks = this.getStyledLooks().filter(l => l.id !== id);
    this.setItems('chic-pic-styled-looks', looks);
  }

  static updateStyledLook(id: string, updatedLook: StyledLook): void {
    const looks = this.getStyledLooks();
    const index = looks.findIndex(l => l.id === id);
    if (index !== -1) {
      looks[index] = { ...updatedLook, id };
      this.setItems('chic-pic-styled-looks', looks);
    }
  }
}
