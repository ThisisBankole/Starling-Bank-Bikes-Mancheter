declare module 'config' {
    interface Config {
      API_URL: string;
      // add other properties if needed
    }
  
    const config: Config;
    export default config;
  }