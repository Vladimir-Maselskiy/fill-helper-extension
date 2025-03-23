import styled from 'styled-components';

export const StyledPopup = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;
  height: 300px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  z-index: 99999;
  padding: 10px;
`;
