import { Button, Flex, Tag } from 'antd';
import { getTagDataByStatus } from 'ContentScript/utils/getTagDataByStatus';
import { on } from 'events';
import React, { useEffect, useState } from 'react';

type TProps = {
  handleClick: () => void;
};

const status = 'filling';

export const AutofillButton = ({ handleClick }: TProps) => {
  return (
    <Flex justify="space-between" align="center">
      <Button
        style={{ marginRight: '24px' }}
        onClick={handleClick}
        type="primary"
      >
        Autofill
      </Button>
      <Tag
        icon={getTagDataByStatus(status).icon}
        color={getTagDataByStatus(status).color}
      >
        {status}
      </Tag>
    </Flex>
  );
};
