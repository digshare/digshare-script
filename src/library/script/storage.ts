export class ScriptStorage<TStore> {
  private store: TStore;

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

    this.store[key] = value;
  }

  removeItem(key: keyof TStore): void {
    delete this.store[key];
  }

  clear(): void {
    // eslint-disable-next-line @mufan/no-object-literal-type-assertion
    this.store = {} as TStore;
  }
}
