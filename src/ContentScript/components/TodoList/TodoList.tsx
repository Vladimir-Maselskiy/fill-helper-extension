import React from 'react';
import { Flex, List, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { TStatus, TTodo } from '../Popup/Popup';

type TProps = { todoes: TTodo[] };

export const TodoList = ({ todoes }: TProps) => {
  const getIconByStatus = (status: TStatus) => {
    switch (status) {
      case 'unfilled':
        return { icon: <ExclamationCircleOutlined />, color: 'default' };
      case 'filling':
        return { icon: <SyncOutlined spin />, color: 'processing' };
      case 'filled':
        return { icon: <CheckCircleOutlined />, color: 'success' };
    }
  };
  return (
    <List
      size="small"
      bordered
      style={{
        width: '100%',
        marginTop: '10px',
        maxHeight: '118px',
        overflowY: 'scroll',
      }}
      dataSource={todoes}
      renderItem={(item: TTodo) => {
        const { name, status } = item;
        return (
          <List.Item>
            <Flex justify="right" style={{ width: '50%' }}>
              {name}
            </Flex>
            <Flex justify="left" style={{ width: '50%' }}>
              <Tag
                icon={getIconByStatus(status).icon}
                color={getIconByStatus(status).color}
              >
                {status}
              </Tag>
            </Flex>
          </List.Item>
        );
      }}
    />
  );
};
