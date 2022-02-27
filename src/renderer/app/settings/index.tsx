import React, { FunctionComponent, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { DEFAULT_SETTINGS, Settings } from '../../../models/settings';
import { TitleBar } from '../../components/title-bar';
import { AccountSettings } from './account-settings';
import { AdvancedSettings } from './advanced-settings';
import { AudioSettings } from './audio-settings';
import { Input } from './settings-style';
import { VisualizationSettings } from './visualization-settings';
import { WindowSettings } from './window-settings';

const SettingsWindowWrapper = styled.div`
  display: flex;
  flex-direction: column;

  background-color: #333;
  color: white;
  border: 1px solid #666;
  margin: 0;
  padding: 0.5rem;
  height: calc(100% - 18px);
  width: calc(100% - 18px);

  font-size: 75%;
`;

const Form = styled.form`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ButtonsGroup = styled.div`
  display: flex;
  margin-top: 2rem;
  width: 100%;
`;

const SaveCancelButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 0.25rem;
`;

interface Props {
  initialValues: Settings;
  onClose: () => void;
  onSave: (data: Settings) => void;
  onLogout: () => void;
}

export const SettingsWindow: FunctionComponent<Props> = ({ initialValues, onClose, onSave, onLogout }) => {
  const methods = useForm<Settings>({
    defaultValues: initialValues,
  });
  const { handleSubmit, reset } = methods;

  const onSubmit = useCallback(
    (data: Settings) => {
      onSave(data);
      onClose();
    },
    [onClose, onSave]
  );

  const handleCancel = useCallback(() => onClose(), [onClose]);

  const handleReset = useCallback(() => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (confirm('Are you sure you want to reset all settings?')) {
      const { accessToken, refreshToken } = initialValues;
      reset(DEFAULT_SETTINGS);
      onSave({ ...DEFAULT_SETTINGS, accessToken, refreshToken });
      onClose();
    }
  }, [initialValues, onClose, onSave, reset]);

  return (
    <SettingsWindowWrapper className="full">
      <TitleBar onClose={onClose} />
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
          <WindowSettings />

          <VisualizationSettings defaultValue={initialValues.visualizationId} />

          <AudioSettings />

          <AdvancedSettings />

          <AccountSettings onLogout={onLogout} />

          <ButtonsGroup>
            <Input type="button" value="Reset" onClick={handleReset} />
            <SaveCancelButtonsWrapper>
              <Input type="submit" value="Save" />
              <Input type="button" value="Cancel" onClick={handleCancel} />
            </SaveCancelButtonsWrapper>
          </ButtonsGroup>
        </FormProvider>
      </Form>
    </SettingsWindowWrapper>
  );
};
