const hasOwnProperty = Object.prototype.hasOwnProperty;

export class ScriptStorage<TData extends object> {
  /**
   * 是否有改变
   */
  changed = false;

  get raw(): Partial<TData> {
    return this.data;
  }

  constructor(private data: Partial<TData>) {}

  getItem<TKey extends keyof TData>(key: TKey): TData[TKey] | undefined {
    return this.data[key];
  }

  setItem<TKey extends keyof TData>(key: TKey, value: TData[TKey]): void {
    this.changed = true;
    this.data[key] = value;
  }

  removeItem(key: keyof TData): void {
    this.changed ||= hasOwnProperty.call(this.data, key);
    delete this.data[key];
  }

  clear(): void {
    this.changed = true;
    this.data = {};
  }
}
