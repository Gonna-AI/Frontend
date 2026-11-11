import React from 'react';
import { isStaleBuildError, reloadForNewBuild } from './staleBuild';

/**
 * React.lazy for route pages that survives a deploy happening while the tab is open.
 *
 * A failed load, or a module that arrives without a component, means the page file belongs to an
 * older build: reload once (see staleBuild.ts). While the reload happens the promise stays pending,
 * so React keeps showing the loading state instead of an error.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  _chunkName?: string,
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      if (!module || !module.default) throw new Error('Importing a module script failed: the page file was empty');
      return module;
    } catch (error) {
      if (isStaleBuildError(error) && reloadForNewBuild()) return new Promise<{ default: T }>(() => undefined);
      throw error;
    }
  });
}
