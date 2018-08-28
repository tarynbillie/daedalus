// @flow strict

export interface LogEntry {
  topics: string[];
}

export interface Receipt {
  logs: LogEntry[];
}
