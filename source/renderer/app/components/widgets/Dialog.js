// @flow
import * as React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Modal } from 'react-polymorph/lib/components/Modal';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { ModalSkin } from 'react-polymorph/lib/skins/simple/ModalSkin';
import styles from './Dialog.scss';

type Action = {
  className?: ?string,
  primary?: boolean,
  label?: string,
  onClick: ?(() => void),
  disabled?: boolean,
};

type Props = {
  title?: string,
  children?: React.Node,
  actions?: Action[],
  closeButton?: React.Element<*>,
  backButton?: React.Node,
  className?: string,
  onClose?: ?Function,
  closeOnOverlayClick?: boolean,
  primaryButtonAutoFocus?: boolean,
};

export default class Dialog extends React.Component<Props> {
  render() {
    const {
      title,
      children,
      actions,
      closeOnOverlayClick,
      onClose,
      className,
      closeButton,
      backButton,
      primaryButtonAutoFocus,
    } = this.props;

    return (
      <Modal
        isOpen
        triggerCloseOnOverlayClick={closeOnOverlayClick}
        onClose={onClose}
        skin={ModalSkin}
      >
        <div className={classnames([styles.dialogWrapper, className])}>
          {title && (
            <div className={styles.title}>
              <h1>{title}</h1>
            </div>
          )}

          {children && <div className={styles.content}>{children}</div>}

          {actions && (
            <div className={styles.actions}>
              {_.map(actions, (action, key) => {
                const buttonClasses = classnames([
                  action.className ? action.className : null,
                  action.primary ? 'primary' : 'flat',
                ]);
                return (
                  <Button
                    key={key}
                    className={buttonClasses}
                    label={action.label}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    skin={ButtonSkin}
                    autoFocus={action.primary ? primaryButtonAutoFocus : false}
                  />
                );
              })}
            </div>
          )}

          {closeButton ? React.cloneElement(closeButton, { onClose }) : null}
          {backButton}
        </div>
      </Modal>
    );
  }
}
