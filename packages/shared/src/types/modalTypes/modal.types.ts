export interface ModalProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  nested?: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  disableEscClose?: boolean; 
  showCloseButton?: boolean;
};
