export interface Page<T> {
  content: T[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface NamedEntity {
  id: string;
  name: string;
}
