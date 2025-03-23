import React from 'react';
import { TStatus } from 'ContentScript/components/Popup/Popup';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

export const getTagDataByStatus = (status: TStatus) => {
  switch (status) {
    case 'unfilled':
      return { icon: <ExclamationCircleOutlined />, color: 'default' };
    case 'filling':
      return { icon: <SyncOutlined spin />, color: 'processing' };
    case 'filled':
      return { icon: <CheckCircleOutlined />, color: 'success' };
  }
};
