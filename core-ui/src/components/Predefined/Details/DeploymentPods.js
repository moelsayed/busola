import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function DeploymentPods(resource) {
  if (!resource) return null;
  const labelSelectors = Object.entries(resource.spec.selector.matchLabels)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');

  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${resource.metadata.namespace}/pods?labelSelector=${labelSelectors}`,
    resourceType: 'pods',
    namespace: resource.metadata.namespace,
    isCompact: true,
    showTitle: true,
  };
  return <ComponentForList name="podsList" params={podListParams} />;
}
