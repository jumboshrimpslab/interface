import classNames from 'classnames';
import { Identicon } from '@polkadot/react-identicon';
import CopyPasteIcon from 'components/CopyPasteIcon';
import getAbbreviatedName from 'utils/display/getAbbreviatedName';
import { useAccount } from 'contexts/AccountContext';
import Icon from 'components/Icon';

const SingleAccountDisplay = ({
  accountName,
  accountAddress,
  isAccountSelected,
  onClickAccountHandler
}: {
  accountName: string;
  accountAddress: string;
  isAccountSelected: boolean;
  onClickAccountHandler: () => void;
}) => {
  const succinctAddress = getAbbreviatedName(accountAddress, 5, 5);

  const succinctAccountName =
    accountName.length > 12 ? `${accountName?.slice(0, 12)}...` : accountName;

  const AccountIcon = () => (
    <Identicon
      value={accountAddress}
      size={24}
      theme="polkadot"
      className="px-1"
    />
  );

  return (
    <div
      key={accountAddress}
      className={classNames(
        'bg-primary cursor-pointer flex items-center gap-5 justify-between rounded-lg px-3 w-68 h-16'
      )}
      onClick={onClickAccountHandler}
    >
      <div>
        <div className="flex flex-row items-center gap-3">
          <AccountIcon />
          <div className="flex flex-col">
            <div className="text-base">{succinctAccountName}</div>
            <div className="flex flex-row items-center gap-2 text-sm">
              {succinctAddress}
              <CopyPasteIcon
                iconClassName="w-5 h-5"
                textToCopy={accountAddress}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative right-2">
        {isAccountSelected && <Icon name="greenCheck" />}
      </div>
    </div>
  );
};

const AccountSelectDropdown = () => {
  const { selectedAccount, accountList, changeSelectedAccount } = useAccount();

  return (
    <div className="flex flex-col gap-5">
      {accountList.map(account => (
        <SingleAccountDisplay
          key={account.address}
          accountName={(account as any).meta.name}
          accountAddress={account.address}
          isAccountSelected={account.address === selectedAccount?.address}
          onClickAccountHandler={() => changeSelectedAccount(account)}
        />
      ))}
    </div>
  );
};

export default AccountSelectDropdown;
