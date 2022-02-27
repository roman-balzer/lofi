import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { Color, FieldSet, FormGroup, Input, Label, Legend, RangeInput, RangeValue, Row } from './settings-style';

export const WindowSettings: FunctionComponent = () => {
  const { register, watch } = useFormContext<Settings>();
  const barThicknessWatch = watch('barThickness');

  return (
    <FieldSet>
      <Legend>Window</Legend>
      <FormGroup>
        <Row>
          <Label>
            <Input type="checkbox" {...register('isAlwaysOnTop')} />
            Always on top
          </Label>
        </Row>

        <Row>
          <Label>
            <Input type="checkbox" {...register('isVisibleInTaskbar')} />
            Display in the taskbar
          </Label>
        </Row>

        <Row>
          <Label>
            <Input type="checkbox" {...register('isAlwaysShowTrackInfo')} />
            Always show song and artist information
          </Label>
        </Row>

        <Row>
          <Label>
            <Input type="checkbox" {...register('isAlwaysShowSongProgress')} />
            Always show song progress
          </Label>
        </Row>

        <Row>
          <Label>
            Progress bar thickness
            <RangeInput
              type="range"
              min={1}
              max={20}
              step={1}
              defaultValue={DEFAULT_SETTINGS.barThickness}
              {...register('barThickness', { required: true })}
            />
            <RangeValue>{barThicknessWatch}</RangeValue>
          </Label>
        </Row>

        <Row>
          <Label>
            Progress bar color
            <Color {...register('barColor')} />
          </Label>
        </Row>
      </FormGroup>
    </FieldSet>
  );
};
