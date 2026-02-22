const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const toCamel = (str: string) => {
    return str.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};

const toSnake = (str: string) => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const keysToCamel = function (o: any): any {
    if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
        const n: any = {};
        Object.keys(o).forEach((k) => {
            n[toCamel(k)] = keysToCamel(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map((i) => keysToCamel(i));
    }
    return o;
};

const keysToSnake = function (o: any): any {
    if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
        const n: any = {};
        Object.keys(o).forEach((k) => {
            n[toSnake(k)] = keysToSnake(o[k]);
        });
        return n;
    } else if (Array.isArray(o)) {
        return o.map((i) => keysToSnake(i));
    }
    return o;
};

export const api = {
    get: async (endpoint: string) => {
        const token = localStorage.getItem('gympro_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, { headers });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('gympro_token');
                localStorage.removeItem('gympro_user');
                window.location.href = '/login';
            }
            throw new Error(`API error: ${response.statusText}`);
        }
        return keysToCamel(await response.json());
    },

    post: async (endpoint: string, data: any) => {
        const token = localStorage.getItem('gympro_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(keysToSnake(data)),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || `API error: ${response.statusText}`);
        }
        return keysToCamel(await response.json());
    },

    put: async (endpoint: string, data: any) => {
        const token = localStorage.getItem('gympro_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(keysToSnake(data)),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || `API error: ${response.statusText}`);
        }
        return keysToCamel(await response.json());
    },

    delete: async (endpoint: string) => {
        const token = localStorage.getItem('gympro_token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || `API error: ${response.statusText}`);
        }
        return keysToCamel(await response.json());
    },
};
