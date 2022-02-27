import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { visualizations } from '../../../visualizations';
import {
  BaseSettingsInputStyle,
  FieldSet,
  FormGroup,
  Label,
  Legend,
  RangeInput,
  RangeValue,
  Row,
} from './settings-style';

const Select = styled.select`
  ${BaseSettingsInputStyle}
  margin-left: 0.25rem;
`;

interface Props {
  defaultValue: number;
}

export const VisualizationSettings: FunctionComponent<Props> = ({ defaultValue }) => {
  const { register, watch } = useFormContext<Settings>();
  const opacityWatch = watch('visualizerOpacity');
  return (
    <FieldSet>
      <Legend>Visualization</Legend>
      <FormGroup>
        <Row>
          Type
          <Select {...register('visualizationId', { valueAsNumber: true })} defaultValue={defaultValue}>
            {visualizations.map(({ name }, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </Select>
        </Row>
        <Row>
          <Label>
            Opacity
            <RangeInput
              type="range"
              min={0}
              max={100}
              step={5}
              defaultValue={DEFAULT_SETTINGS.visualizerOpacity}
              {...register('visualizerOpacity', { required: true, valueAsNumber: true })}
            />
            <RangeValue>{opacityWatch}</RangeValue>
          </Label>
        </Row>
      </FormGroup>
    </FieldSet>
  );
};
