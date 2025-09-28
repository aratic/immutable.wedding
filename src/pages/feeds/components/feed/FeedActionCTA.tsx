import { useNotifications } from '@components/notification/NotificationContext';
import { useIsMobileWeb } from '@hooks/useIsMobileWeb';
import { ActionCTA } from '@pages/feeds/components/feed/action-cta/ActionCTA';
import { AccountTransferActionCTA } from '@pages/feeds/components/feed/action-cta/bottom-sheet-action-cta/account-transfer/AccountTransferActionCTA';
import { TossTransferActionCTA } from '@pages/feeds/components/feed/action-cta/bottom-sheet-action-cta/toss-transfer/TossTransferActionCTA';
import React from 'react'; 
import {
  FeedAction,
  isLinkAction,
  isPopupAction,
  isBottomSheetAction,
} from 'src/models/Feed';
import { ToastWrapper } from './ToastWrapper';

interface Props {
  action: FeedAction;
}

export function FeedActionCTA({ action }: Props) {
  const isMobileWeb = useIsMobileWeb();
  const { showNotification } = useNotifications();

  if (isLinkAction(action)) {
    return (
      <ActionCTA
        as="a"
        backgroundColor={action.color}
        href={
          isMobileWeb // Replace `action.mobileLink ?? action.href` with `(action.mobileLink ?? action.href)`
            ? (action.mobileLink ?? action.href)
            : (action.pcLink ?? action.href)
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {action.text}
      </ActionCTA>
    );
  }

  if (isPopupAction(action)) {
    return (
      <ActionCTA
        as="button"
        backgroundColor={action.color}
        css={{ width: '100%' }}
        type="button"
        onClick={() => {
          showNotification({
            element: <ToastWrapper>✅ {action.message}</ToastWrapper>,
          });
        }}
      >
        {action.text}
      </ActionCTA>
    );
  }

  if (isBottomSheetAction(action)) {
    if (action.type === 'bottom-sheet_toss') {
      return <TossTransferActionCTA action={action} />;
    }
    if (action.type === 'bottom-sheet_account') {
      return <AccountTransferActionCTA action={action} />;
    }
  }

  return <ActionCTA backgroundColor={action.color}>{action.text}</ActionCTA>;
}
