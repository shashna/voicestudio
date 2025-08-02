// entities/Project.js

export class Project {
  static async create(data) {
    // In a real app, this would save to a DB or cloud storage
    // For now, just return what you give it
    return {
      ...data,
      id: Date.now()
    };
  }
}
