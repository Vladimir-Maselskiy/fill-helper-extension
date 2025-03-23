import { Button, Flex, Tag } from 'antd';
import { getTagDataByStatus } from 'ContentScript/utils/getTagDataByStatus';
import { on } from 'events';
import React, { useEffect, useState } from 'react';
import { TStatus } from '../Popup/Popup';

type TProps = {
  handleClick: () => void;
  status: TStatus | null;
};

export const AutofillButton = ({ handleClick, status }: TProps) => {
  return (
    <Flex justify="space-between" align="center">
      <Button
        style={{ marginRight: '24px' }}
        onClick={handleClick}
        type="primary"
      >
        Autofill
      </Button>
      {status && (
        <Tag
          icon={getTagDataByStatus(status).icon}
          color={getTagDataByStatus(status).color}
        >
          {status}
        </Tag>
      )}
    </Flex>
  );
};
