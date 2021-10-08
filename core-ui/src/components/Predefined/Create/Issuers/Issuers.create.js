import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from '../../../../shared/ResourceForm/ResourceForm';
import {
  createIssuerTemplate,
  createCATypeTemplate,
  createACMETypeTemplate,
  createExternalAccountBinding,
} from './templates';
import { validateIssuer } from './helpers';

import { IssuerTypeDropdown } from './IssuerTypeDropdown';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import { Checkbox } from 'fundamental-react';
import * as jp from 'jsonpath';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function IssuersCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [issuer, setIssuer] = useState(createIssuerTemplate(namespace));
  const [issuerType, setIssuerType] = useState('');

  React.useEffect(() => {
    setCustomValid(validateIssuer(issuer, issuerType));
  }, [issuer, issuerType, setCustomValid]);

  React.useEffect(() => {
    let issuerTypeObject = {};
    if (issuerType === 'ca') issuerTypeObject = createCATypeTemplate();
    else if (issuerType === 'acme') issuerTypeObject = createACMETypeTemplate();
    const spec = jp.value(issuer, '$.spec') || [];
    delete spec.ca;
    delete spec.acme;

    setIssuer({
      ...issuer,
      spec: {
        ...spec,
        ...issuerTypeObject,
      },
    });
    // eslint-disable-next-line
  }, [issuerType, setIssuerType]);

  const issuerCAFields = () => {
    if (!issuerType || issuerType !== 'ca') return <></>;
    if (issuerType === 'ca') {
      return (
        <SecretRef
          required
          className={'fd-margin-top--sm'}
          id="secret-ref-ca-input"
          key="secret-ref-ca-input"
          propertyPath="$.spec.ca.privateKeySecretRef"
          title={t('issuers.private-key')}
          tooltipContent={t('issuers.tooltips.secret-ref-ca')}
        />
      );
    }
  };

  const issuerSimpleACMEFields = () => {
    if (!issuerType || issuerType !== 'acme') return <></>;
    if (issuerType === 'acme') {
      return [
        <ResourceForm.FormField
          label={t('issuers.server')}
          key={t('issuers.server')}
          propertyPath="$.spec.acme.server"
          tooltipContent={t('issuers.tooltips.server')}
          required
          placeholder={t('issuers.placeholders.server')}
          input={Inputs.Text}
        />,
        <ResourceForm.FormField
          label={t('issuers.email')}
          key={t('issuers.email')}
          propertyPath="$.spec.acme.email"
          tooltipContent={t('issuers.tooltips.email')}
          required
          placeholder={t('issuers.placeholders.email')}
          input={Inputs.Text}
        />,
      ];
    }
  };

  const issuerAdvancedACMEFields = () => {
    if (!issuerType || issuerType !== 'acme') return <></>;
    if (issuerType === 'acme') {
      return [
        <ResourceForm.FormField
          advanced
          label={t('issuers.skip-dns')}
          key={t('issuers.skip-dns')}
          propertyPath="$.spec.skipDNSChallengeValidation"
          tooltipContent={t('issuers.tooltips.skip-dns')}
          className={'fd-margin-bottom--sm'}
          input={() => (
            <Checkbox
              compact
              checked={issuer.spec.skipDNSChallengeValidation}
              ariaLabel={t('issuers.skip-dns')}
              onChange={() =>
                setIssuer({
                  ...issuer,
                  spec: {
                    ...issuer.spec,
                    skipDNSChallengeValidation: !issuer.spec
                      .skipDNSChallengeValidation,
                  },
                })
              }
            />
          )}
        />,
        <SecretRef
          advanced
          id="secret-ref-acme-input"
          key="secret-ref-acme-input"
          propertyPath="$.spec.acme.privateKeySecretRef"
          title={t('issuers.private-key')}
          tooltipContent={t('issuers.tooltips.secret-ref-acme')}
          required={!jp.value(issuer, '$.spec.acme.autoRegistration')}
          actions={
            <Checkbox
              compact
              checked={jp.value(issuer, '$.spec.acme.autoRegistration')}
              onChange={e => {
                jp.value(
                  issuer,
                  '$.spec.acme.autoRegistration',
                  e.target.checked,
                );
                setIssuer({ ...issuer });
              }}
              dir="rtl"
            >
              {t('issuers.auto-registration')}
            </Checkbox>
          }
        />,
        <ResourceForm.TextArrayInput
          key="domains-simple-include"
          simple
          propertyPath="$.spec.acme.domains.include"
          title={t('domains.include.label')}
          tooltipContent={t('issuers.tooltips.included-domains')}
          inputProps={{
            placeholder: t('domains.include.placeholder'),
          }}
          className={'fd-margin-top--sm'}
        />,
        <ResourceForm.TextArrayInput
          key="domains-include"
          advanced
          propertyPath="$.spec.acme.domains.include"
          title={t('domains.include.label')}
          tooltipContent={t('issuers.tooltips.included-domains')}
          inputProps={{
            placeholder: t('domains.include.placeholder'),
          }}
        />,
        <ResourceForm.TextArrayInput
          key="domains-exclude"
          advanced
          propertyPath="$.spec.acme.domains.exclude"
          title={t('domains.exclude.label')}
          tooltipContent={t('issuers.tooltips.excluded-domains')}
          inputProps={{
            placeholder: t('domains.exclude.placeholder'),
          }}
        />,
        <ResourceForm.CollapsibleSection
          advanced
          key={'external-account'}
          title={t('issuers.external-account.title')}
          resource={issuer}
          setResource={setIssuer}
          tooltipContent={t('issuers.tooltips.external-account-binding')}
        >
          <ResourceForm.FormField
            label={t('issuers.external-account.key-id')}
            input={Inputs.Text}
            placeholder={t('issuers.placeholders.key-id')}
            className={'fd-margin-bottom--sm'}
            value={jp.value(issuer, '$.spec.acme.externalAccountBinding.keyID')}
            setValue={value => {
              const externalAccountBinding = createExternalAccountBinding({
                keySecretRef: jp.value(
                  issuer,
                  '$.spec.acme.externalAccountBinding.keySecretRef',
                ),
                keyId: value,
              });
              if (
                externalAccountBinding.keyID ||
                externalAccountBinding.keySecretRef
              ) {
                jp.value(
                  issuer,
                  '$.spec.acme.externalAccountBinding',
                  externalAccountBinding,
                );
              } else {
                delete issuer.spec.acme.externalAccountBinding;
              }
              setIssuer({ ...issuer });
            }}
          />
          <SecretRef
            advanced
            id="externalAccountBinding"
            key="externalAccountBinding"
            propertyPath="$.spec.acme.externalAccountBinding.keySecretRef"
            title={t('issuers.external-account.secret')}
            tooltipContent={t('issuers.tooltips.key-secret-ref')}
            setValue={value => {
              const externalAccountBinding = createExternalAccountBinding({
                keySecretRef: value,
                keyId: jp.value(
                  issuer,
                  '$.spec.acme.externalAccountBinding.keyID',
                ),
              });
              if (
                externalAccountBinding.keyID ||
                externalAccountBinding.keySecretRef
              ) {
                jp.value(
                  issuer,
                  '$.spec.acme.externalAccountBinding',
                  externalAccountBinding,
                );
              } else {
                delete issuer.spec.acme.externalAccountBinding;
              }

              setIssuer({ ...issuer });
            }}
          />
        </ResourceForm.CollapsibleSection>,
      ];
    }
  };
  return (
    <ResourceForm
      pluralKind="issuers"
      singularName={t('issuers.name_singular')}
      resource={issuer}
      setResource={setIssuer}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/cert.gardener.cloud/v1alpha1/namespaces/${namespace}/issuers/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('issuers.name_singular')}
        setValue={name => {
          jp.value(issuer, '$.metadata.name', name);
          jp.value(issuer, "$.metadata.labels['app.kubernetes.io/name']", name);
          setIssuer({ ...issuer });
        }}
      />
      <ResourceForm.FormField
        label={t('issuers.type')}
        key={t('issuers.type')}
        required
        value={issuerType}
        setValue={type => {
          setIssuerType(type);
        }}
        input={({ value, setValue }) => (
          <IssuerTypeDropdown type={value} setType={setValue} />
        )}
        tooltipContent={t('issuers.tooltips.issuer-type')}
      />

      {issuerSimpleACMEFields()}

      <ResourceForm.FormField
        advanced
        required
        label={t('issuers.requests-per-day')}
        key={t('issuers.requests-per-day')}
        propertyPath="$.spec.requestsPerDayQuota"
        tooltipContent={t('issuers.tooltips.requests')}
        placeholder={t('issuers.placeholders.requests-per-day')}
        input={Inputs.Number}
      />

      {issuerAdvancedACMEFields()}
      {issuerCAFields()}
    </ResourceForm>
  );
}