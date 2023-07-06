import { ReactElement } from 'react';
import Icon from 'components/Icon';

const TxResToast = ({
  isSuccess,
  content
}: {
  isSuccess: boolean;
  content: ReactElement | string;
}) => {
  return (
    <div className="flex items-start gap-6 relative">
      <div className="w-6 h-6">
        <Icon name={isSuccess ? 'toastSuccess' : 'toastError'} />
      </div>
      <div className="font-content text-white text-base leading-5 pr-6">
        {content}
      </div>
    </div>
  );
};

export default TxResToast;
