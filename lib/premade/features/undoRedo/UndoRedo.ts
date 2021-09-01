export class UndoRedo<T> {
  #previousValue: T | null;
  undoStack: T[];
  redoStack: T[];

  constructor() {
    this.#previousValue = null;
    this.undoStack = [];
    this.redoStack = [];
  }

  public getStack() {
    return { undoStack: this.undoStack, redoStack: this.redoStack };
  }

  public isUndoable() {
    return this.undoStack.length > 0;
  }

  public isRedoable() {
    return this.redoStack.length > 0;
  }

  public undo() {
    const undoValue = this.undoStack.pop();

    if (!undoValue) return;

    this.#previousValue && this.redoStack.push(this.#previousValue);
    this.#previousValue = undoValue;

    return undoValue;
  }

  public redo() {
    const redoValue = this.redoStack.pop();

    if (!redoValue) return;

    this.#previousValue && this.undoStack.push(this.#previousValue);
    this.#previousValue = redoValue;

    return redoValue;
  }

  public save(value: T) {
    this.#previousValue && this.undoStack.push(this.#previousValue);

    this.#previousValue = value;

    this.redoStack = [];
  }
};
