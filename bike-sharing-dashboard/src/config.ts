const env = process.env.NODE_ENV || 'development';

interface Config {
  API_URL: string;
  // add other properties if needed
}

const config: {[key:string]: Config} = {
  development: {
    API_URL: 'http://localhost:8000/api/v1'
    // other development-specific configurations
    }
//   production: {
//     API_URL: 'https://owabackend-amcsfyfmaqb2edhn.ukwest-01.azurewebsites.net/api', 
//     // other production-specific configurations
//   }
};

// Debug log to see which environment and URL is being used
console.log('Current environment:', env);
console.log('Using API URL:', config[env].API_URL);

export default config[env];