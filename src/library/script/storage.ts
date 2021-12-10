export class ScriptStorage<TStore> {
  private store: TStore;

  /**
   * 是否有改变
   */
  changed = false;

  get raw(): TStore | undefined {
    return Object.keys(this.store).length ? this.store : undefined;
  }

  constructor(store: TStore) {
    this.store = store ? Object(store) : {};
  }

  getItem<TKey extends keyof TStore>(key: TKey): TStore[TKey] | undefined {
    return this.store[key];
  }

  setItem<TKey extends keyof TStore>(key: TKey, value: TStore[TKey]): void {
    if (typeof this.store !== 'object') {
      // eslint-disable-next-line @mufan/no-object-literal-type-assertion
      this.store = {} as TStore;
    }

    this.changed ||= this.store[key] !== value;
    this.store[key] = value;
  }

  removeItem(key: keyof TStore): void {
    this.changed ||= key in this.store;
    delete this.store[key];
  }

  clear(): void {
    this.changed = true;
    // eslint-disable-next-line @mufan/no-object-literal-type-assertion
    this.store = {} as TStore;
  }
}
