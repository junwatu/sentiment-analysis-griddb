// Types for GridDB errors
export class GridDBError extends Error {
    constructor(message, code, status, details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
        this.name = 'GridDBError';
    }
}
