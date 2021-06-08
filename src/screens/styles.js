import styled from "styled-components/native";

export const ContainerShort = styled.View`
  background: rgb(25, 68, 104);
  width: 180px;
  margin-bottom: 10px;
  border-radius: 5;
`;

export const ProductImageShort = styled.ImageBackground`
  width: 170px;
  height: 135px;
  resize-mode: stretch;
  border-radius: 5;
`;

export const DescriptionShort = styled.View`
  padding: 10px 10px 10px 2px;
  justify-content: space-between;
`;

export const TitleShort = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: 'rgba( 250, 250, 250,1)'';
`;
export const PriceShort = styled.Text`
  font-size: 14px;
  color: #fff;
  padding: 5px 0;
`;