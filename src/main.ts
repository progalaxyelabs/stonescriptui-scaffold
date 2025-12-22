import './generated/router';
import { installInnerHTMLWarning } from './dom-utils';

// Enable innerHTML warnings in development
if (import.meta.env.DEV) {
  installInnerHTMLWarning({
    enabled: true,
    throwError: false // Set to true to prevent innerHTML completely
  });
}
