import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Users, Edit, Trash2, MoreVertical, Building2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import CommitteeCard from '../../../components/ui/CommitteeCard';
import { formatDate } from '../../../utils/dateUtils';

const CouncilCard = ({ council, onEdit, onDelete, onCommitteeEdit, onCommitteeDelete }) => {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';
  const [isExpanded, setIsExpanded] = useState(false);

  const committees = council?.Committees || council?.committees || [];
  const hasCommittees = committees && committees.length > 0;

  const handleCouncilClick = e => {
    if (e.target.closest('button')) {
      return;
    }
    // Navigate to council details if route exists
    // navigate(`/councils/${council.id || council.Id}`);
  };

  const getStatusBadgeClasses = () => {
    const isActive = council?.IsActive ?? council?.isActive;
    if (isActive) {
      return 'bg-green-500/10 text-green-500 border border-green-500';
    }
    return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const getStatusLabel = () => {
    const isActive = council?.IsActive ?? council?.isActive;
    return isActive ? t('status.active') : t('status.inactive');
  };

  return (
    <Card className="p-6 mb-4">
      <div className="flex flex-col">
        {/* Council Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-surface-elevated rounded-lg transition-colors mt-1"
              disabled={!hasCommittees}
            >
              {hasCommittees ? (
                isExpanded ? (
                  <ChevronDown size={20} className="text-text-muted" />
                ) : (
                  <ChevronRight size={20} className="text-text-muted" />
                )
              ) : (
                <div className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text truncate">{isRTL ? council?.arabicName : council?.englishName}</h3>
                {council?.number && <span className="text-xs text-text-muted bg-surface-elevated px-2 py-1 rounded">{council.number}</span>}
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClasses()}`}>{getStatusLabel()}</span>
              </div>
              {council?.shortName && <p className="text-sm text-text-muted mb-2">{council.shortName}</p>}
              {council?.formationDate && (
                <p className="text-xs text-text-muted">
                  {t('formedOn')} {formatDate(council.formationDate)}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-1 hover:bg-surface-elevated rounded-lg transition-colors text-text-muted hover:text-text"
                aria-label={t('actions')}
              >
                <MoreVertical size={18} />
              </button>
            }
          >
            {onEdit && (
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onEdit(council);
                }}
              >
                <Edit size={16} className="text-text-muted" />
                <span>{t('edit')}</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  onDelete(council);
                }}
                className="text-destructive"
              >
                <Trash2 size={16} />
                <span>{t('delete')}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenu>
        </div>

        {/* Council Info */}
        <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
          {council?.Members && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {council.Members.length} {t('members')}
              </span>
            </div>
          )}
          {hasCommittees && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>
                {committees.length} {t('committees')}
              </span>
            </div>
          )}
        </div>

        {/* Committees List (Expandable) */}
        {hasCommittees && isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-text-muted mb-3">{t('committeesUnderCouncil')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees.map(committee => (
                <CommitteeCard key={committee.Id || committee.id} committee={committee} onEdit={onCommitteeEdit} onDelete={onCommitteeDelete} />
              ))}
            </div>
          </div>
        )}

        {!hasCommittees && <div className="mt-2 text-sm text-text-muted italic">{t('noCommitteesInCouncil')}</div>}
      </div>
    </Card>
  );
};

export default CouncilCard;
