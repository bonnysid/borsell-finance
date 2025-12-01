import { Button, bindStyles, Form, FormInput, Link } from '@devbonnysid/ui-kit-default';
import { useSignIn } from '@entities/auth';
import { SignInDtoShape } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import styles from './SignInPage.module.scss';

type SignInPageProps = {};

const cx = bindStyles(styles);

export const SignInPage: FC<SignInPageProps> = () => {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const signInMutation = useSignIn();

  const onSubmit = async (values: SignInDtoShape) => {
    try {
      await signInMutation.mutateAsync(values);
    } catch (e) {
      // TODO: Добавить тосты
      console.error(e);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className={cx('sign-in-page')}>
      <div className={cx('title')}>{t('Login')}</div>

      <FormInput name="username" caption={t('Username')} placeholder={t('Username')} />
      <FormInput
        type="password"
        name="password"
        caption={t('Password')}
        placeholder={t('Password')}
        isCanBeHidden
      />

      <Button
        type="submit"
        isLoading={signInMutation.isPending}
        disabled={form.formState.isDirty}
        isFullWidth
      >
        {t('Login')}
      </Button>

      <div className={cx('link-wrapper')}>
        <Link to={AppRoutePaths.AUTH_SIGN_UP()}>{t('Registration')}</Link>
      </div>
    </Form>
  );
};

export default SignInPage;
