

interface Config {
  API_URL: string;
 
}

const env = import.meta.env.MODE;

const config: {[key:string]: Config} = {
  development: {
    // Local Worker (wrangler dev) serving the API from D1
    API_URL: 'http://localhost:8787/api/v1'
    },
  production: {
    // Same origin: the Worker serves both the static frontend and /api/v1
    API_URL: '/api/v1',
  }
};

// Debug log to see which environment and URL is being used
console.log('Current environment:', env);
console.log('Using API URL:', config[env].API_URL);

export default config[env];