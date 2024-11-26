export class ChronoflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ChronoflowError";
  }
}

export class BoardError extends ChronoflowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "BOARD_ERROR", context);
    this.name = "BoardError";
  }
}

export class CardError extends ChronoflowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CARD_ERROR", context);
    this.name = "CardError";
  }
}

export class StorageError extends ChronoflowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "STORAGE_ERROR", context);
    this.name = "StorageError";
  }
}

export class APIError extends ChronoflowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "API_ERROR", context);
    this.name = "APIError";
  }
}
