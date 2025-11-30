import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '../../context';

const Breadcrumbs = React.memo(() => {
  const { breadcrumbs } = useBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 bg-surface-elevated px-6 py-1 rounded-b-lg border-b border-border z-10">
      {breadcrumbs &&
        breadcrumbs.map((crumb, idx) => (
          <div className="flex items-center gap-2" key={idx}>
            {idx === 0 && (
              <Link to="/" className="text-text-muted hover:text-text">
                <Home className="w-4 h-4" />
              </Link>
            )}
            <div className="flex items-center">
              <Link to={crumb.href} className={`hover:text-text font-medium text-xs ${idx === breadcrumbs.length - 1 ? 'text-brand' : 'text-text'}`}>
                {crumb.label}
              </Link>
              {idx !== breadcrumbs.length - 1 && <span className="mx-2 text-text-muted">{'>'}</span>}
            </div>
          </div>
        ))}
    </nav>
  );
});

export default Breadcrumbs;
