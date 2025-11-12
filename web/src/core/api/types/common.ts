export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type JsonArray = JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export type Nullable<T> = T | null;
export type ISODateString = string;
