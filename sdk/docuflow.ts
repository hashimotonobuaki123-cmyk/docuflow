export type DocuFlowClientOptions = {
  baseUrl?: string;
  apiKey: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  category: string | null;
  summary: string | null;
  tags: string[] | null;
  created_at: string;
};

export type DocumentDetail = DocumentSummary & {
  raw_content: string | null;
};

export class DocuFlowClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: DocuFlowClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://docuflow-azure.vercel.app";
    this.apiKey = options.apiKey;
  }

  private buildHeaders() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
    };
  }

  async listDocuments(): Promise<DocumentSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/documents`, {
      method: "GET",
      headers: this.buildHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list documents: ${res.status}`);
    }

    const json = (await res.json()) as { documents: DocumentSummary[] };
    return json.documents;
  }

  async getDocument(id: string): Promise<DocumentDetail> {
    const res = await fetch(`${this.baseUrl}/api/documents/${id}`, {
      method: "GET",
      headers: this.buildHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to get document: ${res.status}`);
    }

    const json = (await res.json()) as { document: DocumentDetail };
    return json.document;
  }
}


