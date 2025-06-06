// functions/src/lib/credentials/vision-service-account.d.ts

declare const credentials: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain?: string; // Es opcional si a veces no está en tu JSON
    // Si tu JSON tiene otras propiedades, añádelas aquí también con su tipo (string, number, boolean, etc.)
  };

export default credentials;
