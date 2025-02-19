// import { getApiUrl } from '@kyma-project/common';
// @kyma-project/common is deprecated

// const domain = getApiUrl('domain');
const domain = '';

const config = {
  queryEndpoint: `https://loki.${domain}/api/prom/query`,
  labelEndpoint: `https://loki.${domain}/api/prom/label`,
  resourceLabels: resource =>
    `https://loki.${domain}/api/prom/label/${resource}/values`,

  // graphqlApiUrl: `https://busola-backend.${domain}/graphql`,
  // subscriptionsApiUrl: `wss://busola-backend.${domain}/graphql`,
};

export default { ...config };
