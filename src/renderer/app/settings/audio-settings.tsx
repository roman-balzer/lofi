import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { FieldSet, FormGroup, Label, Legend, RangeInput, RangeValue, Row } from './settings-style';

export const AudioSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();
  const volumeIncrementWatch = watch('volumeIncrement');

  return (
    <FieldSet>
      <Legend>Audio</Legend>
      <FormGroup>
        <Row>
          <Label>
            Volume increment
            <RangeInput
              type="range"
              min={0}
              max={100}
              step={2}
              defaultValue={DEFAULT_SETTINGS.volumeIncrement}
              {...register('volumeIncrement', { required: true })}
            />
            <RangeValue>{volumeIncrementWatch}</RangeValue>
          </Label>
        </Row>
      </FormGroup>
    </FieldSet>
  );
};
