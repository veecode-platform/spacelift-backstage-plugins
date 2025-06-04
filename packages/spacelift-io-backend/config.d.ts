export interface Config {
  spacelift: {
    hostUrl: string;
    apiKey: string;
    /**
     * @visibility secret
     */
    apiSecret: string;
  };
}
