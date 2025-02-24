import { getNavConfig } from '../_utils/generate-nav-config';
import { DocsBreadcrumbs } from './docs-breadcrumbs';

export async function DocsNavigationProvider() {
  const config = await getNavConfig();

  return <DocsBreadcrumbs nav={config.sidebarNav} />;
}
