interface GoogleServiceAccountCredentials {
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
  universe_domain: string;
}

const credentials: GoogleServiceAccountCredentials = {
  "type": "service_account",
  "project_id": "frontedwebmedmaster",
  "private_key_id": "f785d338d8824ffc910817f1d82d37cb8f7df1b0",
  // eslint-disable-next-line max-len
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2HbXie64FRD8n\nec8vwWn9oHsH6ALH09ximPvqRWUFsx7UtC3MUD6XluMFuzsQ5HyTxg2vnY5LCP6B\n5PWUnXXE49r5kx2xuNRV1pr7Ewd98o/31HJzlNy2m60nEscziInvrD0PKrr+GNEg\niUPi6swiv4RF3kb+lkDMh4D4g/6tO6yJKgTLbcUn3EhoP9dSq2oeV8Soz9/xPkuf\nOVwbHN1XFOv8zVeo7Ey4817hLMJ1uee6tg5eFw3JQtlnuWKjIjcSCylM79+yV8nX\n2Bj+OkkWcabk8BHxq+wGMy7MZ8rKYgblryQNNvQI5GN0paz7/z9tDKPn+3YeNlrG\nnjdPbY8HAgMBAAECggEAEry3etARz/3nvNvbVW+sxDO6OiPaAWL1W6RKKvOCg4Bx\n4sg6UWP3hKjkE7IMpN4f885JQzEj3j7UfLB+FJEneEn0kiqw6pj4fm/AQ1EqZgAf\nuuETTiavQg8oqgqpuc4fBFdFcvreVrKz9YkvQGNlpwpAWuCV5QS4MbLxXIsBbXji\nqocbEDN4Rosx7dGz9Z39AcReGWRKceJJyLYh8ZE5eEZsjmrSHsEE7T9KotGR1Trw\nORansGO4Y5K8ASyFQaBPUkIKH4ZyoK0o2xGtZR2erogLROhBBbZ36tHQq8OusuCg\nIIEhtUUmw14whu0CkuZwp6U8ODYSMJAEKtw4TqGaPQKBgQDfvICOtKb3vW0xYkfW\nmuFpVvMlf1IAWAIAC1RCDfmChy9mHGyThkhArR/5fmimvsvHH5m6StaLTUo2YtXR\nldFhe1ptlqezlamIcXrfgV5ivkITWMmZOVy0+adxHqkn2DX20Nzv1N+71OtCUnaW\nI7Olc4YdCDp6I5CDhfCIurBjuwKBgQDQYL7J3MtnThfgTp5UIVfxAcIcwdd63hWz\n1t7bVHBKuiIfm5gbWoP3DavnJnSIFyhwXzeb+ajs3f7Q5gCgRvinRglQIDyWORMp\nhElgO9qY/sRMNFVgDKu2/zebrUnPOZmAFUeP7MfTfZKPsXK4QwL1Eko8OmZc1qq/\nrInZHxqfJQKBgEN5wTfIqdZrbaQIJOxHF5ZCX+A+LsflwuyqfgXR2x8PkC72gZRY\nWjAPRmZjRkKLpj9ue1lguqWWcLxIQH4N9fC1WAdW+UrC5zc8Kjd/96xF/v2AuIQa\ndagq5uHJwnA+17+RLCC0jalDRJRi9FrBd6t9VMQquCAf27Sez3UdAJeDAoGBAM/n\ndvQZI6iStifKyRXPntqLkoz2qnOgma6xN/FFsjQcumcm6wB/syMPtPAP4jzWPjbA\nCc/JrM2IQPFUSlOf+/+JVUlooIqRr5jAsCUgEt6LcndFz9jhS4Jt6aGdqALlyU2N\n7bSf3lAY/d34giluUskJ0p989Ryz4fETyQWkjv8xAoGAcfpjy3EKTi36Sii5DWpB\nxGHJH7I/QhrcYbisdqav/ioiKPaAb7LPayd9q5r5Ke5U1w2WB5v7g5jZ1HCXAjYM\nC9o0VAIuLNIG8+XkG0cqn+mC7WzvwAdY7K5LEFH+RWbTJG9L/0F235+OiQrQMZx+\nGTCnso1Fn06TYR+hQfJkndI=\n-----END PRIVATE KEY-----\n",
  "client_email": "ocrmed@frontedwebmedmaster.iam.gserviceaccount.com",
  "client_id": "113498528308356667132",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/ocrmed%40frontedwebmedmaster.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com",
};

export default credentials;
