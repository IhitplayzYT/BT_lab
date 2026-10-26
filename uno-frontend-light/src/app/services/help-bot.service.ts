import { Injectable } from '@angular/core';

export interface HelpBotOption {
  id: string;
  text: string;
  nextStep?: string;
  solution?: string;
}

export interface HelpBotStep {
  id: string;
  question: string;
  options: HelpBotOption[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpBotService {
  private decisionTree: Map<string, HelpBotStep> = new Map();

  constructor() {
    this.initializeDecisionTree();
  }

  private initializeDecisionTree(): void {
    // Root step - Main categories
    this.decisionTree.set('root', {
      id: 'root',
      question: 'What type of issue are you facing?',
      options: [
        { id: 'account', text: 'Account & Login Issues', nextStep: 'account-issues' },
        { id: 'fd', text: 'Fixed Deposit (FD) Issues', nextStep: 'fd-issues' },
        { id: 'payment', text: 'Payment & Transaction Issues', nextStep: 'payment-issues' },
        { id: 'product', text: 'Product & Service Issues', nextStep: 'product-issues' },
        { id: 'general', text: 'General Questions', nextStep: 'general-issues' }
      ]
    });

    // Account Issues
    this.decisionTree.set('account-issues', {
      id: 'account-issues',
      question: 'What account issue are you experiencing?',
      options: [
        { id: 'login-fail', text: 'Cannot login to my account', nextStep: 'login-fail' },
        { id: 'forgot-pass', text: 'Forgot my password', nextStep: 'forgot-pass' },
        { id: 'account-locked', text: 'Account is locked/banned', nextStep: 'account-locked' },
        { id: 'profile', text: 'Want to update profile details', nextStep: 'profile-update' },
        { id: 'role', text: 'Role or permission issues', nextStep: 'role-issues' }
      ]
    });

    this.decisionTree.set('login-fail', {
      id: 'login-fail',
      question: 'What happens when you try to login?',
      options: [
        { id: 'wrong-creds', text: 'Invalid username or password error', solution: 'Solution: Double-check your username and password. Ensure caps lock is off. If you\'ve forgotten your password, use the "Forgot Password" option or contact an admin to reset it.' },
        { id: 'no-internet', text: 'Network error or no internet', solution: 'Solution: Check your internet connection. Ensure you can access other websites. Try refreshing the page or using a different browser.' },
        { id: 'service-down', text: 'Service unavailable error', solution: 'Solution: The backend services might be temporarily down. Please try again in a few minutes. If the issue persists, contact support.' },
        { id: 'token-expired', text: 'Session expired error', solution: 'Solution: Your session has timed out for security. Please login again. This happens automatically after a period of inactivity.' }
      ]
    });

    this.decisionTree.set('forgot-pass', {
      id: 'forgot-pass',
      question: 'Password Reset',
      options: [
        { id: 'reset-solution', text: 'How do I reset my password?', solution: 'Solution: Currently, password reset must be done by an administrator. Please contact your bank officer or admin to reset your password. They can set a temporary password which you can change after login.' }
      ]
    });

    this.decisionTree.set('account-locked', {
      id: 'account-locked',
      question: 'Why is your account locked?',
      options: [
        { id: 'too-many-attempts', text: 'Too many failed login attempts', solution: 'Solution: Your account is temporarily locked due to multiple failed login attempts. Wait for 1 minute and try again. If the issue persists, contact an admin to unlock your account.' },
        { id: 'admin-ban', text: 'Banned by administrator', solution: 'Solution: Your account has been banned by an administrator. Contact the admin to understand the reason and request unbanning. Only admins can unban accounts.' }
      ]
    });

    this.decisionTree.set('profile-update', {
      id: 'profile-update',
      question: 'What profile detail do you want to update?',
      options: [
        { id: 'email-update', text: 'Update email address', solution: 'Solution: Email address updates require administrator approval. Contact your bank officer or admin to request an email change. They can update it for you.' },
        { id: 'personal-info', text: 'Update personal information', solution: 'Solution: Some personal information can be updated through your profile settings. For sensitive changes like name or contact details, contact your bank officer.' },
        { id: 'password-change', text: 'Change my password', solution: 'Solution: After logging in, go to your profile settings to change your password. You\'ll need to enter your current password and then the new one twice for confirmation.' }
      ]
    });

    this.decisionTree.set('role-issues', {
      id: 'role-issues',
      question: 'What role issue are you facing?',
      options: [
        { id: 'wrong-role', text: 'I have the wrong role assigned', solution: 'Solution: Role changes can only be made by administrators. Contact your admin to request a role change. Common roles: CUSTOMER, BANK_OFFICER, ADMIN.' },
        { id: 'no-access', text: 'I cannot access certain features', solution: 'Solution: Different roles have different permissions. Customers can view their FDs and apply for new ones. Bank Officers can manage applications and products. Admins have full access. Contact admin if you believe you should have access.' }
      ]
    });

    // FD Issues
    this.decisionTree.set('fd-issues', {
      id: 'fd-issues',
      question: 'What FD issue are you experiencing?',
      options: [
        { id: 'apply-fd', text: 'Cannot apply for a new FD', nextStep: 'apply-fd-issues' },
        { id: 'view-fd', text: 'Cannot view my existing FDs', nextStep: 'view-fd-issues' },
        { id: 'maturity', text: 'Questions about FD maturity', nextStep: 'maturity-issues' },
        { id: 'premature', text: 'Want to close FD prematurely', nextStep: 'premature-issues' },
        { id: 'interest', text: 'Questions about interest calculation', nextStep: 'interest-issues' }
      ]
    });

    this.decisionTree.set('apply-fd-issues', {
      id: 'apply-fd-issues',
      question: 'What issue are you facing when applying for FD?',
      options: [
        { id: 'no-products', text: 'No products available to select', solution: 'Solution: Ensure there are active FD products in the system. Contact your bank officer if no products are showing. Products must be in ACTIVE status to be available.' },
        { id: 'validation-error', text: 'Validation errors on the form', solution: 'Solution: Check that all required fields are filled correctly. Ensure the deposit amount is within the product\'s min/max limits. The tenure must be within the allowed range for the selected product.' },
        { id: 'submit-fail', text: 'Application submission fails', solution: 'Solution: Check your internet connection. Ensure you\'re logged in. If the error persists, check the browser console for details and contact support.' },
        { id: 'currency-issue', text: 'Currency conversion not working', solution: 'Solution: Currency rates are fetched from an external API. If it fails, the system uses fallback rates. Try refreshing the page. If the issue persists, contact support.' }
      ]
    });

    this.decisionTree.set('view-fd-issues', {
      id: 'view-fd-issues',
      question: 'What issue viewing FDs?',
      options: [
        { id: 'no-fds', text: 'No FDs showing in my dashboard', solution: 'Solution: You may not have any active FDs yet. If you\'ve recently applied, it might still be processing. Contact your bank officer to check the status of your application.' },
        { id: 'wrong-data', text: 'FD details showing incorrectly', solution: 'Solution: Refresh the page to load the latest data. If the issue persists, there might be a data synchronization issue. Contact support with the FD account number.' }
      ]
    });

    this.decisionTree.set('maturity-issues', {
      id: 'maturity-issues',
      question: 'What maturity question do you have?',
      options: [
        { id: 'maturity-date', text: 'When will my FD mature?', solution: 'Solution: Your FD maturity date is shown in your FD details. It\'s calculated based on the tenure from the opening date. You can also check the Maturity Calendar in the admin dashboard for upcoming maturities.' },
        { id: 'maturity-process', text: 'What happens at maturity?', solution: 'Solution: At maturity, your FD principal plus interest is automatically credited to your linked account. You can choose to renew the FD or withdraw the funds. Contact your bank officer for renewal options.' },
        { id: 'maturity-reminder', text: 'Can I get maturity reminders?', solution: 'Solution: Maturity reminders are sent via email before the maturity date. Ensure your email is updated in your profile. You can also check the maturity calendar in the dashboard.' }
      ]
    });

    this.decisionTree.set('premature-issues', {
      id: 'premature-issues',
      question: 'Premature Closure',
      options: [
        { id: 'premature-process', text: 'How do I close my FD early?', solution: 'Solution: Premature closure can be requested through your dashboard or by contacting your bank officer. Note that premature closure may incur penalties and reduced interest rates.' },
        { id: 'penalty-info', text: 'What are the penalties for premature closure?', solution: 'Solution: Premature closure typically results in a lower interest rate (often 1-2% lower than the contracted rate). A processing fee may also apply. Contact your bank officer for exact penalty calculations.' }
      ]
    });

    this.decisionTree.set('interest-issues', {
      id: 'interest-issues',
      question: 'What interest question do you have?',
      options: [
        { id: 'rate-calc', text: 'How is interest calculated?', solution: 'Solution: Interest is calculated using compound interest formula based on the product\'s interest type (typically compound quarterly). The rate depends on the product, tenure, and customer category (Senior Citizens get higher rates).' },
        { id: 'rate-change', text: 'Can my interest rate change?', solution: 'Solution: Once an FD is opened, the interest rate is fixed for the entire tenure. It will not change even if market rates change. However, new FDs may have different rates.' },
        { id: 'senior-citizen', text: 'Do I get higher rate as Senior Citizen?', solution: 'Solution: Yes, Senior Citizens (age 60+) typically get an additional 1% interest rate bonus. This is automatically applied if your age is 60 or above when applying for the FD.' },
        { id: 'payout', text: 'How is interest paid out?', solution: 'Solution: Interest can be paid out periodically (quarterly, monthly) or compounded and paid at maturity. This depends on the product configuration. Check your FD details for the payout frequency.' }
      ]
    });

    // Payment Issues
    this.decisionTree.set('payment-issues', {
      id: 'payment-issues',
      question: 'What payment issue are you facing?',
      options: [
        { id: 'deposit-fail', text: 'Cannot deposit funds for FD', nextStep: 'deposit-issues' },
        { id: 'withdrawal-fail', text: 'Cannot withdraw funds', nextStep: 'withdrawal-issues' },
        { id: 'transfer-fail', text: 'Transfer or transaction failed', nextStep: 'transfer-issues' }
      ]
    });

    this.decisionTree.set('deposit-issues', {
      id: 'deposit-issues',
      question: 'Deposit Issues',
      options: [
        { id: 'deposit-solution', text: 'How to deposit funds for FD?', solution: 'Solution: When applying for an FD, you can link your bank account for automatic debit. The principal amount will be debited when the FD is approved. Ensure sufficient funds are available in your linked account.' }
      ]
    });

    this.decisionTree.set('withdrawal-issues', {
      id: 'withdrawal-issues',
      question: 'Withdrawal Issues',
      options: [
        { id: 'withdrawal-solution', text: 'How to withdraw matured FD amount?', solution: 'Solution: At maturity, funds are automatically credited to your linked account. For premature withdrawal, submit a request through your dashboard or contact your bank officer. Processing typically takes 1-2 business days.' }
      ]
    });

    this.decisionTree.set('transfer-issues', {
      id: 'transfer-issues',
      question: 'Transfer Issues',
      options: [
        { id: 'transfer-solution', text: 'Transaction failed - what to do?', solution: 'Solution: Check if the transaction was actually processed by checking your account balance. If funds were deducted but transaction failed, contact support immediately with transaction details. The system will automatically reverse failed transactions.' }
      ]
    });

    // Product Issues
    this.decisionTree.set('product-issues', {
      id: 'product-issues',
      question: 'What product issue are you facing?',
      options: [
        { id: 'product-info', text: 'Need information about FD products', nextStep: 'product-info-issues' },
        { id: 'product-compare', text: 'Want to compare different FD products', solution: 'Solution: Use the FD Calculator in the dashboard to compare different products. Enter different tenures and amounts to see maturity amounts and interest rates across products.' },
        { id: 'product-not-available', text: 'Product not showing in list', solution: 'Solution: Products must be in ACTIVE status to be available. If a product is DRAFT, RETIRED, or SUSPENDED, it won\'t appear. Contact your bank officer to check product status.' }
      ]
    });

    this.decisionTree.set('product-info-issues', {
      id: 'product-info-issues',
      question: 'What product information do you need?',
      options: [
        { id: 'fd-types', text: 'What types of FD products are available?', solution: 'Solution: Common FD types include Regular FD, Tax Saver FD (5-year lock-in), Senior Citizen FD (higher rates), NRI FD (for NRIs), and Flexi FD (flexible features). Each has different terms and benefits.' },
        { id: 'min-max', text: 'What are the minimum and maximum amounts?', solution: 'Solution: Minimum and maximum deposit amounts vary by product. Typical minimum is ₹10,000 and maximum can go up to ₹1 crore or more. Check individual product details for exact limits.' },
        { id: 'tenure-options', text: 'What tenure options are available?', solution: 'Solution: Tenure options typically range from 6 months to 10 years. Common tenures are 1, 2, 3, and 5 years. Longer tenures usually offer higher interest rates.' }
      ]
    });

    // General Issues
    this.decisionTree.set('general-issues', {
      id: 'general-issues',
      question: 'What general question do you have?',
      options: [
        { id: 'security', text: 'Security and privacy questions', nextStep: 'security-issues' },
        { id: 'support', text: 'How to contact support?', solution: 'Solution: For support, you can: 1) Use this Help Bot, 2) Contact your bank officer, 3) Email support at support@bank.com, 4) Call customer service at the helpline number provided in your account documents.' },
        { id: 'mobile', text: 'Is there a mobile app?', solution: 'Solution: Currently, the system is web-based. A mobile app may be available in the future. You can access all features through the web browser on your mobile device.' },
        { id: 'documents', text: 'What documents are required?', solution: 'Solution: For FD opening, you typically need: PAN card, Aadhaar card, passport-size photograph, and proof of address. For existing customers, your KYC may already be on file.' }
      ]
    });

    this.decisionTree.set('security-issues', {
      id: 'security-issues',
      question: 'Security Questions',
      options: [
        { id: 'data-safe', text: 'Is my data secure?', solution: 'Solution: Yes, your data is encrypted and stored securely. We use industry-standard security measures including SSL encryption, secure authentication, and regular security audits. Your financial data is never shared with third parties without consent.' },
        { id: 'two-factor', text: 'Is two-factor authentication available?', solution: 'Solution: Currently, the system uses password-based authentication. Two-factor authentication may be added in the future for enhanced security. Ensure you use a strong, unique password.' },
        { id: 'session-timeout', text: 'Why does my session timeout?', solution: 'Solution: Sessions timeout automatically after a period of inactivity for security. This prevents unauthorized access if you leave your device unattended. Simply login again to continue.' }
      ]
    });
  }

  getStep(stepId: string): HelpBotStep | undefined {
    return this.decisionTree.get(stepId);
  }

  getRootStep(): HelpBotStep {
    return this.decisionTree.get('root')!;
  }

  reset(): void {
    // Returns to root
    return;
  }
}
