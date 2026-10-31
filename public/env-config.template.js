// Runtime configuration, read through window.__RMU_CONFIG__ (see webpack.config.ts).
// The Docker image renders this file into env-config.js with envsubst (docker/40-env-config.sh);
// the webpack dev server serves the same keys from .env. Only public values belong here.
// When strategic runs inside the shell, the shell's env-config.js is the one in effect.
window.__RMU_CONFIG__ = {
  // Static assets (images, locales).
  RMU_MFE_ASSETS_URI: '${RMU_MFE_ASSETS_URI}',
  // User uploads (`uploads/...`), read by rmu-react-shared-lib. Defaults to /media/.
  RMU_MFE_MEDIA_URI: '${RMU_MFE_MEDIA_URI}',
  // APIs, read by strategic and by rmu-react-shared-lib.
  RMU_API_CORE_URI: '${RMU_API_CORE_URI}',
  RMU_API_STRATEGIC_URI: '${RMU_API_STRATEGIC_URI}',
  RMU_API_TACTICAL_URI: '${RMU_API_TACTICAL_URI}',
  RMU_API_ATTACK_TABLES_URI: '${RMU_API_ATTACK_TABLES_URI}',
  RMU_API_ITEMS_URI: '${RMU_API_ITEMS_URI}',
  RMU_API_NPC_NAMES_URI: '${RMU_API_NPC_NAMES_URI}',
  RMU_API_NPCS_URI: '${RMU_API_NPCS_URI}',
  RMU_API_SPELLS_URI: '${RMU_API_SPELLS_URI}',
  RMU_API_MEDIA_URI: '${RMU_API_MEDIA_URI}',
};
