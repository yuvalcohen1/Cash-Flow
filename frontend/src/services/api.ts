class ApiService {
  private baseUrl = "http://localhost:3000/api";

  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  async getMe(token: string) {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  async getTransactions(token: string, params: any = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(
      `${this.baseUrl}/transactions?${queryParams}`,
      {
        headers: this.getHeaders(token),
      }
    );
    return response.json();
  }

  async createTransaction(token: string, transaction: any) {
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(transaction),
    });
    return response.json();
  }

  async updateTransaction(token: string, id: number, transaction: any) {
    const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
      method: "PUT",
      headers: this.getHeaders(token),
      body: JSON.stringify(transaction),
    });
    return response.json();
  }

  async deleteTransaction(token: string, id: number) {
    const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  async getCategories(token: string, type?: string) {
    const queryParams = type ? `?type=${type}` : "";
    const response = await fetch(`${this.baseUrl}/categories${queryParams}`, {
      headers: this.getHeaders(token),
    });
    return response.json();
  }

  async getSummary(
    token: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await fetch(`${this.baseUrl}/charts/summary?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch summary");
    return response.json();
  }

  async getTrends(
    token: string,
    period?: string,
    months?: number,
    year?: number
  ) {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (months) params.append("months", months.toString());
    if (year) params.append("year", year.toString());

    const response = await fetch(`${this.baseUrl}/charts/trends?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch trends");
    return response.json();
  }

  async getCategoryBreakdown(
    token: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    if (period) params.append("period", period);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await fetch(
      `${this.baseUrl}/charts/category-breakdown?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch category breakdown");
    return response.json();
  }

  // AI Reports endpoints (FastAPI server on port 8000)
  private reportsBaseUrl = "http://localhost:8000/api/v1/reports";

  async generateAIReport(token: string, startDate?: string, endDate?: string) {
    const body: any = {};
    if (startDate) body.start_date = startDate;
    if (endDate) body.end_date = endDate;

    const response = await fetch(`${this.reportsBaseUrl}/generate`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate report");
    }

    return response.json();
  }

  async getInsights(token: string, startDate?: string, endDate?: string) {
    const body: any = {};
    if (startDate) body.start_date = startDate;
    if (endDate) body.end_date = endDate;

    const response = await fetch(`${this.reportsBaseUrl}/insights`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get insights");
    }

    return response.json();
  }
}

export const api = new ApiService();
