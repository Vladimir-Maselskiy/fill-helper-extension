import React from 'react';
import { Flex, List, Tag } from 'antd';

import { TStatus, TTodo } from '../Popup/Popup';
import { getTagDataByStatus } from 'ContentScript/utils/getTagDataByStatus';

type TProps = { todoes: TTodo[] };

export const TodoList = ({ todoes }: TProps) => {
  return (
    <List
      size="small"
      bordered
      style={{
        width: '100%',
        marginTop: '10px',
        maxHeight: '140px',
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
                icon={getTagDataByStatus(status).icon}
                color={getTagDataByStatus(status).color}
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
