const API_BASE = import.meta.env.VITE_API_URL || '';

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const data = contentType && contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message;
    throw new Error(message || 'Request failed');
  }

  return data;
};

export const apiClient = {
  get: async (path, params) => {
    const url = new URL(`/api${path}`, API_BASE || window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value !== 'undefined') {
          url.searchParams.set(key, String(value));
        }
      });
    }
    const response = await fetch(url.toString(), {
      credentials: 'include'
    });
    return handleResponse(response);
  },
  post: async (path, body) => {
    const url = new URL(`/api${path}`, API_BASE || window.location.origin);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },
  delete: async (path, body) => {
    const res = await fetch(API_BASE + path, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body?.data || body)
    });
  
    if (!res.ok) {
      const msg = `Error ${res.status}`;
      throw new Error(msg);
    }
  
    return res.json();
  }
};
