import { Button, bindStyles, Form, FormInput, Link } from '@devbonnysid/ui-kit-default';
import { useSignUp } from '@entities/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import { SignUpDtoShape } from '@packages/types';
import { handleApiError } from '@shared/api/handleApiError';
import { AppRoutePaths } from '@shared/router';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import styles from './SignUpPage.module.scss';

type SignUpPageProps = {};

type SignUpForm = SignUpDtoShape & {
  repeatPassword: string;
};

const cx = bindStyles(styles);

const validationSchema = yup.object().shape({
  username: yup.string().required('RequiredField'),
  password: yup.string().required('RequiredField'),
  repeatPassword: yup
    .string()
    .required('RequiredField')
    .oneOf([yup.ref('password'), ''], 'PasswordsMustMatch'),
});

export const SignUpPage: FC<SignUpPageProps> = () => {
  const { t } = useTranslation();
  const form = useForm<SignUpForm>({
    defaultValues: {
      username: '',
      password: '',
      repeatPassword: '',
    },
    resolver: yupResolver(validationSchema),
  });
  const signUpMutation = useSignUp();

  const onSubmit = async (values: SignUpDtoShape) => {
    try {
      await signUpMutation.mutateAsync(values);
    } catch (e) {
      handleApiError(e, form);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className={cx('sign-up-page')}>
      <div className={cx('title')}>{t('Registration')}</div>

      <FormInput
        name="username"
        caption={t('Username')}
        placeholder={t('Username')}
        autoComplete="username"
      />
      <FormInput
        type="password"
        name="password"
        caption={t('Password')}
        placeholder={t('Password')}
        autoComplete="new-password"
        isCanBeHidden
      />
      <FormInput
        type="password"
        name="repeatPassword"
        caption={t('RepeatPassword')}
        autoComplete="new-password"
        placeholder={t('RepeatPassword')}
        isCanBeHidden
      />

      <Button type="submit" isLoading={signUpMutation.isPending} isFullWidth>
        {t('Registration')}
      </Button>

      <div className={cx('link-wrapper')}>
        <Link to={AppRoutePaths.AUTH_SIGN_IN()}>{t('Login')}</Link>
      </div>
    </Form>
  );
};

export default SignUpPage;
