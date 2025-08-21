const getEnvVar = (key, defaultValue) => {
  
  // Prioridad 1: Variables de window.ENV (runtime)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    const value = window.ENV[key];
    console.log(`🔧 ${key}: ${value} (from window.ENV)`);
    return value;
  }
  
  // Prioridad 2: Variables de process.env (build time)
  if (process.env[key]) {
    const value = process.env[key];
    console.log(`🔧 ${key}: ${value} (from process.env)`);
    return value;
  }
  
  // Prioridad 3: Valor por defecto
  console.log(`🔧 ${key}: ${defaultValue} (default)`);
  return defaultValue;
};

export const RMU_API_CORE_URL = getEnvVar('RMU_API_CORE_URL', 'http://api-core.rmu.local/v1');
export const RMU_API_STRATEGIC_URL = getEnvVar('RMU_API_STRATEGIC_URL', 'http://api-strategic.rmu.local/v1');
export const RMU_FE_STRATEGIC_PUBLIC_PATH = getEnvVar('RMU_FE_STRATEGIC_PUBLIC_PATH', 'http://localhost:8082/');
export const NODE_ENV = getEnvVar('NODE_ENV', 'production');

// Log de configuración completa
console.log('🌍 Configuración de entorno:', {
  RMU_API_CORE_URL,
  RMU_API_STRATEGIC_URL,
  RMU_FE_STRATEGIC_PUBLIC_PATH,
  NODE_ENV,
  windowENV: typeof window !== 'undefined' ? window.ENV : 'undefined'
});