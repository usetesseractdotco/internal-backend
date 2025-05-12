type RemoveNull<T> = { [Key in keyof T]: NonNullable<T[Key]> }

export type { RemoveNull }
