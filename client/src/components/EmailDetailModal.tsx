import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, User, Eye, EyeOff, Archive, Trash2 } from 'lucide-react';
import type { Email } from '@shared/schema';

interface EmailDetailModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (emailId: string) => void;
  onMarkAsUnread?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
}

export function EmailDetailModal({ 
  email, 
  isOpen, 
  onClose, 
  onMarkAsRead, 
  onMarkAsUnread, 
  onDelete 
}: EmailDetailModalProps) {
  if (!email) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'read': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'unread': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string, type: string) => {
    if (type === 'received') {
      return status === 'read' ? 'Przeczytane' : 'Nieprzeczytane';
    }
    switch (status) {
      case 'sent': return 'Wysłane';
      case 'draft': return 'Szkic';
      case 'failed': return 'Nieudane';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'received' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getTypeText = (type: string) => {
    return type === 'received' ? 'Otrzymane' : 'Wysłane';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {email.subject}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {email.type === 'received' ? 'Od:' : 'Do:'}
                </span>
                <span className="text-sm">
                  {email.type === 'received' ? email.from : email.to}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Data:</span>
                <span className="text-sm">
                  {email.createdAt ? new Date(email.createdAt).toLocaleString('pl-PL') : '-'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(email.type)}>
                  {getTypeText(email.type)}
                </Badge>
                <Badge className={getStatusColor(email.status)}>
                  {getStatusText(email.status, email.type)}
                </Badge>
              </div>
              
              {email.readAt && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Przeczytane: {new Date(email.readAt).toLocaleString('pl-PL')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Email Content */}
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <h3 className="font-medium mb-3">Treść wiadomości:</h3>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: email.content || 'Brak treści' }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {email.type === 'received' && (
                <>
                  {email.status === 'unread' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsRead?.(email.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Oznacz jako przeczytane
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsUnread?.(email.id)}
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Oznacz jako nieprzeczytane
                    </Button>
                  )}
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(email.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Usuń
              </Button>
            </div>
            
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}