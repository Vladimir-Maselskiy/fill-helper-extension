import { Button } from 'antd';
import { on } from 'events';
import React, { useEffect, useState } from 'react';

type TProps = {
  handleClick: () => void;
};

export const AutofillButton = ({ handleClick }: TProps) => {
  return (
    <Button onClick={handleClick} type="primary">
      Autofill
    </Button>
  );
};
